import WorkContent from "./WorkContent"
import { getAllProjects } from "@/lib/projects"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Work - baysaass",
  description: "Selected brand identity, packaging, and design projects.",
}

export default function WorkPage() {
  const all = getAllProjects()
  return <WorkContent projects={all} />
}
