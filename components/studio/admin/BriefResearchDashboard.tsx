'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  BarChart3,
  Target,
  Compass,
  PieChart,
  Layers,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import BriefAnalysisDetailModal from './BriefAnalysisDetailModal'

interface BriefResearchDashboardProps {
  projects: Project[]
  metrics?: {
    totalProjects: number
    completedBriefs: number
    inProgressBriefs: number
    pendingBriefs: number
    avgReadiness: number
    brandIdealsAvg: {
      visionClarity: number
      audienceResonance: number
      differentiation: number
      coherence: number
    }
    archetypeDistribution: Record<string, number>
    disciplineDistribution: Record<string, number>
    tierDistribution: Record<string, number>
    stageDistribution: Record<string, number>
    topStyles: [string, number][]
    topAudiences: [string, number][]
  }
  onRefresh?: () => void
}

export default function BriefResearchDashboard({
  projects,
  metrics,
  onRefresh,
}: BriefResearchDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openProjectModal = (proj: Project) => {
    setSelectedProject(proj)
    setModalOpen(true)
  }

  const completedCount = metrics?.completedBriefs ?? projects.filter((p) => p.brief.complete).length
  const totalCount = metrics?.totalProjects ?? projects.length
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
  const avgReadiness = metrics?.avgReadiness ?? 65

  const brandIdeals = metrics?.brandIdealsAvg || {
    visionClarity: 72,
    audienceResonance: 68,
    differentiation: 61,
    coherence: 77,
  }

  const archetypes = Object.entries(metrics?.archetypeDistribution || {}).sort((a, b) => b[1] - a[1])
  const disciplines = Object.entries(metrics?.disciplineDistribution || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-black">
              Бриф дээр суурилсан судалгааны дэшбоард
            </h2>
            <span className="flex items-center gap-1 rounded-full border border-black bg-black px-2.5 py-0.5 text-[10px] font-bold text-white">
              <Sparkles className="size-3" /> TypeSafe AI
            </span>
          </div>
          <p className="mt-1 text-xs text-[#666666]">
            Бүх ирсэн захиалгын бриф, харилцагчийн зан төлөв, брэндийн стратегийн 4 суурь тулгуурын синтез
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 self-start rounded-full border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
          >
            <RefreshCw className="size-3.5 text-[#666666]" /> Шинэчлэх
          </button>
        )}
      </div>

      {/* Metric summary 4 cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Briefs */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
            <span>Нийт ирсэн бриф</span>
            <Layers className="size-4 text-[#888888]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-black">{totalCount}</span>
            <span className="text-xs font-semibold text-[#226738]">
              {completedCount} бүрэн бүрдсэн
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#666666]">
            Бөглөлтийн хувь: <span className="font-bold text-black">{completionRate}%</span>
          </div>
        </div>

        {/* Average Readiness Score */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
            <span>Дундаж Бэлэн байдлын оноо</span>
            <Sparkles className="size-4 text-black" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-black">
              {avgReadiness}
              <span className="text-sm font-normal text-[#888888]">/100</span>
            </span>
            <span className="text-xs font-semibold text-[#226738]">
              {avgReadiness >= 70 ? 'Өндөр чадамжтай' : 'Дундаж түвшин'}
            </span>
          </div>
          <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full bg-black" style={{ width: `${avgReadiness}%` }} />
          </div>
        </div>

        {/* Lead Priority VIP */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
            <span>VIP & Growth төслүүд</span>
            <Target className="size-4 text-[#888888]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-black">
              {(metrics?.tierDistribution?.VIP || 0) + (metrics?.tierDistribution?.GROWTH || 0)}
            </span>
            <span className="text-xs font-semibold text-[#c2410c]">
              VIP: {metrics?.tierDistribution?.VIP || 0}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#666666]">
            Standard: {metrics?.tierDistribution?.STANDARD || 0}
          </div>
        </div>

        {/* Pipeline Stage Distribution */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#888888]">
            <span>Идэвхтэй хэлэлцээрт</span>
            <TrendingUp className="size-4 text-[#888888]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-black">
              {(metrics?.stageDistribution?.contract_pending || 0) + (metrics?.stageDistribution?.active || 0)}
            </span>
            <span className="text-xs font-semibold text-[#226738]">
              Гэрээ: {metrics?.stageDistribution?.contract_pending || 0}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#666666]">
            Идэвхтэй гүйцэтгэл: {metrics?.stageDistribution?.active || 0}
          </div>
        </div>
      </div>

      {/* Grid: 4 Strategic Brand Pillars + Design Disciplines */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 4 Strategic Brand Pillars Card */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
            <div>
              <h3 className="text-sm font-bold text-black tracking-tight">
                Брэндийн 4 суурь тулгуур үзүүлэлт (Brand Strategy Pillars)
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Ирсэн брифүүдийн дундаж стратегийн чанар & уялдаа холбоо
              </p>
            </div>
            <span className="rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[10px] font-bold text-black">
              Phase 1 Research
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {/* 1. Vision Clarity */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-black">
                  1. Мөн чанар & Эрхэм зорилго (Essence & Vision)
                </span>
                <span className="font-bold text-black">{brandIdeals.visionClarity}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{ width: `${brandIdeals.visionClarity}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[#888888]">
                Бизнесийн үндсэн үйл ажиллагаа, брэндийн нэршил тодорхойлогдсон дундаж түвшин.
              </p>
            </div>

            {/* 2. Audience Resonance */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-black">
                  2. Зорилтот сегмент (Target Audience)
                </span>
                <span className="font-bold text-black">{brandIdeals.audienceResonance}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{ width: `${brandIdeals.audienceResonance}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[#888888]">
                Хэрэглэгчийн хүн ам зүй, нас, хүйс, сонирхлын сегментчлэлийн нарийвчлал.
              </p>
            </div>

            {/* 3. Differentiation */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-black">
                  3. Цорын ганц ялгарал & Амлалт (Radical Differentiation)
                </span>
                <span className="font-bold text-black">{brandIdeals.differentiation}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{ width: `${brandIdeals.differentiation}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[#888888]">
                Өрсөлдөгчдөөс ялгарах гол үнэ цэнэ, зах зээлд байрших өвөрмөц онцлог.
              </p>
            </div>

            {/* 4. Touchpoints Coherence */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-black">
                  4. Хүрэх цэгүүд & Системийн уялдаа (Coherence & Touchpoints)
                </span>
                <span className="font-bold text-black">{brandIdeals.coherence}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{ width: `${brandIdeals.coherence}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[#888888]">
                Хүлээлгэн өгөх лого, сав баглаа, дижитал болон брэндбүүк тачпойнтууд.
              </p>
            </div>
          </div>
        </div>

        {/* Design Disciplines & Archetypes breakdown */}
        <div className="space-y-6">
          {/* Disciplines */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3 mb-4">
              <h3 className="text-sm font-bold text-black tracking-tight">
                Хүсэгдэж буй дизайны чиглэлүүд (Disciplines)
              </h3>
              <PieChart className="size-4 text-[#888888]" />
            </div>

            <div className="space-y-2.5">
              {disciplines.length === 0 ? (
                <p className="text-xs text-[#888888]">Өгөгдөл одоогоор алга.</p>
              ) : (
                disciplines.map(([name, count]) => {
                  const pct = totalCount ? Math.round((count / totalCount) * 100) : 0
                  return (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-black">{name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-36 h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
                          <div className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono font-bold text-black w-7 text-right">{count}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Archetypes */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3 mb-4">
              <h3 className="text-sm font-bold text-black tracking-tight">
                Брэндийн зонхилох архетипүүд (Archetypes)
              </h3>
              <Compass className="size-4 text-[#888888]" />
            </div>

            <div className="flex flex-wrap gap-2">
              {archetypes.length === 0 ? (
                <p className="text-xs text-[#888888]">Архетип тодорхойлогдоогүй.</p>
              ) : (
                archetypes.map(([arch, count]) => (
                  <div
                    key={arch}
                    className="flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3 py-1.5 text-xs"
                  >
                    <span className="font-semibold text-black">{arch}</span>
                    <span className="rounded-full bg-black px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Style & Audience Trends Row */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Style Patterns */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
            Эрэлттэй буй брэндийн өнгө аяс & хэв маяг (Style Keywords)
          </h3>
          <div className="flex flex-wrap gap-2">
            {(metrics?.topStyles || []).length === 0 ? (
              <span className="text-xs text-[#888888]">Хэв маягийн дата бүрдээгүй</span>
            ) : (
              metrics?.topStyles?.map(([tag, count]) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3 py-1 text-xs font-medium text-black capitalize"
                >
                  #{tag} <span className="text-[#888888] text-[10px]">({count})</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Audience Patterns */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
            Зорилтот хэрэглэгчийн сегментүүд (Target Audiences)
          </h3>
          <div className="flex flex-wrap gap-2">
            {(metrics?.topAudiences || []).length === 0 ? (
              <span className="text-xs text-[#888888]">Хэрэглэгчийн дата бүрдээгүй</span>
            ) : (
              metrics?.topAudiences?.map(([tag, count]) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3 py-1 text-xs font-medium text-black capitalize"
                >
                  @{tag} <span className="text-[#888888] text-[10px]">({count})</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Brief Intelligence Table */}
      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-black tracking-tight">
              Бүх брифүүдийн TypeSafe судалгааны дэлгэрэнгүй жагсаалт
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Харилцагч бүрийн бэлэн байдлын оноо, архетип болон стратегийн шалгуур
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                <th className="py-3 px-3">Компани / Төсөл</th>
                <th className="py-3 px-3">Бэлэн байдал (Score)</th>
                <th className="py-3 px-3">Зэрэглэл</th>
                <th className="py-3 px-3">Архетип</th>
                <th className="py-3 px-3">Бриф явц</th>
                <th className="py-3 px-3">Шалгуур (Noul)</th>
                <th className="py-3 px-3 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {projects.map((proj) => {
                const analysis = proj.brief.analysis
                const answersCount = Object.keys(proj.brief.answers || {}).length
                const score = analysis?.readinessScore || 0

                return (
                  <tr key={proj.token} className="hover:bg-[#fafafa] transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-black">{proj.name}</div>
                      <div className="text-[11px] text-[#888888]">
                        {proj.company} · Токен: <code className="font-mono text-black">{proj.token}</code>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-black">{score}</span>
                        <div className="w-16 h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                          <div
                            className="h-full rounded-full bg-black"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-[#666666]">
                        {analysis?.readinessTier || 'Хүлээгдэж буй'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                          analysis?.leadQualityTier === 'VIP'
                            ? 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                            : analysis?.leadQualityTier === 'GROWTH'
                            ? 'border border-[#d2ebd6] bg-[#f0fdf4] text-[#226738]'
                            : 'border border-[#e0e0e0] bg-[#fafafa] text-[#666666]'
                        }`}
                      >
                        {analysis?.leadQualityTier || 'STANDARD'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="max-w-[150px] truncate font-medium text-black" title={analysis?.brandArchetype}>
                        {analysis?.brandArchetype || '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {proj.brief.complete ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#d2ebd6] bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-bold text-[#226738]">
                            <CheckCircle2 className="size-3" /> Бүрэн
                          </span>
                        ) : answersCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#fef08a] bg-[#fefce8] px-2 py-0.5 text-[10px] font-bold text-[#854d0e]">
                            <Clock className="size-3" /> {answersCount} хариулттай
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#999999]">Хариулаагүй</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1">
                        {analysis?.verifications?.hasClearVision?.result ? (
                          <span title="Зорилго тодорхой" className="text-xs">🎯</span>
                        ) : null}
                        {analysis?.verifications?.hasDefinedAudience?.result ? (
                          <span title="Сегмент тодорхой" className="text-xs">👥</span>
                        ) : null}
                        {analysis?.verifications?.hasDifferentiation?.result ? (
                          <span title="Ялгарал тодорхой" className="text-xs">⚡</span>
                        ) : null}
                        {analysis?.verifications?.needsStrategyDiscovery?.result ? (
                          <span title="Стратеги воркшоп хэрэгтэй" className="text-xs">💡</span>
                        ) : null}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openProjectModal(proj)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition shadow-sm"
                      >
                        <Eye className="size-3" /> Шинжилгээ үзэх
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brief Detail Modal */}
      <BriefAnalysisDetailModal
        project={selectedProject}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={onRefresh}
      />
    </div>
  )
}
