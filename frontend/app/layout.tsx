import type { Metadata } from "next"
import "./globals.css"
import { Layout } from "@/components/Layout"
import { THEME_SCRIPT } from "@/lib/theme"

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
    <html lang="en" suppressHydrationWarning data-theme="gothic">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
