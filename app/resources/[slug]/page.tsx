import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import {
  getResourceBySlug,
  getAllResources,
  getAllCategories,
  incrementResourceViews,
} from '@/lib/resources/db'
import {
  ArrowLeft,
  FileText,
  Download,
  Wrench,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Share2,
  ChevronRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const res = await getResourceBySlug(slug)
  if (!res) return { title: 'Материал олдсонгүй | baysaass' }

  return {
    title: `${res.title} | baysaass дизайны сан`,
    description: res.summary,
    openGraph: {
      title: res.title,
      description: res.summary,
      images: res.coverImage ? [res.coverImage] : [],
    },
  }
}

export default async function PublicResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)

  if (!resource || resource.status !== 'published') {
    notFound()
  }

  // Increment views in background
  incrementResourceViews(resource.id).catch(() => {})

  const categories = await getAllCategories()
  const cat = categories.find((c) => c.id === resource.category)

  // Related
  const allInCat = await getAllResources({ status: 'published', category: resource.category })
  const related = allInCat.filter((r) => r.id !== resource.id).slice(0, 3)

  return (
    <>
      <Navigation />

      <main className="bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32 min-h-screen">
        <div className="max-w-[960px] mx-auto px-6 md:px-10">
          {/* Top Breadcrumb Bar */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#e0e0e0]">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#888888] hover:text-black transition"
            >
              <ArrowLeft className="size-4" />
              <span>Дизайны сан руу буцах</span>
            </Link>

            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {cat?.nameMn || resource.category}
            </span>
          </div>

          {/* Micro-label & Title */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#f4f4f5] text-black uppercase tracking-wider">
                {resource.type === 'article' && <FileText className="size-3.5" />}
                {resource.type === 'download' && <Download className="size-3.5" />}
                {resource.type === 'tool' && <Wrench className="size-3.5" />}
                <span>
                  {resource.type === 'article'
                    ? 'Нийтлэл'
                    : resource.type === 'download'
                    ? 'Татах файл'
                    : 'Хэрэгсэл'}
                </span>
              </span>

              <span className="text-xs text-[#888888]">
                {resource.readTimeMinutes || 5} мин унших
              </span>

              <span className="text-xs text-[#888888]">·</span>

              <span className="text-xs text-[#888888]">
                {new Date(resource.publishedAt || resource.createdAt).toLocaleDateString('mn-MN')}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black leading-[1.12] mb-4">
              {resource.title}
            </h1>

            <p className="text-base md:text-lg text-[#666666] leading-relaxed">
              {resource.summary}
            </p>
          </div>

          {/* Cover Image */}
          {resource.coverImage && (
            <div className="rounded-3xl border border-[#e0e0e0] overflow-hidden mb-12 shadow-sm bg-[#fafafa]">
              <img
                src={resource.coverImage}
                alt={resource.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* MAIN BODY BASED ON TYPE */}

          {/* Type A: ARTICLE */}
          {resource.type === 'article' && (
            <div className="max-w-none mb-16 text-[#222222] leading-relaxed text-base md:text-lg">
              <div className="whitespace-pre-line leading-relaxed space-y-6">
                {resource.content}
              </div>
            </div>
          )}

          {/* Type B: DOWNLOAD / TEMPLATE */}
          {resource.type === 'download' && (
            <div className="mb-16 space-y-8">
              <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-8 md:p-10 shadow-xs">
                <h2 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
                  <Download className="size-5 text-blue-600" />
                  <span>Татаж авах файлууд</span>
                </h2>
                <p className="text-xs text-[#666666] mb-6">
                  Дараах эх файлуудыг өөрийн брэнд дизайны төсөлд үнэгүй ашиглах боломжтой.
                </p>

                <div className="space-y-3">
                  {resource.downloadFiles.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white border border-[#e0e0e0] text-xs text-[#888888]">
                      Одоогоор татах файл байршуулаагүй байна.
                    </div>
                  ) : (
                    resource.downloadFiles.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#e0e0e0] bg-white hover:border-black/30 transition shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                              {file.format}
                            </span>
                            <p className="font-bold text-sm text-black truncate">{file.name}</p>
                          </div>
                          {file.description && (
                            <p className="text-xs text-[#666666] mt-1">{file.description}</p>
                          )}
                          <span className="text-[11px] text-[#888888] mt-1 block">
                            Хэмжээ: {file.fileSize || 'Тодорхойгүй'}
                          </span>
                        </div>

                        <a
                          href={file.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0 shadow-lg"
                        >
                          <Download className="size-3.5" />
                          <span>Файл татах</span>
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {resource.content && (
                <div className="max-w-none text-base text-[#222222] leading-relaxed whitespace-pre-line">
                  {resource.content}
                </div>
              )}
            </div>
          )}

          {/* Type C: TOOL / APPLICATION */}
          {resource.type === 'tool' && (
            <div className="mb-16 space-y-8">
              <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-8 md:p-12 text-center shadow-xs">
                <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Wrench className="size-8" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-black mb-3">
                  {resource.title}
                </h2>
                <p className="text-sm md:text-base text-[#666666] max-w-lg mx-auto mb-8 leading-relaxed">
                  {resource.summary}
                </p>

                {resource.destinationUrl && (
                  <Link
                    href={resource.destinationUrl}
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-lg"
                  >
                    <span>{resource.ctaLabel}</span>
                    <ExternalLink className="size-4" />
                  </Link>
                )}
              </div>

              {resource.content && (
                <div className="max-w-none text-base text-[#222222] leading-relaxed whitespace-pre-line">
                  {resource.content}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="pt-6 pb-8 border-t border-[#e0e0e0] flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#888888] mr-1">Шошго:</span>
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#f4f4f5] text-[11px] font-semibold text-[#52525b]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Resources */}
          {related.length > 0 && (
            <div className="pt-12 border-t border-[#e0e0e0] mb-16">
              <p className="text-[#888888] text-[11px] font-medium tracking-[0.18em] uppercase mb-2">
                Related
              </p>
              <h2 className="text-2xl font-black text-black tracking-tight mb-6">
                Холбоотой эх сурвалжууд
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={rel.destinationUrl || `/resources/${rel.slug}`}
                    className="group rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 hover:border-black/30 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-2">
                        {rel.type}
                      </span>
                      <h3 className="font-bold text-sm text-black group-hover:text-blue-600 transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#e0e0e0] text-xs font-semibold text-[#888888] flex items-center justify-between">
                      <span>{rel.readTimeMinutes || 3} мин</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Baysaass Studio Consultation CTA Banner */}
          <div className="rounded-3xl bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-20 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Baysaass Studio Services
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                Брэнддээ шинэ дүр төрх, систем бүтээх үү?
              </h3>
              <p className="text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-[500px] leading-relaxed">
                Бид бизнесүүдийн үнэ цэнийг тодорхойлж, олон жил үнэ цэнээ хадгалах брэнд айдентити хөгжүүлдэг.
              </p>
            </div>

            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-xs font-bold hover:bg-[#f4f4f5] transition-colors"
            >
              <span>Хамтран ажиллах хүсэлт илгээх</span>
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Signature Portfolio Pre-Footer CTA */}
          <section className="border-t border-[#e0e0e0] pt-24 md:pt-32 text-center px-6">
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
