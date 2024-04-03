import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getDomain } from "./url"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mermaid SSR API",
  description: "Prerender diagram from Mermaid.js text",
  metadataBase: new URL(getDomain())
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
