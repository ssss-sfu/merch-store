import { Resend } from "resend";
import { TRPCError } from "@trpc/server";
import { type PrismaClient } from "@prisma/client";

const emailConfig = {
  confirmed: {
    subject: "[ACTION REQUIRED] SSSS Merch - Order Confirmation 💖",
    title: "SSSS Merch - Order Confirmed!",
    message: `Thank you for your order. Please contact an executive, preferably <strong>@${process.env.NEXT_PUBLIC_DISCORD_TAG}</strong> on Discord!.`,
    showNextSteps: true,
  },
  processed: {
    subject: "SSSS Merch - Your Order Has Been Picked Up 💖",
    title: "SSSS Merch - Order Picked Up!",
    message:
      "Your order has been successfully picked up. Thank you for purchasing SSSS merch!",
    showNextSteps: false,
  },
  cancelled: {
    subject: "SSSS Merch - Your Order Has Been Cancelled 💔",
    title: "SSSS Merch - Order CANCELLED",
    message:
      "Your order has been cancelled. If you still want these items, please place a new order.",
    showNextSteps: false,
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(
  orderId: string,
  prisma: PrismaClient,
  status: "confirmed" | "processed" | "cancelled" = "confirmed",
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderedItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Order not found",
    });
  }

  const _total = await prisma.$queryRaw<{ total: number }[]>`
    SELECT SUM(price * quantity) / 100 as total
    FROM order_items
    WHERE "orderId" = ${orderId}
    GROUP BY "orderId"
  `;

  if (!_total || _total.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to calculate order total",
    });
  }

  const total =
    typeof _total[0]?.total === "bigint"
      ? Number(_total[0].total)
      : (_total[0]?.total ?? 0);

  const config = emailConfig[status];
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://merch.sfussss.org`
      : "http://localhost:3000";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .title {
          color: rgb(36,169,139);
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #4b5563;
          margin-top: 0;
        }
        .order-details {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .detail-row {
          margin-bottom: 4px;
        }
        .label {
          font-weight: 500;
        }
        .items-list {
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 0;
          margin: 16px 0;
        }
        .item {
          padding: 12px 0;
        }
        .item-details {
          display: flex;
          justify-content: space-between;
        }
        .item-name {
          font-weight: 500;
        }
        .item-meta {
          color: #6b7280;
          font-size: 14px;
          margin-top: 4px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: 500;
          padding-top: 16px;
          margin-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .footer {
          font-size: 14px;
          margin-top: 24px;
        }
        .note {
          font-weight: 500;
          margin-top: 8px;
        }
        .social-icons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 16px;
        }
        .social-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
      </style>
    </head>
    <body>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center">
            <table class="container" cellpadding="0" cellspacing="0" border="0" width="600">
              <tr>
                <td>
                  <!-- Header -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <img src="https://raw.githubusercontent.com/ssss-sfu/newsletter/main/src/img/logo.png" alt="SSSS Logo" style="width: 120px;">
                        <h1 class="title">${config.title}</h1>
                        <p class="subtitle">${config.message}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer Content -->
                  ${
                    config.showNextSteps
                      ? `
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; font-size: 14px;">
                    <tr>
                      <td>
                        <p class="section-title">Next Steps:</p>
                        <p>
                          IMPORTANT:
                          These items will be stored at the SSSS office (Room ${process.env.NEXT_PUBLIC_ROOM_NUMBER ?? "UNDEFINED ROOM NUMBER"}) at the Surrey campus and will only be available for pickup at Surrey campus or delivery on select days to Burnaby campus (subject to change). <br/><br/>

                          If you are not already in the SSSS Discord, we encourage you to join! You can receive regular updates on union activities and events, and it will be easier to contact you. Be sure to check out the <strong>#merch-sales</strong> channel for specifics by adding it to your Channels through Discord's Channel list feature! You may also directly DM <strong>@${process.env.NEXT_PUBLIC_DISCORD_TAG}</strong> on Discord!
                        </p>
                        <p class="note">
                          Note: If no attempt has been made to pick up your order within 2 weeks,
                          your order will be automatically cancelled.
                        </p>
                        <p>If you have any questions, please contact us.</p>
                        <p>Thank you for buying SSSS merch!</p>
                      </td>
                    </tr>
                  </table>
                  `
                      : `
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; font-size: 14px;">
                    <tr>
                      <td>
                        <p>If you have any questions, please contact us.</p>
                        <p>Thank you for buying SSSS merch!</p>
                      </td>
                    </tr>
                  </table>
                  `
                  }

                  <!-- Order Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                    <tr>
                      <td>
                        <h2 class="section-title">Order Details</h2>
                        <p class="detail-row"><span class="label">Order ID:</span> ${order.id}</p>
                        <p class="detail-row"><span class="label">Name:</span> ${order.name}</p>
                        <p class="detail-row"><span class="label">Discord:</span> ${order.discord || "Not provided"}</p>
                        <p class="detail-row"><span class="label">Email:</span> ${order.email}</p>
                        <p class="detail-row"><span class="label">Date:</span> ${order.createdAt.toLocaleDateString()}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Items Ordered -->
                  <h3 class="section-title">Items Ordered:</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px 0; margin: 16px 0;">
                    ${order.orderedItems
                      .map(
                        (item) => `
                      <tr>
                        <td style="padding: 12px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="48" style="padding-right: 16px;">
                                ${
                                  item.product.images[0]
                                    ? `<div style="width: 48px; height: 48px; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
                                    <img src="${item.product.images[0].url}" alt="${item.product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                                  </div>`
                                    : `<div style="width: 48px; height: 48px; background-color: #f3f4f6; border-radius: 4px;"></div>`
                                }
                              </td>
                              <td>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="font-weight: 500; padding-right: 8px;">${item.product.name}</td>
                                    <td align="right">$${(item.price / 100).toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td colspan="2" style="color: #6b7280; font-size: 14px; padding-top: 4px;">
                                      ${item.size ? `Size: ${item.size.toUpperCase()}` : "No size"} | Qty: ${item.quantity}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    `,
                      )
                      .join("")}

                    <!-- Total -->
                    <tr>
                      <td style="padding-top: 16px; border-top: 1px solid #e2e8f0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-weight: 500;">Total</td>
                            <td align="right" style="font-weight: 500;">$${total.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- View Order Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; padding-top: 16px;">
                    <tr>
                      <td>
                        <a href="${baseUrl}/order/${order.id}" style="display: inline-block; padding: 8px 16px; background-color: #0a0a0a; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">View Order Online</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Social Links Footer -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; background-color: #0f1419; color: white;">
                    <tr>
                      <td style="padding: 20px;">
                        <img src="https://raw.githubusercontent.com/ssss-sfu/newsletter/main/src/img/footer-banner.png" alt="SSSS Logo" style="width: 250px; margin-bottom: 10px; margin-top: 16px;">
                        
                        <p><a href="https://www.sfussss.org/" style="color: #a78bfa; text-decoration: underline; margin-bottom: 10px;">https://www.sfussss.org/</a></p>
                        
                        <p style="margin: 8px 0; font-size: 14px;">12450 102 Ave Unit 250, SRYE 4016, Galleria 4 Surrey, BC V3T 0A3</p>
                        
                        <p style="margin: 8px 0; font-size: 14px;">Get in Touch: <a href="mailto:ssss-exec@sfu.ca" style="color: white;">ssss-exec@sfu.ca</a></p>
                        
                        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top: 16px;">
                          <tr>
                            <td style="padding: 0 10px;">
                              <a href="https://www.instagram.com/ssss.sfu/" style="display: inline-block; text-decoration: none;">
                                <img src="https://raw.githubusercontent.com/ssss-sfu/newsletter/refs/heads/main/src/img/instagram-icon.svg" width="36" height="36" alt="Instagram" >
                              </a>
                            </td>
                            <td style="padding: 0 10px;">
                              <a href="https://discord.com/invite/whdfmJbVF7" style="display: inline-block; text-decoration: none;">
                                <img src="https://raw.githubusercontent.com/ssss-sfu/newsletter/refs/heads/main/src/img/discord-icon.svg" width="36" height="36" alt="Discord" >
                              </a>
                            </td>
                            <td style="padding: 0 10px;">
                              <a href="https://www.linkedin.com/company/sfu-ssss/" style="display: inline-block; text-decoration: none;">
                                <img src="https://raw.githubusercontent.com/ssss-sfu/newsletter/refs/heads/main/src/img/linkedin-icon.svg" width="36" height="36" alt="LinkedIn">
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.NODE_ENV === "production"
          ? (process.env.EMAIL_FROM ?? "onboarding@resend.dev")
          : "onboarding@resend.dev",
      to:
        process.env.NODE_ENV === "production"
          ? order.email
          : (process.env.DEV_EMAIL_RECIPIENT ?? order.email),
      subject: config.subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send email",
        cause: error,
      });
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send email",
      cause: error,
    });
  }
}

export async function sendEmail(
  orderId: string,
  prisma: PrismaClient,
  status: "confirmed" | "processed" | "cancelled" = "confirmed",
) {
  return sendOrderEmail(orderId, prisma, status);
}
