import { useAtomValue, useSetAtom } from "jotai";
import {
  type CartItem as CartItemComponent,
  cartAtom,
  clearCartAtom,
  removeFromCartAtom,
  updateCartItemQuantityAtom,
  type CartItem,
} from "@/lib/products/cartStore";
import Header from "@/lib/products/Header";
import { Input } from "@/ui/input";
import Layout from "@/lib/components/Layout";
import { Button } from "@/ui/button";
import { DialogContent, DialogTitle, DialogTrigger } from "@/ui/dialog";
import dynamic from "next/dynamic";
import { type RouterOutputs, api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AddFormOrder, addFormOrderSchema } from "~/schemas/order";
import { FieldValidation } from "@/lib/components/FieldValidation";
import { useToast } from "@/ui/use-toast";
import { useState } from "react";
import Image from "next/image";
import { DisclaimerText } from "@/lib/products/DisclaimerText";

// Prevent Nextjs hydration warning
const ClientSideDialog = dynamic(
  () => import("@/ui/dialog").then((mod) => mod.Dialog),
  {
    ssr: false,
  },
);

type Product = RouterOutputs["product"]["getFromCart"][number];

export default function Index() {
  const cart = useAtomValue(cartAtom);
  const clearCart = useSetAtom(clearCartAtom);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = api.product.getFromCart.useQuery(
    cart.map((item) => ({ id: item.id, size: item.size, price: item.price })),
  );

  console.log(products);

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

  const totalPrice: string = cart
    .reduce((accumulator, currentItem) => {
      const quantity = currentItem.quantity;

      return accumulator + quantity * currentItem.price;
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
              {cart.map((cartItem) => {
                return (
                  <CartItemComponent
                    key={cartItem.id}
                    cart={cartItem}
                    product={products?.find(
                      (product) => product.id === cartItem.id,
                    )}
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

type CartItemComponentProps = {
  cart: CartItem;
  product: Product | undefined;
};

function CartItemComponent({ cart, product }: CartItemComponentProps) {
  const setQuantity = useSetAtom(updateCartItemQuantityAtom);
  const handleQuantityChange = (id: string, quantity: number) =>
    setQuantity({ id, quantity, size: cart.size });

  const removeFromCart = useSetAtom(removeFromCartAtom);

  if (!product) {
    return <div>Loading...</div>;
  }

  if (product.type === "not-exist") {
    return (
      <div>
        <p>This product doesn&#39;t exist</p>
      </div>
    );
  }

  return (
    <li>
      <div className="flex items-start gap-8">
        <Image
          priority={true}
          width={500}
          height={500}
          className="aspect-square w-[30%] max-w-[180px] overflow-hidden rounded-xl object-cover"
          src={product.imageLink}
          alt={product.name}
        />
        <div>
          <h3 className="pb-4 font-medium	">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <label>Quantity:</label>
            <Input
              type="number"
              className="w-16"
              min={1}
              onChange={(e) =>
                handleQuantityChange(product.id, e.target.valueAsNumber)
              }
              value={cart.quantity}
            />
          </div>
          {!!cart.size && <li className="text-sm">Size: {cart.size}</li>}
          <p className="text-sm">
            Total Price: <span>${(cart.price * cart.quantity).toFixed(2)}</span>
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => removeFromCart({ id: cart.id, size: cart.size })}
              disabled={product.type === "archived"}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
      {!!product?.errors?.length && (
        <ul className="rounded bg-red-300 p-2">
          {product.errors.map((error, i) => (
            <li key={i}>
              {error.type === "size" ? (
                <p>
                  The size {cart.size} does not exist anymore. The available
                  sizes are {error.availableSizes.join(" ")}
                </p>
              ) : (
                <p>The price of this product was changed to ${error.price}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
