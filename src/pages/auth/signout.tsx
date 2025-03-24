import { signOut } from "next-auth/react";
import { Button } from "~/lib/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/products" }).catch((error) => {
      console.error("Sign out failed:", error);
    });
  };

  return (
    <main className="fixed inset-0 grid place-items-center">
      <form
        className="border-input grid gap-4 rounded border-4 p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="mb-2 text-center text-2xl font-bold">
          Are you sure you want to sign out?
        </h1>

        <div className="flex justify-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="button" onClick={() => handleSignOut()}>
            Yes, Sign Out
          </Button>
        </div>
      </form>
    </main>
  );
}
