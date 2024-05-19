import { Size } from "@prisma/client";
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
  sizes: z.record(
    z.custom<Size>((val: string) => Object.keys(Size).includes(val)),
    z.boolean(),
  ),
});

export type AddProduct = z.infer<typeof addProductSchema>;

export const editProductSchema = addProductSchema.extend({
  id: z.string(),
  updatedAt: z.date(),
  archived: z.boolean(),
});

export type EditProduct = z.infer<typeof editProductSchema>;

export const formSchema = z.object({
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
  sizes: z.record(
    z.custom<Size>((val: string) => Object.keys(Size).includes(val)),
    z.boolean(),
  ),
  about: z
    .object({
      id: z.string(),
      description: z.string().min(1),
    })
    .array(),
  archived: z.boolean(),
});

export type FormSchema = z.infer<typeof formSchema>;
