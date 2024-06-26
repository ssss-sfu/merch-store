import Link from "next/link";
import { Logo } from "@/lib/components/icons/Logo";
import { IconCart } from "@/lib/components/icons/icon-cart";

export default function Header() {
  return (
    <header className="flex justify-between px-4 py-7">
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
          <Link href="/products/cart">
            <IconCart />
          </Link>
        </ul>
      </nav>
    </header>
  );
}
