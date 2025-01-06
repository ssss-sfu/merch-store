import Image from "next/image";
import Link from "next/link";
import DashboardHeader from "@/lib/dashboard/DashboardHeader";
import FetchResolver from "@/lib/components/FetchResolver";
import Layout from "@/lib/components/Layout";
import { api } from "~/utils/api";
import { Skeleton } from "~/lib/components/ui/skeleton";

export { getServerSideProps } from "~/utils/serverSideAuth";

export default function Orders() {
  const productsQuery = api.productManagement.getAll.useQuery();

  return (
    <Layout>
      <DashboardHeader />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Product Management</h2>
          <div className="flex">
            <Link href="add" className="rounded bg-violet-400 px-3 py-2">
              Add Product
            </Link>
          </div>
        </div>
        <main className="grid grid-cols-1 gap-8 sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
          <FetchResolver
            {...productsQuery}
            loader={Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3.5/4] w-full" />
            ))}
          >
            {(products) => {
              return products.map((product) => (
                <Link
                  href={`./${product.id}`}
                  key={product.id}
                  className="grid aspect-[3.5/4] grid-rows-[1fr_auto_auto_auto] items-center gap-2 rounded border-2 border-accent p-4"
                >
                  <div className="relative h-full">
                    <Image
                      priority={true}
                      fill
                      sizes="(min-width: 640px): 100vw, 20vw"
                      className="h-full w-full object-cover"
                      src={product.imageLink}
                      alt={product.name}
                    />
                  </div>
                  <h3>{product.name}</h3>
                  <span>$ {product.price}</span>
                  <span>{product.archived ? "Archived" : "Active"}</span>
                </Link>
              ));
            }}
          </FetchResolver>
        </main>
      </div>
    </Layout>
  );
}
