import Image from "next/image"
import FadeUp from "@/components/fade-up"
import type { GalleryRow } from "@/lib/projects"

interface ProjectGalleryProps {
  images: string[]
  name: string
  galleryLayout?: GalleryRow[]
}

// ── Explicit layout renderer ────────────────────────────────────────────────

function ExplicitGallery({ rows, name }: { rows: GalleryRow[]; name: string }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => {
        // Full-width image
        if (row.type === "full") {
          return (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="relative aspect-[16/9] w-full bg-[#f0f0f0]">
                <Image
                  src={row.image}
                  alt={`${name} — ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </FadeUp>
          )
        }

        // Pair — fixed square crop
        if (row.type === "pair") {
          return (
            <div key={i} className="grid grid-cols-2 gap-3">
              {row.images.map((img, ii) => (
                <FadeUp key={img} delay={i * 0.04 + ii * 0.03}>
                  <div className="relative aspect-square bg-[#f0f0f0]">
                    <Image
                      src={img}
                      alt={`${name} — ${i + 1}.${ii + 1}`}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  </div>
                </FadeUp>
              ))}
            </div>
          )
        }

        // Pair natural — each image at its own proportions, no crop
        if (row.type === "pair-natural") {
          return (
            <FadeUp key={i} delay={i * 0.04}>
              <div className={`grid gap-3 ${row.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {row.images.map((img, ii) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={img}
                    src={img}
                    alt={`${name} — ${i + 1}.${ii + 1}`}
                    className="w-full h-auto block bg-[#f0f0f0]"
                    loading="lazy"
                  />
                ))}
              </div>
            </FadeUp>
          )
        }

        // Diptych — seamless side-by-side, no gap
        if (row.type === "diptych") {
          return (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="grid grid-cols-2 gap-0 overflow-hidden">
                {row.images.map((img, ii) => (
                  <div key={img} className="relative aspect-square bg-[#f0f0f0]">
                    <Image
                      src={img}
                      alt={`${name} — ${i + 1}.${ii + 1}`}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  </div>
                ))}
              </div>
            </FadeUp>
          )
        }

        // Triple — 3 images in one row, natural proportions
        if (row.type === "triple") {
          return (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="grid grid-cols-3 gap-3">
                {row.images.map((img, ii) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={img}
                    src={img}
                    alt={`${name} — ${i + 1}.${ii + 1}`}
                    className="w-full h-auto block bg-[#f0f0f0]"
                    loading="lazy"
                  />
                ))}
              </div>
            </FadeUp>
          )
        }

        return null
      })}
    </div>
  )
}

// ── Auto layout renderer (fallback) ────────────────────────────────────────
// Pattern: [img, img] → full → repeat

function AutoGallery({ images, name }: { images: string[]; name: string }) {
  const groups: Array<{ pair: string[]; full: string | null }> = []
  for (let i = 0; i < images.length; i += 3) {
    groups.push({ pair: images.slice(i, i + 2), full: images[i + 2] ?? null })
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-3">
          {group.pair.length > 0 && (
            <div className={`grid gap-3 ${group.pair.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {group.pair.map((img, ii) => (
                <FadeUp key={img} delay={gi * 0.08 + ii * 0.04}>
                  <div className="relative aspect-square bg-[#f0f0f0]">
                    <Image
                      src={img}
                      alt={`${name} — ${gi * 3 + ii + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </FadeUp>
              ))}
            </div>
          )}
          {group.full && (
            <FadeUp delay={gi * 0.08 + 0.08}>
              <div className="relative aspect-[16/9] bg-[#f0f0f0]">
                <Image
                  src={group.full}
                  alt={`${name} — ${gi * 3 + 3}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </FadeUp>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Public component ────────────────────────────────────────────────────────

export default function ProjectGallery({ images, name, galleryLayout }: ProjectGalleryProps) {
  const hasContent = galleryLayout ? galleryLayout.length > 0 : images.length > 1
  if (!hasContent) return null

  return (
    <section className="max-w-[1320px] mx-auto px-6 md:px-10 pb-24">
      {galleryLayout
        ? <ExplicitGallery rows={galleryLayout} name={name} />
        : <AutoGallery images={images} name={name} />
      }
    </section>
  )
}
