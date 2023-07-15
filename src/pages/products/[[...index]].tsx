import Link from "next/link";
import Header from "~/components/products/Header";
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
        <h1>Products</h1>
        <section className="grid grid-cols-4 gap-3">
          <FetchResolver {...productsQuery}>
            {(products) =>
              products.map((product) => (
                <Product key={product.id} {...product} />
              ))
            }
          </FetchResolver>
        </section>
      </main>
    </Layout>
  );
}

function Product({ id, name, price, imageLink }: Products[number]) {
  return (
    <Link
      href={`./${id}`}
      key={id}
      className="grid h-full w-full items-center justify-stretch gap-2 rounded border-2 border-accent p-4"
    >
      <Image
        priority={true}
        width={500}
        height={500}
        className="h-full w-full object-cover"
        src={imageLink}
        alt={name}
      />
      <h3>{name}</h3>
      <span>$ {price}</span>
    </Link>
  );
}
