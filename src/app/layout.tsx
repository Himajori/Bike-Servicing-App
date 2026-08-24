import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BikeApp",
  description: "Customer bike servicing API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
