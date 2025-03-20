import React, { useState } from "react";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";
import { useRouter } from "next/router";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/use-toast";
import Link from "next/link";

export default function OrderConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  return (
    <Layout>
      <Header />
      <main className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-green-600">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">Thank you for your order.</p>
          </div>

          <div className="mb-6 rounded-lg">
            <h2 className="mb-2 text-lg font-semibold">Order Details</h2>
            <p className="mb-1 text-gray-700">
              <span className="font-medium">Order ID:</span> {id}
            </p>
            <p className="mb-4 text-sm text-gray-500">
              An email will be sent to you shortly.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={copyToClipboard}
                className="w-full"
                variant={copied ? "outline" : "default"}
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

          <div className="rounded-xl text-sm text-blue-800">
            <p className="font-medium">Next Steps:</p>
            <p className="mt-1">
              Join our Discord and reach out to our executive team with your
              order details. They will provide you with further instructions on
              where and when to collect your items.
            </p>
            <p className="mt-2 font-medium">
              Note: If no attempt has been made to pick up your order within a
              week, we will cancel your order.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
