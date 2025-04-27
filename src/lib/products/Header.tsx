import Link from "next/link";
import { Logo } from "@/lib/components/icons/Logo";
import { IconCart } from "@/lib/components/icons/icon-cart";
import { useAtom } from "jotai";
import { cartCountAtom } from "@/lib/products/cartStore";
import { useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/router";

export default function Header() {
  const [cartCount] = useAtom(cartCountAtom);
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const memoizedCartCount = useMemo(() => cartCount, [cartCount]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: "/products" }).catch((error) => {
      console.error("Sign out failed:", error);
    });
  };

  const navLinks = isClient
    ? [
        { href: "/products", label: "Shop" },
        { href: "/faq", label: "FAQ" },
        { href: "https://www.sfussss.org/", label: "SSSS", target: "_blank" },
        {
          href: status === "authenticated" ? "#" : "/api/auth/signin",
          label: status === "authenticated" ? "Sign Out" : "Sign In",
          onClick: status === "authenticated" ? handleSignOut : undefined,
        },
      ]
    : [];

  const isLinkActive = (href: string) => {
    if (href === "/products" && router.pathname === "/products") {
      return true;
    }
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <header className="relative z-1 flex justify-between py-7">
      <Link href="/">
        <Logo />
      </Link>

      {isClient && (
        <button
          className="relative z-20 block sm:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          {!isMenuOpen && memoizedCartCount > 0 && (
            <span className="absolute top-3 -right-2 rounded-full bg-black px-1 text-center text-xs text-white">
              {memoizedCartCount}
            </span>
          )}
        </button>
      )}

      <nav className="hidden sm:block">
        <ul className="flex gap-9">
          {isClient &&
            navLinks.map((link, index) => (
              <Link
                key={index}
                className={`underline-offset-8 hover:underline ${
                  isLinkActive(link.href) ? "underline" : ""
                }`}
                href={link.href}
                target={link.target}
                onClick={link.onClick}
              >
                {link.label}
              </Link>
            ))}
          <Link
            href="/products/cart"
            className={`relative ${
              router.pathname === "/products/cart"
                ? "underline underline-offset-8"
                : ""
            }`}
          >
            <IconCart />
            {isClient && memoizedCartCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-black px-1 text-center text-xs text-white">
                {memoizedCartCount}
              </span>
            )}
          </Link>
        </ul>
      </nav>

      {/* Mobile menu */}
      {isClient && isMenuOpen && (
        <div className="fixed inset-0 z-10 bg-white pt-24 sm:hidden">
          <nav className="container mx-auto px-4">
            <ul className="flex flex-col gap-6 text-lg">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    className={`block py-2 ${
                      isLinkActive(link.href) ? "font-medium" : ""
                    }`}
                    href={link.href}
                    target={link.target}
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      if (link.onClick) link.onClick(e);
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products/cart"
                  className={`flex items-center gap-2 py-2 ${
                    router.pathname === "/products/cart" ? "font-medium" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                  {memoizedCartCount > 0 && (
                    <span className="rounded-full bg-black px-2 py-1 text-center text-xs text-white">
                      {memoizedCartCount}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
