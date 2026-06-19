import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sabalanerp.com"),
  title: "استعلام قیمت سبلان",
  description: "سامانه استعلام قیمت محصولات سنگ سبلان",
  icons: {
    icon: "/brand/sabalan-logo.jpg",
    shortcut: "/brand/sabalan-logo.jpg",
    apple: "/brand/sabalan-logo.jpg",
  },
  openGraph: {
    title: "استعلام قیمت سبلان",
    description: "سامانه استعلام قیمت محصولات سنگ سبلان",
    images: ["/brand/sabalan-logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "استعلام قیمت سبلان",
    description: "سامانه استعلام قیمت محصولات سنگ سبلان",
    images: ["/brand/sabalan-logo.jpg"],
  },
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
