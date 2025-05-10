import React from "react";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "How will I pick it up?",
      answer: `These items will be stored at the SSSS office (Room 4016) at the Surrey campus and will only be available for pickup at
        Surrey campus or delivery on select days to Burnaby campus (subject to change). \n\n
        If you are not already in the SSSS Discord, we encourage you to join! You can receive regular updates on union
        activities and events, and it will be easier to contact you. Be sure to check out the #merch-sales channel for
        specifics!`,
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
