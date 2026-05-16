import type { Metadata } from "next"
import { DM_Sans, Noto_Sans } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "900"],
})

const notoSans = Noto_Sans({
  subsets: ["cyrillic"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: "baysaass \u2014 Portfolio",
  description:
    "Personal portfolio of a designer crafting brands, packaging, and experiences for world-class clients.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#ffffff]">
      <body className={`${dmSans.variable} ${notoSans.variable} font-sans antialiased bg-[#ffffff] text-black`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
