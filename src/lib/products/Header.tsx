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
            className="hidden sm:block hover:underline underline-offset-8" 
            href="/products">
            Shop
          </Link>
          <Link
            className="hidden sm:block hover:underline underline-offset-8"
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
