import { Size } from "@prisma/client";
import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
});

export const addProductSchema = z.object({
  name: z.string().min(1),
  images: z.array(imageSchema).min(1, "At least one image is required"),
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
  images: z.array(imageSchema),
});

export type EditProduct = z.infer<typeof editProductSchema>;

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        description: z.string(),
      }),
    )
    .min(1, "At least one image is required"),
  sizes: z
    .record(z.boolean())
    .refine(
      (sizes) => Object.values(sizes).some((selected) => selected === true),
      {
        message: "At least one size must be selected",
      },
    ),
  quantity: z.record(z.number().min(0, "Quantity must be 0 or greater")),
  about: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
    }),
  ),
  archived: z.boolean(),
});

export type FormSchema = z.infer<typeof formSchema>;
