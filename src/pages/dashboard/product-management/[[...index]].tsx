import Image from "next/image";
import Link from "next/link";
import DashboardHeader from "@/lib/dashboard/DashboardHeader";
import FetchResolver from "@/lib/components/FetchResolver";
import Layout from "@/lib/components/Layout";
import { api } from "~/utils/api";

export { getServerSideProps } from "~/utils/serverSideAuth";

export default function Orders() {
  const productsQuery = api.productManagement.getAll.useQuery();

  return (
    <Layout>
      <DashboardHeader />
      <main>
        <div className="flex justify-between">
          <h2>Product Management</h2>
          <div className="flex">
            <Link href="add" className="rounded bg-violet-400 px-3 py-2">
              Add Product
            </Link>
          </div>
        </div>
        <section className="grid grid-cols-4 gap-3">
          <FetchResolver {...productsQuery}>
            {(products) => {
              return products.map((product) => (
                <Link
                  href={`./${product.id}`}
                  key={product.id}
                  className="grid h-full w-full items-center justify-stretch gap-2 rounded border-2 border-accent p-4"
                >
                  <Image
                    priority={true}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover"
                    src={product.imageLink}
                    alt={product.name}
                  />
                  <h3>{product.name}</h3>
                  <span>$ {product.price}</span>
                  <span>{product.archived ? "Archived" : "Active"}</span>
                </Link>
              ));
            }}
          </FetchResolver>
        </section>
      </main>
    </Layout>
  );
}
