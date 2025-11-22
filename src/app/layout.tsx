import Head from "next/head";
import type { Metadata } from "next";
import localFont from "next/font/local";

import "../shared/styles/index.scss";

const lausanne = localFont({
  src: [{ path: "../shared/assets/fonts/TWKLausannePan-350.otf", style: "normal" }],
  variable: "--font-lausanne-pan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Bot",
  description: "AI Bot",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lausanne.variable}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
