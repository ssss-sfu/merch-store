import React from "react";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "How will I pick it up?",
      answer:
        "Join our Discord and you will be able to pick it up in person at the SFU Surrey campus. Once you join, please reach out to our executive team with your order details, and they will provide you with further instructions on where and when to collect your items.",
    },
    {
      question: "How is payment done?",
      answer: "Payment is done in person by either cash or e-transfer.",
    },
    {
      question: "Why do I need to login to SFU?",
      answer:
        "To ensure security and prevent any fraudulent orders, we require you to login with your SFU account, if you are uncertain or uncomfortable about this, please reach out to our executive team via our Discord.",
    },
  ];
  return (
    <Layout>
      <Header />
      <main>
        <section className="flex flex-col gap-8 px-4 py-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-3 rounded-lg p-6 text-left"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {faq.question}
              </h2>
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </Layout>
  );
}
