import { productManagementRouter } from "~/server/api/routers/product-management";
import { createTRPCRouter } from "~/server/api/trpc";
import { orderRouter } from "./routers/orders";
import { productRouter } from "./routers/product";
import { uploadthingRouter } from "./routers/uploadthing";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  productManagement: productManagementRouter,
  order: orderRouter,
  product: productRouter,
  uploadthing: uploadthingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
