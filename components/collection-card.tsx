"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import type { Collection } from "@/lib/collections"

interface CollectionCardProps {
  collection: Collection
  index: number
  onClick: (collection: Collection) => void
}

export default function CollectionCard({ collection, index, onClick }: CollectionCardProps) {
  return (
    <motion.button
      onClick={() => onClick(collection)}
      className="group block w-full text-left cursor-pointer"
      whileTap={{ scale: 0.98 }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#f0f0f0] aspect-[4/3]">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={collection.cover}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-4 text-white text-[11px] font-semibold tracking-[0.12em] uppercase opacity-80">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="absolute bottom-3 right-4 text-white text-[11px] font-medium tracking-wide opacity-70">
          {collection.items.length} {collection.items.length === 1 ? "piece" : "pieces"}
        </div>
      </div>

      {/* Text metadata */}
      <div className="pt-3 pb-1 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-black text-[18px] sm:text-[20px] font-bold tracking-tight leading-tight group-hover:translate-x-1 transition-transform duration-300">
            {collection.name}
          </h3>
          <span className="text-[#888888] text-[10px] sm:text-[11px] font-medium tracking-[0.06em] uppercase shrink-0 mt-0.5">
            Collection
          </span>
        </div>
        <p className="text-[#888888] text-[10px] sm:text-[11px] font-medium tracking-[0.08em] uppercase mt-0.5">
          {collection.category}
        </p>
        <p className="text-[#aaaaaa] text-[11px] sm:text-[12px] leading-snug mt-0.5">
          Click to explore →
        </p>
      </div>
    </motion.button>
  )
}
