import type { Metadata, Viewport } from "next"
import { DM_Sans, Noto_Sans } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
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

/** Viewport \u2014 exported separately so Next.js injects the <meta> tag server-side */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://baysaass.space"),
  title: {
    default: "baysaass \u2014 Brand Designer | Ulaanbaatar, Mongolia",
    template: "%s | baysaass",
  },
  description:
    "baysaass is a brand designer based in Ulaanbaatar, Mongolia \u2014 specializing in brand identity, logo design, packaging, typography, and visual systems for ambitious brands.",
  keywords: [
    "brand designer Mongolia",
    "brand identity Ulaanbaatar",
    "logo design Mongolia",
    "packaging design",
    "visual identity",
    "typography design",
    "baysaass",
  ],
  icons: {
    icon: [
      { url: "/Group 3.svg", type: "image/svg+xml" },
      { url: "/Group 3.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/Group 1.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "baysaass",
    title: "baysaass \u2014 Brand Designer | Ulaanbaatar, Mongolia",
    description:
      "Brand identity, logo design, packaging, and visual systems for ambitious brands. Based in Ulaanbaatar, Mongolia.",
    url: "https://baysaass.space",
    locale: "en_US",
    images: [
      {
        url: "/hero-showreel.jpg",
        width: 1200,
        height: 630,
        alt: "baysaass \u2014 Brand Designer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "baysaass \u2014 Brand Designer | Ulaanbaatar, Mongolia",
    description:
      "Brand identity, logo design, packaging, and visual systems for ambitious brands. Based in Ulaanbaatar, Mongolia.",
    images: ["/hero-showreel.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
}

/** JSON-LD: Person + WebSite schemas for the whole site */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://baysaass.space/#person",
      name: "baysaass",
      url: "https://baysaass.space",
      email: "baysaauskhuu@gmail.com",
      jobTitle: "Brand Designer",
      description:
        "Brand designer based in Ulaanbaatar, Mongolia specializing in brand identity, logo design, packaging, and visual systems.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ulaanbaatar",
        addressCountry: "MN",
      },
      sameAs: [
        "https://www.instagram.com/_baysaa_notfound/",
        "https://www.behance.net/uskhuulevi",
        "https://www.facebook.com/sanaaagency0/",
        "https://www.tiktok.com/@_baysaa_notfound",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://baysaass.space/#website",
      url: "https://baysaass.space",
      name: "baysaass",
      description:
        "Portfolio of baysaass \u2014 a brand designer based in Ulaanbaatar, Mongolia.",
      publisher: { "@id": "https://baysaass.space/#person" },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#ffffff]">
      <head>
        {/* Dark-mode favicon */}
        <link rel="icon" href="/Group 4.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/Group 4.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/Group 2.png" sizes="180x180" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} ${notoSans.variable} font-sans antialiased bg-[#ffffff] text-black`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
