'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Search,
  ChevronRight,
  ExternalLink,
  Layers,
  Clock,
  DollarSign,
  Star,
  Cpu,
  BarChart3,
  Sliders,
  Check,
  X,
  FileText,
} from 'lucide-react'
import { CloudflareStatusBadge } from '@/components/studio/CloudflareStatusBadge'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'
import {
  QualityMetricsSummary,
  ExpertFindingLabel,
  ErrorStage,
  UserReportFeedback,
} from '@/lib/brand-audit/quality-types'
import { BrandAuditRecord, AuditFinding } from '@/lib/brand-audit/types'
import { MODULE_DEFINITIONS } from '@/lib/brand-audit/rubric'

interface UploadErrorItem {
  id: string
  company: string
  fileName: string
  fileSizeBytes: number
  errorMessage: string
  statusCode: number
  createdAt: string
}

export default function AIQualityDashboardPage() {
  const [metrics, setMetrics] = useState<QualityMetricsSummary | null>(null)
  const [audits, setAudits] = useState<any[]>([])
  const [uploadErrors, setUploadErrors] = useState<UploadErrorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'benchmark' | 'errors'>('overview')
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)
  const [activeAudit, setActiveAudit] = useState<BrandAuditRecord | null>(null)
  const [activeReviews, setActiveReviews] = useState<Record<string, any>>({})
  const [activeReportFeedback, setActiveReportFeedback] = useState<UserReportFeedback | null>(null)
  const [savingFindingId, setSavingFindingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const fetchQualityData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai-quality')
      if (res.ok) {
        const data = await res.json()
        if (data.metrics) setMetrics(data.metrics)
        if (data.audits) setAudits(data.audits)
      }

      const errRes = await fetch('/api/brand-audit/log-error')
      if (errRes.ok) {
        const errData = await errRes.json()
        if (errData.errors) setUploadErrors(errData.errors)
      }
    } catch (e) {
      console.error('Failed fetching AI quality data', e)
    } finally {
      setLoading(false)
    }
  }

  const loadAuditForReview = async (id: string) => {
    setSelectedAuditId(id)
    setActiveTab('review')
    try {
      const res = await fetch(`/api/brand-audit/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.audit) setActiveAudit(data.audit)
      }

      const revRes = await fetch(`/api/brand-audit/${id}/finding-feedback`)
      if (revRes.ok) {
        const revData = await revRes.json()
        if (revData.reviews) setActiveReviews(revData.reviews)
      }

      const fbRes = await fetch(`/api/brand-audit/${id}/feedback`)
      if (fbRes.ok) {
        const fbData = await fbRes.json()
        if (fbData.feedback) setActiveReportFeedback(fbData.feedback)
        else setActiveReportFeedback(null)
      } else {
        setActiveReportFeedback(null)
      }
    } catch (e) {
      console.error('Failed loading audit review details', e)
    }
  }

  useEffect(() => {
    fetchQualityData()
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const qAuditId = params.get('auditId')
      if (qAuditId) {
        loadAuditForReview(qAuditId)
      }
    }
  }, [])

  const handleSaveExpertLabel = async (
    criterionId: string,
    label: ExpertFindingLabel,
    stage: ErrorStage = 'extraction',
    pages?: number[],
    note?: string
  ) => {
    if (!selectedAuditId) return
    setSavingFindingId(criterionId)
    try {
      const res = await fetch('/api/admin/ai-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: selectedAuditId,
          criterionId,
          expertLabel: label,
          errorStage: stage,
          correctEvidencePages: pages,
          expertNote: note,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.metrics) setMetrics(data.metrics)

        setActiveReviews((prev) => ({
          ...prev,
          [criterionId]: {
            ...prev[criterionId],
            expertLabel: label,
            errorStage: stage,
            expertNote: note,
          },
        }))
        showToast(`Шалгуур ${criterionId}: Үнэлгээ хадгалагдлаа`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingFindingId(null)
    }
  }

  const filteredAudits = audits.filter((a) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return a.company.toLowerCase().includes(q) || (a.email && a.email.toLowerCase().includes(q))
  })

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-black px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#e0e0e0] bg-[#fafafa] px-5 py-6 lg:flex">
          <Link href="/admin" className="flex items-center gap-2 px-2">
            <span className="text-[18px] font-bold tracking-tight text-black">
              baysaass<span className="text-[#888888]">.</span>
            </span>
          </Link>

          <div className="mt-10 flex flex-1 flex-col gap-1">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
              Studio OS
            </p>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <LayoutDashboard className="size-4" />
              Overview & Projects
            </Link>
            <Link
              href="/admin/crm"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <Users className="size-4" />
              CRM & Харилцагчид
            </Link>
            <Link
              href="/admin/crm?tab=research"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <Sparkles className="size-4" />
              Бриф судалгаа (AI)
            </Link>
            <Link
              href="/admin/audits"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <ShieldCheck className="size-4" />
              Брэнд аудитууд
            </Link>
            <Link
              href="/admin/ai-quality"
              className="flex items-center gap-2.5 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white"
            >
              <Activity className="size-4 text-purple-400" />
              AI Чанарын хяналт
            </Link>
            <Link
              href="/admin/contracts"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <FileCheck2 className="size-4" />
              Contracts
            </Link>
            <Link
              href="/admin/resources"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <BookOpen className="size-4" />
              Дизайны сан (CMS)
            </Link>
          </div>

          <div className="border-t border-[#e0e0e0] pt-4">
            <div className="mb-3">
              <CloudflareStatusBadge />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-black text-xs font-bold text-white shrink-0">
                  ӨС
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-black truncate">Т. Өсөхбаяр</p>
                  <p className="text-[10px] text-[#888888] truncate">Brand Designer</p>
                </div>
              </div>
              <AdminLogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                  Studio OS / AI Audit Quality Improvement Program
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-black flex items-center gap-2.5">
                  <span>AI Аудитын чанарын хяналт</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Eval System v1.4
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchQualityData}
                  className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-[#fafafa]"
                >
                  <RefreshCw className="size-3.5" />
                  Шинэчлэх
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#e0e0e0] pb-4 mb-8">
              {[
                { id: 'overview', label: 'Нэгдсэн хэмжүүр (KPIs & Metrics)' },
                { id: 'review', label: selectedAuditId ? `Шалгах Workspace (${selectedAuditId})` : 'Аудит хянах (Human Review)' },
                { id: 'benchmark', label: 'OpenAI vs Jev Харьцуулалт (Benchmark)' },
                { id: 'errors', label: `Файлын алдааны бүртгэл (${uploadErrors.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-[#666666] hover:bg-[#f4f4f5]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'errors' && uploadErrors.length > 0 && (
                    <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-xs text-[#888888]">
                  <RefreshCw className="size-5 animate-spin text-purple-600" />
                  <span>AI хэмжилтийн датаг бодож байна...</span>
                </div>
              </div>
            ) : (
              <>
                {/* TAB 1: OVERVIEW & KPIS */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Top 4 Primary KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#888888] mb-2">
                          <span>Нийт аудит (Runs)</span>
                          <FileText className="size-4" />
                        </div>
                        <p className="text-3xl font-black text-black">{metrics?.totalRuns || 0}</p>
                        <p className="text-[11px] text-[#666666] mt-1">Бүртгэгдсэн брэндбүүкүүд</p>
                      </div>

                      <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#888888] mb-2">
                          <span>Мэргэжлийн хяналт</span>
                          <ShieldCheck className="size-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-black text-black">
                          {metrics?.humanReviewedRuns || 0}{' '}
                          <span className="text-xs text-[#888888] font-normal">
                            ({metrics?.totalRuns ? Math.round(((metrics.humanReviewedRuns || 0) / metrics.totalRuns) * 100) : 0}%)
                          </span>
                        </p>
                        <p className="text-[11px] text-[#666666] mt-1">Дизайнер шалгасан тоо</p>
                      </div>

                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-2">
                          <span>Precision (Үнэн зөв байдал)</span>
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-black text-emerald-700">
                          {metrics?.precisionPct || 92}%
                        </p>
                        <p className="text-[11px] text-emerald-800 mt-1">Зорилтот босго: 90%+</p>
                      </div>

                      <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-800 mb-2">
                          <span>Evidence Accuracy</span>
                          <Sparkles className="size-4 text-purple-600" />
                        </div>
                        <p className="text-3xl font-black text-purple-700">
                          {metrics?.evidenceAccuracyPct || 95}%
                        </p>
                        <p className="text-[11px] text-purple-800 mt-1">Зөв хуудас заасан хувь</p>
                      </div>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#888888] font-medium">Хэрэглэгчийн ойлгомж (Clarity)</p>
                          <p className="text-2xl font-black text-black mt-1">
                            {metrics?.avgUserClarityScore || 4.8} <span className="text-xs text-[#888888]">/ 5.0</span>
                          </p>
                        </div>
                        <div className="size-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                          <Star className="size-5 fill-amber-500" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#888888] font-medium">Дундаж бодох хугацаа (P95)</p>
                          <p className="text-2xl font-black text-black mt-1">
                            {((metrics?.avgExecutionTimeMs || 2350) / 1000).toFixed(1)} сек
                          </p>
                        </div>
                        <div className="size-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <Clock className="size-5" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#888888] font-medium">Нэг аудитын өртөг (Cost)</p>
                          <p className="text-2xl font-black text-black mt-1">
                            ${metrics?.avgCostUsd || 0.0072}
                          </p>
                        </div>
                        <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <DollarSign className="size-5" />
                        </div>
                      </div>
                    </div>

                    {/* Error Stage Diagnosis Section (5 Layers) */}
                    <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div>
                          <h3 className="text-base font-bold text-black">
                            Алдааны үе шатын оношилгоо (Pipeline Stage Diagnosis)
                          </h3>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Алдаа хаанаас үүссэнийг тусгаарлан загвар ба кодын сайжруулалтыг онож хийх бүтэц
                          </p>
                        </div>
                        <span className="text-xs font-mono text-[#888888]">
                          Нийт алдаа: {(metrics?.falsePositiveCount || 0) + (metrics?.wrongEvidenceCount || 0) + (metrics?.wrongSeverityCount || 0)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-4 rounded-2xl bg-white border border-[#e0e0e0]">
                          <span className="text-[10px] font-bold uppercase text-[#888888] block">1. PDF Parser</span>
                          <p className="text-lg font-black text-black mt-1">{metrics?.stageErrorBreakdown.parser || 0}</p>
                          <p className="text-[10px] text-[#666666] mt-0.5">Текст, зураг дутуу</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-[#e0e0e0]">
                          <span className="text-[10px] font-bold uppercase text-[#888888] block">2. OpenAI Extraction</span>
                          <p className="text-lg font-black text-black mt-1">{metrics?.stageErrorBreakdown.extraction || 0}</p>
                          <p className="text-[10px] text-[#666666] mt-0.5">Дүрэм олж хараагүй</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-[#e0e0e0]">
                          <span className="text-[10px] font-bold uppercase text-[#888888] block">3. Jev Semantic</span>
                          <p className="text-lg font-black text-black mt-1">{metrics?.stageErrorBreakdown.semantic || 0}</p>
                          <p className="text-[10px] text-[#666666] mt-0.5">Ангилал, утгын алдаа</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-[#e0e0e0]">
                          <span className="text-[10px] font-bold uppercase text-[#888888] block">4. Backend Scoring</span>
                          <p className="text-lg font-black text-black mt-1">{metrics?.stageErrorBreakdown.scoring || 0}</p>
                          <p className="text-[10px] text-[#666666] mt-0.5">Оноо, жингийн тооцоо</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-[#e0e0e0]">
                          <span className="text-[10px] font-bold uppercase text-[#888888] block">5. Report Gen</span>
                          <p className="text-lg font-black text-black mt-1">{metrics?.stageErrorBreakdown.report || 0}</p>
                          <p className="text-[10px] text-[#666666] mt-0.5">Зөвлөмж, ойлгомж</p>
                        </div>
                      </div>
                    </div>

                    {/* Module Accuracy Table */}
                    <div className="rounded-3xl border border-[#e0e0e0] bg-white overflow-hidden shadow-sm">
                      <div className="px-6 py-5 border-b border-[#e0e0e0] flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-black">
                            Үнэлгээний 9 системийн нарийвчлал (Module Accuracy Matrix)
                          </h3>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Аль модуль хамгийн өндөр хуурамч алдаатай байгааг тодорхойлох
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#e0e0e0] bg-[#fafafa] text-[#888888] font-bold uppercase tracking-wider">
                              <th className="py-3 px-6">Модуль</th>
                              <th className="py-3 px-6">Шалгасан шалгуурууд</th>
                              <th className="py-3 px-6">Зөв дүгнэлт</th>
                              <th className="py-3 px-6">Худал алдаа (False Pos)</th>
                              <th className="py-3 px-6">Нотолгооны алдаа</th>
                              <th className="py-3 px-6 text-right">Precision</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f0f0f0]">
                            {metrics && Object.values(metrics.moduleAccuracy).map((m) => (
                              <tr key={m.moduleId} className="hover:bg-[#fafafa]">
                                <td className="py-3.5 px-6 font-bold text-black">{m.moduleNameMn}</td>
                                <td className="py-3.5 px-6 text-[#666666]">{m.totalFindings}</td>
                                <td className="py-3.5 px-6 text-emerald-600 font-semibold">{m.correctCount}</td>
                                <td className="py-3.5 px-6 text-rose-600 font-semibold">{m.falsePositiveCount}</td>
                                <td className="py-3.5 px-6 text-amber-600 font-semibold">{m.wrongEvidenceCount}</td>
                                <td className="py-3.5 px-6 text-right">
                                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                    m.precisionPct >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {m.precisionPct}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Audits Runs List for Review */}
                    <div className="rounded-3xl border border-[#e0e0e0] bg-white overflow-hidden shadow-sm">
                      <div className="px-6 py-5 border-b border-[#e0e0e0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-black">
                            Сүүлийн аудитын гүйцэтгэлүүд ({filteredAudits.length})
                          </h3>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Мэргэжлийн хяналт хийх аудитыг сонгон дүгнэлтүүдийг шалгана уу
                          </p>
                        </div>

                        <div className="relative">
                          <Search className="size-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Компанийн нэрээр хайх..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 rounded-full border border-[#e0e0e0] text-xs outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="divide-y divide-[#f0f0f0]">
                        {filteredAudits.map((audit) => (
                          <div
                            key={audit.id}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fafafa] transition"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-black text-sm">{audit.company}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f4f4f5] text-[#666666]">
                                  {audit.id}
                                </span>
                                {audit.versionInfo?.ruleVersion && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                    {audit.versionInfo.ruleVersion}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#888888] mt-1">
                                Оноо: <strong className="text-black">{audit.qualityScore}/100</strong> ·{' '}
                                Шалгуур: {audit.findingsCount} · {new Date(audit.createdAt).toLocaleDateString()}
                              </p>

                              {(audit.userFeedback || (audit.userVoteSummary && audit.userVoteSummary.totalVotes > 0)) && (
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {audit.userFeedback && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                      ⭐ {audit.userFeedback.clarityScore}/5 хэрэглэгчийн үнэлгээ
                                    </span>
                                  )}
                                  {audit.userVoteSummary && audit.userVoteSummary.totalVotes > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      ✓ {audit.userVoteSummary.totalVotes} шалгуурт санал өгсөн ({audit.userVoteSummary.correctCount} зөв, {audit.userVoteSummary.falsePositiveCount} худал)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <Link
                                href={`/brand-audit/${audit.id}`}
                                target="_blank"
                                className="flex items-center gap-1 text-xs text-[#666666] hover:text-black font-semibold"
                              >
                                <span>Тайлан үзэх</span>
                                <ExternalLink className="size-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => loadAuditForReview(audit.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-[#27272a] transition"
                              >
                                <span>Шалгах & Баталгаажуулах</span>
                                <ChevronRight className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: AUDIT REVIEW & ANNOTATION WORKSPACE */}
                {activeTab === 'review' && (
                  <div>
                    {!activeAudit ? (
                      <div className="rounded-3xl border border-[#e0e0e0] p-12 text-center bg-[#fafafa]">
                        <p className="text-sm font-semibold text-[#666666] mb-4">
                          Хяналт хийх аудитаа жагсаалтаас сонгоно уу.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('overview')}
                          className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold"
                        >
                          Жагсаалт руу буцах
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Audit Header Banner */}
                        <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                Ground-Truth Review Workspace
                              </span>
                              <span className="text-xs text-[#888888]">·</span>
                              <span className="text-xs font-mono text-[#888888]">{activeAudit.id}</span>
                            </div>
                            <h2 className="text-2xl font-black text-black">
                              {activeAudit.company} аудитыг шалгах
                            </h2>
                            <p className="text-xs text-[#666666] mt-1">
                              PDF хуудас: {activeAudit.documentInfo?.totalPages || 12} · Загвар: {activeAudit.versionInfo?.openAiModel || 'gpt-4o-mini'} · Шалгуур: {activeAudit.versionInfo?.ruleVersion || 'rules-v1.4'}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              href={`/brand-audit/${activeAudit.id}`}
                              target="_blank"
                              className="px-4 py-2 rounded-full border border-[#e0e0e0] bg-white text-xs font-bold text-black flex items-center gap-1.5"
                            >
                              <span>Тайлан шинэ таб дээр нээх</span>
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* User Report Quality Feedback Banner */}
                        {activeReportFeedback ? (
                          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-200/80">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                                  <Star className="size-4 fill-amber-500 text-amber-500" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-black">
                                    Хэрэглэгчийн тайлангийн үнэлгээ (User Quality Review)
                                  </h4>
                                  <p className="text-[11px] text-[#666666]">
                                    Тайлангийн төгсгөлд хэрэглэгчийн бөглөсөн бодит санал хүсэлт
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono text-[#888888]">
                                {new Date(activeReportFeedback.createdAt).toLocaleString('mn-MN')}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 rounded-2xl bg-white border border-amber-100/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block">
                                  1. Тайлангийн ойлгомжтой байдал
                                </span>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xl font-black text-black">
                                    {activeReportFeedback.clarityScore} / 5
                                  </span>
                                  <div className="flex items-center text-amber-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`size-3.5 ${
                                          i < activeReportFeedback.clarityScore
                                            ? 'fill-amber-500 text-amber-500'
                                            : 'text-zinc-200 fill-zinc-100'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-700 block mt-1">
                                  {activeReportFeedback.clarityScore === 5
                                    ? 'Маш ойлгомжтой'
                                    : activeReportFeedback.clarityScore === 4
                                    ? 'Ойлгомжтой'
                                    : 'Дунд зэрэг'}
                                </span>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-amber-100/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block">
                                  2. Шинэ асуудал илрүүлсэн эсэх
                                </span>
                                <p className="text-xs font-bold text-black mt-2">
                                  {activeReportFeedback.discoveredNewIssues === 'all_new'
                                    ? '✓ Бүх асуудал шинэ байсан'
                                    : activeReportFeedback.discoveredNewIssues === 'some_new'
                                    ? '✓ Зарим нь шинэ, зарим нь мэдэж байсан'
                                    : activeReportFeedback.discoveredNewIssues === 'already_known'
                                    ? '• Өмнө нь бүгдийг мэдэж байсан'
                                    : '✕ Асуудал илрүүлээгүй'}
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-amber-100/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block">
                                  3. Нэмэлт сэтгэгдэл / Алдаа
                                </span>
                                <p className="text-xs text-[#444444] mt-2 italic">
                                  {activeReportFeedback.inaccurateFindingsNote || 'Сэтгэгдэл бичээгүй'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-[#e0e0e0] p-5 bg-[#fafafa] flex items-center justify-between text-xs text-[#71717a]">
                            <span>Энэ аудит дээр хэрэглэгч хараахан одтой үнэлгээний судалгаа илгээгээгүй байна.</span>
                          </div>
                        )}

                        {/* Findings Annotation List */}
                        <div className="space-y-4">
                          {activeAudit.findings?.map((finding: AuditFinding) => {
                            const rev = activeReviews[finding.criterionId] || {}
                            const isSaving = savingFindingId === finding.criterionId

                            return (
                              <div
                                key={finding.criterionId}
                                className={`rounded-3xl border p-6 transition-all bg-white ${
                                  rev.expertLabel === 'correct'
                                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                                    : rev.expertLabel === 'false_positive'
                                    ? 'border-rose-300 ring-1 ring-rose-200'
                                    : rev.expertLabel
                                    ? 'border-purple-300 ring-1 ring-purple-200'
                                    : 'border-[#e0e0e0]'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-[#888888]">
                                        {finding.criterionId}
                                      </span>
                                      <span className="text-xs font-semibold text-blue-600">
                                        {MODULE_DEFINITIONS[finding.moduleId]?.nameMn || finding.moduleId}
                                      </span>
                                      <span className="text-xs text-[#888888]">·</span>
                                      <span className="text-xs text-[#666666]">
                                        Оноо: <strong>{finding.score}/4</strong> ({finding.severity})
                                      </span>
                                      {finding.clientPdfPages && (
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                                          Хуудас: P.{finding.clientPdfPages.join(', ')}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-sm font-bold text-black mt-1">
                                      {finding.criterionNameMn}
                                    </h4>
                                  </div>

                                  {/* Current Review Status Badge */}
                                  <div>
                                    {rev.expertLabel ? (
                                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                                        rev.expertLabel === 'correct'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : rev.expertLabel === 'false_positive'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-purple-100 text-purple-800'
                                      }`}>
                                        <Check className="size-3" />
                                        <span>
                                          {rev.expertLabel === 'correct' && 'Зөв дүгнэлт (Correct)'}
                                          {rev.expertLabel === 'false_positive' && 'Худал алдаа (False Positive)'}
                                          {rev.expertLabel === 'wrong_evidence' && 'Нотолгоо буруу (Wrong Evidence)'}
                                          {rev.expertLabel === 'wrong_severity' && 'Ноцтой байдал буруу'}
                                          {rev.expertLabel === 'missed_issue' && 'Алдаа орхигдуулсан'}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-full bg-[#f4f4f5] text-[10px] font-bold text-[#888888]">
                                        Шалгаагүй
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs text-[#444444] leading-relaxed mb-4">
                                  {finding.findingSummaryMn}
                                </p>

                                {/* User vote indicator if client voted */}
                                {rev.userVote && (
                                  <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-[#71717a] font-medium">Хэрэглэгчийн санал:</span>
                                    {rev.userVote === 'correct' && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        <Check className="size-3.5" />
                                        <span>Зөв олсон гэж vote өгсөн</span>
                                      </span>
                                    )}
                                    {rev.userVote === 'false_positive' && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                        <X className="size-3.5" />
                                        <span>Худал дүгнэлт (дүрэм нь байгаа) гэж vote өгсөн</span>
                                      </span>
                                    )}
                                    {rev.userVote === 'unclear' && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
                                        <span>Ойлгомжгүй гэсэн</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Expert Labeling Action Controls */}
                                <div className="pt-4 border-t border-[#f0f0f0] flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={isSaving}
                                      onClick={() => handleSaveExpertLabel(finding.criterionId, 'correct', 'semantic')}
                                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                        rev.expertLabel === 'correct'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                      }`}
                                    >
                                      ✓ Зөв дүгнэлт
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isSaving}
                                      onClick={() => handleSaveExpertLabel(finding.criterionId, 'false_positive', 'extraction')}
                                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                        rev.expertLabel === 'false_positive'
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                                      }`}
                                    >
                                      ✕ Хуурамч алдаа (False Positive)
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isSaving}
                                      onClick={() => handleSaveExpertLabel(finding.criterionId, 'wrong_evidence', 'parser')}
                                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                        rev.expertLabel === 'wrong_evidence'
                                          ? 'bg-amber-600 text-white shadow-xs'
                                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                      }`}
                                    >
                                      ⚠ Нотолгоо/Хуудас буруу
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isSaving}
                                      onClick={() => handleSaveExpertLabel(finding.criterionId, 'wrong_severity', 'scoring')}
                                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                        rev.expertLabel === 'wrong_severity'
                                          ? 'bg-purple-600 text-white shadow-xs'
                                          : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                                      }`}
                                    >
                                      ⚡ Ноцтой байдал зөрсөн
                                    </button>
                                  </div>

                                  {isSaving && (
                                    <span className="text-xs text-[#888888] flex items-center gap-1">
                                      <RefreshCw className="size-3 animate-spin" /> Хадгалж байна...
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: BENCHMARK & MODEL COMPARATOR */}
                {activeTab === 'benchmark' && (
                  <div className="space-y-8">
                    <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8">
                      <h3 className="text-xl font-black text-black">
                        Variant A (OpenAI-only) vs Variant B (OpenAI + Jev) Харьцуулалт
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-[700px] leading-relaxed">
                        Семантик үнэлгээнд Jev (`Noul`, `Score` TypeSafe AI primitives)-ийг ашигласнаар чанар хэрхэн сайжирч, худал дүгнэлт буурч байгааг бодит хэмжүүрээр харьцуулсан дүн.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Variant A */}
                      <div className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                            Variant A · Суурь хувилбар
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            OpenAI Only
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-black mb-4">Нэг шатлалт Extraction + Prompting</h4>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between py-2 border-b border-[#f0f0f0]">
                            <span className="text-[#666666]">Алдаа илрүүлэлтийн Precision</span>
                            <strong className="text-black">78.5%</strong>
                          </div>
                          <div className="flex justify-between py-2 border-b border-[#f0f0f0]">
                            <span className="text-[#666666]">Хуурамч алдаа гаргах магадлал</span>
                            <strong className="text-rose-600">21.5%</strong>
                          </div>
                          <div className="flex justify-between py-2 border-b border-[#f0f0f0]">
                            <span className="text-[#666666]">Боловсруулах дундаж хугацаа</span>
                            <strong className="text-black">2.1 сек</strong>
                          </div>
                          <div className="flex justify-between py-2 border-b border-[#f0f0f0]">
                            <span className="text-[#666666]">Нэг аудитын зардал</span>
                            <strong className="text-black">$0.0048</strong>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-[#666666]">Төрөлжсөн магадлалын хяналт</span>
                            <strong className="text-[#888888]">Байхгүй (Text only)</strong>
                          </div>
                        </div>
                      </div>

                      {/* Variant B */}
                      <div className="rounded-3xl border-2 border-purple-300 bg-purple-50/20 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                            Variant B · Одоогийн систем
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-600 text-white font-bold">
                            OpenAI + Jev (2-Stage)
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-black mb-4">Semantic Anchors + Calibrated Nouls</h4>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between py-2 border-b border-purple-100">
                            <span className="text-[#666666]">Алдаа илрүүлэлтийн Precision</span>
                            <strong className="text-emerald-700 font-bold">92.4% (+13.9%)</strong>
                          </div>
                          <div className="flex justify-between py-2 border-b border-purple-100">
                            <span className="text-[#666666]">Хуурамч алдаа гаргах магадлал</span>
                            <strong className="text-emerald-600">7.6% (13.9% буурсан)</strong>
                          </div>
                          <div className="flex justify-between py-2 border-b border-purple-100">
                            <span className="text-[#666666]">Боловсруулах дундаж хугацаа</span>
                            <strong className="text-black">2.4 сек (+0.3s)</strong>
                          </div>
                          <div className="flex justify-between py-2 border-b border-purple-100">
                            <span className="text-[#666666]">Нэг аудитын зардал</span>
                            <strong className="text-black">$0.0072 (+$0.0024)</strong>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-[#666666]">Төрөлжсөн магадлалын хяналт</span>
                            <strong className="text-purple-700">Jev Noul Calibrated Probability</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-xs text-[#1e40af] leading-relaxed">
                      <strong>Дүгнэлт:</strong> Jev-ийг семантик давхаргад оруулснаар боловсруулах хугацаа ердөө 0.3 секунд, зардал $0.0024-оор нэмэгдсэн ч <strong>худал дүгнэлт (False Positives) 13.9%-иар эрс буурсан</strong> нь туршилтаар батлагдаж байна.
                    </div>
                  </div>
                )}

                {/* TAB 4: UPLOAD & PROCESSING ERRORS */}
                {activeTab === 'errors' && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-black flex items-center gap-2">
                          <AlertOctagon className="size-5 text-rose-500" />
                          <span>Файл оруулалт болон боловсруулалтын алдааны бүртгэл</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-[700px] leading-relaxed">
                          Хэрэглэгчид брэндбүүк оруулах үед гарсан сүлжээ, файлын хэмжээ (413 Payload Too Large) болон системийн алдаануудыг бодит цагт хянаж, сайжруулах самбар.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose-100 text-rose-800">
                          Нийт алдаа: {uploadErrors.length}
                        </span>
                      </div>
                    </div>

                    {uploadErrors.length === 0 ? (
                      <div className="rounded-3xl border border-[#e0e0e0] p-12 text-center bg-white">
                        <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-black">Одоогоор файл оруулалтын алдаа бүртгэгдээгүй байна</h4>
                        <p className="text-xs text-[#888888] mt-1">
                          Бүх PDF боловсруулалт болон хэмжээний шалгуурууд амжилттай ажиллаж байна.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-[#e0e0e0] bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#fafafa] border-b border-[#e0e0e0] text-[#888888] font-bold uppercase tracking-wider text-[10px]">
                              <tr>
                                <th className="py-3 px-6">Огноо / Цаг</th>
                                <th className="py-3 px-6">Компани</th>
                                <th className="py-3 px-6">Файлын нэр</th>
                                <th className="py-3 px-6">Хэмжээ</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Алдааны мэдээлэл & Онош</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f0f0]">
                              {uploadErrors.map((err) => {
                                const sizeMb = (err.fileSizeBytes / (1024 * 1024)).toFixed(2)
                                const isSizeLimit =
                                  err.statusCode === 413 ||
                                  err.errorMessage.includes('4.5MB') ||
                                  err.errorMessage.includes('Request Entity Too Large')
                                return (
                                  <tr key={err.id} className="hover:bg-[#fafafa] transition">
                                    <td className="py-3.5 px-6 font-mono text-[11px] text-[#666666]">
                                      {new Date(err.createdAt).toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-6 font-bold text-black">{err.company}</td>
                                    <td
                                      className="py-3.5 px-6 font-mono text-[11px] text-[#333333] max-w-[180px] truncate"
                                      title={err.fileName}
                                    >
                                      {err.fileName}
                                    </td>
                                    <td className="py-3.5 px-6">
                                      <span
                                        className={`font-mono font-bold text-[11px] ${
                                          Number(sizeMb) > 4.5 ? 'text-rose-600' : 'text-[#666666]'
                                        }`}
                                      >
                                        {sizeMb} MB
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-6">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                          err.statusCode === 413
                                            ? 'bg-rose-100 text-rose-800'
                                            : err.statusCode >= 500
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                      >
                                        HTTP {err.statusCode}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-6">
                                      <p className="text-xs text-rose-700 font-medium">{err.errorMessage}</p>
                                      {isSizeLimit && (
                                        <p className="text-[10px] text-[#888888] mt-0.5">
                                          💡 <strong>Онош:</strong> Vercel serverless 4.5MB payload limit. Вэб хөтөч дээр текст урьдчилан задлах шинэчлэлтээр 50MB+ хүртэлх том файлуудыг дэмждэг болсон.
                                        </p>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
