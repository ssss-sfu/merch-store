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
import { Skeleton } from "~/lib/components/ui/skeleton";
import { twMerge } from "tailwind-merge";

type Size = RouterInputs["order"]["add"]["products"][number]["size"];

const sortedSize: Size[] = ["xxs", "xs", "s", "m", "l", "xl", "xxl"];

export default function Product() {
  return (
    <Layout>
      <Header />
      <Content />
    </Layout>
  );
}

function Content() {
  const router = useRouter();

  const {
    data: product,
    isLoading,
    isError,
  } = api.product.get.useQuery(router.query.productId as string, {
    enabled: !!router.query.productId,
  });

  const [size, setSize] = useState<Size>();
  const handleSize = (value: string) => {
    setSize(value as Size);
    setQuantity(1);
  };

  const [quantity, setQuantity] = useState<number>(1);
  const handleQuantity = (value: number) => {
    const availableStock = getAvailableStock();
    setQuantity(Math.min(value, availableStock || 1));
  };

  const getAvailableStock = () => {
    if (!product || !size) return 0;

    const sizeItem = product.availableSizes.find(
      (item) => item.productSize.size === size,
    );

    return sizeItem?.quantity ?? 0;
  };

  // Helper function to check if a size is in stock
  const isSizeInStock = (sizeValue: string) => {
    if (!product) return false;

    const sizeItem = product.availableSizes.find(
      (item) => item.productSize.size === sizeValue,
    );

    return (sizeItem?.quantity ?? 0) > 0;
  };

  const addToCart = useSetAtom(addToCartAtom);
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState<string | undefined>();

  if (isLoading) {
    return (
      <div className="grid h-[24rem] grid-cols-2 gap-4 px-4">
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (isError) {
    return <div>Something went wrong</div>;
  }

  if (!product) {
    return <div>Product does not exist</div>;
  }

  if (!activeImage) {
    setActiveImage(product.images[0]?.url ?? "");
  }

  const priceLabel: string =
    `${product.price}`.split(".").length > 1
      ? `${product.price}`
      : `${product.price}.00`;

  const handleAddToCart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const availableStock = getAvailableStock();
    const finalQuantity = Math.min(quantity, availableStock);

    if (finalQuantity <= 0) {
      toast({
        title: "Cannot add to cart",
        description: "This item is out of stock",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      size: size,
      quantity: finalQuantity,
      price: product.price,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} was added to your cart`,
    });
  };

  return (
    <main className="flex flex-col gap-6 md:flex-row md:justify-center md:gap-14">
      <div className="flex w-full flex-col gap-4">
        <Image
          priority={true}
          width={500}
          height={500}
          className="aspect-square w-full overflow-hidden rounded-xl object-cover"
          src={activeImage ?? ""}
          alt={product.name}
        />
        <div className="grid grid-cols-6 gap-2">
          {product.images.map(({ id, url }: { id: string; url: string }) => (
            <button
              key={id}
              className={twMerge(
                `aspect-square w-full overflow-hidden rounded-xl border-2 border-transparent object-cover transition-colors ${
                  activeImage === url ? "border-primary border-2" : ""
                }`,
              )}
              onClick={() => setActiveImage(url)}
            >
              <Image
                priority={true}
                width={100}
                height={100}
                className="h-full w-full object-cover"
                src={url}
                alt={product.name}
              />
            </button>
          ))}
        </div>
      </div>
      <form
        className="flex w-full flex-col gap-y-8 md:gap-y-16"
        onSubmit={handleAddToCart}
      >
        <section className="md:pt-8">
          <h1 className="text-2xl font-medium">{product.name}</h1>
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
                        (a, b) => sortedSize.indexOf(a) - sortedSize.indexOf(b),
                      )
                      .map((sizeValue) => (
                        <SelectItem
                          key={sizeValue}
                          value={sizeValue}
                          disabled={!isSizeInStock(sizeValue)}
                        >
                          {sizeValue}{" "}
                          {!isSizeInStock(sizeValue) && "(Out of stock)"}
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
                max={getAvailableStock()}
                value={quantity}
                onChange={(e) => handleQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              disabled={
                product.availableSizes.length > 0 &&
                (!size || getAvailableStock() === 0)
              }
            >
              Add to Cart*
            </Button>
            <DisclaimerText />
          </div>
        </section>
      </form>
    </main>
  );
}
