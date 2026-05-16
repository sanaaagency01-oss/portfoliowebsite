"use client"

import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProjectCard from "@/components/project-card"
import FadeUp from "@/components/fade-up"
import ScrollFloat from "@/components/ui/scroll-float"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import type { Project } from "@/lib/projects"

interface WorkContentProps {
  projects: Project[]
}

export default function WorkContent({ projects }: WorkContentProps) {
  const { lang } = useLang()
  const T = translations[lang].work
  const Tc = translations[lang].cta

  return (
    <>
      <Navigation />

      <main className="pt-[68px]">
        {/* Header */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16">
  {/* sr-only h1 ensures every page has exactly one h1 for SEO; the visual heading below is an h2 via ScrollFloat */}
  <h1 className="sr-only">Work — Brand Design Portfolio by baysaass</h1>
  <FadeUp>
    <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-8">
      {T.label}
    </p>
  </FadeUp>

  <ScrollFloat
    containerClassName="text-black text-[clamp(2.5rem,6vw,5rem)] font-black tracking-[-0.04em] leading-tight max-w-[1200px]"
    scrollStart="center bottom+=40%"
    scrollEnd="bottom bottom-=30%"
    stagger={0.02}
  >
    {T.heading}
  </ScrollFloat>
</section>

        {/* Project grid */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pb-28 md:pb-36">
          <FadeUp delay={0.15}>
            <div className="flex items-center justify-between mb-10 border-t border-[#e0e0e0] pt-8">
              <p className="text-[#888888] text-[13px]">
                {T.projectsCount(projects.length)}
              </p>
              <div className="flex items-center gap-6">
                {T.filters.map((cat, i) => (
                  <button
                    key={cat}
                    className={`text-[13px] font-medium tracking-wide nav-link ${
                      i === 0 ? "text-black" : "text-[#888888]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-16">
            {projects.map((project, i) => (
              <FadeUp key={project.id} delay={(i % 2) * 0.1}>
                <ProjectCard project={project} />
              </FadeUp>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#e0e0e0] py-28 md:py-40 text-center px-6">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.15em] uppercase mb-6">
              {T.startLabel}
            </p>
          </FadeUp>
          <ScrollFloat
            containerClassName="text-black text-[clamp(2rem,4.5vw,3.5rem)] font-black tracking-[-0.04em] leading-tight max-w-[700px] mx-auto"
            scrollStart="center bottom+=30%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.02}
          >
            {T.ctaHeading}
          </ScrollFloat>
          <FadeUp delay={0.2}>
            <div className="mt-10">
              <Link
                href="/contact"
                className="text-black text-[clamp(1rem,2.5vw,1.5rem)] font-bold nav-link tracking-tight"
              >
                {Tc.link} &rarr;
              </Link>
            </div>
          </FadeUp>
        </section>
      </main>

      <Footer />
    </>
  )
}
