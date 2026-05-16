import AboutContent from "./AboutContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - baysaass",
  description: "A brand designer based in Dublin. Learn about the process, philosophy, and clients.",
}

export default function AboutPage() {
  return <AboutContent />
}
