import { z } from "zod";

export const addOrderSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  discord: z.string().min(1),
  products: z
    .object({
      id: z.string(),
      quantity: z.number().min(1),
      price: z.number().gte(0),
      size: z.enum(["xxs", "xs", "s", "m", "l", "xl", "xxl"]).optional(),
    })
    .array()
    .min(1),
});

export const addFormOrderSchema = addOrderSchema.pick({
  name: true,
  email: true,
  discord: true,
});

export type AddFormOrder = z.infer<typeof addFormOrderSchema>;

export const orderResponseSchema = z.object({
  id: z.string(),
  emailSent: z.boolean().optional(),
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;

export const getAllOrdersSchema = z.object({
  processingState: z.enum(["processing", "processed"]),
});

export const cartSchema = z
  .object({
    id: z.string(),
    size: z.enum(["xxs", "xs", "s", "m", "l", "xl", "xxl"]).optional(),
    price: z.number().gte(0),
  })
  .array();

export type GetCartInput = z.infer<typeof cartSchema>[number];
