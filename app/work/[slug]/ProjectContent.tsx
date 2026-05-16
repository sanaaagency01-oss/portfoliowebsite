"use client"

import Image from "next/image"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import FadeUp from "@/components/fade-up"
import ProjectGallery from "@/components/project-gallery"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import type { Project } from "@/lib/projects"

interface Props {
  project: Project
  next: Project
}

export default function ProjectContent({ project, next }: Props) {
  const { lang } = useLang()
  const T = translations[lang]

  const tagline = lang === "mn" && project.taglineMn ? project.taglineMn : project.tagline
  const description = lang === "mn" && project.descriptionMn ? project.descriptionMn : project.description
  const nextTagline = lang === "mn" && next.taglineMn ? next.taglineMn : next.tagline

  return (
    <>
      <Navigation />

      <main className="pt-[68px]">
        {/* Title stack */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-12">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-10">
              {project.category} &middot; {project.year}
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-black text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.95]">
              {project.name}
            </h1>
            <h1 className="text-[#888888] text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.95]">
              {tagline}
            </h1>
          </FadeUp>
        </section>

        {/* Hero image */}
        <FadeUp distance={16} duration={0.9}>
          <div className="w-full aspect-[16/9] relative">
            <Image
              src={project.cover}
              alt={project.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </FadeUp>

        {/* Project details */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 md:gap-24">
            <FadeUp delay={0.05}>
              <div className="flex flex-col gap-10">
                <div>
                  <p className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase mb-3">
                    {T.project.client}
                  </p>
                  <p className="text-black text-[15px]">{project.client}</p>
                </div>
                <div>
                  <p className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase mb-3">
                    {T.project.services}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {project.services.map((s) => (
                      <li key={s} className="text-black text-[15px]">{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase mb-3">
                    {T.project.year}
                  </p>
                  <p className="text-black text-[15px]">{project.year}</p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <p className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase mb-6">
                {T.project.overview}
              </p>
              <p className="text-[#444444] text-[clamp(1rem,1.5vw,1.125rem)] leading-relaxed max-w-[640px]">
                {description}
              </p>
            </FadeUp>
          </div>
        </section>

        {/* Gallery */}
        <ProjectGallery
          images={project.images}
          name={project.name}
          galleryLayout={project.galleryLayout}
        />

        {/* Next project */}
        <section className="border-t border-[#e0e0e0]">
          <Link
            href={`/work/${next.slug}`}
            className="group flex flex-col md:flex-row items-start md:items-center gap-8 px-6 md:px-10 py-14 bg-[#ffffff] hover:bg-[#f5f5f5] transition-colors duration-300 max-w-[1320px] mx-auto"
          >
            <div className="shrink-0">
              <p className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase mb-4">
                {T.project.nextProject}
              </p>
              <div className="relative w-[200px] aspect-[16/10] overflow-hidden">
                <Image
                  src={next.cover}
                  alt={next.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="200px"
                />
              </div>
            </div>
            <div>
              <h3 className="text-black text-[clamp(1.5rem,4vw,3rem)] font-black tracking-[-0.03em] leading-[1.0] group-hover:text-[#444444] transition-colors duration-200">
                {next.name}
              </h3>
              <p className="text-[#888888] text-[clamp(1.25rem,3vw,2.5rem)] font-black tracking-[-0.03em] leading-[1.0]">
                {nextTagline}
              </p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
