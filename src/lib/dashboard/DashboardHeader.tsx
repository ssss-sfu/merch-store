import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardHeader() {
  const { data: session } = useSession();
  return (
    <header className="flex justify-between">
      <h1>Dashboard</h1>
      <div className="flex gap-2">
        <nav>
          <ul className="flex gap-2">
            <li>
              <Link href="/dashboard/orders">Orders</Link>
            </li>
            <li>
              <Link href="/dashboard/product-management">
                Product Management
              </Link>
            </li>
          </ul>
        </nav>
        {session && (
          <button onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
        )}
      </div>
    </header>
  );
}
