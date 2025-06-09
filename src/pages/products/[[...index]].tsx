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
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
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
  availableSizes,
}: {
  id: string;
  name: string;
  price: number;
  images: { url: string; description?: string }[];
  availableSizes: { quantity: number }[];
}) {
  const priceLabel =
    `${price}`.split(".").length > 1 ? `${price}` : `${price}.00`;

  const isOutOfStock = availableSizes.every((size) => size.quantity === 0);

  return (
    <Link
      href={`./${id}`}
      key={id}
      className="grid w-full grid-rows-[1fr_auto_auto] items-center text-center"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl">
        <Image
          priority={true}
          fill
          sizes="(min-width: 640px): 100vw, 80vw"
          className="object-cover"
          src={images[0]?.url ?? ""}
          alt={images[0]?.description ?? name}
        />
      </div>
      <h3 className="mb-2 text-sm font-medium">{name}</h3>
      <div className="flex items-center justify-center">
        {isOutOfStock ? (
          <button className="border-primary cursor-pointer rounded-md border px-4 py-1 text-center text-base">
            SOLD OUT
          </button>
        ) : (
          <span className="py-1">${priceLabel}</span>
        )}
      </div>
    </Link>
  );
}
