"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { Collection, CollectionItem } from "@/lib/collections"
import { useLang } from "@/contexts/language-context"

interface CollectionGalleryProps {
  collection: Collection | null
  onClose: () => void
}

export default function CollectionGallery({ collection, onClose }: CollectionGalleryProps) {
  const { lang } = useLang()
  const [activeItem, setActiveItem] = useState<CollectionItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (collection) {
      setActiveItem(collection.items[0] ?? null)
      setActiveImageIndex(0)
    }
  }, [collection])

  useEffect(() => {
    if (collection) {
      document.body.style.overflow = "hidden"
    }
    return () => { document.body.style.overflow = "" }
  }, [collection])

  const allImages = activeItem?.images ?? []

  const prevImage = useCallback(() => {
    setActiveImageIndex((i) => (i - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const nextImage = useCallback(() => {
    setActiveImageIndex((i) => (i + 1) % allImages.length)
  }, [allImages.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!collection) return
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "ArrowRight") nextImage()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [collection, onClose, prevImage, nextImage])

  const title = collection
    ? (lang === "mn" && collection.nameMn ? collection.nameMn : collection.name)
    : ""
  const itemTitle = activeItem
    ? (lang === "mn" && activeItem.titleMn ? activeItem.titleMn : activeItem.title)
    : ""
  const itemDesc = activeItem
    ? (lang === "mn" && activeItem.descriptionMn ? activeItem.descriptionMn : activeItem.description)
    : ""

  return (
    <AnimatePresence>
      {collection && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[200] bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            key="panel"
            className="fixed inset-0 z-[201] flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 md:px-10 h-[56px] md:h-[64px] border-b border-[#e0e0e0] shrink-0">
              <div className="flex items-center gap-3 md:gap-6 min-w-0">
                <p className="text-black text-[13px] font-semibold tracking-tight truncate">{title}</p>
                <span className="text-[#cccccc] text-[12px] shrink-0">/</span>
                <p className="text-[#888888] text-[11px] md:text-[12px] tracking-[0.1em] uppercase shrink-0">
                  {collection.category}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-[#888888] hover:text-black text-[12px] md:text-[13px] font-semibold tracking-widest uppercase transition-colors nav-link shrink-0 ml-4"
                aria-label="Close gallery"
              >
                {lang === "mn" ? "Хаах" : "Close"}
              </button>
            </div>

            {/* Main content */}
            <div className="flex flex-col md:flex-row min-h-0 flex-1">

              {/* Left — image (fixed height on mobile, flex-1 on desktop) */}
              <div className="relative h-[44vh] md:h-auto md:flex-1 bg-[#f7f7f7] flex items-center justify-center overflow-hidden shrink-0 md:shrink">

                {/* Deck ghost images — stacked behind current poster */}
                {allImages.length > 2 && (
                  <div
                    className="absolute inset-0 pointer-events-none hidden sm:block"
                    style={{ zIndex: 0, opacity: 0.2, transform: "translate(20px, 16px) rotate(4deg)" }}
                  >
                    <Image
                      src={allImages[(activeImageIndex + 2) % allImages.length]}
                      alt=""
                      fill
                      className="object-contain p-6 md:p-10"
                      sizes="(max-width: 768px) 100vw, 65vw"
                    />
                  </div>
                )}
                {allImages.length > 1 && (
                  <div
                    className="absolute inset-0 pointer-events-none hidden sm:block"
                    style={{ zIndex: 1, opacity: 0.38, transform: "translate(10px, 8px) rotate(2deg)" }}
                  >
                    <Image
                      src={allImages[(activeImageIndex + 1) % allImages.length]}
                      alt=""
                      fill
                      className="object-contain p-6 md:p-10"
                      sizes="(max-width: 768px) 100vw, 65vw"
                    />
                  </div>
                )}

                {/* Current image */}
                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                  <AnimatePresence mode="wait">
                    {allImages[activeImageIndex] && (
                      <motion.div
                        key={allImages[activeImageIndex]}
                        className="relative w-full h-full"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.01 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <Image
                          src={allImages[activeImageIndex]}
                          alt={itemTitle}
                          fill
                          className="object-contain p-4 md:p-10"
                          sizes="(max-width: 768px) 100vw, 65vw"
                          priority
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Prev / Next arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white border border-[#e0e0e0] hover:border-black text-black transition-colors shadow-sm"
                      style={{ zIndex: 3 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white border border-[#e0e0e0] hover:border-black text-black transition-colors shadow-sm"
                      style={{ zIndex: 3 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {allImages.length > 1 && (
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
                    style={{ zIndex: 3 }}
                  >
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          i === activeImageIndex ? "bg-black w-4" : "bg-[#cccccc] w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right — sidebar (flex-1 + scroll on mobile, fixed width on desktop) */}
              <div className="flex-1 md:flex-none md:w-[300px] lg:w-[360px] border-t md:border-t-0 md:border-l border-[#e0e0e0] flex flex-col overflow-y-auto">

                {/* Item list */}
                <div className="border-b border-[#e0e0e0] shrink-0">
                  {collection.items.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveItem(item); setActiveImageIndex(0) }}
                      className={`w-full flex items-center justify-between px-4 md:px-6 py-3 md:py-4 text-left border-b border-[#f0f0f0] last:border-0 transition-colors duration-150 ${
                        activeItem?.id === item.id ? "bg-[#f7f7f7]" : "hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[#cccccc] text-[11px] font-semibold tracking-[0.1em] shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`text-[13px] md:text-[14px] font-medium tracking-tight truncate ${
                          activeItem?.id === item.id ? "text-black" : "text-[#666666]"
                        }`}>
                          {lang === "mn" && item.titleMn ? item.titleMn : item.title}
                        </span>
                      </div>
                      <span className="text-[#aaaaaa] text-[11px] shrink-0 ml-2">{item.year}</span>
                    </button>
                  ))}
                </div>

                {/* Active item metadata */}
                {activeItem && (
                  <div className="px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-5">
                    <div>
                      <p className="text-[#aaaaaa] text-[10px] font-medium tracking-[0.12em] uppercase mb-1">
                        {lang === "mn" ? "Гарчиг" : "Title"}
                      </p>
                      <p className="text-black text-[16px] md:text-[18px] font-bold tracking-tight">{itemTitle}</p>
                    </div>

                    <div className="flex gap-6 md:gap-8">
                      <div>
                        <p className="text-[#aaaaaa] text-[10px] font-medium tracking-[0.12em] uppercase mb-1">
                          {lang === "mn" ? "Захиалагч" : "Client"}
                        </p>
                        <p className="text-black text-[13px] md:text-[14px] font-medium">{activeItem.client}</p>
                      </div>
                      <div>
                        <p className="text-[#aaaaaa] text-[10px] font-medium tracking-[0.12em] uppercase mb-1">
                          {lang === "mn" ? "Он" : "Year"}
                        </p>
                        <p className="text-black text-[13px] md:text-[14px] font-medium">{activeItem.year}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#aaaaaa] text-[10px] font-medium tracking-[0.12em] uppercase mb-2">
                        {lang === "mn" ? "Тайлбар" : "Description"}
                      </p>
                      <p className="text-[#555555] text-[12px] md:text-[13px] leading-relaxed">{itemDesc}</p>
                    </div>

                    {activeItem.images.length > 1 && (
                      <div>
                        <p className="text-[#aaaaaa] text-[10px] font-medium tracking-[0.12em] uppercase mb-2">
                          {lang === "mn" ? "Зургууд" : "Images"}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {activeItem.images.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImageIndex(i)}
                              className={`relative w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded border-2 transition-all duration-150 ${
                                i === activeImageIndex ? "border-black" : "border-transparent"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`${itemTitle} ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Download button — зөвхөн downloadUrl байгаа үед */}
                    {activeItem.downloadUrl && (
                      <div className="pt-4 border-t border-[#f0f0f0]">
                        <p className="text-[#aaaaaa] text-[10px] font-medium tracking-[0.12em] uppercase mb-3">
                          {lang === "mn" ? "Татаж авах" : "Download"}
                        </p>
                        <a
                          href={activeItem.downloadUrl}
                          download
                          className="inline-flex items-center gap-2 bg-black text-white text-[12px] md:text-[13px] font-semibold px-4 md:px-5 py-2.5 rounded-full hover:bg-[#222] transition-colors duration-200"
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                            <path d="M6.5 1v7.5M3.5 6l3 3 3-3M1.5 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {lang === "mn" ? "Demo татах (.otf)" : "Download Demo (.otf)"}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
