import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1),
  imageLink: z.string().url(),
  price: z
    .string()
    .min(1)
    .regex(new RegExp("^\\d*(\\.\\d{0,2})?$"))
    .transform((v) => parseFloat(v))
    .or(
      z.number().refine((val) => {
        const str = val.toString();
        return str.match(new RegExp("^\\d*(\\.\\d{0,2})?$"));
      }),
    ),
  about: z
    .object({
      id: z.string(),
      description: z.string().min(1),
    })
    .array(),
  sizes: z
    .object({
      id: z.string(),
      size: z.string(),
    })
    .array(),
});

export type AddProduct = z.infer<typeof addProductSchema>;

export const editProductSchema = addProductSchema.extend({
  id: z.string(),
  updatedAt: z.date(),
  archived: z.boolean(),
});

export type EditProduct = z.infer<typeof editProductSchema>;
