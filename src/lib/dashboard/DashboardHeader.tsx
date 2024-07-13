import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/lib/components/icons/Logo";
import Link from "next/link";

export default function DashboardHeader() {
  const { data: session } = useSession();
  return (
    <header className="flex justify-between py-7">
      <Link href="/products">
        <Logo />
      </Link>
      <nav>
        <ul className="flex gap-9">
          <Link
            className="hidden underline-offset-8 hover:underline sm:block"
            href="/dashboard/orders"
          >
            Orders
          </Link>
          <Link
            className="hidden underline-offset-8 hover:underline sm:block"
            href="/dashboard/product-management"
          >
            Product Management
          </Link>
          {session && (
            <button
              className="hidden underline-offset-8 hover:underline sm:block"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          )}
        </ul>
      </nav>
    </header>
  );
}
