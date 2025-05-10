import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html style={{ colorScheme: "light" }} className="light">
      <Head>
        <meta
          name="description"
          content="Software Systems Student Society Merch Store, brought to you by Seb's Goods™"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-background">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
