import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  addProductSchema,
  editProductSchema,
} from "~/schemas/productManagement";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  transformPriceToModel,
  transformPriceToView,
  transformProductPriceToView,
  transformProductsPriceToView,
} from "~/server/price-transformer";

export const productManagementRouter = createTRPCRouter({
  add: protectedProcedure
    .input(addProductSchema)
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.prisma.$transaction(async (prisma) => {
        const product = await prisma.product.create({
          data: {
            name: input.name,
            price: input.price * 100,
            imageLink: input.imageLink,
            aboutProducts: {
              createMany: {
                data: input.about,
              },
            },
          },
        });

        await prisma.availableSize.createMany({
          data: (
            Object.entries(input.sizes) as Array<
              [keyof typeof input.sizes, boolean]
            >
          )
            .filter(([_, val]) => val)
            .map(([size]) => {
              return {
                productId: product.id,
                productSizeId: size,
              };
            }),
        });
      });

      return data;
    }),
  edit: protectedProcedure
    .input(editProductSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedProduct = await ctx.prisma.$transaction(
        async (prisma) => {
          // Check if has be updated by someone else while viewing
          const product = await prisma.product.findUnique({
            where: { id: input.id },
          });

          if (product?.updatedAt.getTime() !== input.updatedAt.getTime()) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Product has been updated by someone else.",
            });
          }

          const updatedProduct = await ctx.prisma.product.update({
            where: {
              id: input.id,
            },
            data: {
              name: input.name,
              price: transformPriceToModel(input.price),
              imageLink: input.imageLink,
              archived: input.archived,
            },
          });

          const upsertPromises = input.about.map(({ description, id }) => {
            return ctx.prisma.aboutProduct.upsert({
              where: {
                id: id,
              },
              update: {
                description: description,
              },
              create: {
                description: description,
                productId: input.id,
              },
            });
          });

          await Promise.all(upsertPromises);

          await prisma.availableSize.deleteMany({
            where: {
              productId: input.id,
            },
          });

          await prisma.availableSize.createMany({
            data: (
              Object.entries(input.sizes) as Array<
                [keyof typeof input.sizes, boolean]
              >
            )
              .filter(([_, val]) => val)
              .map(([size]) => {
                return {
                  productId: product.id,
                  productSizeId: size,
                };
              }),
          });

          return updatedProduct;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
      );

      return updatedProduct;
    }),
  getAllSizes: protectedProcedure.query(async ({ ctx }) => {
    const sizes = await ctx.prisma.productSize.findMany();

    return sizes;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany();
    return transformProductsPriceToView(products);
  }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: {
        id: input,
      },
      include: {
        aboutProducts: true,
        availableSizes: {
          include: {
            productSize: true,
          },
        },
      },
    });

    if (product) {
      return transformProductPriceToView({
        ...product,
        availableSizes: product.availableSizes.map(({ productSize }) => {
          return {
            size: productSize.size,
          };
        }),
      });
    }

    return null;
  }),
  archive: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.update({
        where: {
          id: input,
        },
        data: {
          archived: true,
        },
      });

      return product;
    }),
  unarchive: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.update({
        where: {
          id: input,
        },
        data: {
          archived: false,
        },
      });

      return product;
    }),
});
