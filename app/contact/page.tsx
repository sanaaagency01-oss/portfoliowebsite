import type { Metadata } from "next"
import ContactContent from "./ContactContent"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with baysaass. Get in touch to discuss brand identity, logo design, packaging, or any creative brief — based in Ulaanbaatar, Mongolia.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | baysaass",
    description:
      "Start a project with baysaass. Get in touch to discuss brand identity, logo design, packaging, or any creative brief.",
    url: "/contact",
    type: "website",
  },
}

export default function ContactPage() {
  return <ContactContent />
}
