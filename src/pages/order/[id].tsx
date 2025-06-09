import React, { useState } from "react";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";
import { useRouter } from "next/router";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/use-toast";
import Link from "next/link";
import { api } from "~/utils/api";
import Image from "next/image";
import { Skeleton } from "~/lib/components/ui/skeleton";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { type ProcessingState } from "@prisma/client";

export default function OrderConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const isAdmin = !session?.user.email?.endsWith("@sfu.ca");

  const { data: orderData, isLoading } = api.order.get.useQuery(id as string, {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const queryUtils = api.useUtils();
  const updateProcessingState = api.order.updateProcessingState.useMutation({
    onSuccess(data) {
      void queryUtils.order.get.invalidate(data.id).catch((error) => {
        console.error("Failed to invalidate order query:", error);
      });

      if (data.processingState === "cancelled") {
        toast({
          title: "Order cancelled",
          description: "Inventory has been restored",
        });
      } else if (data.processingState === "processed") {
        toast({
          title: "Order processed",
          description: "Order has been marked as processed",
        });
      }
    },
  });

  const copyToClipboard = () => {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Order link has been copied to clipboard",
    });

    setTimeout(() => setCopied(false), 3000);
  };

  const getOrderStatusContent = () => {
    if (!orderData) return { title: "", message: "" };

    switch (orderData.processingState) {
      case "cancelled":
        return {
          title: "Order Cancelled",
          message:
            "This order was cancelled. Please make another purchase if this was a mistake.",
          titleColor: "text-red-600",
        };
      case "processed":
        return {
          title: "Order Completed",
          message:
            "Thank you for shopping with us! Your order has been picked up.",
          titleColor: "text-blue-600",
        };
      default:
        return {
          title: "Order Confirmed!",
          message:
            "Thank you for your order, an email will be sent to you shortly.",
          titleColor: "text-green-600",
        };
    }
  };

  const { title, message, titleColor } = getOrderStatusContent();

  return (
    <Layout>
      <Header />
      <main className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <h1
              className={`mb-2 text-2xl font-bold ${titleColor ?? "text-green-600"}`}
            >
              {isLoading ? "Loading..." : title}
            </h1>
            <p className="text-balance text-gray-600">
              {isLoading ? "Please wait..." : message}
            </p>
            {isAdmin && orderData && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm font-medium">Admin Controls:</span>
                <Select
                  value={orderData.processingState}
                  onValueChange={(state: ProcessingState) => {
                    updateProcessingState.mutate({
                      id: orderData.id,
                      processingState: state,
                    });
                  }}
                  disabled={updateProcessingState.isLoading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mb-6 rounded-lg">
            <h2 className="mb-2 text-lg font-semibold">Order Details</h2>
            <p className="mb-1 text-gray-700">
              <span className="font-medium">Order ID:</span> {id}
            </p>

            {isLoading ? (
              <div className="mt-4">
                <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>

                <h3 className="mb-2 font-medium">Items Ordered:</h3>
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex py-3">
                      <div className="mr-4 h-12 w-12">
                        <Skeleton className="h-12 w-12" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="mt-1 flex items-end justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ) : orderData ? (
              <div className="mt-4">
                <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span> {orderData.name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(orderData.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <h3 className="mb-2 font-medium">Items Ordered:</h3>
                <div className="divide-y divide-gray-200">
                  {orderData.orderedItems.map((item) => (
                    <div key={item.id} className="flex py-3">
                      <div className="mr-4 h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.product.images?.[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover object-center"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.product.name}</h3>
                          <p className="ml-4">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="mt-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">
                            {item.size && `Size: ${item.size.toUpperCase()}`}
                            {!item.size && "No size"}
                          </p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>${orderData.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Order details not found.</p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={copyToClipboard}
                className={`w-full ${copied ? "opacity-80 brightness-90" : ""}`}
                variant={"default"}
              >
                {copied ? "Copied!" : "Copy Order Link"}
              </Button>

              <Link href="/products" passHref>
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {orderData &&
            orderData.processingState !== "cancelled" &&
            orderData.processingState !== "processed" && (
              <div className="text-sm">
                <p className="font-medium">Next Steps:</p>
                <p className="mt-1">
                  Join our Discord and reach out to our executive team with your
                  order details. They will provide you with further instructions
                  on where and when to collect your items.
                </p>
                <p className="mt-2 font-medium">
                  Note: If no attempt has been made to pick up your order within
                  a week, your order will be cancelled.
                </p>
              </div>
            )}
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
