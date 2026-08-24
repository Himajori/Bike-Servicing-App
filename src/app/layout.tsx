import type { Metadata, Viewport } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const heading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BikeApp — Bike servicing",
  description:
    "Book doorstep or pickup-and-drop bike service, track the job, pay, and review your mechanic.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c1710",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
