import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Palette,
  Type,
  FileCheck2,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react'
import { MODULE_DEFINITIONS } from '@/lib/brand-audit/rubric'

export const metadata = {
  title: 'Брэндбүүк чанарын аудит | Baysaass Studio',
  description:
    'Брэндийн лого, өнгө, үсэг, бодит хэрэглээний удирдамжийн чанарыг олон улсын стандартаар нэг бүрчлэн үнэлж, үйлдвэрлэлийн алдаанаас сэргийлэх мэргэжлийн аудит.',
}

export default function BrandAuditLandingPage() {
  const moduleList = Object.entries(MODULE_DEFINITIONS)

  return (
    <div className="min-h-screen bg-white text-black pt-[90px] pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f4f5] text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
          <Sparkles className="size-3.5 text-blue-600" />
          <span>Baysaass Brandbook Quality Auditor</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black leading-[1.08] mb-6">
              Таны брэнд бодит амьдрал дээр{' '}
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">
                алдаагүй
              </span>{' '}
              хэрэгжихэд бэлэн үү?
            </h1>
            <p className="text-lg md:text-xl text-[#52525b] font-normal leading-relaxed mb-8 max-w-[620px]">
              Брэндбүүкийн лого, хамгаалалтын зай, өнгөний код (CMYK/RGB), үсгийн шатлал, дижитал болон хэвлэлийн бодит хэрэглээг 30 нарийвчилсан шалгуураар үнэлж, үйлдвэрлэлийн үнэтэй алдаануудыг урьдчилан илрүүлнэ.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/brand-audit/new"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-md group"
              >
                <span>Брэндбүүкээ шалгуулах (PDF оруулах)</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#rubric-overview"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#e4e4e7] text-sm font-semibold text-[#18181b] hover:bg-[#f4f4f5] transition-colors"
              >
                <span>Үнэлэх 9 модультай танилцах</span>
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-[#71717a]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>30 шалгуурт чанарын оноо (0–100)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Хуудас бүрийн бодит заалтын анализ</span>
              </div>
            </div>
          </div>

          {/* Interactive Preview Scorecard */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[#e4e4e7] bg-[#fafafa] p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e4e4e7]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Sample Audit Readout
                  </span>
                  <h3 className="text-base font-bold text-black">Exemplary Brand Guidelines</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Verified
                </div>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-white border border-[#e4e4e7] p-4 text-center">
                  <div className="text-3xl font-black text-black">88<span className="text-sm font-medium text-[#71717a]">/100</span></div>
                  <p className="text-xs font-semibold text-[#71717a] mt-1">Чанарын ерөнхий оноо</p>
                </div>
                <div className="rounded-2xl bg-white border border-[#e4e4e7] p-4 text-center">
                  <div className="text-3xl font-black text-blue-600">100<span className="text-sm font-medium text-blue-400">%</span></div>
                  <p className="text-xs font-semibold text-[#71717a] mt-1">Шалгуурын хамралт</p>
                </div>
              </div>

              {/* Sample Issue Alert */}
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900">Хамгаалалтын зай (Clear space)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-semibold">Хуудас 8</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Хүрээ татсан боловч хэмжих жишиг X-нэгж тодорхойгүй байна. Постер, самбар дээр тексттэй наалдах эрсдэлтэй.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Pass */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">Өнгөний техникийн код</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-semibold">Хуудас 12</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      CMYK, RGB, HEX болон Pantone стандартууд бүрэн тусгагдсан. Хэвлэл ба дэлгэцэнд өнгө хазайхгүй.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e4e4e7] text-center">
                <Link
                  href="/brand-audit/new"
                  className="text-xs font-bold text-black hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Өөрийн файлаа оруулж шалгах</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Brand Audit Matters */}
      <section className="bg-[#fafafa] border-y border-[#e4e4e7] py-20 mb-20">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
          <div className="max-w-[680px] mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Яагаад аудит чухал вэ?
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight mt-2">
              Брэндбүүк бол үзэсгэлэнгийн зураг биш, хэрэгжүүлэлтийн гэрээ юм.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl bg-white border border-[#e4e4e7] p-8">
              <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
                <AlertTriangle className="size-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-black mb-3">Хэвлэлийн өндөр зардалтай алдаа</h3>
              <p className="text-sm text-[#52525b] leading-relaxed">
                CMYK код зөрсөн эсвэл зүсэлтийн зай (bleed) орхигдсоноос болж мянга мянган хайрцаг, савлагаа буруу өнгөөр хэвлэгдэн дахин хэвлэх зардал үүсдэг.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-[#e4e4e7] p-8">
              <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
                <Layers className="size-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-black mb-3">Гадны гүйцэтгэгчдийн үл ойлголцол</h3>
              <p className="text-sm text-[#52525b] leading-relaxed">
                Хамгаалалтын зай, хамгийн бага хэмжээний тодорхой хэмжээсгүйгээс маркетерууд болон сошиал менежерүүд логог дур мэдэн сунгаж эвддэг.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-[#e4e4e7] p-8">
              <div className="size-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                <ShieldCheck className="size-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-black mb-3">Брэндийн нэгдмэл үнэ цэнэ</h3>
              <p className="text-sm text-[#52525b] leading-relaxed">
                Аудит хийснээр танай баг болон хамтран ажиллах бүх студиуд нэг хэлээр ярьж, брэндийн визуал дүр төрх урт хугацаанд үнэ цэнээ хадгална.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9 Core Modules Section */}
      <section id="rubric-overview" className="max-w-[1240px] mx-auto px-6 md:px-10 mb-24 scroll-mt-24">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Audit Architecture
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight mt-2">
            Үнэлгээний 9 үндсэн систем
          </h2>
          <p className="text-base text-[#52525b] mt-4">
            Брэндийн стратегиас эхлээд үйлдвэрлэлийн эх файл хүртэлх 30 шалгуурыг нарийвчлан шалгадаг бүтэц.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleList.map(([key, def], idx) => (
            <div
              key={key}
              className="rounded-3xl border border-[#e4e4e7] bg-white p-7 hover:border-black/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#71717a]">0{idx + 1}</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {def.name}
                </span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">{def.nameMn}</h3>
              <p className="text-xs text-[#52525b] leading-relaxed mb-4">{def.descriptionMn}</p>
            </div>
          ))}
        </div>

        {/* Big CTA Bar */}
        <div className="mt-16 rounded-3xl bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Бэлэн үү?
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
              Брэндбүүкээ оруулж 30 секундийн дотор тайлангаа аваарай
            </h3>
            <p className="text-xs md:text-sm text-[#a1a1aa] mt-2">
              PDF файлаа байршуулан шууд чанарын оноо болон засварын зөвлөмжийг нээж харна.
            </p>
          </div>
          <Link
            href="/brand-audit/new"
            className="shrink-0 inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-black text-sm font-bold hover:bg-[#f4f4f5] transition-colors"
          >
            <span>Аудит эхлүүлэх</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
