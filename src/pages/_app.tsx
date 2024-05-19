import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { Provider } from "jotai";
import "~/styles/globals.css";
import { Toaster } from "@/ui/toaster";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Provider>
      <SessionProvider session={session}>
        <Head>
          <title>SSSS Merch</title>
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
      <Toaster />
    </Provider>
  );
};

export default api.withTRPC(MyApp);
