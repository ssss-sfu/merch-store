import { useSetAtom } from "jotai";
import { useRouter } from "next/router";
import { useState } from "react";
import { addToCartAtom } from "~/components/cartStore";
import Header from "~/components/products/Header";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import Layout from "~/components/ui/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/Select";
import { useToast } from "~/components/ui/useToast";
import { type RouterInputs, api } from "~/utils/api";
import Image from "next/image";

type Size = RouterInputs["order"]["add"]["products"][number]["size"];

export default function Product() {
  const router = useRouter();

  const { data: product, isLoading } = api.product.get.useQuery(
    router.query.productId as string,
    {
      enabled: !!router.query.productId,
    }
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

  return (
    <Layout>
      <Header />
      <main className="flex justify-center gap-4">
        <div className="w-full">
          <Image
            priority={true}
            width={500}
            height={500}
            className="h-full w-full object-cover"
            src={product.imageLink}
            alt={product.name}
          />
        </div>
        <form className="flex w-full flex-col gap-4" onSubmit={handleAddToCart}>
          <h1>{product.name}</h1>
          <span>$ {product.price}</span>
          <div className="flex items-end gap-2">
            {!!product.availableSizes.length && (
              <div className="grid w-full gap-2">
                <label>Size</label>
                <Select onValueChange={handleSize} value={size}>
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.availableSizes.map(({ productSize }) => (
                      <SelectItem key={productSize.id} value={productSize.size}>
                        {productSize.size}
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
          <Button variant="outline" className="bg-black text-white">
            Add to Cart
          </Button>
          {!!product.aboutProducts.length && (
            <div>
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
            </div>
          )}
        </form>
      </main>
    </Layout>
  );
}
