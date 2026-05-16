"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Project } from "@/lib/projects"
import { useLang } from "@/contexts/language-context"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { lang } = useLang()
  const tagline = lang === "mn" && project.taglineMn ? project.taglineMn : project.tagline
  return (
    <Link href={`/work/${project.slug}`} className="group block project-card">
      {/* Media container */}
      <div className="relative overflow-hidden bg-[#f0f0f0] aspect-[4/3]">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={project.cover}
            alt={project.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-[#000000] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </div>

      {/* Text metadata */}
      <div className="pt-3 pb-1 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-black text-[18px] sm:text-[20px] font-bold tracking-tight leading-tight group-hover:translate-x-1 transition-transform duration-300">
            {project.name}
          </h3>
          <span className="text-[#888888] text-[10px] sm:text-[11px] font-medium tracking-[0.06em] uppercase shrink-0 mt-0.5">
            {project.year}
          </span>
        </div>
        <p className="text-[#888888] text-[10px] sm:text-[11px] font-medium tracking-[0.08em] uppercase mt-0.5">
          {project.category}
        </p>
        <p className="text-[#aaaaaa] text-[11px] sm:text-[12px] leading-snug line-clamp-1 mt-0.5">
          {tagline}
        </p>
      </div>
    </Link>
  )
}
