import Link from "next/link";
import { Logo } from "@/lib/components/icons/Logo";
import { IconCart } from "@/lib/components/icons/icon-cart";
import { useAtom } from "jotai";
import { cartCountAtom } from "@/lib/products/cartStore";
import { useEffect, useState, useMemo } from "react";

export default function Header() {
  const [cartCount] = useAtom(cartCountAtom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const memoizedCartCount = useMemo(() => cartCount, [cartCount]);

  return (
    <header className="flex justify-between py-7">
      <Link href="/products">
        <Logo />
      </Link>
      <nav>
        <ul className="flex gap-9">
          <Link
            className="hidden underline-offset-8 hover:underline sm:block"
            href="/products"
          >
            Shop
          </Link>
          <Link
            className="hidden underline-offset-8 hover:underline sm:block"
            href="https://www.sfussss.org/"
            target="_blank"
          >
            SSSS Website
          </Link>
          <Link href="/products/cart" className="relative">
            <IconCart />
            <span className="absolute -right-1 -top-1 rounded-full bg-black px-1 text-center text-xs text-white">
              {isClient ? memoizedCartCount : "0"}
            </span>
          </Link>
        </ul>
      </nav>
    </header>
  );
}
