type ProductWithPrice = { price: number; [key: string]: unknown };

export function transformProductsPriceToView<T extends ProductWithPrice>(
  products: T[],
): T[] {
  products.forEach((product) => {
    product.price = product.price / 100;
  });
  return products;
}

export function transformProductPriceToView<T extends ProductWithPrice>(
  product: T,
): T {
  product.price = product.price / 100;
  return product;
}
