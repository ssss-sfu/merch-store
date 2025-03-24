import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import type { ProcessingState } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow posts and require api key to access this route
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.CRON_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get the date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find all orders that are still processing and older than a week
    const staleOrders = await prisma.order.findMany({
      where: {
        processingState: "processing" as ProcessingState,
        createdAt: {
          lt: oneWeekAgo,
        },
      },
      include: {
        orderedItems: true,
      },
    });

    // Process each stale order to cancel them
    const results = await Promise.all(
      staleOrders.map(async (order) => {
        // Start a transaction to ensure inventory is properly restored
        return await prisma.$transaction(async (tx) => {
          // Restore inventory for each ordered item
          for (const item of order.orderedItems) {
            if (item.size) {
              const availableSize = await tx.availableSize.findFirst({
                where: {
                  productId: item.productId,
                  productSize: {
                    size: item.size,
                  },
                },
              });

              if (availableSize) {
                await tx.availableSize.update({
                  where: { id: availableSize.id },
                  data: { quantity: availableSize.quantity + item.quantity },
                });
              }
            }
          }

          // Update the order status to cancelled
          return await tx.order.update({
            where: { id: order.id },
            data: { processingState: "cancelled" },
          });
        });
      }),
    );

    // Return a success response of the cancelled orders
    return res.status(200).json({
      success: true,
      message: `${results.length} stale orders have been cancelled`,
      cancelledOrders: results.map((order) => order.id),
    });
  } catch (error) {
    console.error("Error cancelling stale orders:", error);
    return res.status(500).json({ error: "Failed to cancel stale orders" });
  }
}
