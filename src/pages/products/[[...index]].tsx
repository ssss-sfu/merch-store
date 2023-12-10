import Link from "next/link";
import Header from "~/components/products/Header";
import Footer from "~/components/products/Footer";
import FetchResolver from "~/components/ui/FetchResolver";
import Layout from "~/components/ui/Layout";
import Image from "next/image";
import { type RouterOutputs, api } from "~/utils/api";

type Products = RouterOutputs["product"]["getAll"];

export default function Products() {
  const productsQuery = api.product.getAll.useQuery(undefined);

  return (
    <Layout>
      <Header />
      <main>
        <section className="grid grid-cols-2 gap-4 px-4 md:grid-cols-3 md:gap-12 lg:grid-cols-4 lg:gap-14">
          <FetchResolver {...productsQuery}>
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

function Product({ id, name, price, imageLink }: Products[number]) {
  const priceLabel: string =
    `${price}`.split(".").length > 1 ? `${price}` : `${price}.00`;

  return (
    <Link
      href={`./${id}`}
      key={id}
      className="flex aspect-square flex-col items-center gap-3	text-center "
    >
      <Image
        priority={true}
        width={208}
        height={208}
        className="mb-3 h-full w-full overflow-hidden rounded-xl object-cover	"
        src={imageLink}
        alt={name}
      />
      <h3 className="text-xs">{name}</h3>
      <span className="text-base">${priceLabel}</span>
    </Link>
  );
}
