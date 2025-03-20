import { z } from "zod";
import {
  type Context,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { addOrderSchema, getAllOrdersSchema } from "~/schemas/order";
import { TRPCError } from "@trpc/server";
import { type ProcessingState, type Size } from "@prisma/client";
import {
  transformPriceToModel,
  transformPriceToView,
  transformProductsPriceToView,
} from "@/lib/utils/price-transformer";

type Order = {
  id: string;
  name: string;
  discord: string;
  email: string;
  count: bigint;
  total: number;
  processingState: ProcessingState;
  createdAt: Date;
};

export const orderRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(getAllOrdersSchema)
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.$queryRaw<Order[]>`
        SELECT id, name, discord, email, totals.total, counts.count, "processingState", "createdAt"
        FROM orders, (
          SELECT "orderId", SUM(price)::INT as total
          FROM order_items
          GROUP BY "orderId"
        ) as totals, (
          SELECT "orderId", SUM(quantity) as count
          FROM order_items
          GROUP BY "orderId"
        ) as counts
        WHERE orders.id = totals."orderId"
        AND orders.id = counts."orderId"
        AND "processingState" = ${input.processingState}::"ProcessingState"
        ORDER BY "createdAt" DESC
      `;

      orders.forEach((order) => {
        order.total = transformPriceToView(order.total);
      });

      return orders;
    }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const sizes = await ctx.prisma.$queryRaw<{ size: string }[]>`
    SELECT size
    FROM order_items
    WHERE "orderId" = ${input}
  `;

    const sizeList = sizes?.map((row) => row.size as Size) || [];

    const order = await ctx.prisma.order.findUnique({
      where: {
        id: input,
      },
      include: {
        orderedItems: {
          include: {
            product: {
              include: {
                availableSizes: {
                  where:
                    sizeList.length > 0
                      ? {
                          productSize: {
                            size: {},
                          },
                        }
                      : {},
                },
              },
            },
          },
        },
      },
    });
    const _total = await getOrderTotal(input, ctx);
    const total = _total?.[0]?.total;

    if (total === undefined || !order) {
      return null;
    }

    order.orderedItems = transformProductsPriceToView(order.orderedItems);

    return { ...order, total };
  }),
  add: publicProcedure
    .input(addOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        include: {
          availableSizes: {
            include: {
              productSize: true,
            },
          },
        },
        where: {
          OR: input.products.map((cartItem) => ({ id: cartItem.id })),
        },
      });

      const errors = input.products.reduce((accumulator, cartItem) => {
        const targetProduct = products.find((p) => p.id === cartItem.id);

        if (!targetProduct) {
          accumulator.push(`Product with id ${cartItem.id} does not exist`);
          return accumulator;
        }

        if (targetProduct.archived) {
          accumulator.push(`Product ${targetProduct.name} has been archived`);
          return accumulator;
        }

        const cartItemPrice = transformPriceToModel(cartItem.price);
        if (targetProduct.price !== cartItemPrice) {
          accumulator.push(
            `The price for product ${targetProduct.name} has changed`,
          );
        }

        if (
          cartItem.size &&
          !targetProduct.availableSizes.find(
            (as) => as.productSize.size === cartItem.size,
          )
        ) {
          accumulator.push(
            `The size ${cartItem.size} is no longer available for product ${targetProduct.name}. The available sizes are ${targetProduct.availableSizes.map((s) => s.productSize.size).join(", ")}`,
          );
        }

        if (!cartItem.size && targetProduct.availableSizes.length > 0) {
          accumulator.push(`Product ${targetProduct.name} no longer has sizes`);
        }

        return accumulator;
      }, [] as string[]);

      if (errors.length > 0) {
        return {
          type: "error" as const,
          errors,
        };
      }

      const order = await ctx.prisma.order.create({
        data: {
          name: input.name,
          email: input.email,
          discord: input.discord,
          orderedItems: {
            createMany: {
              data: input.products.map((product) => {
                return {
                  productId: product.id,
                  quantity: product.quantity,
                  size: product.size,
                  price: transformPriceToModel(product.price),
                };
              }),
            },
          },
        },
      });

      // Return the order ID so we can redirect to it
      return { id: order.id };
    }),
  updateProcessingState: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        processingState: z.enum(["processing", "processed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.id,
        },
        include: {
          orderedItems: {
            include: {
              product: {
                include: {
                  availableSizes: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      for (const item of order.orderedItems) {
        await ctx.prisma.availableSize.updateMany({
          where: {
            productId: item.productId,
            productSizeId: item.size ?? undefined,
          },
          data: {
            quantity: {
              [input.processingState === "processing"
                ? "increment"
                : "decrement"]: item.quantity,
            },
          },
        });
      }

      const updatedOrder = await ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          processingState: input.processingState,
        },
        include: {
          orderedItems: {
            include: {
              product: {
                include: {
                  availableSizes: true,
                },
              },
            },
          },
        },
      });

      const _total = await getOrderTotal(input.id, ctx);
      const total = _total?.[0]?.total;

      if (!total || !updatedOrder) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not update processing state",
        });
      }

      return { ...updatedOrder, total };
    }),
});

async function getOrderTotal(orderId: string, ctx: Context) {
  const total = await ctx.prisma.$queryRaw<{ total: number }[]>`
    SELECT SUM(price * quantity) / 100 as total
    FROM order_items
    WHERE "orderId" = ${orderId}
    GROUP BY "orderId"
  `;

  return total;
}
