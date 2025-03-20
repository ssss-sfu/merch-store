import React from "react";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "How will I pick it up?",
      answer:
        "Join our Discord. Once you join, please reach out to our executive team with your order details, and they will provide you with further instructions on where and when to collect your items. If no attempt has been made to pick up your order within a week, we will cancel your order.",
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
        <section className="flex flex-col gap-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-2 rounded-lg text-left"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {faq.question}
              </h2>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </Layout>
  );
}
