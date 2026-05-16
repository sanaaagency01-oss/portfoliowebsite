import AboutContent from "./AboutContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description:
    "baysaass is a brand designer based in Ulaanbaatar, Mongolia. Learn about the design process, brand philosophy, services offered, and clients worked with.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | baysaass",
    description:
      "Brand designer based in Ulaanbaatar, Mongolia. Discover the design process, philosophy, and clients behind baysaass.",
    url: "/about",
    type: "website",
    images: [
      {
        url: "/about-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "baysaass — Brand Designer",
      },
    ],
  },
}

export default function AboutPage() {
  return <AboutContent />
}
