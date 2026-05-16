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

  return <ProjectContent project={project} next={next} />
}
