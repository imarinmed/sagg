import type { Metadata } from "next"
import "./globals.css"
import { Layout } from "@/components/Layout"

export const metadata: Metadata = {
  title: "Blod, Svett, Tårar - Dark Adaptation Wiki",
  description: "Knowledge base for the dark adaptation of Blod svett tårar",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
