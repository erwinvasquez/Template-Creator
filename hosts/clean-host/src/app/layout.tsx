import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { loadPayload } from "@web-generator/fashion-atelier-v1";
import "./globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const payload = loadPayload();

export const metadata: Metadata = {
  title: {
    default: payload.seo.default.title,
    template: payload.seo.titleTemplate,
  },
  description: payload.seo.default.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={payload.brand.locale.slice(0, 2)}
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
