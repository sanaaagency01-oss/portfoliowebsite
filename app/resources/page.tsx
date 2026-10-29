import React from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { getAllResources, getAllCategories } from '@/lib/resources/db'
import { ResourceType } from '@/lib/resources/types'
import {
  FileText,
  Download,
  Wrench,
  Search,
  ArrowRight,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react'

export const metadata = {
  title: 'Дизайны сан — Практик гарын авлага, татах загварууд & AI хэрэгслүүд | baysaass',
  description:
    'Брэндийн дизайн, стратеги, сав баглаа боодол, үсгийн соёлын практик гарын авлага, үнэгүй загварууд болон AI хэрэгслүүдийн нэгдсэн сан.',
}

export const dynamic = 'force-dynamic'

export default async function PublicResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const catFilter = params.category || 'all'
  const searchFilter = params.search || ''

  // Fetch only published resources
  const resources = await getAllResources({
    status: 'published',
    category: catFilter,
    search: searchFilter,
  })

  const categories = await getAllCategories()

  const featured = resources.find((r) => r.featured)
  const nonFeaturedList = featured && catFilter === 'all' ? resources.filter((r) => r.id !== featured.id) : resources

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'article':
        return <FileText className="size-3.5" />
      case 'download':
        return <Download className="size-3.5" />
      case 'tool':
        return <Wrench className="size-3.5" />
    }
  }

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'article':
        return 'Нийтлэл'
      case 'download':
        return 'Татах загвар'
      case 'tool':
        return 'Хэрэгсэл'
    }
  }

  const getCoverImage = (img?: string) => {
    if (!img) return ''
    if (img.includes('/work/one-more-night')) return ''
    if (img.includes('/work/cae-logo')) return ''
    if (img.includes('/work/tsuiwan-package')) return ''
    if (img.startsWith('/work/')) return ''
    return img.trim()
  }

  return (
    <>
      <Navigation />

      <main className="bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32 min-h-screen">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10">
          {/* Top Micro-label */}
          <div className="mb-4">
            <p className="text-[#888888] text-[11px] sm:text-[12px] font-medium tracking-[0.18em] uppercase">
              Дизайны сан & Хэрэгслүүд
            </p>
          </div>

          {/* Header */}
          <div className="max-w-[800px] mb-12">
            <h1 className="text-black text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-[-0.03em] leading-tight text-balance mb-4">
              Дизайны сан
            </h1>
            <p className="text-[#666666] text-[15px] sm:text-[17px] leading-relaxed">
              Брэнд дизайны бодит туршлага дээр суурилсан практик удирдамж, үнэгүй татах загварууд болон AI хэрэгслүүдийн нэгдсэн сан.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-12 border-b border-[#e0e0e0]">
            {/* Category Links */}
            <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href="/resources"
                className={`text-[13px] font-medium tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                  catFilter === 'all'
                    ? 'text-black font-bold border-b-2 border-black pb-1'
                    : 'text-[#888888] hover:text-black pb-1'
                }`}
              >
                Бүгд
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/resources?category=${c.id}`}
                  className={`text-[13px] font-medium tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                    catFilter === c.id
                      ? 'text-black font-bold border-b-2 border-black pb-1'
                      : 'text-[#888888] hover:text-black pb-1'
                  }`}
                >
                  {c.nameMn}
                </Link>
              ))}
            </div>

            {/* Total Count */}
            <p className="text-[#888888] text-[13px] font-medium shrink-0">
              {resources.length} материал
            </p>
          </div>

          {/* Featured Resource Hero */}
          {featured && catFilter === 'all' && (() => {
            const featuredCover = getCoverImage(featured.coverImage)
            const hasCover = Boolean(featuredCover)

            return (
              <div className="mb-14">
                <div className="group rounded-2xl border border-[#e0e0e0] bg-white overflow-hidden hover:border-black/30 transition-all">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div className={`${hasCover ? 'lg:col-span-7' : 'lg:col-span-12'} p-8 md:p-12 flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                            ★ Онцлох
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black text-white uppercase tracking-wider">
                            {getTypeIcon(featured.type)}
                            <span>{getTypeLabel(featured.type)}</span>
                          </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight mb-3">
                          {featured.title}
                        </h2>
                        <p className="text-sm md:text-base text-[#666666] leading-relaxed mb-6 line-clamp-3 max-w-3xl">
                          {featured.summary}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-[#e0e0e0] flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-[#888888]">
                          <span>{featured.readTimeMinutes || 5} мин унших</span>
                          <span>·</span>
                          <span>{categories.find((c) => c.id === featured.category)?.nameMn}</span>
                        </div>

                        <Link
                          href={featured.destinationUrl || `/resources/${featured.slug}`}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition"
                        >
                          <span>{featured.ctaLabel}</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>

                    {hasCover && (
                      <div className="lg:col-span-5 bg-[#f0f0f0] min-h-[260px] relative overflow-hidden flex items-center justify-center">
                        <img
                          src={featuredCover}
                          alt={featured.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Resources Grid */}
          {resources.length === 0 ? (
            <div className="rounded-2xl border border-[#e0e0e0] p-16 text-center bg-[#fafafa]">
              <BookOpen className="size-12 text-[#a1a1aa] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-1">Материал олдсонгүй</h3>
              <p className="text-xs text-[#888888] mb-6">
                Сонгосон ангилалд нийтлэгдсэн материал одоогоор байхгүй байна.
              </p>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold"
              >
                <span>Бүх материалыг харах</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {(catFilter === 'all' ? nonFeaturedList : resources).map((res, idx) => {
                const catName = categories.find((c) => c.id === res.category)?.nameMn || res.category
                const linkHref = res.destinationUrl || `/resources/${res.slug}`
                const cover = getCoverImage(res.coverImage)
                const hasCover = Boolean(cover)

                return (
                  <Link
                    key={res.id}
                    href={linkHref}
                    className="group block"
                  >
                    {hasCover ? (
                      /* CASE 1: Card WITH uploaded cover image */
                      <>
                        <div className="relative overflow-hidden bg-[#f0f0f0] aspect-[16/10] rounded-2xl mb-4 border border-[#e0e0e0]">
                          <img
                            src={cover}
                            alt={res.title}
                            className="size-full object-cover group-hover:scale-104 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-xs text-black shadow-xs">
                              {getTypeIcon(res.type)}
                              <span>{getTypeLabel(res.type)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Metadata & Typography */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-medium tracking-[0.06em] text-[#888888] uppercase">
                            <span>{catName}</span>
                            <span>{res.readTimeMinutes || 5} мин</span>
                          </div>

                          <h3 className="text-black text-[17px] sm:text-[19px] font-bold tracking-tight leading-snug group-hover:translate-x-1 transition-transform duration-300">
                            {res.title}
                          </h3>

                          {res.summary && (
                            <p className="text-[#666666] text-[12px] sm:text-[13px] leading-relaxed line-clamp-2 mt-1">
                              {res.summary}
                            </p>
                          )}

                          <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-black group-hover:text-blue-600 transition-colors">
                            <span>{res.ctaLabel}</span>
                            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </>
                    ) : (
                      /* CASE 2: Card WITHOUT image -> Title fitted inside the card box */
                      <>
                        <div className="relative overflow-hidden bg-[#fafafa] aspect-[16/10] rounded-2xl mb-4 border border-[#e4e4e7] p-5 sm:p-6 flex flex-col justify-between group-hover:border-black/40 group-hover:bg-[#f4f4f5] transition-all shadow-2xs">
                          {/* Top Row: Type Badge + Read time */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-black border border-[#e4e4e7] shadow-2xs">
                              {getTypeIcon(res.type)}
                              <span>{getTypeLabel(res.type)}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#888888] tracking-wider uppercase">
                              {res.readTimeMinutes || 5} МИН
                            </span>
                          </div>

                          {/* Center: Title fitted inside the card */}
                          <div className="my-auto py-2">
                            <h3 className="text-black text-[18px] sm:text-[20px] font-black tracking-tight leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                              {res.title}
                            </h3>
                          </div>

                          {/* Bottom Row inside card */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-[#e4e4e7]/70 text-[11px] font-medium text-[#71717a]">
                            <span className="truncate">{catName}</span>
                            <span className="font-mono text-[10px] text-[#a1a1aa] shrink-0 uppercase tracking-wider">
                              baysaass
                            </span>
                          </div>
                        </div>

                        {/* Metadata & Summary below card */}
                        <div className="flex flex-col gap-1">
                          {res.summary && (
                            <p className="text-[#666666] text-[12px] sm:text-[13px] leading-relaxed line-clamp-2">
                              {res.summary}
                            </p>
                          )}

                          <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-black group-hover:text-blue-600 transition-colors">
                            <span>{res.ctaLabel}</span>
                            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Signature Portfolio Pre-Footer CTA */}
          <section className="border-t border-[#e0e0e0] mt-24 pt-24 md:pt-32 text-center px-6">
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.15em] uppercase mb-6">
              START A PROJECT / ХАМТРАН АЖИЛЛАХ
            </p>
            <h2 className="text-black text-[clamp(2rem,4.5vw,3.5rem)] font-black tracking-[-0.04em] leading-tight max-w-[700px] mx-auto">
              Дараагийн төсөлдөө бэлэн үү?
            </h2>
            <div className="mt-10">
              <Link
                href="/contact"
                className="text-black text-[clamp(1rem,2.5vw,1.5rem)] font-bold nav-link tracking-tight inline-flex items-center gap-2"
              >
                Холбогдох &rarr;
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
