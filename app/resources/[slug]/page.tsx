import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getResourceBySlug, getAllResources, getAllCategories, incrementResourceViews } from '@/lib/resources/db'
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
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const res = await getResourceBySlug(slug)
  if (!res) return { title: 'Resource олдсонгүй | Baysaass' }

  return {
    title: `${res.title} | Baysaass Resources`,
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
    <div className="min-h-screen bg-white text-black pt-[100px] pb-24">
      <div className="max-w-[880px] mx-auto px-6">
        {/* Back link & Category breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#e4e4e7]">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#71717a] hover:text-black transition"
          >
            <ArrowLeft className="size-4" />
            <span>Бүх ресурсууд руу буцах</span>
          </Link>

          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            {cat?.nameMn || resource.category}
          </span>
        </div>

        {/* Title & Metadata */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#f4f4f5] text-black uppercase tracking-wider">
              {resource.type === 'article' && <FileText className="size-3.5" />}
              {resource.type === 'download' && <Download className="size-3.5" />}
              {resource.type === 'tool' && <Wrench className="size-3.5" />}
              <span>{resource.type}</span>
            </span>

            <span className="text-xs text-[#71717a]">
              {resource.readTimeMinutes || 5} мин унших
            </span>

            <span className="text-xs text-[#71717a]">·</span>

            <span className="text-xs text-[#71717a]">
              {new Date(resource.publishedAt || resource.createdAt).toLocaleDateString('mn-MN')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-black leading-[1.12]">
            {resource.title}
          </h1>

          <p className="text-base md:text-lg text-[#52525b] mt-4 leading-relaxed">
            {resource.summary}
          </p>
        </div>

        {/* Cover Image */}
        {resource.coverImage && (
          <div className="rounded-3xl border border-[#e4e4e7] overflow-hidden mb-12 shadow-sm bg-[#fafafa]">
            <img
              src={resource.coverImage}
              alt={resource.title}
              className="w-full h-auto max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* MAIN BODY BASED ON TYPE */}

        {/* Type A: ARTICLE */}
        {resource.type === 'article' && (
          <div className="prose prose-neutral max-w-none mb-16 text-[#18181b] leading-relaxed">
            <div className="whitespace-pre-line text-sm md:text-base leading-relaxed space-y-4">
              {resource.content}
            </div>
          </div>
        )}

        {/* Type B: DOWNLOAD / TEMPLATE */}
        {resource.type === 'download' && (
          <div className="mb-16 space-y-8">
            <div className="rounded-3xl border border-[#e4e4e7] bg-[#fafafa] p-8 shadow-xs">
              <h2 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
                <Download className="size-5 text-emerald-600" />
                <span>Татаж авах файлууд</span>
              </h2>
              <p className="text-xs text-[#71717a] mb-6">
                Дараах файлуудыг өөрийн төсөлд үнэгүй ашиглах боломжтой.
              </p>

              <div className="space-y-3">
                {resource.downloadFiles.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white border border-[#e4e4e7] text-xs text-[#71717a]">
                    Одоогоор татах файл байршуулаагүй байна.
                  </div>
                ) : (
                  resource.downloadFiles.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#e4e4e7] bg-white hover:border-black/30 transition shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                            {file.format}
                          </span>
                          <p className="font-bold text-sm text-black truncate">{file.name}</p>
                        </div>
                        {file.description && (
                          <p className="text-xs text-[#71717a] mt-1">{file.description}</p>
                        )}
                        <span className="text-[11px] text-[#a1a1aa] mt-1 block">
                          Хэмжээ: {file.fileSize || 'Тодорхойгүй'}
                        </span>
                      </div>

                      <a
                        href={file.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition shrink-0 shadow-xs"
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
              <div className="prose prose-neutral max-w-none text-sm text-[#18181b] leading-relaxed whitespace-pre-line">
                {resource.content}
              </div>
            )}
          </div>
        )}

        {/* Type C: TOOL / APPLICATION */}
        {resource.type === 'tool' && (
          <div className="mb-16 space-y-8">
            <div className="rounded-3xl border border-[#e4e4e7] bg-[#fafafa] p-8 md:p-12 text-center shadow-xs">
              <div className="size-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
                <Wrench className="size-7" />
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
                {resource.title}
              </h2>
              <p className="text-xs md:text-sm text-[#52525b] max-w-md mx-auto mb-8">
                {resource.summary}
              </p>

              {resource.destinationUrl && (
                <Link
                  href={resource.destinationUrl}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-black text-white text-sm font-bold hover:bg-neutral-800 transition shadow-md"
                >
                  <span>{resource.ctaLabel}</span>
                  <ExternalLink className="size-4" />
                </Link>
              )}
            </div>

            {resource.content && (
              <div className="prose prose-neutral max-w-none text-sm text-[#18181b] leading-relaxed whitespace-pre-line">
                {resource.content}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="pt-6 pb-8 border-t border-[#e4e4e7] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#71717a] mr-1">Шошго:</span>
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
          <div className="pt-12 border-t border-[#e4e4e7] mb-16">
            <h2 className="text-xl font-extrabold text-black tracking-tight mb-6">
              Холбоотой эх сурвалжууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={rel.destinationUrl || `/resources/${rel.slug}`}
                  className="group rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-5 hover:border-black/30 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                      {rel.type}
                    </span>
                    <h3 className="font-bold text-xs text-black group-hover:text-blue-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e4e4e7] text-[11px] font-semibold text-[#71717a] flex items-center justify-between">
                    <span>{rel.readTimeMinutes || 3} мин</span>
                    <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Studio CTA Banner */}
        <div className="rounded-3xl bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Baysaass Studio
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
              Брэнддээ шинэ дүр төрх, систем бүтээх үү?
            </h3>
            <p className="text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-[500px]">
              Бид бизнесүүдийн үнэ цэнийг тодорхойлж, олон жил үнэ цэнээ хадгалах брэнд айдентити хөгжүүлдэг.
            </p>
          </div>

          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-xs font-bold hover:bg-[#f4f4f5] transition shadow-xs"
          >
            <span>Хамтран ажиллах хүсэлт илгээх</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
