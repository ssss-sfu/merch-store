import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  transformProductPriceToView,
  transformProductsPriceToView,
  transformPriceToView,
  transformPriceToModel,
} from "~/server/price-transformer";
import { cartSchema } from "~/schemas/order";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imageLink: true,
        availableSizes: true,
      },
      where: { archived: false },
    });

    return transformProductsPriceToView(products);
  }),
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findFirst({
      where: {
        id: input,
        archived: false,
      },
      include: {
        aboutProducts: {
          include: {
            product: true,
          },
        },
        availableSizes: {
          include: {
            productSize: true,
          },
        },
      },
    });

    return product !== null ? transformProductPriceToView(product) : null;
  }),
  getFromCart: publicProcedure
    .input(cartSchema)
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        include: {
          availableSizes: {
            include: {
              productSize: true,
            },
          },
        },
        where: {
          OR: input.map((cartItem) => ({ id: cartItem.id })),
        },
      });
      return input.map((cartItem) => {
        const targetProduct = products.find((p) => p.id === cartItem.id);

        if (targetProduct?.archived) {
          return {
            type: "archived" as const,
            id: targetProduct.id,
            name: targetProduct.name,
            imageLink: targetProduct.imageLink,
          };
        }

        if (!targetProduct) {
          return {
            type: "not-exist" as const,
            id: cartItem.id,
          };
        }

        const errors: (PriceError | SizeError)[] = [];

        const cartItemPrice = transformPriceToModel(cartItem.price);
        if (targetProduct.price !== cartItemPrice) {
          errors.push({
            type: "price" as const,
            price: transformPriceToView(targetProduct.price),
            invalidPrice: transformPriceToView(cartItemPrice),
          });
        }

        if (
          cartItem.size &&
          !targetProduct.availableSizes.find(
            (as) => as.productSize.size === cartItem.size,
          )
        ) {
          errors.push({
            type: "size" as const,
            invalidSize: cartItem.size,
            availableSizes: targetProduct.availableSizes.map(
              (s) => s.productSize.size,
            ),
          });
        }

        return {
          type: "normal" as const,
          id: targetProduct.id,
          imageLink: targetProduct.imageLink,
          name: targetProduct.name,
          errors,
        };
      });
    }),
});

type PriceError = { type: "price"; price: number; invalidPrice: number };
type SizeError = {
  type: "size";
  availableSizes: string[];
  invalidSize: string;
};
