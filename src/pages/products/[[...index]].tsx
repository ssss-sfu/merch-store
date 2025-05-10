import Link from "next/link";
import Header from "@/lib/products/Header";
import Footer from "@/lib/products/Footer";
import FetchResolver from "@/lib/components/FetchResolver";
import Layout from "@/lib/components/Layout";
import Image from "next/image";
import { type RouterOutputs, api } from "~/utils/api";
import { Skeleton } from "~/lib/components/ui/skeleton";

type Products = RouterOutputs["product"]["getAll"];

export default function Products() {
  const productsQuery = api.product.getAll.useQuery(undefined);

  return (
    <Layout>
      <Header />
      <main>
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
          <FetchResolver
            {...productsQuery}
            loader={Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3.5/4] w-full" />
            ))}
          >
            {(products) =>
              products.map((product) => (
                <Product key={product.id} {...product} />
              ))
            }
          </FetchResolver>
        </section>
      </main>
      <Footer />
    </Layout>
  );
}

function Product({
  id,
  name,
  price,
  images,
}: {
  id: string;
  name: string;
  price: number;
  images: { url: string; description?: string }[];
}) {
  const priceLabel =
    `${price}`.split(".").length > 1 ? `${price}` : `${price}.00`;

  return (
    <Link
      href={`./${id}`}
      key={id}
      className="grid aspect-[3.5/4] w-full grid-rows-[1fr_auto_auto] flex-col items-center gap-3 text-center"
    >
      <div className="relative h-full">
        <Image
          priority={true}
          fill
          sizes="(min-width: 640px): 100vw, 50vw"
          className="mb-3 h-full w-full overflow-hidden rounded-xl object-cover"
          src={images[0]?.url ?? ""}
          alt={images[0]?.description ?? name}
        />
      </div>
      <h3 className="text-xs">{name}</h3>
      <span className="text-base">${priceLabel}</span>
    </Link>
  );
}
