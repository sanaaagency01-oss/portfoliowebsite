"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProjectCard from "@/components/project-card"
import DepthCarousel, { type DepthCarouselItem } from "@/components/DepthCarousel"
import CollectionGallery from "@/components/collection-gallery"
import FadeUp from "@/components/fade-up"
import ScrollFloat from "@/components/ui/scroll-float"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import type { Project } from "@/lib/projects"
import { collections, type Collection } from "@/lib/collections"

interface WorkContentProps {
  projects: Project[]
}

export default function WorkContent({ projects }: WorkContentProps) {
  const { lang } = useLang()
  const T = translations[lang].work
  const Tc = translations[lang].cta
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0)

  // Category filter options
  const categoryFilters = useMemo(
    () => [
      { id: "all", label: lang === "mn" ? "Бүгд" : "All" },
      { id: "Poster", label: lang === "mn" ? "Постер" : "Poster" },
      { id: "Typography", label: lang === "mn" ? "Типографи" : "Typography" },
      { id: "Fonts", label: lang === "mn" ? "Фонт" : "Fonts" },
    ],
    [lang]
  )

  // Flattened items from collections for DepthCarousel
  const allCollectionItems = useMemo(() => {
    return collections.flatMap((col) => {
      const colName = lang === "mn" && col.nameMn ? col.nameMn : col.name
      return col.items.map((item) => ({
        image: encodeURI(item.images[0] || col.cover),
        alt: lang === "mn" && item.titleMn ? item.titleMn : item.title,
        title: lang === "mn" && item.titleMn ? item.titleMn : item.title,
        category: col.category,
        collectionName: colName,
        collection: col,
        item: item,
        actionText: lang === "mn" ? "Коллекц үзэх →" : "View collection →",
      }))
    })
  }, [lang])

  // Filtered carousel items based on selected category tab
  const carouselItems = useMemo(() => {
    if (selectedCategory === "all") return allCollectionItems
    const filtered = allCollectionItems.filter((item) => item.category === selectedCategory)
    // If fewer than 4 items (e.g. Typography or Fonts with 2 items), expand with sub-images for a full 3D stack
    if (filtered.length < 4) {
      const targetCol = collections.find((c) => c.category === selectedCategory)
      if (targetCol) {
        const colName = lang === "mn" && targetCol.nameMn ? targetCol.nameMn : targetCol.name
        const expanded: DepthCarouselItem[] = []
        targetCol.items.forEach((item) => {
          item.images.forEach((img, idx) => {
            expanded.push({
              image: encodeURI(img),
              alt: `${item.title} ${idx + 1}`,
              title: `${lang === "mn" && item.titleMn ? item.titleMn : item.title} ${targetCol.items.length > 1 && item.images.length > 1 ? `#${idx + 1}` : ""}`.trim(),
              category: targetCol.category,
              collectionName: colName,
              collection: targetCol,
              item: item,
              actionText: lang === "mn" ? "Коллекц үзэх →" : "View collection →",
            })
          })
        })
        return expanded
      }
    }
    return filtered
  }, [allCollectionItems, selectedCategory, lang])

  const currentItem = carouselItems[activeItemIndex] || carouselItems[0]

  return (
    <>
      <Navigation />

      <main className="pt-[68px]">
        {/* Header */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16">
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
                <ProjectCard project={project} priority={i < 2} />
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pb-28 md:pb-36">
          <FadeUp>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-t border-[#e0e0e0] pt-8 gap-4">
              <div>
                <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-1">
                  {lang === "mn" ? "Коллекц" : "Collections"}
                </p>
                <p className="text-[#888888] text-[13px]">
                  {carouselItems.length}{" "}
                  {lang === "mn" ? "бүтээл" : "pieces"} •{" "}
                  {collections.length}{" "}
                  {lang === "mn" ? "коллекц" : "collections"}
                </p>
              </div>

              {/* Category filters */}
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id)
                      setActiveItemIndex(0)
                    }}
                    className={`text-[13px] font-medium tracking-wide nav-link transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? "text-black font-bold"
                        : "text-[#888888] hover:text-black"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Depth Carousel Container */}
          <div style={{ height: "500px", position: "relative" }} className="w-full">
            <DepthCarousel
              key={selectedCategory}
              items={carouselItems}
              depth={220}
              spread={90}
              tilt={22}
              tiltDirection="right"
              perspective={1400}
              visibleCards={4}
              falloff={0.2}
              blur={6}
              autoplay
              loop
              onChange={(idx) => setActiveItemIndex(idx)}
              onItemClick={(item) => {
                if (item.collection) setActiveCollection(item.collection)
              }}
            />
          </div>

          {/* Active Card Info & Action bar */}
          {currentItem && (
            <FadeUp delay={0.1}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-[#e0e0e0]">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
                      {currentItem.collectionName}
                    </span>
                    <span className="text-[#cccccc]">•</span>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#888888]">
                      {currentItem.category}
                    </span>
                  </div>
                  <h3 className="text-black text-[20px] font-bold tracking-tight">
                    {currentItem.title}
                  </h3>
                </div>

                {currentItem.collection && (
                  <button
                    type="button"
                    onClick={() => setActiveCollection(currentItem.collection)}
                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-semibold hover:bg-[#222222] transition-colors"
                  >
                    {lang === "mn" ? "Коллекц үзэх" : "Explore Collection"} ({currentItem.collection.items.length}{" "}
                    {lang === "mn" ? "бүтээл" : "pieces"}) &rarr;
                  </button>
                )}
              </div>
            </FadeUp>
          )}
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

      <CollectionGallery
        collection={activeCollection}
        onClose={() => setActiveCollection(null)}
      />
    </>
  )
}
