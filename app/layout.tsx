import type { Metadata } from "next";
import AuthGuard from "@/src/components/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pasar Splendid Admin",
  description: "Panel administrasi Pasar Splendid Malang",
};

export const instant = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
