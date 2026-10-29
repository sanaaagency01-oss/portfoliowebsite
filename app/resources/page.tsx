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
  searchParams: Promise<{ type?: string; category?: string; search?: string }>
}) {
  const params = await searchParams
  const typeFilter = params.type as ResourceType | undefined
  const catFilter = params.category || 'all'
  const searchFilter = params.search || ''

  // Fetch only published resources
  const resources = await getAllResources({
    status: 'published',
    type: typeFilter,
    category: catFilter,
    search: searchFilter,
  })

  const categories = await getAllCategories()

  const featured = resources.find((r) => r.featured)
  const nonFeaturedList = featured ? resources.filter((r) => r.id !== featured.id) : resources

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
              Брэнд дизайнер Т. Өсөхбаярын бодит туршлага дээр суурилсан практик удирдамж, үнэгүй татах загварууд болон AI хэрэгслүүдийн нэгдсэн сан.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-10 border-b border-[#e0e0e0]">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Link
                href={`/resources${typeFilter ? `?type=${typeFilter}` : ''}`}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  catFilter === 'all'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-[#666666] border border-[#e0e0e0] hover:border-black'
                }`}
              >
                Бүгд
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/resources?category=${c.id}${typeFilter ? `&type=${typeFilter}` : ''}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    catFilter === c.id
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-[#666666] border border-[#e0e0e0] hover:border-black'
                  }`}
                >
                  {c.nameMn}
                </Link>
              ))}
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#fafafa] border border-[#e0e0e0] p-1 rounded-full shrink-0">
              {[
                { id: undefined, label: 'Бүгд' },
                { id: 'article', label: 'Нийтлэл' },
                { id: 'download', label: 'Татах файл' },
                { id: 'tool', label: 'Хэрэгсэл' },
              ].map((t) => {
                const active = typeFilter === t.id
                const query = new URLSearchParams()
                if (catFilter !== 'all') query.set('category', catFilter)
                if (t.id) query.set('type', t.id)
                const href = `/resources${query.toString() ? `?${query.toString()}` : ''}`

                return (
                  <Link
                    key={t.label}
                    href={href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      active ? 'bg-black text-white shadow-xs' : 'text-[#888888] hover:text-black'
                    }`}
                  >
                    {t.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Featured Resource Hero */}
          {featured && catFilter === 'all' && !typeFilter && (
            <div className="mb-14">
              <div className="group rounded-3xl border border-[#e0e0e0] bg-[#fafafa] overflow-hidden hover:border-black/30 hover:shadow-xl transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                          ★ Онцлох материал
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-black text-white uppercase tracking-wider">
                          {getTypeIcon(featured.type)}
                          <span>{getTypeLabel(featured.type)}</span>
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-4xl font-extrabold text-black tracking-tight mb-4">
                        {featured.title}
                      </h2>
                      <p className="text-sm md:text-base text-[#666666] leading-relaxed mb-6 line-clamp-3">
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
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg"
                      >
                        <span>{featured.ctaLabel}</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-[#f4f4f5] min-h-[260px] relative overflow-hidden flex items-center justify-center">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <BookOpen className="size-16 text-[#a1a1aa]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources Grid */}
          {resources.length === 0 ? (
            <div className="rounded-3xl border border-[#e0e0e0] p-16 text-center bg-[#fafafa]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(catFilter === 'all' && !typeFilter ? nonFeaturedList : resources).map((res) => {
                const catName = categories.find((c) => c.id === res.category)?.nameMn || res.category
                const linkHref = res.destinationUrl || `/resources/${res.slug}`

                return (
                  <div
                    key={res.id}
                    className="group rounded-3xl border border-[#e0e0e0] bg-[#fafafa] overflow-hidden hover:border-black/30 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="h-48 bg-[#f4f4f5] relative overflow-hidden flex items-center justify-center border-b border-[#e0e0e0]">
                        {res.coverImage ? (
                          <img
                            src={res.coverImage}
                            alt={res.title}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <BookOpen className="size-10 text-[#a1a1aa]" />
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-black shadow-xs">
                            {getTypeIcon(res.type)}
                            <span>{getTypeLabel(res.type)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 mb-2">
                          <span>{catName}</span>
                          <span>·</span>
                          <span className="text-[#888888]">{res.readTimeMinutes || 5} мин</span>
                        </div>

                        <h3 className="text-base font-bold text-black tracking-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {res.title}
                        </h3>

                        <p className="text-xs text-[#666666] leading-relaxed line-clamp-3 mb-4">
                          {res.summary}
                        </p>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="p-6 pt-0">
                      <Link
                        href={linkHref}
                        className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-full border border-[#e0e0e0] bg-white text-xs font-semibold text-black hover:border-black hover:bg-black hover:text-white transition-all shadow-xs"
                      >
                        <span>{res.ctaLabel}</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
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
