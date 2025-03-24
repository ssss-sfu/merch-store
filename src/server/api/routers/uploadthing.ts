import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const uploadthingRouter = createTRPCRouter({
  deleteImage: protectedProcedure
    .input(
      z.object({
        fileKey: z.string().optional(),
        url: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Split key from URL, only if key is not provided
        const fileKey = input.fileKey ?? input.url.split("/").pop();

        if (!fileKey) {
          throw new Error("Invalid file key or URL");
        }

        // Delete the file from UploadThing
        await utapi.deleteFiles(fileKey);

        return { success: true };
      } catch (error) {
        console.error("Failed to delete image:", error);
        throw new Error("Failed to delete image");
      }
    }),
});
