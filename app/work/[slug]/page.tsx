import { notFound } from "next/navigation"
import { getAllProjects, getProjectBySlug } from "@/lib/projects"
import ProjectContent from "./ProjectContent"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: project.name,
    description: project.description.slice(0, 160),
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      title: `${project.name} | baysaass`,
      description: project.description.slice(0, 160),
      url: `/work/${slug}`,
      type: "website",
      images: project.cover
        ? [
            {
              url: project.cover,
              width: 1200,
              height: 630,
              alt: `${project.name} — ${project.category} by baysaass`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | baysaass`,
      description: project.description.slice(0, 160),
      images: project.cover ? [project.cover] : [],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const all = getAllProjects()
  const currentIndex = all.findIndex((p) => p.slug === slug)
  const next = all[(currentIndex + 1) % all.length]

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `https://baysaass.space/work/${slug}#work`,
        name: project.name,
        description: project.description,
        creator: {
          "@type": "Person",
          name: "baysaass",
          alternateName: "Т. Өсөхбаяр",
          url: "https://baysaass.space",
        },
        image: project.cover ? `https://baysaass.space${project.cover}` : undefined,
        genre: project.category,
        dateCreated: project.year,
        inLanguage: ["mn-MN", "en-US"],
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
          {
            "@type": "ListItem",
            position: 3,
            name: project.name,
            item: `https://baysaass.space/work/${slug}`,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <ProjectContent project={project} next={next} />
    </>
  )
}
