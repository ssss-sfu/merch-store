import { type NextPage } from "next";
import Link from "next/link";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";

const Home: NextPage = () => {
  return (
    <Layout>
      <Header />
      <main className="mx-auto flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-4xl flex-col items-center px-4 py-12 text-center">
          <div className="mb-24 flex flex-col items-center space-y-6">
            <h1 className="text-primary text-5xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              SSSS Merch Store
            </h1>

            <div className="flex gap-4">
              <Link
                href="/products"
                className="bg-primary hover:bg-primary/90 rounded-md px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              >
                Shop Now
              </Link>
              <Link
                href="/faq"
                className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
