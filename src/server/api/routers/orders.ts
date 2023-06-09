import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { addOrderSchema } from "~/schemas/order";
import { TRPCError } from "@trpc/server";

export const orderRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      include: { _count: { select: { orderedItems: true } } },
    });

    return orders.map((order) => ({
      ...order,
      count: order._count.orderedItems as number,
    }));
  }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({
      where: {
        id: input,
      },
      include: {
        orderedItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }),
  add: publicProcedure
    .input(addOrderSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Verify size
      await ctx.prisma.$transaction(async (prisma) => {
        const productPrices = await prisma.product.findMany({
          select: {
            id: true,
            price: true,
          },
          where: {
            archived: false,
          },
        });

        const productPricesMap = new Map(
          productPrices.map((p) => [p.id, p.price])
        );

        await ctx.prisma.order.create({
          data: {
            name: input.name,
            email: input.email,
            orderedItems: {
              createMany: {
                data: input.products.map((product) => {
                  const productId = product.id.split("-")[0] as string;
                  const price = productPricesMap.get(productId);

                  if (price !== 0 && !price) {
                    throw new TRPCError({
                      code: "CONFLICT",
                      message: "Product no longer exists",
                    });
                  }

                  return {
                    productId,
                    quantity: product.quantity,
                    size: product.size,
                    price
                  };
                }),
              },
            },
          },
        });
      });
    }),
});
