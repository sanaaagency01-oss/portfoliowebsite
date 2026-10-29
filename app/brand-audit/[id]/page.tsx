'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Printer,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Filter,
  Search,
  Check,
} from 'lucide-react'
import {
  BrandAuditRecord,
  AuditFinding,
  FindingSeverity,
  ModuleId,
} from '@/lib/brand-audit/types'
import { MODULE_DEFINITIONS } from '@/lib/brand-audit/rubric'

export default function BrandAuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [audit, setAudit] = useState<BrandAuditRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [rerunning, setRerunning] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<
    'all' | 'critical' | 'improvement' | 'pass'
  >('all')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/brand-audit/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.audit) {
          setAudit(data.audit)
        }
      }
    } catch (e) {
      console.error('Error fetching audit:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudit()
  }, [id])

  // Polling while running
  useEffect(() => {
    if (!audit || audit.status === 'completed' || audit.status === 'failed') {
      return
    }

    const interval = setInterval(() => {
      fetchAudit()
    }, 2500)

    return () => clearInterval(interval)
  }, [audit?.status, id])

  const handleRerun = async () => {
    setRerunning(true)
    try {
      const res = await fetch(`/api/brand-audit/${id}/rerun`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.audit) setAudit(data.audit)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRerunning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black pt-[100px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-6 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-[#71717a]">
            Аудитын мэдээллийг татаж байна...
          </p>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-white text-black pt-[100px] pb-20">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <AlertOctagon className="size-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Аудит олдсонгүй</h1>
          <p className="text-xs text-[#71717a] mb-6">
            Таны хайсан брэнд аудит устгагдсан эсвэл буруу холбоос байна.
          </p>
          <Link
            href="/brand-audit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold"
          >
            <ArrowLeft className="size-4" />
            <span>Нүүр хуудас руу буцах</span>
          </Link>
        </div>
      </div>
    )
  }

  // Processing state
  if (audit.status === 'queued' || audit.status === 'analyzing') {
    return (
      <div className="min-h-screen bg-white text-black pt-[100px] pb-24">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-6">
            <Sparkles className="size-3.5" />
            <span>AI Automated Analysis in Progress</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-2">
            {audit.company} брэндбүүкийг үнэлж байна
          </h1>
          <p className="text-xs text-[#71717a] mb-8">
            30 шалгуурт дүрэм, логоны зай, өнгө, үсгийн шатлалыг шалгаж байна.
          </p>

          <div className="rounded-3xl border border-[#e4e4e7] p-8 bg-[#fafafa] shadow-sm mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-black mb-2">
              <span>{audit.currentStageMn || 'Шалгаж байна...'}</span>
              <span>{audit.progressPct}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#e4e4e7] overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${audit.progressPct}%` }}
              />
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
                <RefreshCw className="size-3.5 animate-spin text-blue-600" />
                <span>Түр хүлээнэ үү. Тайлан автоматаар гарч ирнэ.</span>
              </div>
              <button
                type="button"
                onClick={handleRerun}
                disabled={rerunning}
                className="text-[11px] font-bold text-black hover:text-blue-600 underline underline-offset-2 transition-colors disabled:opacity-50"
              >
                {rerunning ? 'Боловсруулж байна...' : 'Удаж байвал энд дарж шууд тооцоолох'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter findings
  const filteredFindings = audit.findings.filter((f) => {
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false
    if (selectedModule !== 'all' && f.moduleId !== selectedModule) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = f.criterionNameMn.toLowerCase().includes(q)
      const matchSummary = f.findingSummaryMn.toLowerCase().includes(q)
      const matchRemedy = f.remedyActionMn.toLowerCase().includes(q)
      if (!matchName && !matchSummary && !matchRemedy) return false
    }
    return true
  })

  // Color logic for overall score
  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        text: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'Маш өндөр чанартай (Exemplary)',
      }
    }
    if (score >= 65) {
      return {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        label: 'Хангалттай сайн (Solid Foundation)',
      }
    }
    if (score >= 45) {
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Сайжруулах шаардлагатай (Needs Refinement)',
      }
    }
    return {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
      label: 'Шуурхай засах алдаатай (Critical Gaps)',
    }
  }

  const theme = getScoreTheme(audit.qualityScore)

  return (
    <div className="min-h-screen bg-white text-black pt-[90px] pb-24 print:pt-4 print:pb-0">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e4e4e7] print:hidden">
          <Link
            href="/brand-audit"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#71717a] hover:text-black transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Бүх аудитууд</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e4e4e7] text-xs font-semibold text-black hover:bg-[#fafafa] transition-colors"
            >
              <Printer className="size-3.5" />
              <span>Тайлан хэвлэх / PDF</span>
            </button>
            <button
              onClick={handleRerun}
              disabled={rerunning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`size-3.5 ${rerunning ? 'animate-spin' : ''}`} />
              <span>Дахин шалгах</span>
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
              {audit.scope === 'full_brandbook'
                ? 'Бүрэн брэндбүүк'
                : audit.scope === 'visual_identity'
                ? 'Visual Identity'
                : 'Лого гарын авлага'}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f4f4f5] text-[#52525b] uppercase tracking-wider">
              {audit.medium === 'both'
                ? 'Print & Digital'
                : audit.medium === 'digital'
                ? 'Digital'
                : 'Print'}
            </span>
            <span className="text-[11px] text-[#71717a]">
              Огноо: {new Date(audit.createdAt).toLocaleDateString('mn-MN')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-black">
            {audit.company} — Чанарын аудитын тайлан
          </h1>
          <p className="text-xs md:text-sm text-[#71717a] mt-2">
            Файл: {audit.documentInfo.fileName} ({audit.documentInfo.totalPages} хуудас)
          </p>
        </div>

        {/* Hero Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Quality Gauge */}
          <div className="lg:col-span-5 rounded-3xl border border-[#e4e4e7] p-8 bg-[#fafafa] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
                Overall Quality Score
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-6xl md:text-7xl font-black ${theme.text}`}>
                  {audit.qualityScore}
                </span>
                <span className="text-xl font-bold text-[#a1a1aa]">/100</span>
              </div>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${theme.badge}`}>
                  {theme.label}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e4e4e7]">
              <div className="flex items-center justify-between text-xs text-[#71717a] mb-2 font-semibold">
                <span>Шалгуурын хамралт (Coverage)</span>
                <span className="text-black font-bold">{audit.coveragePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e4e4e7] overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${audit.coveragePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Severity Counters */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Critical */}
            <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                  <AlertOctagon className="size-5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Шуурхай засах
                </h2>
                <div className="text-4xl font-black text-rose-600 mt-2">
                  {audit.criticalFindingsCount}
                </div>
              </div>
              <p className="text-[11px] text-rose-800/80 mt-4 leading-relaxed">
                Үйлдвэрлэл болон хэрэглээнд шууд алдаа үүсгэх өндөр эрсдэлтэй шалгуурууд.
              </p>
            </div>

            {/* Improvement */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <AlertTriangle className="size-5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Сайжруулах
                </h2>
                <div className="text-4xl font-black text-amber-600 mt-2">
                  {audit.improvementFindingsCount}
                </div>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-4 leading-relaxed">
                Тусгагдсан боловч гүйцэтгэгч таамаглахаар үлдсэн дутуу дүрмүүд.
              </p>
            </div>

            {/* Pass */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <CheckCircle2 className="size-5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Шаардлага хангасан
                </h2>
                <div className="text-4xl font-black text-emerald-600 mt-2">
                  {audit.passFindingsCount}
                </div>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-4 leading-relaxed">
                Олон улсын стандартад бүрэн нийцсэн тодорхой заалтууд.
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Readout */}
        <div className="rounded-3xl border border-[#e4e4e7] p-8 bg-[#fafafa] mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              Мэргэжлийн удирдлагын хураангуй дүгнэлт
            </h2>
          </div>
          <div className="text-xs md:text-sm text-[#27272a] leading-relaxed whitespace-pre-line font-mono bg-white p-6 rounded-2xl border border-[#e4e4e7]">
            {audit.executiveSummaryMn}
          </div>
        </div>

        {/* 9 Modules Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-black tracking-tight">
              9 Модулийн чанарын оноо
            </h2>
            <span className="text-xs text-[#71717a]">
              Модуль дээр дарж шалгууруудыг шүүнэ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(audit.modules).map((mod) => (
              <button
                type="button"
                key={mod.moduleId}
                onClick={() =>
                  setSelectedModule(selectedModule === mod.moduleId ? 'all' : mod.moduleId)
                }
                className={`text-left rounded-3xl border p-5 transition-all ${
                  selectedModule === mod.moduleId
                    ? 'border-black bg-white ring-2 ring-black shadow-md'
                    : 'border-[#e4e4e7] bg-[#fafafa] hover:border-black/40 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-black">{mod.moduleNameMn}</span>
                  <span
                    className={`text-xs font-black ${
                      mod.qualityScore >= 75
                        ? 'text-emerald-600'
                        : mod.qualityScore >= 50
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {mod.qualityScore}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#e4e4e7] overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      mod.qualityScore >= 75
                        ? 'bg-emerald-600'
                        : mod.qualityScore >= 50
                        ? 'bg-blue-600'
                        : 'bg-amber-600'
                    }`}
                    style={{ width: `${mod.qualityScore}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#71717a]">
                  {mod.criticalCount > 0 && (
                    <span className="text-rose-600 font-bold">
                      {mod.criticalCount} асуудал
                    </span>
                  )}
                  {mod.improvementCount > 0 && (
                    <span className="text-amber-600">
                      {mod.improvementCount} зөвлөмж
                    </span>
                  )}
                  <span className="text-emerald-600">
                    {mod.passCount} нийцсэн
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Findings Explorer */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-black tracking-tight">
                Шалгуурын дэлгэрэнгүй заалтууд ({filteredFindings.length})
              </h2>
              <p className="text-xs text-[#71717a] mt-1">
                Танай оруулсан PDF хуудасны бодит заалтууд болон засах дараалал
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
              <input
                type="text"
                placeholder="Шалгуур хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-xs text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[
              { id: 'all', label: 'Бүгд' },
              { id: 'critical', label: `Шуурхай засах (${audit.criticalFindingsCount})` },
              { id: 'improvement', label: `Сайжруулах (${audit.improvementFindingsCount})` },
              { id: 'pass', label: `Шаардлага хангасан (${audit.passFindingsCount})` },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setSelectedSeverity(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedSeverity === tab.id
                    ? 'bg-black text-white'
                    : 'bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {selectedModule !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedModule('all')}
                className="ml-auto text-[11px] font-bold text-rose-600 hover:underline"
              >
                Модулийн шүүлтүүр арилгах
              </button>
            )}
          </div>

          {/* Findings Cards */}
          <div className="space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="rounded-3xl border border-[#e4e4e7] p-12 text-center text-xs text-[#71717a]">
                Сонгосон шүүлтүүрт тохирох шалгуур олдсонгүй.
              </div>
            ) : (
              filteredFindings.map((finding) => (
                <div
                  key={finding.criterionId}
                  className={`rounded-3xl border p-6 md:p-8 transition-all ${
                    finding.severity === 'critical'
                      ? 'border-rose-200 bg-rose-50/20'
                      : finding.severity === 'improvement'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-[#e4e4e7] bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      {/* User's PDF Page tag only! No textbook citations! */}
                      <span className="px-3 py-1 rounded-full bg-[#f4f4f5] text-[11px] font-bold text-[#18181b] border border-[#e4e4e7]">
                        Хуудас {finding.clientPdfPages.join(', ')}
                      </span>

                      <span className="text-[11px] font-semibold text-[#71717a] bg-neutral-100 px-2.5 py-0.5 rounded-full">
                        {MODULE_DEFINITIONS[finding.moduleId]?.nameMn} · {finding.criterionId}
                      </span>

                      {finding.verifiedByJev && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="size-3" />
                          <span>TypeSafe AI Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#71717a]">
                        Жин: {finding.weight}/5
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          finding.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : finding.severity === 'improvement'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {finding.severity === 'critical'
                          ? 'Шуурхай засах'
                          : finding.severity === 'improvement'
                          ? 'Сайжруулах зөвлөмж'
                          : 'Шаардлага хангасан'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-black mb-3">
                    {finding.criterionNameMn}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* What was found */}
                    <div className="rounded-2xl bg-white border border-[#e4e4e7] p-4">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#71717a] mb-1">
                        Илэрсэн агуулга:
                      </span>
                      <p className="text-[#18181b] leading-relaxed">
                        {finding.findingSummaryMn}
                      </p>
                      {finding.extractedRuleSnippet && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 text-[11px] text-[#52525b] italic">
                          "{finding.extractedRuleSnippet}"
                        </div>
                      )}
                    </div>

                    {/* Risk & Business impact */}
                    <div className="rounded-2xl bg-white border border-[#e4e4e7] p-4">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#71717a] mb-1">
                        Бизнест үзүүлэх нөлөө & Эрсдэл:
                      </span>
                      <p className="text-[#18181b] leading-relaxed">
                        {finding.businessImpactMn}
                      </p>
                    </div>
                  </div>

                  {/* Actionable Remedy */}
                  <div className="mt-4 rounded-2xl bg-[#fafafa] border border-[#e4e4e7] p-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                      Хэрхэн засах зөвлөмж:
                    </span>
                    <p className="text-xs text-black font-medium leading-relaxed">
                      {finding.remedyActionMn}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Baysaass Studio Consultation CTA */}
        <div className="rounded-3xl bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 print:hidden">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Baysaass Studio Services
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
              Брэндбүүкийнхээ алдааг мэргэжлийн түвшинд засуулах уу?
            </h3>
            <p className="text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-[600px]">
              Бид танай брэндийн лого систем, өнгө, үсгийн шатлал, үйлдвэрлэлийн эх файлуудыг олон улсын жишигт нийцүүлэн шинэчлэн боловсруулж өгнө.
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
      </div>
    </div>
  )
}
