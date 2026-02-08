import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blod Wiki",
  description: "Blood, Sweat, Tears - Dark Adaptation Wiki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
