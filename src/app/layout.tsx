import type { Metadata, Viewport } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { AppChatbot } from "@/components/app-chatbot";

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const heading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BikeService — book a bike repair",
  description:
    "Repair your bike without leaving home. Find a workshop, see prices, and book doorstep or pickup & drop.",
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
      <body className="min-h-full font-sans">
        {children}
        <AppChatbot />
      </body>
    </html>
  );
}
