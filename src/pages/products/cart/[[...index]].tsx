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
import {
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Dialog as ClientSideDialog,
} from "@/ui/dialog";
import { type RouterOutputs, api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AddFormOrder, addFormOrderSchema } from "~/schemas/order";
import { FieldValidation } from "@/lib/components/FieldValidation";
import { useToast } from "@/ui/use-toast";
import { useState, useMemo, Suspense, useEffect } from "react";
import Image from "next/image";
import { DisclaimerText } from "@/lib/products/DisclaimerText";
import { Skeleton } from "~/lib/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Product = RouterOutputs["product"]["getFromCart"][number];

export default function Index() {
  return (
    <Layout>
      <Header />
      <Content />
    </Layout>
  );
}

function Content() {
  const cart = useAtomValue(cartAtom);
  const clearCart = useSetAtom(clearCartAtom);
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryUtils = api.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AddFormOrder>({
    resolver: zodResolver(addFormOrderSchema),
    defaultValues: {
      name: "",
      email: session?.user?.email ?? "no-reply@sfussss.org",
      discord: "",
    },
  });

  useEffect(() => {
    if (session?.user?.email) {
      reset({
        ...getValues(),
        email: session.user.email,
      });
    }
  }, [getValues, session, reset]);

  const { toast } = useToast();
  const router = useRouter();
  const handleDialogOpen = (open: boolean) => {
    if (session === null) {
      router.push("/auth/signin");
      return;
    }
    if (open && cart.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }
    setIsModalOpen(open);
  };
  const placeOrderMutation = api.order.add.useMutation({
    async onSuccess(res) {
      if (res?.type && res.type === "error") {
        toast({
          title: "An error occured",
          variant: "destructive",
          description: (
            <ul>
              {res.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ),
        });
        await queryUtils.product.getFromCart.invalidate();
        setIsModalOpen(false);
        return;
      }

      const orderId = res.id;

      toast({ title: "Order placed" });
      clearCart();
      reset();
      setIsModalOpen(false);

      // Redirect to the order confirmation page
      if (orderId) {
        router.push(`/order/${orderId}`);
      }
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

  return (
    <main className="">
      <h2 className="pb-8 text-3xl font-medium">Your Cart</h2>
      <section className="flex flex-col-reverse gap-10 md:flex-row">
        <div className="w-full">
          {isClient ? (
            <>
              {cart.length > 0 ? (
                <ProductList cart={cart} />
              ) : (
                <p className="w-full text-xl">No items yet</p>
              )}
            </>
          ) : (
            <CartItemSkeleton />
          )}
        </div>

        <div className="md:max-w-[30%]">
          <h2 className="pb-8 text-xl font-medium">Total</h2>
          <p className="pb-4 text-3xl">
            <Suspense fallback={<>$0.00</>}>
              <TotalPrice cart={cart} />
            </Suspense>
          </p>
          {isClient ? (
            <ClientSideDialog
              open={isModalOpen}
              onOpenChange={handleDialogOpen}
            >
              <Suspense>
                <DialogTrigger asChild>
                  <div className="flex flex-col gap-2">
                    <Button disabled={cart.length === 0}>Place Order*</Button>
                    <DisclaimerText />
                  </div>
                </DialogTrigger>
              </Suspense>
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
                    <label htmlFor="discord">Discord</label>
                    <FieldValidation error={errors.discord}>
                      <Input id="discord" {...register("discord")} />
                    </FieldValidation>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email">Email</label>
                    <FieldValidation error={errors.email}>
                      <Input
                        id="email"
                        {...register("email")}
                        readOnly
                        disabled
                        className="cursor-not-allowed"
                      />
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
          ) : (
            <Skeleton className="h-10 w-96" />
          )}
        </div>
      </section>
    </main>
  );
}

function ProductList({ cart }: { cart: CartItem[] }) {
  const { data: products } = api.product.getFromCart.useQuery(
    cart.map((item) => ({ id: item.id, size: item.size, price: item.price })),
    { refetchOnWindowFocus: false, suspense: true },
  );

  return (
    <ul className="flex w-full flex-col gap-8">
      {cart.map((cartItem) => (
        <CartItemComponent
          key={
            cartItem.size !== undefined
              ? cartItem.id + cartItem.size
              : cartItem.id
          }
          cart={cartItem}
          product={products?.find((product) => product.id === cartItem.id)}
        />
      ))}
    </ul>
  );
}

function TotalPrice({ cart }: { cart: CartItem[] }) {
  const totalPrice = useMemo(() => {
    return cart
      .reduce((accumulator, currentItem) => {
        const quantity = currentItem.quantity;
        return accumulator + quantity * currentItem.price;
      }, 0)
      .toFixed(2);
  }, [cart]);

  return <>${totalPrice}</>;
}

type CartItemComponentProps = {
  cart: CartItem;
  product: Product | undefined;
};

function CartItemComponent({ cart, product }: CartItemComponentProps) {
  const setQuantity = useSetAtom(updateCartItemQuantityAtom);
  const removeFromCart = useSetAtom(removeFromCartAtom);
  const { toast } = useToast();

  const handleQuantityChange = (id: string, quantity: number) => {
    const maxQuantity =
      product?.type === "normal" && cart.size
        ? (product.availableSizes?.find((sizeObj) => sizeObj.size === cart.size)
            ?.quantity ?? 1)
        : 1;

    if (quantity > maxQuantity) {
      toast({
        title: "Maximum quantity reached",
        description: `You cannot add more than ${maxQuantity} of this item.`,
        variant: "destructive",
      });
      quantity = maxQuantity;
    }

    setQuantity({ id, quantity, size: cart.size });
  };

  if (!product) {
    return (
      <li>
        <CartItemSkeleton />
      </li>
    );
  }

  if (product.type === "not-exist") {
    return (
      <li>
        <p>This product doesn&#39;t exist</p>
      </li>
    );
  }

  const maxQuantity =
    product.type === "normal" && cart.size
      ? (product.availableSizes?.find((sizeObj) => sizeObj.size === cart.size)
          ?.quantity ?? 1)
      : 1;

  return (
    <li>
      <div className="flex items-start gap-8">
        <Image
          priority={true}
          width={500}
          height={500}
          className="aspect-square w-[30%] max-w-[180px] overflow-hidden rounded-xl object-cover"
          src={product.images?.[0]?.url ?? ""}
          alt={product.name}
        />
        <div>
          <h3 className="pb-4 font-medium">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <label>Quantity:</label>
            <Input
              type="number"
              className="w-16"
              min={1}
              max={maxQuantity + 1}
              onChange={(e) =>
                handleQuantityChange(product.id, e.target.valueAsNumber)
              }
              value={cart.quantity}
            />
          </div>
          {!!cart.size && <p className="text-sm">Size: {cart.size}</p>}
          <p className="text-sm">
            Total Price: <span>${(cart.price * cart.quantity).toFixed(2)}</span>
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => removeFromCart({ id: cart.id, size: cart.size })}
            >
              Remove
            </Button>
          </div>
        </div>

        {product.type === "archived" ? (
          <p>This product has been archived. Please remove from your cart.</p>
        ) : (
          <>
            {!!product?.errors?.length && (
              <div>
                <h3 className="mb-4">Notes:</h3>
                <ul className="ml-auto">
                  {product.errors.map((error, i) => (
                    <li key={i}>
                      {error.type === "size" ? (
                        <p>
                          The size {error.invalidSize} does not exist anymore.
                          The available sizes are{" "}
                          {error.availableSizes.join(", ")}
                        </p>
                      ) : (
                        <p>
                          The price of this product was changed to $
                          {error.price}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <p>Please remove and add the item again</p>
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}

function CartItemSkeleton() {
  return (
    <li>
      <div className="flex items-start gap-8">
        <Skeleton className="aspect-square w-[30%] max-w-[180px] rounded-xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="pt-2">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </li>
  );
}
