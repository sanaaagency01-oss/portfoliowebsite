import type { Metadata } from "next"
import HomeContent from "./HomeContent"

export const metadata: Metadata = {
  title: "baysaass — Brand Designer | Ulaanbaatar, Mongolia",
  description:
    "baysaass is a brand designer based in Ulaanbaatar, Mongolia — specializing in brand identity, logo design, packaging, typography, and visual systems for ambitious brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "baysaass — Brand Designer | Ulaanbaatar, Mongolia",
    description:
      "Brand identity, logo design, packaging, and visual systems for ambitious brands. Based in Ulaanbaatar, Mongolia.",
    url: "/",
    type: "website",
  },
}

export default function HomePage() {
  return <HomeContent />
}
