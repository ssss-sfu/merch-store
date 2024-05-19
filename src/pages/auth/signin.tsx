import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const callbackUrl = router.query.callbackUrl as string | undefined;
    await signIn("credentials", {
      username,
      password,
      callbackUrl: `${callbackUrl ? callbackUrl : "/dashboard"}`,
    });
  };

  const hasError = router.query.error;

  return (
    <main className="fixed inset-0 grid place-items-center">
      <form
        className="grid gap-4 rounded border-4 border-input p-6"
        onSubmit={onSubmit}
      >
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
        {hasError && (
          <p className="w-64 break-normal rounded bg-red-200 p-4 text-red-500">
            Invalid Credentials. Please try again.
          </p>
        )}
      </form>
    </main>
  );
}
