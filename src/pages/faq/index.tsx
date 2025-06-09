import React from "react";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "How will I pick it up?",
      answer: (
        <>
          These items will be stored at the{" "}
          <span className="font-medium">SSSS office (Room 4016)</span> at the
          Surrey campus and will only be available for pickup at{" "}
          <span className="font-medium">Surrey campus</span> or delivery on
          select days to <span className="font-medium">Burnaby campus</span>{" "}
          (subject to change).
          <br />
          <br />
          If you are not already in the{" "}
          <span className="font-medium">SSSS Discord</span>, we encourage you to
          join! You can receive regular updates on union activities and events,
          and it will be easier to contact you. Be sure to check out the{" "}
          <span className="font-medium">#merch-sales</span> channel for
          specifics! You can get the channel by selecting the &ldquo;Browse
          Channels&rdquo; tab in the SSSS discord and selecting the channel. You
          may also directly dm{" "}
          <span className="font-medium">
            @
            {process.env.NEXT_PUBLIC_DISCORD_TAG ?? "DISCORD TAG IS NOT SET UP"}
          </span>{" "}
          on Discord about your order!
        </>
      ),
    },
    {
      question: "How is payment done?",
      answer: (
        <>
          Payment is done in person by either{" "}
          <span className="font-medium">cash</span> or{" "}
          <span className="font-medium">e-transfer</span>.
        </>
      ),
    },
    {
      question: "Why do I need to login to SFU?",
      answer: (
        <>
          To ensure <span className="font-medium">security</span> and prevent
          any <span className="font-medium">fraudulent orders</span>, we require
          you to login with your SFU account. If you are uncertain or
          uncomfortable about this, please reach out to our executive team via
          our Discord.
        </>
      ),
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
