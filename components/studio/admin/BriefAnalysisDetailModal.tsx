'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Briefcase,
  Layers,
  Target,
  Compass,
  ArrowRight,
  FileText,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'
import ContractExportButton from '@/components/studio/ContractExportButton'

interface BriefAnalysisDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function BriefAnalysisDetailModal({
  project,
  isOpen,
  onClose,
  onUpdate,
}: BriefAnalysisDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'answers' | 'chat'>('analysis')
  const [reanalyzing, setReanalyzing] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  if (!isOpen || !project) return null

  const brief = project.brief
  const analysis = brief.analysis
  const answers = brief.answers || {}
  const messages = brief.messages || []

  const copyBriefLink = () => {
    const url = `${window.location.origin}/client/brief/${project.token}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleReanalyze = async () => {
    setReanalyzing(true)
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: project.token, reanalyze: true }),
      })
      if (res.ok) {
        if (onUpdate) onUpdate()
      }
    } catch (e) {
      console.error('Failed reanalyzing brief', e)
    } finally {
      setReanalyzing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#e0e0e0] bg-white shadow-2xl">
        {/* Modal Header */}
        <header className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4.5 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white shadow-sm">
              {project.company ? project.company[0].toUpperCase() : 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-black">{project.name}</h2>
                <span className="rounded-full border border-[#e0e0e0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#666666]">
                  {project.company}
                </span>
              </div>
              <p className="text-[11px] text-[#888888] flex items-center gap-2 mt-0.5">
                <span>Токен: <code className="font-mono text-black">{project.token}</code></span>
                <span>·</span>
                <span>{project.contactName} ({project.phone || project.email || 'Холбоо барих мэдээлэлгүй'})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              title="TypeSafe AI-аар дахин шинжлэх"
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Дахин шинжлэх</span>
            </button>
            <button
              onClick={copyBriefLink}
              title="Харилцагчийн бриф линк хуулах"
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition"
            >
              {copiedLink ? <Check className="size-3.5 text-[#226738]" /> : <Copy className="size-3.5 text-[#666666]" />}
              <span className="hidden sm:inline">Бриф линк</span>
            </button>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-[#888888] hover:bg-[#e0e0e0] hover:text-black transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* Tab Controls */}
        <div className="flex border-b border-[#e5e5e5] px-6 bg-white gap-2">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 border-b-2 py-3 text-xs font-bold transition ${
              activeTab === 'analysis'
                ? 'border-black text-black'
                : 'border-transparent text-[#888888] hover:text-black'
            }`}
          >
            <Sparkles className="size-3.5" /> TypeSafe Судалгааны үр дүн
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`flex items-center gap-2 border-b-2 py-3 text-xs font-bold transition ${
              activeTab === 'answers'
                ? 'border-black text-black'
                : 'border-transparent text-[#888888] hover:text-black'
            }`}
          >
            <Layers className="size-3.5" /> Харилцагчийн бриф хариултууд ({Object.keys(answers).length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 border-b-2 py-3 text-xs font-bold transition ${
              activeTab === 'chat'
                ? 'border-black text-black'
                : 'border-transparent text-[#888888] hover:text-black'
            }`}
          >
            <Clock className="size-3.5" /> AI Чат түүх ({messages.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* TAB 1: TYPESAFE ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Executive Cards Row */}
              <div className="grid gap-4 sm:grid-cols-4">
                {/* Readiness Score */}
                <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
                    <span>Бэлэн байдлын оноо</span>
                    <Sparkles className="size-3.5 text-black" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-black">
                      {analysis?.readinessScore || 0}
                    </span>
                    <span className="text-xs font-semibold text-[#888888]">/100</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{ width: `${analysis?.readinessScore || 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-[#226738]">
                    {analysis?.readinessTier || 'Тодорхойлох шатанд'}
                  </p>
                </div>

                {/* Lead Quality Tier */}
                <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
                    <span>Харилцагчийн зэрэглэл</span>
                    <Target className="size-3.5 text-black" />
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1 text-sm font-extrabold ${
                        analysis?.leadQualityTier === 'VIP'
                          ? 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                          : analysis?.leadQualityTier === 'GROWTH'
                          ? 'border border-[#d2ebd6] bg-[#f0fdf4] text-[#226738]'
                          : 'border border-[#e0e0e0] bg-white text-black'
                      }`}
                    >
                      {analysis?.leadQualityTier || 'STANDARD'}
                    </span>
                  </div>
                  <p className="mt-3 text-[10px] text-[#666666]">
                    Төсвийн боломж & төслийн ач холбогдол
                  </p>
                </div>

                {/* Brand Archetype */}
                <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
                    <span>Брэндийн архетип</span>
                    <Compass className="size-3.5 text-black" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-black line-clamp-1">
                      {analysis?.brandArchetype || 'Тодорхойлоогүй'}
                    </p>
                  </div>
                  <p className="mt-3 text-[10px] text-[#666666]">
                    Брэндийн зан чанар & өнгө аяс
                  </p>
                </div>

                {/* Primary Scope */}
                <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
                    <span>Үндсэн чиглэл</span>
                    <Briefcase className="size-3.5 text-black" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-black line-clamp-1">
                      {analysis?.primaryDiscipline || project.type || 'Brand Identity'}
                    </p>
                  </div>
                  <p className="mt-3 text-[10px] text-[#666666]">
                    Төслийн ажлын үндсэн цар хүрээ
                  </p>
                </div>
              </div>

              {/* Recommended Next Action Banner */}
              {analysis?.recommendedNextStep && (
                <div className="flex items-center justify-between rounded-2xl border border-black bg-black p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-white">
                      <ArrowRight className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#aaaaaa] font-semibold">
                        TypeSafe зөвлөмж · Дараагийн оновчтой алхам
                      </p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {analysis.recommendedNextStep}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/projects/${project.token}`}
                    className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#e5e5e5] transition"
                  >
                    Ажиллах <ExternalLink className="size-3" />
                  </Link>
                </div>
              )}

              {/* 4 Strategic Brand Pillars Radar / Bars */}
              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
                <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                      Брэндийн 4 суурь тулгуур үзүүлэлт (Brand Strategy Pillars)
                    </h3>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Брэндийн стратеги, ялгарал, хүрэх цэгийн судалгааны бэлтгэлийн түвшин
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 1. Vision Clarity */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-black">1. Мөн чанар & Зорилго (Essence & Vision)</span>
                      <span className="font-bold text-black">{analysis?.brandIdeals.visionClarity || 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${analysis?.brandIdeals.visionClarity || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Audience Resonance */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-black">2. Зорилтот бүлэг (Target Audience)</span>
                      <span className="font-bold text-black">{analysis?.brandIdeals.audienceResonance || 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${analysis?.brandIdeals.audienceResonance || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Differentiation */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-black">3. Цорын ганц ялгарал (Radical Differentiation)</span>
                      <span className="font-bold text-black">{analysis?.brandIdeals.differentiation || 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${analysis?.brandIdeals.differentiation || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Touchpoints Coherence */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-black">4. Хүрэх цэгүүд & Уялдаа (Touchpoints Coherence)</span>
                      <span className="font-bold text-black">{analysis?.brandIdeals.coherence || 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${analysis?.brandIdeals.coherence || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TypeSafe Noul Verifications Grid */}
              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
                <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                      TypeSafe Noul нөхцөлт баталгаажуулалтууд (Calibrated Judgments)
                    </h3>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Мэдээллийн бүрэн байдал, эрсдэл болон магадлалын хэмжүүр
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {analysis?.verifications &&
                    Object.entries(analysis.verifications).map(([key, item]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 hover:border-[#e0e0e0] transition"
                      >
                        <div className="flex items-start gap-2.5">
                          {item.result ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#226738]" />
                          ) : (
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#c2410c]" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-black">
                              {key === 'hasClearVision' && 'Бизнесийн тодорхой зорилготой эсэх'}
                              {key === 'hasDefinedAudience' && 'Хэрэглэгчийн сегментчлэл тодорхой эсэх'}
                              {key === 'hasDifferentiation' && 'Зах зээлийн ялгарал тодорхой эсэх'}
                              {key === 'hasScopeAlignment' && 'Ажлын цар хүрээ нийцтэй эсэх'}
                              {key === 'isTimeSensitive' && 'Хугацаа шахуу төсөл эсэх'}
                              {key === 'needsStrategyDiscovery' && 'Стратеги воркшоп шаардлагатай эсэх'}
                            </p>
                            <p className="text-[11px] text-[#666666] mt-0.5">{item.note}</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-md border border-[#e5e5e5] bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-black">
                          {Math.round(item.prob * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Key Strategic Insights List */}
              {analysis?.keyInsights && analysis.keyInsights.length > 0 && (
                <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3">
                    Студийн стратегийн үндсэн дүгнэлтүүд
                  </h3>
                  <ul className="space-y-2">
                    {analysis.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#333333]">
                        <span className="mt-1.5 size-1.5 rounded-full bg-black shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENT RAW ANSWERS */}
          {activeTab === 'answers' && (
            <div className="space-y-4">
              {Object.keys(answers).length === 0 ? (
                <div className="py-12 text-center text-xs text-[#888888]">
                  Харилцагч хараахан асуултуудад хариулаагүй байна.
                </div>
              ) : (
                [
                  { key: 'projectType', title: '1. Төслийн үндсэн төрөл' },
                  { key: 'business', title: '2. Бизнесийн мөн чанар & Нэр (Who are you?)' },
                  { key: 'goal', title: '3. Төслийн гол зорилго' },
                  { key: 'audience', title: '4. Зорилтот хэрэглэгчид (Who needs to know?)' },
                  { key: 'style', title: '5. Брэндийн өнгө аяс & Хэв маяг (Look & feel)' },
                  { key: 'deliverables', title: '6. Хүлээлгэн өгөх материалууд (Touchpoints)' },
                  { key: 'timeline', title: '7. Харилцагчийн хүссэн хугацаа (Target Deadline)' },
                  { key: 'budget', title: '8. Төлөвлөсөн төсвийн хүлээлт (Budget range)' },
                  { key: 'references', title: '9. Visual референсүүд & жишээ' },
                  { key: 'serviceScope', title: '10. Баталгаажуулсан үйлчилгээний цар хүрээ (Service Scope)' },
                ].map(({ key, title }) => (
                  <div key={key} className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4.5">
                    <p className="text-xs font-bold text-black">{title}</p>
                    <p className="mt-1.5 text-xs text-[#333333] leading-relaxed whitespace-pre-wrap">
                      {answers[key] ? answers[key] : <span className="text-[#999999] italic">Хариулаагүй / Алгассан</span>}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: AI CHAT TRANSCRIPT */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#888888]">
                  Чат харилцааны түүх олдсонгүй.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'CLIENT' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#888888]">
                      <span>{msg.role === 'CLIENT' ? 'Харилцагч' : 'Baysaass AI Assistant'}</span>
                      {msg.timestamp && (
                        <span>· {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === 'CLIENT'
                          ? 'bg-black text-white'
                          : 'border border-[#e0e0e0] bg-[#fafafa] text-black'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e5e5] px-6 py-4 bg-[#fafafa]">
          <span className="text-[11px] text-[#888888]">
            Сүүлд шинжилсэн: {analysis?.analyzedAt ? new Date(analysis.analyzedAt).toLocaleString('mn-MN') : 'Шинжлээгүй'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <ContractExportButton project={project} variant="white" buttonText="Гэрээ экспортлох" />
            <Link
              href={`/admin/contracts?token=${project.token}`}
              className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition shadow-xs"
            >
              <FileText className="size-3.5" />
              <span>Үнийн санал & Гэрээ бэлтгэх</span>
            </Link>
            <Link
              href={`/admin/projects/${project.token}`}
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#222222] transition"
            >
              <span>Төслийн талбар</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
