import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/ui/button";

export default function InvalidAccount() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    void router.push("/auth/signin");
  };

  const handleBackToHome = () => {
    void router.push("/products");
  };

  return (
    <main className="fixed inset-0 grid place-items-center">
      <div className="grid gap-4 rounded border-4 border-input p-6 text-center">
        <h1 className="mb-2 text-center text-2xl font-bold">
          Invalid Permissions
        </h1>

        <div className="w-96 break-normal rounded bg-red-200 p-4 text-red-500">
          Oops! Your account does not have permissions to access this page.
          Please try a different account.
        </div>

        <Button onClick={handleLogout} className="mt-2">
          Logout
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleBackToHome}>
          Back to Home
        </Button>
      </div>
    </main>
  );
}
