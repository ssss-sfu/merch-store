import { atom } from "jotai";
import { type GetCartInput } from "~/schemas/order";

export type CartItem = GetCartInput & {
  quantity: number;
};

export const cartAtom = atom<CartItem[]>([]);

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
