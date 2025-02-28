import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { status } = useSession();
  const { ticket, error } = router.query;

  const casCallbackUrl = "/products/cart";
  const credentialsCallbackUrl = "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl =
        sessionStorage.getItem("callbackUrl") ?? credentialsCallbackUrl;
      void router.replace(callbackUrl);
      return;
    }

    if (ticket && typeof ticket === "string") {
      const redirectUrl = new URL(
        "auth/signin",
        process.env.NEXT_PUBLIC_URL ?? window.location.origin,
      ).toString();

      void signIn("cas", {
        ticket,
        redirectUrl,
        callbackUrl: casCallbackUrl,
        redirect: false,
      }).then((response) => {
        if (response?.ok) {
          void router.replace(casCallbackUrl);
        }
      });
    }
  }, [ticket, status, router]);

  const onCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await signIn("credentials", {
      username,
      password,
      callbackUrl: credentialsCallbackUrl,
    });
  };

  const onSfuSignIn = () => {
    const serviceUrl = new URL(
      "auth/signin",
      process.env.NEXT_PUBLIC_URL ?? window.location.origin,
    ).toString();

    const casLoginUrl = new URL("https://cas.sfu.ca/cas/login");
    casLoginUrl.searchParams.append("service", serviceUrl);

    sessionStorage.setItem("callbackUrl", casCallbackUrl);

    window.location.href = casLoginUrl.toString();
  };

  if (ticket && status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Authenticating with SFU...</h1>
          <p className="mt-2">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 grid place-items-center">
      <form
        className="grid gap-4 rounded border-4 border-input p-6"
        onSubmit={onCredentialsSubmit}
      >
        <h1 className="mb-2 text-center text-2xl font-bold">Sign In</h1>

        <label className="flex flex-col gap-2">
          Username
          <Input
            className="w-64"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          Password
          <Input
            className="w-64"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <Button type="submit">Sign in</Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={onSfuSignIn}>
          Sign in with SFU
        </Button>

        {(error === "CredentialsSignin" || error === "SFUAuthFailed") && (
          <p className="w-64 break-normal rounded bg-red-200 p-4 text-red-500">
            {error === "SFUAuthFailed"
              ? "SFU authentication failed. Please try again."
              : "Invalid credentials. Please try again."}
          </p>
        )}
      </form>
    </main>
  );
}
