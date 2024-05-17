import { useAtomValue, useSetAtom } from "jotai";
import {
  CartItem,
  cartAtom,
  clearCartAtom,
  removeFromCartAtom,
  updateCartItemQuantityAtom,
} from "~/components/cartStore";
import Header from "~/components/products/Header";
import { Input } from "~/components/ui/Input";
import Layout from "~/components/ui/Layout";
import { Button } from "~/components/ui/Button";
import {
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/Dialog";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AddFormOrder, addFormOrderSchema } from "~/schemas/order";
import { FieldValidation } from "~/components/ui/FieldValidation";
import { useToast } from "~/components/ui/useToast";
import { useState } from "react";
import Image from "next/image";
import { DisclaimerText } from "~/components/products/DisclaimerText";

// Prevent Nextjs hydration warning
const ClientSideDialog = dynamic(
  () => import("~/components/ui/Dialog").then((mod) => mod.Dialog),
  {
    ssr: false,
  },
);

export default function Index() {
  const cart = useAtomValue(cartAtom);
  const clearCart = useSetAtom(clearCartAtom);

  const setQuantity = useSetAtom(updateCartItemQuantityAtom);
  const handleQuantityChange = (id: string, quantity: number) =>
    setQuantity({ id, quantity });

  const removeFromCart = useSetAtom(removeFromCartAtom);
  const handleRemove = (id: string) => removeFromCart({ id });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products, isLoading } = api.product.getAll.useQuery(undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddFormOrder>({
    resolver: zodResolver(addFormOrderSchema),
    defaultValues: { name: "", email: "" },
  });

  const { toast } = useToast();
  const placeOrderMutation = api.order.add.useMutation({
    onSuccess() {
      toast({ title: "Order placed" });
      clearCart();
      reset();
      setIsModalOpen(false);
    },
    onError(error) {
      if (error.data?.code && error.data.code === "CONFLICT") {
        toast({
          title: "Failed to place order",
          description: "This product no longer exist",
        });
      } else {
        toast({ title: "Failed to place order" });
      }
    },
  });
  const placeOrder = handleSubmit((data) =>
    placeOrderMutation.mutate({ ...data, products: cart }),
  );

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!products) {
    return <p>Failed to load products</p>;
  }

  const productPriceMap = new Map(products.map((p) => [p.id, p.price]));
  const totalPrice: string = cart
    .reduce((accumulator, currentItem) => {
      const productId = currentItem.size
        ? (currentItem.id.split("-")[0] as string)
        : currentItem.id;
      const quantity = currentItem.quantity;

      const price = productPriceMap.get(productId);
      let totalAddedPrice = 0;

      if (price) {
        totalAddedPrice += price * quantity;
      }

      return accumulator + totalAddedPrice;
    }, 0)
    .toFixed(2);

  return (
    <Layout>
      <Header />
      <main className="px-4">
        <h2 className="pb-8 text-3xl	font-medium">Your Cart</h2>
        <section className="flex flex-col-reverse	gap-10 md:flex-row">
          {cart.length ? (
            <ul className="flex w-full	flex-col gap-8">
              {cart.map((item) => {
                const productId = item.size ? item.id.split("-")[0] : item.id;
                return (
                  <CartItem
                    key={item.id}
                    price={productPriceMap.get(productId as string)}
                    {...item}
                    handleRemove={handleRemove}
                    handleQuantityChange={handleQuantityChange}
                  />
                );
              })}
            </ul>
          ) : (
            <p className="w-full text-xl">No items yet</p>
          )}
          <div className="md:max-w-[30%]">
            <h2 className="pb-8 text-xl	font-medium">Total</h2>
            <p className="pb-4 text-3xl">${totalPrice}</p>
            <ClientSideDialog
              open={isModalOpen}
              onOpenChange={(e) => setIsModalOpen(e)}
            >
              <DialogTrigger asChild>
                <div className="flex flex-col gap-2">
                  <Button disabled={cart.length === 0}>Place Order*</Button>
                  <DisclaimerText />
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Place Order</DialogTitle>
                <form className="grid gap-4" onSubmit={placeOrder}>
                  <div className="grid gap-2">
                    <label htmlFor="name">Name</label>
                    <FieldValidation error={errors.name}>
                      <Input id="name" {...register("name")} />
                    </FieldValidation>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email">Email</label>
                    <FieldValidation error={errors.email}>
                      <Input id="email" {...register("email")} />
                    </FieldValidation>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={placeOrderMutation.isLoading}
                    >
                      Place Order*
                    </Button>
                    <DisclaimerText />
                  </div>
                </form>
              </DialogContent>
            </ClientSideDialog>
          </div>
        </section>
      </main>
    </Layout>
  );
}

type CartItemProps = CartItem & {
  price: number | undefined;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleRemove: (id: string) => void;
};

function CartItem({
  id,
  name,
  size,
  price,
  quantity,
  imageLink,
  handleQuantityChange,
  handleRemove,
}: CartItemProps) {
  return (
    <li className="flex items-start gap-8">
      <Image
        priority={true}
        width={500}
        height={500}
        className="aspect-square w-[30%] max-w-[180px] overflow-hidden rounded-xl object-cover"
        src={imageLink}
        alt={name}
      />
      <ul>
        <li>
          <h3 className="pb-4 font-medium	">{name}</h3>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <label>Quantity:</label>
          <Input
            type="number"
            className="w-16"
            min={1}
            onChange={(e) => handleQuantityChange(id, e.target.valueAsNumber)}
            value={quantity}
          />
        </li>
        {!!size && <li className="text-sm">Size: {size}</li>}
        <li className="text-sm">
          Total Price:{" "}
          {price ? (
            <span>${(price * quantity).toFixed(2)}</span>
          ) : (
            <span>This product is no longer sold</span>
          )}
        </li>
        <li className="pt-2">
          <Button variant="outline" onClick={() => handleRemove(id)}>
            Remove
          </Button>
        </li>
      </ul>
    </li>
  );
}
