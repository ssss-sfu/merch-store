import { atom } from "jotai";
import { type GetCartInput } from "~/schemas/order";

export type CartItem = GetCartInput & {
  quantity: number;
};

const getCartFromSessionStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const cart = sessionStorage.getItem("cart");
    return cart ? (JSON.parse(cart) as CartItem[]) : [];
  }
  return [];
};

const saveCartToSessionStorage = (cart: CartItem[]) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }
};

const cartWithSessionStorageAtom = atom<CartItem[]>(
  getCartFromSessionStorage(),
);

export const cartAtom = atom(
  (get) => get(cartWithSessionStorageAtom),
  (get, set, update: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    const newCart =
      typeof update === "function"
        ? update(get(cartWithSessionStorageAtom))
        : update;
    set(cartWithSessionStorageAtom, newCart);
    saveCartToSessionStorage(newCart);
  },
);

export const addToCartAtom = atom(null, (get, set, update: CartItem) => {
  const cart = get(cartAtom);
  const index = cart.findIndex(
    (item) => item.id === update.id && item.size === update.size,
  );

  if (index === -1) {
    set(cartAtom, [...cart, update]);
  } else {
    set(
      cartAtom,
      cart.map((item, i) => {
        if (i === index) {
          return { ...item, quantity: item.quantity + update.quantity };
        }
        return item;
      }),
    );
  }
});

export const updateCartItemQuantityAtom = atom(
  null,
  (get, set, update: Pick<CartItem, "id" | "size" | "quantity">) => {
    const cart = get(cartAtom);
    const index = cart.findIndex(
      (item) => item.id === update.id && item.size === update.size,
    );

    if (index === -1) {
      return;
    }

    set(
      cartAtom,
      cart.map((item, i) => {
        if (i === index) {
          return { ...item, quantity: update.quantity };
        }
        return item;
      }),
    );
  },
);

export const removeFromCartAtom = atom(
  null,
  (get, set, update: Pick<CartItem, "id" | "size">) => {
    const cart = get(cartAtom);
    set(
      cartAtom,
      cart.filter((item) => item.id !== update.id || item.size !== update.size),
    );
  },
);

export const clearCartAtom = atom(null, (_, set) => {
  set(cartAtom, []);
});

export const cartCountAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce((count, item) => count + item.quantity, 0);
});
