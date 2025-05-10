import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import type { ProcessingState } from "@prisma/client";
import { sendEmail } from "~/server/services/emailService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Allow both GET and POST for Vercel cron jobs
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the date 7 days ago
    const timeAgo = new Date();
    timeAgo.setDate(timeAgo.getDate() - 7);

    // Find all orders that are still processing and older than a week
    const staleOrders = await prisma.order.findMany({
      where: {
        processingState: "processing" as ProcessingState,
        createdAt: {
          lt: timeAgo,
        },
      },
      include: {
        orderedItems: true,
      },
    });

    // Delay function to stay under the 2 requests/second limit for Resend.dev
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Process each stale order and cancel them - one at a time, avoid rate limits :)
    const results = [];
    for (const order of staleOrders) {
      // Start transaction for each order
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Increment inventory for each ordered item
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

      // Send cancellation email to the order's email address with delay's to avoid rate limits
      try {
        await sendEmail(order.id, prisma, "cancelled");
        console.log(`Cancellation email sent for order ${order.id}`);
        // Wait 600ms between email sends to stay under the 2 requests/second limit
        await delay(600);
      } catch (error) {
        console.error(
          `Failed to send cancellation email for order ${order.id}:`,
          error,
        );
      }

      results.push(updatedOrder);
    }

    // Return a success response of the cancelled orders
    return res.status(200).json({
      success: true,
      message: `${results.length} stale orders have been cancelled and emails sent`,
      cancelledOrders: results.map((order) => order.id),
    });
  } catch (error) {
    console.error("Error cancelling stale orders:", error);
    return res.status(500).json({ error: "Failed to cancel stale orders" });
  }
}
