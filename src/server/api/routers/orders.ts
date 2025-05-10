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
import { sendEmail } from "../../services/emailService";

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
          SELECT "orderId", SUM(price * quantity)::INT as total
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
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
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
                images: true,
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

    const formattedTotal = typeof total === "bigint" ? Number(total) : total;

    return { ...order, total: formattedTotal };
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

        // Check if stock is sufficient
        if (cartItem.size) {
          const availableSize = targetProduct.availableSizes.find(
            (as) => as.productSize.size === cartItem.size,
          );

          if (!availableSize) {
            accumulator.push(
              `Size ${cartItem.size} is not available for product ${targetProduct.name}`,
            );
          } else if (availableSize.quantity < cartItem.quantity) {
            accumulator.push(
              `Not enough stock for ${targetProduct.name} in size ${cartItem.size}. Only ${availableSize.quantity} available.`,
            );
          }
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

      // Start the transaction to ensure inventory
      const result = await ctx.prisma.$transaction(async (tx) => {
        // Check product availability and decrement inventory
        for (const item of input.products) {
          // If size is specified, check size-specific inventory
          if (item.size) {
            const availableSize = await tx.availableSize.findFirst({
              where: {
                productId: item.id,
                productSize: {
                  size: item.size,
                },
              },
            });

            if (!availableSize || availableSize.quantity < item.quantity) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Not enough inventory for product ${item.id} in size ${item.size}`,
              });
            }

            // Decrement inventory
            await tx.availableSize.update({
              where: { id: availableSize.id },
              data: { quantity: availableSize.quantity - item.quantity },
            });
          }
        }

        // Create the order
        const order = await tx.order.create({
          data: {
            name: input.name,
            email: input.email,
            discord: input.discord,
            orderedItems: {
              create: input.products.map((product) => ({
                productId: product.id,
                size: product.size,
                price: transformPriceToModel(product.price),
                quantity: product.quantity,
              })),
            },
          },
        });

        return {
          type: "success" as const,
          id: order.id,
        };
      });

      if (result.type === "success") {
        try {
          await sendEmail(result.id, ctx.prisma, "confirmed");
        } catch (error) {
          console.error("Failed to send confirmation email:", error);
        }
      }

      return result;
    }),

  cancelOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: input.id },
          include: { orderedItems: true },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        for (const item of order.orderedItems) {
          if (item.size) {
            const availableSize = await tx.availableSize.findFirst({
              where: {
                productId: item.productId,
                productSize: {
                  size: item.size,
                },
              },
            });

            if (availableSize) {
              await tx.availableSize.update({
                where: { id: availableSize.id },
                data: { quantity: availableSize.quantity + item.quantity },
              });
            }
          }
        }

        const updatedOrder = await tx.order.update({
          where: { id: input.id },
          data: { processingState: "cancelled" },
          include: {
            orderedItems: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        });

        try {
          await sendEmail(input.id, ctx.prisma, "cancelled");
        } catch (error) {
          console.error("Failed to send cancellation email:", error);
        }

        return updatedOrder;
      });
    }),

  updateProcessingState: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        processingState: z.enum(["processing", "processed", "cancelled"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // Get the current order state
        const currentOrder = await ctx.prisma.order.findUnique({
          where: { id: input.id },
          include: { orderedItems: true },
        });

        if (!currentOrder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        return await ctx.prisma.$transaction(async (tx) => {
          if (
            currentOrder.processingState === "cancelled" &&
            (input.processingState === "processing" ||
              input.processingState === "processed")
          ) {
            for (const item of currentOrder.orderedItems) {
              if (item.size) {
                const availableSize = await tx.availableSize.findFirst({
                  where: {
                    productId: item.productId,
                    productSize: { size: item.size },
                  },
                });

                if (!availableSize || availableSize.quantity < item.quantity) {
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Not enough inventory for product ${item.productId} in size ${item.size}`,
                  });
                }

                // Decrement inventory
                await tx.availableSize.update({
                  where: { id: availableSize.id },
                  data: { quantity: availableSize.quantity - item.quantity },
                });
              }
            }
          }

          // Move from cancelled from processing/processed - increment inventory
          else if (
            (currentOrder.processingState === "processing" ||
              currentOrder.processingState === "processed") &&
            input.processingState === "cancelled"
          ) {
            for (const item of currentOrder.orderedItems) {
              if (item.size) {
                const availableSize = await tx.availableSize.findFirst({
                  where: {
                    productId: item.productId,
                    productSize: { size: item.size },
                  },
                });

                if (availableSize) {
                  // Increment inventory
                  await tx.availableSize.update({
                    where: { id: availableSize.id },
                    data: { quantity: availableSize.quantity + item.quantity },
                  });
                }
              }
            }
          }

          // Update order status
          const updatedOrder = await tx.order.update({
            where: { id: input.id },
            data: { processingState: input.processingState },
            include: {
              orderedItems: {
                include: {
                  product: {
                    include: { images: true },
                  },
                },
              },
            },
          });

          try {
            if (input.processingState === "processed") {
              await sendEmail(input.id, ctx.prisma, "processed");
            } else if (input.processingState === "cancelled") {
              await sendEmail(input.id, ctx.prisma, "cancelled");
            }
          } catch (error) {
            console.error("Failed to send status email:", error);
          }

          return updatedOrder;
        });
      });
    }),

  sendOrderConfirmationEmail: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await sendEmail(input.orderId, ctx.prisma, "confirmed");
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
