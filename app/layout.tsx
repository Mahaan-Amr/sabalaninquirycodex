import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "استعلام قیمت سبلان",
  description: "سامانه استعلام قیمت محصولات سنگ سبلان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body>{children}</body>
    </html>
  );
}
