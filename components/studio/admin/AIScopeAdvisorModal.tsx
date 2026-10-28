'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Check,
  X,
  Package,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { DeliverableItem, ProjectTask, StageItem, Project, AIScopeSuggestion } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'

interface AIScopeAdvisorModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onApplyAll: (data: {
    deliverables: DeliverableItem[]
    tasks: ProjectTask[]
    stages: StageItem[]
    total: number
    proposalNote: string
    durationDays: number
  }) => void
  onApplyDeliverablesOnly?: (deliverables: DeliverableItem[]) => void
  onApplyTasksOnly?: (tasks: ProjectTask[]) => void
}

export default function AIScopeAdvisorModal({
  isOpen,
  onClose,
  project,
  onApplyAll,
  onApplyDeliverablesOnly,
  onApplyTasksOnly,
}: AIScopeAdvisorModalProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<AIScopeSuggestion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'deliverables' | 'tasks' | 'proposal'>('all')
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  // Fetch or trigger suggestion whenever modal opens and we don't have one
  React.useEffect(() => {
    if (isOpen && project && !suggestion) {
      handleGenerate()
    }
    if (!isOpen) {
      setAppliedSuccess(false)
    }
  }, [isOpen, project])

  const handleGenerate = async () => {
    if (!project) return
    setLoading(true)
    setError(null)
    setAppliedSuccess(false)
    try {
      const res = await fetch(`/api/admin/ai/suggest-scope?token=${project.token}`)
      if (res.ok) {
        const data = await res.json()
        if (data.suggestion) {
          setSuggestion(data.suggestion)
        }
      } else {
        const err = await res.json()
        setError(err.error || 'AI санал гаргахад алдаа гарлаа')
      }
    } catch (e: any) {
      console.error('Error generating AI scope suggestion', e)
      setError('Сүлжээний холболтын алдаа')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !project) return null

  const handleApplyEverything = () => {
    if (!suggestion) return

    const today = new Date()
    const endDate = new Date(today.getTime() + (suggestion.recommendedDurationDays || 28) * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0]

    const mappedDeliverables: DeliverableItem[] = suggestion.suggestedDeliverables.map((d, idx) => ({
      id: `del_ai_${Date.now()}_${idx}`,
      name: d.name,
      description: d.description,
      quantity: d.quantity || '1',
      due: endDate,
      status: 'pending',
    }))

    const mappedTasks: ProjectTask[] = suggestion.suggestedTasks.map((t, idx) => ({
      id: `task_ai_${Date.now()}_${idx}`,
      name: t.name,
      description: t.description || 'Ажлын даалгавар',
      due: endDate,
      completed: false,
    }))

    const mappedStages: StageItem[] = suggestion.suggestedStages.map((s, idx) => ({
      id: `stage_ai_${Date.now()}_${idx}`,
      name: s.name,
      result: s.result,
      payment: s.payment,
    }))

    onApplyAll({
      deliverables: mappedDeliverables,
      tasks: mappedTasks,
      stages: mappedStages.length > 0 ? mappedStages : (project.contract?.stages || []),
      total: suggestion.recommendedBudget,
      proposalNote: suggestion.proposalNote,
      durationDays: suggestion.recommendedDurationDays,
    })

    setAppliedSuccess(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-[#e0e0e0] bg-white shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-black text-white shadow-xs">
              <Sparkles className="size-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black">OpenAI — Ажлын цар хүрээ & Гаралт санал дэвшүүлэгч</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  GPT-4o холбогдсон
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Бриф: <strong className="text-black">{project.name}</strong> ({project.company})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              title="Дахин боловсруулах"
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f5f5f5] transition disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Шинэчлэх</span>
            </button>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-[#888888] hover:bg-[#f0f0f0] hover:text-black transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg animate-pulse">
                <Sparkles className="size-7 text-amber-300 animate-spin" />
              </div>
              <h4 className="text-base font-bold text-black">Бриф дээр OpenAI шинжилгээ хийж байна...</h4>
              <p className="mt-1 max-w-sm text-xs text-[#666666]">
                Харилцагчийн зорилго, хэрэглэгчийн сегмент, хэв маяг болон хүссэн ажлуудад нийцсэн цар хүрээ, таск, гаралтуудыг боловсруулж байна.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="size-10 text-red-500 mb-3" />
              <h4 className="text-sm font-bold text-black">Алдаа гарлаа</h4>
              <p className="mt-1 text-xs text-red-600">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-4 rounded-full bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#222] transition"
              >
                Дахин оролдох
              </button>
            </div>
          ) : suggestion ? (
            <>
              {/* Strategic Scope Banner */}
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                      AI Санал болгож буй Цар хүрээ
                    </span>
                    <h4 className="text-base font-bold text-black">{suggestion.scopeTitle}</h4>
                    <p className="text-xs text-[#555555] leading-relaxed max-w-2xl mt-1">
                      {suggestion.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] px-3.5 py-2 text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#c2410c]">
                        Зөвлөмжит төсөв
                      </span>
                      <strong className="text-sm font-extrabold text-black">
                        {formatCurrency(suggestion.recommendedBudget)}
                      </strong>
                    </div>

                    <div className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-right">
                      <span className="block text-[10px] font-semibold text-[#888888]">
                        Хугацаа: <strong className="text-black">{suggestion.recommendedTimeline}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {suggestion.budgetRationale && (
                  <div className="mt-3 border-t border-[#ededed] pt-2 text-[11px] text-[#777777] italic">
                    💡 <strong>Үндэслэл:</strong> {suggestion.budgetRationale}
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1.5 border-b border-[#f0f0f0] pb-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}
                >
                  Нэгдсэн тойм ({suggestion.suggestedDeliverables.length + suggestion.suggestedTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('deliverables')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'deliverables'
                      ? 'bg-black text-white'
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}
                >
                  📦 Хүлээлгэн өгөх гаралтууд ({suggestion.suggestedDeliverables.length})
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'tasks'
                      ? 'bg-black text-white'
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}
                >
                  🛠️ Дизайнерын таскууд ({suggestion.suggestedTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('proposal')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'proposal'
                      ? 'bg-black text-white'
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5]'
                  }`}
                >
                  📝 Үнийн саналын зурвас
                </button>
              </div>

              {/* Tab Content: Deliverables */}
              {(activeTab === 'all' || activeTab === 'deliverables') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
                      <Package className="size-4 text-black" />
                      Харилцагчийн гар дээр хүлээлгэн өгөх гаралтууд (Client Deliverables)
                    </h5>
                    <span className="text-[11px] text-[#888888]">
                      {suggestion.suggestedDeliverables.length} төрлийн ажил
                    </span>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {suggestion.suggestedDeliverables.map((del, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between rounded-xl border border-[#e5e5e5] bg-white p-3.5 text-xs transition hover:border-black"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-black font-bold">{del.name}</strong>
                            <span className="shrink-0 rounded-md bg-[#f0f0f0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#555]">
                              {del.quantity}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-[#666666] leading-relaxed">
                            {del.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: Internal Tasks */}
              {(activeTab === 'all' || activeTab === 'tasks') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
                      <CheckSquare className="size-4 text-black" />
                      Дизайнерын дотооддоо хийж гүйцэтгэх даалгаврууд (Internal Tasks)
                    </h5>
                    <span className="text-[11px] text-[#888888]">
                      {suggestion.suggestedTasks.length} даалгавар
                    </span>
                  </div>

                  <div className="space-y-2">
                    {suggestion.suggestedTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-black">{task.name}</p>
                            <p className="mt-0.5 text-[11px] text-[#666666]">{task.description}</p>
                          </div>
                        </div>
                        {task.stage && (
                          <span className="shrink-0 rounded-md bg-white border border-[#e0e0e0] px-2 py-0.5 text-[10px] font-semibold text-[#666]">
                            {task.stage}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: Proposal Note */}
              {(activeTab === 'all' || activeTab === 'proposal') && (
                <div className="space-y-2 pt-2">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
                    <FileText className="size-4 text-black" />
                    Харилцагчид илгээх үнийн саналын мэндчилгээ & тайлбар
                  </h5>
                  <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs text-[#333333] leading-relaxed whitespace-pre-line font-sans">
                    {suggestion.proposalNote}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f0f0] bg-[#fafafa] px-6 py-4">
          <div className="text-xs text-[#666666]">
            {suggestion && (
              <span>
                Төсөв: <strong className="text-black">{formatCurrency(suggestion.recommendedBudget)}</strong> · Хугацаа:{' '}
                <strong className="text-black">{suggestion.recommendedTimeline}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#cccccc] bg-white px-4 py-2 text-xs font-semibold text-black hover:border-black transition"
            >
              Хаах
            </button>

            {suggestion && (
              <button
                type="button"
                onClick={handleApplyEverything}
                disabled={appliedSuccess}
                className="flex items-center gap-2 rounded-full bg-black px-6 py-2 text-xs font-bold text-white hover:bg-[#222222] transition shadow-md disabled:bg-emerald-700"
              >
                {appliedSuccess ? (
                  <>
                    <Check className="size-4 text-white" /> Амжилттай тусгагдлаа!
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 text-amber-300" />
                    Бүгдийг гэрээ & төсөлд тусгах
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
