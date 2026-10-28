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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "baysaass — Contact & Brief Intake",
      },
    ],
  },
}

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://baysaass.space/contact#page",
        name: "Contact — baysaass",
        description: "Inquire about brand identity, packaging, or typography design projects.",
        url: "https://baysaass.space/contact",
        mainEntity: {
          "@id": "https://baysaass.space/#studio",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://baysaass.space",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact",
            item: "https://baysaass.space/contact",
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactContent />
    </>
  )
}
