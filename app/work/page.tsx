import WorkContent from "./WorkContent"
import { getAllProjects } from "@/lib/projects"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected brand identity, packaging, logo design, and visual system projects by baysaass — a brand designer based in Ulaanbaatar, Mongolia.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work | baysaass",
    description:
      "Selected brand identity, packaging, logo design, and visual system projects by baysaass.",
    url: "/work",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "baysaass — Selected Portfolio Works",
      },
    ],
  },
}

export default function WorkPage() {
  const all = getAllProjects()

  const workJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://baysaass.space/work#collection",
        name: "Selected Works — baysaass",
        description:
          "Portfolio of brand identity, packaging, and visual systems designed by baysaass.",
        url: "https://baysaass.space/work",
        hasPart: all.map((p) => ({
          "@type": "CreativeWork",
          name: p.name,
          url: `https://baysaass.space/work/${p.slug}`,
          genre: p.category,
        })),
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
            name: "Work",
            item: "https://baysaass.space/work",
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }}
      />
      <WorkContent projects={all} />
    </>
  )
}
