import { useSetAtom } from "jotai";
import { useRouter } from "next/router";
import { useState } from "react";
import { addToCartAtom } from "@/lib/products/cartStore";
import Header from "@/lib/products/Header";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import Layout from "@/lib/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useToast } from "@/ui/use-toast";
import { type RouterInputs, api } from "~/utils/api";
import Image from "next/image";
import { DisclaimerText } from "@/lib/products/DisclaimerText";

type Size = RouterInputs["order"]["add"]["products"][number]["size"];

export default function Product() {
  const router = useRouter();

  const { data: product, isLoading } = api.product.get.useQuery(
    router.query.productId as string,
    {
      enabled: !!router.query.productId,
    },
  );

  const [size, setSize] = useState<Size>();
  const handleSize = (value: string) => setSize(value as Size);

  const [quantity, setQuantity] = useState<number>(1);
  const handleQuantity = (value: number) => setQuantity(value);

  const addToCart = useSetAtom(addToCartAtom);

  const { toast } = useToast();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Something went wrong</div>;
  }

  const priceLabel: string =
    `${product.price}`.split(".").length > 1
      ? `${product.price}`
      : `${product.price}.00`;

  const handleAddToCart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (size) {
      const id = `${product.id}-${size}`;
      addToCart({
        id,
        name: product.name,
        size,
        quantity,
        imageLink: product.imageLink,
      });
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        quantity,
        imageLink: product.imageLink,
      });
    }

    toast({
      title: "Added to cart",
      description: `${product.name} was added to your cart`,
    });
  };

  const sortedSize: Size[] = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];

  return (
    <Layout>
      <Header />
      <main className="flex flex-col justify-center gap-6 px-4 md:flex-row md:gap-14">
        <div className="w-full">
          <Image
            priority={true}
            width={500}
            height={500}
            className="aspect-square w-full overflow-hidden rounded-3xl	object-cover	"
            src={product.imageLink}
            alt={product.name}
          />
        </div>
        <form
          className="flex w-full flex-col gap-y-8 md:gap-y-16"
          onSubmit={handleAddToCart}
        >
          <section className="md:pt-8">
            <h1 className="text-2xl font-medium	">{product.name}</h1>
            <span className="text-lg">${priceLabel}</span>
          </section>
          {!!product.aboutProducts.length && (
            <section>
              <h2>About this product</h2>
              <ul>
                {product.aboutProducts.map(({ id, description }) => {
                  return (
                    <li className="ml-8 list-disc" key={id}>
                      {description}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          <section className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              {!!product.availableSizes.length && (
                <div className="grid w-full gap-1">
                  <label>Size</label>
                  <Select onValueChange={handleSize} value={size}>
                    <SelectTrigger>
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.availableSizes
                        .map((prod) => prod.productSize.size)
                        .sort(
                          (a, b) =>
                            sortedSize.indexOf(a) - sortedSize.indexOf(b),
                        )
                        .map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid w-full gap-2">
                <label>Quantity</label>
                <Input
                  type="number"
                  placeholder="Quantity"
                  step={1}
                  min={1}
                  value={quantity}
                  onChange={(e) => handleQuantity(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="bg-black text-white">
                Add to Cart*
              </Button>
              <DisclaimerText />
            </div>
          </section>
        </form>
      </main>
    </Layout>
  );
}
