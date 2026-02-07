import type { Metadata } from "next"
import "./globals.css"
import { Layout } from "@/components/Layout"
import { THEME_SCRIPT } from "@/lib/theme"
import { NarrativeProvider } from "@/lib/narrative-context"
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

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
    <html 
      lang="en" 
      suppressHydrationWarning 
      data-theme="gothic"
      className={`${cormorant.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_SCRIPT,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-pattern bg-overlay`}>
        <NarrativeProvider>
          <Layout>{children}</Layout>
        </NarrativeProvider>
      </body>
    </html>
  )
}
