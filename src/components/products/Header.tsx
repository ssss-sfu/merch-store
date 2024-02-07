import Link from "next/link";
import { Logo } from "~/components/ui/Logo";
import { IconCart } from "~/components/ui/icon";

export default function Header() {
  return (
    <header className="flex justify-between px-4 py-7">
      <Link href="/products">
        <Logo />
      </Link>
      <nav>
        <ul className="flex gap-9">
          <Link className="hidden sm:block" href="/products">
            Shop
          </Link>
          <Link
            className="hidden sm:block"
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
