'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import {
  ArrowLeft,
  ArrowRight,
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
  Download,
  Share2,
  Clock,
  Copy,
  X,
} from 'lucide-react'
import {
  BrandAuditRecord,
  AuditFinding,
  FindingSeverity,
  ModuleId,
} from '@/lib/brand-audit/types'
import { MODULE_DEFINITIONS } from '@/lib/brand-audit/rubric'
import AuditExportButton from '@/components/brand-audit/AuditExportButton'
import { openAuditPrintWindow, downloadAuditDocument } from '@/lib/brand-audit/export'

function getRemainingTimeLabel(expiresAt?: string) {
  if (!expiresAt) return '3 хоног үлдсэн'
  const diffMs = new Date(expiresAt).getTime() - Date.now()
  if (diffMs <= 0) return 'Хугацаа дууссан'
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours >= 48) {
    const days = Math.floor(diffHours / 24)
    return `${days} хоног үлдсэн`
  }
  if (diffHours >= 1) {
    return `${diffHours} цаг үлдсэн`
  }
  const diffMins = Math.floor(diffMs / (1000 * 60))
  return `${Math.max(1, diffMins)} минут үлдсэн`
}

export default function BrandAuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [audit, setAudit] = useState<BrandAuditRecord | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [extending, setExtending] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rerunning, setRerunning] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<
    'all' | 'critical' | 'improvement' | 'pass'
  >('all')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visualProgress, setVisualProgress] = useState(25)
  const [pollCount, setPollCount] = useState(0)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://baysaass.space/brand-audit/${id}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
    showToast('Хуваалцах линк санах ойд хуулагдлаа!')
  }

  const handleExtendAudit = async (days: number = 3) => {
    setExtending(true)
    try {
      const res = await fetch(`/api/brand-audit/${id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.audit) {
          setAudit(data.audit)
          setIsExpired(false)
          showToast(`Хүчинтэй хугацааг ${days} хоногоор амжилттай сэргээлээ!`)
        }
      } else {
        const err = await res.json()
        showToast(err.error || 'Сунгахад алдаа гарлаа')
      }
    } catch {
      showToast('Сүлжээний алдаа гарлаа')
    } finally {
      setExtending(false)
    }
  }

  // Evaluation & Feedback State (AI Quality Improvement)
  const [findingVotes, setFindingVotes] = useState<Record<string, string>>({})
  const [clarityScore, setClarityScore] = useState<number>(5)
  const [discoveredNew, setDiscoveredNew] = useState<string>('yes_new')
  const [feedbackNote, setFeedbackNote] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFindingVote = async (criterionId: string, vote: 'correct' | 'false_positive' | 'unclear') => {
    setFindingVotes((prev) => ({ ...prev, [criterionId]: vote }))
    try {
      await fetch(`/api/brand-audit/${id}/finding-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterionId, userVote: vote }),
      })
    } catch (e) {
      console.error('Failed submitting finding vote', e)
    }
  }

  const handleSubmitReportFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    try {
      const res = await fetch(`/api/brand-audit/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clarityScore,
          discoveredNewIssues: discoveredNew,
          inaccurateFindingsNote: feedbackNote,
        }),
      })
      if (res.ok) {
        setFeedbackSubmitted(true)
      }
    } catch (e) {
      console.error('Failed submitting report feedback', e)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/brand-audit/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.audit) {
          setAudit(data.audit)
          setIsAdmin(Boolean(data.isAdmin))
          setIsExpired(Boolean(data.isExpired))
          if (data.audit.status === 'completed') {
            setVisualProgress(100)
          }
        }
      }

      // Load existing finding votes if any
      const revRes = await fetch(`/api/brand-audit/${id}/finding-feedback`)
      if (revRes.ok) {
        const revData = await revRes.json()
        if (revData.reviews) {
          const votesMap: Record<string, string> = {}
          for (const [k, v] of Object.entries(revData.reviews as Record<string, any>)) {
            if (v.userVote) votesMap[k] = v.userVote
          }
          setFindingVotes(votesMap)
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

  // Polling & Smooth visual progress while running
  useEffect(() => {
    if (!audit || audit.status === 'completed' || audit.status === 'failed') {
      return
    }

    const timer = setInterval(() => {
      setVisualProgress((prev) => (prev < 90 ? prev + 5 : 92))
    }, 800)

    const interval = setInterval(() => {
      setPollCount((c) => {
        const next = c + 1
        // Auto-heal: If polled 3 times (approx 6s) and still not completed, trigger rerun
        if (next === 3) {
          fetch(`/api/brand-audit/${id}/rerun`, { method: 'POST' })
            .then((r) => r.json())
            .then((d) => {
              if (d.audit) setAudit(d.audit)
            })
            .catch(() => {})
        }
        return next
      })
      fetchAudit()
    }, 2000)

    return () => {
      clearInterval(timer)
      clearInterval(interval)
    }
  }, [audit?.status, id])

  const handleRerun = async () => {
    if (!isAdmin && (audit?.clientRerunCount || 0) >= 1) {
      showToast('Дахин шалгах 1 удаагийн эрх ашиглагдсан байна.')
      return
    }

    setRerunning(true)
    setVisualProgress(65)
    try {
      const res = await fetch(`/api/brand-audit/${id}/rerun`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUserTriggered: true }),
      })
      const data = await res.json()
      if (res.ok && data.audit) {
        setAudit(data.audit)
        setVisualProgress(100)
        showToast('Аудитыг дахин амжилттай шалгалаа (1/1 ашиглагдлаа).')
      } else {
        showToast(data.error || 'Дахин шалгахад алдаа гарлаа')
      }
    } catch (e) {
      console.error(e)
      showToast('Сүлжээний алдаа гарлаа')
    } finally {
      setRerunning(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white text-black pt-[110px] md:pt-[130px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-[#888888]">
              Аудитын мэдээллийг татаж байна...
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!audit) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white text-black pt-[110px] md:pt-[130px] pb-24">
          <div className="max-w-[600px] mx-auto px-6 text-center">
            <AlertOctagon className="size-12 text-rose-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-black mb-2">Аудит олдсонгүй</h1>
            <p className="text-sm text-[#666666] mb-8">
              Таны хайсан брэнд аудит олдсонгүй эсвэл буруу холбоос байна.
            </p>
            <Link
              href="/brand-audit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-bold hover:bg-[#27272a] transition"
            >
              <ArrowLeft className="size-4" />
              <span>Брэнд аудит руу буцах</span>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Check if expired and user is not admin
  if (isExpired && !isAdmin) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32">
          <div className="max-w-[700px] mx-auto px-6 md:px-10 text-center">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 mb-6 border border-rose-100 shadow-xs">
              <Clock className="size-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 uppercase tracking-wider mb-4">
              <span>Хугацаа дууссан (Link Expired)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black mb-4">
              Энэхүү брэнд аудитын хуваалцах холбоосны хугацаа дууссан байна
            </h1>

            <p className="text-sm sm:text-base text-[#666666] leading-relaxed mb-8 max-w-[580px] mx-auto">
              Аюулгүй байдал болон өгөгдлийн шинэчлэлийг хангах үүднээс брэнд аудитыг хуваалцах линк нь <strong>3 хоног (72 цаг)</strong>-ийн хугацаанд хүчинтэй байдаг. Уг хугацаа өнгөрсөн тул тайланг түр хаасан байна.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
              <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                <h3 className="text-sm font-bold text-black mb-1.5 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-blue-600" />
                  <span>Та энэ брэндийн эзэмшигч үү?</span>
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  Хэрэв та брэнд аудитын тайлангаа дахин харах эсвэл бусдад хуваалцах шаардлагатай бол админтай холбогдон холбоосоо дахин 3 хоногоор сэргээлгэх боломжтой.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-[#27272a] transition"
                >
                  <span>Админтай холбогдох</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                <h3 className="text-sm font-bold text-black mb-1.5 flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-600" />
                  <span>Шинэ брэндбүүк аудит хийлгэх</span>
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  Өөрийн шинэчилсэн брэндбүүк эсвэл шинэ загварын PDF-ээ 30 шалгуураар дахин үнэгүй үнэлүүлэх боломжтой.
                </p>
                <Link
                  href="/brand-audit/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e0e0e0] bg-white text-black text-xs font-bold hover:border-black transition"
                >
                  <span>Шинэ аудит эхлүүлэх</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#f0f0f0] text-xs text-[#888888] flex items-center justify-center gap-4">
              <Link href="/brand-audit" className="hover:text-black transition">
                ← Брэнд аудитын үндсэн хуудас
              </Link>
              <span>·</span>
              <Link href="/admin/login" className="hover:text-black transition">
                Админ нэвтрэх
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Processing / Analyzing state
  if (audit.status === 'queued' || audit.status === 'analyzing') {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32">
          <div className="max-w-[760px] mx-auto px-6 md:px-10 text-center">
            <p className="text-[#888888] text-[11px] sm:text-[12px] font-medium tracking-[0.18em] uppercase mb-4">
              Baysaass Brandbook Quality Auditor
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-6">
              <Sparkles className="size-3.5" />
              <span>AI Automated Analysis in Progress</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-3">
              {audit.company} брэндбүүкийг үнэлж байна
            </h1>
            <p className="text-sm md:text-base text-[#666666] max-w-[560px] mx-auto mb-8 leading-relaxed">
              30 шалгуурт дүрэм, логоны зай, өнгө, үсгийн шатлал, дижитал болон хэвлэлийн бодит хэрэглээг үнэлж байна.
            </p>

            <div className="rounded-3xl border border-[#e0e0e0] p-8 md:p-10 bg-[#fafafa] shadow-md mb-8">
              <div className="flex items-center justify-between text-xs font-bold text-black mb-3">
                <span>{audit.currentStageMn || 'Шалгаж байна...'}</span>
                <span>{Math.max(audit.progressPct, visualProgress)}%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-[#e0e0e0] overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(audit.progressPct, visualProgress)}%` }}
                />
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-xs text-[#888888]">
                  <RefreshCw className="size-3.5 animate-spin text-blue-600" />
                  <span>Түр хүлээнэ үү. Систем шалгууруудыг автоматаар бодож байна...</span>
                </div>
                <button
                  type="button"
                  onClick={handleRerun}
                  disabled={rerunning}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#27272a] transition disabled:opacity-50"
                >
                  {rerunning ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Үр дүнг бодож байна...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      <span>Шууд үр дүнг тооцоолох</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
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
    <>
      <div className="print:hidden">
        <Navigation />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-black px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-4 print:hidden">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32 min-h-screen print:pt-4 print:pb-0">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 print:p-0">
          {/* Admin Banner for Expired Audits */}
          {isAdmin && isExpired && (
            <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-900">
                    Админ горим: Энэхүү аудитын олон нийтийн 3 хоногийн линк хүчингүй (expired) болсон байна.
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Та админ эрхтэй тул үзэж байна. Бусад гадны хэрэглэгчдэд линкийг дахин нээхийн тулд хугацааг сунгана уу.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleExtendAudit(3)}
                disabled={extending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shrink-0 disabled:opacity-50"
              >
                <Clock className="size-3.5" />
                <span>{extending ? 'Сэргээж байна...' : 'Дахин 3 хоногоор сэргээх'}</span>
              </button>
            </div>
          )}

          {/* Top Breadcrumb & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#e0e0e0] print:hidden">
            <Link
              href="/brand-audit"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#888888] hover:text-black transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Бүх аудитууд руу буцах</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-[#27272a] transition-colors shadow-xs"
              >
                <Share2 className="size-3.5" />
                <span>Хуваалцах</span>
              </button>
              <AuditExportButton audit={audit} variant="black" />
              {!isAdmin && (audit.clientRerunCount || 0) >= 1 ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#e4e4e7] bg-[#f4f4f5] text-xs font-semibold text-[#888888] cursor-not-allowed transition-colors"
                  title="Дахин шалгах 1 удаагийн эрх ашиглагдсан байна"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>Дахин шалгасан (1/1)</span>
                </button>
              ) : (
                <button
                  onClick={handleRerun}
                  disabled={rerunning}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#e0e0e0] text-xs font-semibold text-black hover:border-black disabled:opacity-50 transition-colors"
                  title={isAdmin ? "Админ горим: Хязгааргүй дахин шалгах" : "Дахин шалгах (1 удаа ашиглах боломжтой)"}
                >
                  <RefreshCw className={`size-3.5 ${rerunning ? 'animate-spin' : ''}`} />
                  <span>Дахин шалгах {!isAdmin ? '(1 удаа)' : ''}</span>
                </button>
              )}
            </div>
          </div>

          {/* Micro-label & Header */}
          <div className="mb-10">
            <p className="text-[#888888] text-[11px] sm:text-[12px] font-medium tracking-[0.18em] uppercase mb-3 print:hidden">
              Baysaass Brandbook Quality Auditor
            </p>

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
              <span className="text-[11px] text-[#888888]">
                Огноо: {new Date(audit.createdAt).toLocaleDateString('mn-MN')}
              </span>
              <button
                type="button"
                onClick={() => openAuditPrintWindow(audit)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 transition print:hidden"
              >
                <Download className="size-3" />
                <span>PDF татах</span>
              </button>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black">
              {audit.company} — Чанарын аудитын тайлан
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-[#888888] mt-2">
              <span>Файл: {audit.documentInfo.fileName} ({audit.documentInfo.totalPages} хуудас)</span>
              {audit.documentInfo.fileUrl && (
                <>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `/api/brand-audit/upload-url?key=${encodeURIComponent(audit.documentInfo.fileUrl!)}`
                        )
                        if (res.ok) {
                          const data = await res.json()
                          if (data.downloadUrl) window.open(data.downloadUrl, '_blank')
                        }
                      } catch (err) {
                        console.error('Download error', err)
                      }
                    }}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold underline hover:no-underline text-xs print:hidden"
                  >
                    <Download className="size-3" />
                    <span>R2 эх файл татах</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Scorecard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Main Quality Gauge */}
            <div className="lg:col-span-5 rounded-3xl border border-[#e0e0e0] p-8 md:p-10 bg-[#fafafa] flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                  Overall Quality Score
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`text-6xl md:text-7xl font-black ${theme.text}`}>
                    {audit.qualityScore}
                  </span>
                  <span className="text-xl font-bold text-[#a1a1aa]">/100</span>
                </div>
                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${theme.badge}`}
                  >
                    {theme.label}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e0e0e0]">
                <div className="flex items-center justify-between text-xs text-[#888888] mb-2 font-medium">
                  <span>Шалгуурын хамралт</span>
                  <span className="font-bold text-black">{audit.coveragePct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e0e0e0] overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${audit.coveragePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Findings Breakdown & Summary */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              {/* Finding Stat Counters */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1">
                    <AlertOctagon className="size-4" />
                    <span>Чухал алдаа</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-rose-700">
                    {audit.criticalFindingsCount}
                  </div>
                  <p className="text-[11px] text-rose-600 mt-1">Үйлдвэрлэлд шууд саад болох</p>
                </div>

                <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
                    <AlertTriangle className="size-4" />
                    <span>Сайжруулах</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-amber-700">
                    {audit.improvementFindingsCount}
                  </div>
                  <p className="text-[11px] text-amber-600 mt-1">Тодруулах шаардлагатай</p>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                    <CheckCircle2 className="size-4" />
                    <span>Хангалттай</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-emerald-700">
                    {audit.passFindingsCount}
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-1">Стандарт хангасан</p>
                </div>
              </div>

              {/* Executive Summary Box */}
              <div className="rounded-3xl border border-[#e0e0e0] p-6 md:p-8 bg-[#fafafa]">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="size-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                    Аудиторын нэгдсэн дүгнэлт
                  </h3>
                </div>
                <div className="whitespace-pre-line text-xs sm:text-sm text-[#444444] leading-relaxed max-h-[220px] overflow-y-auto pr-2">
                  {audit.executiveSummaryMn}
                </div>
              </div>
            </div>
          </div>

          {/* 9 Modules Breakdown Grid */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[#888888] text-[11px] font-medium tracking-[0.18em] uppercase mb-1">
                  Module Breakdown
                </p>
                <h2 className="text-2xl font-black text-black">9 үндсэн модулийн үнэлгээ</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(audit.modules).map(([modId, modResult]) => {
                const def = MODULE_DEFINITIONS[modId as ModuleId]
                const score = modResult.qualityScore

                let modBadgeColor = 'bg-rose-100 text-rose-800'
                if (score >= 80) modBadgeColor = 'bg-emerald-100 text-emerald-800'
                else if (score >= 60) modBadgeColor = 'bg-blue-100 text-blue-800'
                else if (score >= 40) modBadgeColor = 'bg-amber-100 text-amber-800'

                return (
                  <div
                    key={modId}
                    className="rounded-3xl border border-[#e0e0e0] bg-white p-6 hover:border-black/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                        {def?.name || modId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modBadgeColor}`}>
                        {score}/100
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-black mb-1">
                      {modResult.moduleNameMn || def?.nameMn}
                    </h3>
                    <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 mb-4">
                      {def?.descriptionMn}
                    </p>

                    <div className="pt-3 border-t border-[#e0e0e0] flex items-center justify-between text-xs text-[#888888]">
                      <span>{modResult.passCount} хангасан</span>
                      <span>
                        {modResult.criticalCount > 0 && (
                          <span className="text-rose-600 font-bold mr-2">
                            {modResult.criticalCount} алдаа
                          </span>
                        )}
                        {modResult.improvementCount > 0 && (
                          <span className="text-amber-600 font-bold">
                            {modResult.improvementCount} зөвлөмж
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed Criteria Checklist Section */}
          <div className="mb-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[#888888] text-[11px] font-medium tracking-[0.18em] uppercase mb-1">
                  Detailed Criteria Review
                </p>
                <h2 className="text-2xl font-black text-black">
                  30 шалгуурын нарийвчилсан тайлан ({filteredFindings.length})
                </h2>
              </div>

              {/* Severity Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Бүгд' },
                  { id: 'critical', label: `Алдаа (${audit.criticalFindingsCount})` },
                  { id: 'improvement', label: `Зөвлөмж (${audit.improvementFindingsCount})` },
                  { id: 'pass', label: `Хангасан (${audit.passFindingsCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSeverity(tab.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                      selectedSeverity === tab.id
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white text-[#666666] border border-[#e0e0e0] hover:border-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Module filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="size-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Шалгуур, тайлбар эсвэл зөвлөмжөөс хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e0e0e0] bg-white text-xs text-black placeholder:text-[#a1a1aa] focus:outline-none focus:border-black"
                />
              </div>

              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border border-[#e0e0e0] bg-white text-xs font-semibold text-black focus:outline-none focus:border-black shrink-0"
              >
                <option value="all">Бүх модулиуд</option>
                {Object.entries(MODULE_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.nameMn}
                  </option>
                ))}
              </select>
            </div>

            {/* Findings List */}
            {filteredFindings.length === 0 ? (
              <div className="rounded-3xl border border-[#e0e0e0] p-12 text-center bg-[#fafafa]">
                <p className="text-xs text-[#888888]">Тохирох шалгуур олдсонгүй.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFindings.map((finding) => {
                  let severityBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="size-3" />
                      <span>Хангасан ({finding.score}/4)</span>
                    </span>
                  )

                  if (finding.severity === 'critical') {
                    severityBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        <AlertOctagon className="size-3" />
                        <span>Чухал алдаа ({finding.score}/4)</span>
                      </span>
                    )
                  } else if (finding.severity === 'improvement') {
                    severityBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="size-3" />
                        <span>Сайжруулах ({finding.score}/4)</span>
                      </span>
                    )
                  }

                  return (
                    <div
                      key={finding.criterionId}
                      className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 hover:border-black/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#888888]">
                            {finding.criterionId}
                          </span>
                          <span className="text-xs text-[#888888]">·</span>
                          <span className="text-xs font-semibold text-blue-600">
                            {MODULE_DEFINITIONS[finding.moduleId]?.nameMn || finding.moduleId}
                          </span>
                        </div>
                        {severityBadge}
                      </div>

                      <h3 className="text-base font-bold text-black mb-2">
                        {finding.criterionNameMn}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed mb-4">
                        {finding.findingSummaryMn}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#e0e0e0] text-xs">
                        <div className="rounded-2xl bg-white border border-[#e0e0e0] p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
                            Бизнесийн эрсдэл & Үр дагавар
                          </span>
                          <p className="text-xs text-[#52525b] leading-relaxed">
                            {finding.businessImpactMn}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white border border-[#e0e0e0] p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                            Аудиторын засах зөвлөмж
                          </span>
                          <p className="text-xs text-[#52525b] leading-relaxed">
                            {finding.remedyActionMn}
                          </p>
                        </div>
                      </div>

                      {/* Finding-Level Feedback Bar (AI Quality Evaluation) */}
                      <div className="mt-4 pt-3.5 border-t border-[#e0e0e0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-[11px] font-semibold text-[#888888]">
                          Энэ дүгнэлтийг та хэрхэн үнэлэх вэ?
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleFindingVote(finding.criterionId, 'correct')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                              findingVotes[finding.criterionId] === 'correct'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-[#52525b] border border-[#e0e0e0] hover:border-black'
                            }`}
                          >
                            ✓ Зөв дүгнэлт
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFindingVote(finding.criterionId, 'false_positive')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                              findingVotes[finding.criterionId] === 'false_positive'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white text-[#52525b] border border-[#e0e0e0] hover:border-black'
                            }`}
                          >
                            ✕ Буруу — Энэ дүрэм байгаа
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFindingVote(finding.criterionId, 'unclear')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                              findingVotes[finding.criterionId] === 'unclear'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-[#52525b] border border-[#e0e0e0] hover:border-black'
                            }`}
                          >
                            ? Тайлбар ойлгомжгүй
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Download Report Card */}
          <div className="rounded-3xl border border-[#e0e0e0] p-8 md:p-10 bg-[#fafafa] mb-8 print:hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                  <Download className="size-3" />
                  <span>Тайлан татах боломж</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-black">
                  {audit.company} брэндийн аудитын тайланг татаж авах
                </h2>
                <p className="text-xs text-[#666666] mt-1 max-w-[580px] leading-relaxed">
                  Бүх 30 шалгуурын оноо, стандартын зөрчил, эрсдэл болон дизайнер, удирдлагад зориулсан засах зөвлөмжүүдийг албан ёсны A4 PDF болон бусад форматаар хадгалж аваарай.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => openAuditPrintWindow(audit)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-lg"
                >
                  <Printer className="size-4" />
                  <span>Албан ёсны PDF татах</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAuditDocument(audit, 'md')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-[#e0e0e0] bg-white text-black text-xs font-semibold hover:border-black transition"
                >
                  <FileText className="size-4 text-emerald-600" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadAuditDocument(audit, 'txt')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-[#e0e0e0] bg-white text-black text-xs font-semibold hover:border-black transition"
                >
                  <FileText className="size-4 text-[#888888]" />
                  <span>Текст (.txt)</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Report Feedback Widget (AI Audit Quality Program) */}
          <div className="rounded-3xl border border-[#e0e0e0] p-8 md:p-10 bg-white mb-14 print:hidden">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                <Sparkles className="size-3" />
                <span>AI Чанарын сайжруулалт</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-black">
                Энэхүү аудитын тайлан танд хэр өгөөжтэй байв?
              </h2>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Бид хиймэл оюуны бодит алдаа илрүүлэлт, дүрэм унших нарийвчлалыг тасралтгүй сайжруулж байна. 30 секундийн үнэлгээ өгч чанарыг сайжруулахад тусална уу.
              </p>

              {feedbackSubmitted ? (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Баярлалаа! Таны санал хүсэлт амжилттай бүртгэгдлээ. AI загварын цаашдын сайжруулалтад тусгагдах болно.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReportFeedback} className="mt-6 space-y-6">
                  {/* Question 1: Clarity */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-2">
                      1. Тайлангийн дүгнэлтүүд хэр ойлгомжтой байна вэ?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setClarityScore(score)}
                          className={`size-10 rounded-xl text-xs font-bold transition-all ${
                            clarityScore === score
                              ? 'bg-black text-white'
                              : 'bg-[#fafafa] border border-[#e0e0e0] text-[#666666] hover:border-black hover:text-black'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                      <span className="text-[11px] text-[#888888] ml-2">
                        {clarityScore === 1 && 'Маш ойлгомжгүй'}
                        {clarityScore === 2 && 'Ойлгомжгүй'}
                        {clarityScore === 3 && 'Дундаж'}
                        {clarityScore === 4 && 'Ойлгомжтой'}
                        {clarityScore === 5 && 'Маш ойлгомжтой'}
                      </span>
                    </div>
                  </div>

                  {/* Question 2: Discovered New Issues */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-2">
                      2. Та өмнө нь анзаараагүй шинэ алдаа, эрсдэл олж мэдсэн үү?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'yes_new', label: 'Тийм, шинэ асуудал олсон' },
                        { id: 'some_new', label: 'Зарим нь шинэ байсан' },
                        { id: 'no', label: 'Үгүй, бүгдийг нь мэдэж байсан' },
                        { id: 'unsure', label: 'Мэдэхгүй / Эргэлзээтэй' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDiscoveredNew(opt.id)}
                          className={`p-3 rounded-xl text-[11px] font-semibold text-left transition-all ${
                            discoveredNew === opt.id
                              ? 'bg-black text-white'
                              : 'bg-[#fafafa] border border-[#e0e0e0] text-[#666666] hover:border-black hover:text-black'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 3: Inaccurate Findings */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      3. Буруу эсвэл дутуу дүгнэсэн зүйл байвал бичнэ үү (Сонголттой):
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      placeholder="Жишээ нь: 14-р хуудсанд хамгаалалтын зай тодорхой байхад алдаа гэж заасан байна..."
                      className="w-full text-xs p-3 rounded-xl border border-[#e0e0e0] bg-[#fafafa] text-black focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    <span>{submittingFeedback ? 'Илгээж байна...' : 'Үнэлгээ илгээх'}</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Baysaass Studio Consultation CTA */}
          <div className="rounded-3xl bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-20 shadow-xl print:hidden">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Baysaass Studio Services
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                Брэндбүүкийнхээ алдааг мэргэжлийн түвшинд засуулах уу?
              </h3>
              <p className="text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-[600px] leading-relaxed">
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

          {/* Signature Portfolio Pre-Footer CTA */}
          <section className="border-t border-[#e0e0e0] py-24 md:py-32 text-center px-6 print:hidden">
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

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in print:hidden">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#e0e0e0] animate-in zoom-in-95">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-[#888888] hover:text-black hover:bg-[#f4f4f5] transition"
              >
                <X className="size-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-black text-white shrink-0">
                  <Share2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Брэнд аудитыг хуваалцах</h3>
                  <p className="text-xs text-[#888888]">{audit.company} брэндийн тайлан</p>
                </div>
              </div>

              {/* Countdown / Expiry card */}
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4 text-blue-600" />
                    <span>3 хоног хүчинтэй холбоос</span>
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {getRemainingTimeLabel(audit.expiresAt)}
                  </span>
                </div>
                <p className="text-[#475569] leading-relaxed text-[11px] mt-1.5">
                  Энэхүү холбоосыг хуулан харилцагч, багийн гишүүд болон удирдлагадаа илгээх боломжтой. Аюулгүй байдлыг хангах үүднээс 72 цагийн дараа холбоос автоматаар хаагдах ба хүсвэл админ сэргээж эрхийг дахин нээх боломжтой.
                </p>
              </div>

              {/* Copy Link Input */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-black mb-1.5">
                  Хуваалцах холбоос:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      typeof window !== 'undefined'
                        ? window.location.href
                        : `https://baysaass.space/brand-audit/${id}`
                    }
                    className="flex-1 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-xs font-mono text-[#333333] select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-black text-white text-xs font-bold hover:bg-[#27272a] transition shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="size-4 text-emerald-400" />
                        <span>Хуулагдлаа!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        <span>Линк хуулах</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Admin quick controls if logged in as admin */}
              {isAdmin && (
                <div className="mt-6 pt-5 border-t border-[#f0f0f0]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-2.5">
                    Админ удирдлага: Хугацааг сунгах / Сэргээх
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExtendAudit(3)}
                      disabled={extending}
                      className="px-3.5 py-1.5 rounded-xl border border-[#e0e0e0] text-xs font-bold text-black hover:bg-[#f4f4f5] transition disabled:opacity-50"
                    >
                      +3 хоног
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendAudit(7)}
                      disabled={extending}
                      className="px-3.5 py-1.5 rounded-xl border border-[#e0e0e0] text-xs font-bold text-black hover:bg-[#f4f4f5] transition disabled:opacity-50"
                    >
                      +7 хоног
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendAudit(365)}
                      disabled={extending}
                      className="px-3.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100 transition disabled:opacity-50"
                    >
                      Хязгааргүй (1 жил)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}
