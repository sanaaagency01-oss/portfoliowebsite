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
  },
}

export default function WorkPage() {
  const all = getAllProjects()
  return <WorkContent projects={all} />
}
