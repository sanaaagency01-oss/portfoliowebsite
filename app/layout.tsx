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
  subsets: ["cyrillic", "cyrillic-ext"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "600", "700", "900"],
})

/** Viewport — exported separately so Next.js injects the <meta> tag server-side */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://baysaass.space"),
  title: {
    default: "baysaass — Brand Designer | Ulaanbaatar, Mongolia",
    template: "%s | baysaass",
  },
  description:
    "baysaass is a brand designer based in Ulaanbaatar, Mongolia — specializing in brand identity, logo design, packaging, typography, and visual systems for ambitious brands.",
  keywords: [
    "brand designer Mongolia",
    "brand identity Ulaanbaatar",
    "logo design Mongolia",
    "packaging design Mongolia",
    "visual identity system",
    "typography design",
    "baysaass",
    "Өсөхбаяр дизайнер",
    "брэндинг хийх",
    "лого дизайн",
    "лого хийлгэх",
    "сав баглаа боодлын дизайн",
    "график дизайнер Улаанбаатар",
    "хэвлэлийн эх бэлтгэл",
  ],
  authors: [{ name: "baysaass", url: "https://baysaass.space" }],
  creator: "baysaass",
  publisher: "baysaass",
  category: "design",
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
    title: "baysaass — Brand Designer | Ulaanbaatar, Mongolia",
    description:
      "Brand identity, logo design, packaging, and visual systems for ambitious brands. Based in Ulaanbaatar, Mongolia.",
    url: "https://baysaass.space",
    locale: "mn_MN",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "baysaass — Brand Designer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "baysaass — Brand Designer | Ulaanbaatar, Mongolia",
    description:
      "Brand identity, logo design, packaging, and visual systems for ambitious brands. Based in Ulaanbaatar, Mongolia.",
    images: ["/twitter-image"],
    creator: "@_baysaa_notfound",
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

/** JSON-LD: Person + WebSite + ProfessionalService schemas for full site */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://baysaass.space/#person",
      name: "baysaass",
      alternateName: "Т. Өсөхбаяр",
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
        "Portfolio of baysaass — a brand designer based in Ulaanbaatar, Mongolia.",
      publisher: { "@id": "https://baysaass.space/#person" },
      inLanguage: ["mn-MN", "en-US"],
    },
    {
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": "https://baysaass.space/#studio",
      name: "baysaass — Brand Design Studio",
      url: "https://baysaass.space",
      logo: "https://baysaass.space/Group%201.png",
      image: "https://baysaass.space/opengraph-image",
      description:
        "Brand identity, logo design, packaging, and visual systems studio founded by baysaass in Ulaanbaatar, Mongolia.",
      founder: { "@id": "https://baysaass.space/#person" },
      email: "baysaauskhuu@gmail.com",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ulaanbaatar",
        addressCountry: "MN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 47.9184,
        longitude: 106.9177,
      },
      areaServed: [
        { "@type": "City", "name": "Ulaanbaatar" },
        { "@type": "Country", "name": "Mongolia" },
        { "@type": "AdministrativeArea", "name": "Worldwide" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Design Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Brand Identity Design",
              description:
                "Complete visual brand strategy, logos, typography, color palettes, and comprehensive brand guidelines.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Packaging & Label Design",
              description:
                "Custom retail packaging, labels, print finishes, and production-ready dielines.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Typography & Visual Systems",
              description:
                "Custom lettering, editorial layout, and scalable design systems for modern digital and physical mediums.",
            },
          },
        ],
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn" className="bg-[#ffffff]">
      <head>
        {/* Geo tags for local search engine indexing */}
        <meta name="geo.region" content="MN-1" />
        <meta name="geo.placename" content="Ulaanbaatar" />
        <meta name="geo.position" content="47.9184;106.9177" />
        <meta name="ICBM" content="47.9184, 106.9177" />

        {/* Favicons */}
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
