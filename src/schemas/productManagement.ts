import { Size } from "@prisma/client";
import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid URL"),
      }),
    )
    .min(1, "At least one image is required"),
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
  quantity: z.record(
    z.custom<Size>((val: string) => Object.keys(Size).includes(val)),
    z.number(),
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
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid URL"),
        id: z.string(),
      }),
    )
    .min(1, "At least one image is required"),
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
  quantity: z.record(
    z.custom<Size>((val: string) => Object.keys(Size).includes(val)),
    z.number(),
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
