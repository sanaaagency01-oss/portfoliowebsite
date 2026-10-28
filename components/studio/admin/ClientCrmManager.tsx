'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Layers,
  FileText,
  Clock,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react'
import { Project, ProjectStatus } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'
import BriefAnalysisDetailModal from './BriefAnalysisDetailModal'
import ContractExportButton from '@/components/studio/ContractExportButton'

interface ClientCrmManagerProps {
  projects: Project[]
  onUpdate: () => void
  onNewClient?: () => void
}

const STAGES: { key: ProjectStatus | 'all'; label: string; countColor: string }[] = [
  { key: 'all', label: 'Бүх харилцагчид', countColor: 'bg-[#f0f0f0] text-black' },
  { key: 'lead', label: '1. Шинэ Lead', countColor: 'bg-[#e0e7ff] text-[#3730a3]' },
  { key: 'brief_pending', label: '2. Бриф бөглөж буй', countColor: 'bg-[#fef9c3] text-[#854d0e]' },
  { key: 'brief_submitted', label: '3. Бриф ирсэн (Санал хүлээж буй)', countColor: 'bg-[#e0f2fe] text-[#0369a1]' },
  { key: 'proposal_sent', label: '4. Үнийн санал илгээсэн', countColor: 'bg-[#fef3c7] text-[#b45309]' },
  { key: 'contract_pending', label: '5. Гэрээ байгуулах', countColor: 'bg-[#ffedd5] text-[#9a3412]' },
  { key: 'active', label: '6. Идэвхтэй төсөл', countColor: 'bg-[#dcfce7] text-[#166534]' },
  { key: 'review_needed', label: 'Хяналт / Санал', countColor: 'bg-[#f3e8ff] text-[#6b21a8]' },
  { key: 'completed', label: 'Дууссан', countColor: 'bg-[#f1f5f9] text-[#475569]' },
]

export default function ClientCrmManager({
  projects,
  onUpdate,
  onNewClient,
}: ClientCrmManagerProps) {
  const [activeStage, setActiveStage] = useState<ProjectStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'readiness' | 'total'>('date')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [updatingToken, setUpdatingToken] = useState<string | null>(null)
  const [deletingToken, setDeletingToken] = useState<string | null>(null)

  const handleDeleteProject = async (token: string, name: string) => {
    if (!window.confirm(`"${name}" төслийг бүрмөсөн устгах уу? Энэ үйлдлийг буцах боломжгүй.`)) {
      return
    }

    setDeletingToken(token)
    try {
      const res = await fetch(`/api/admin/crm?token=${token}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onUpdate()
      } else {
        alert('Төсөл устгахад алдаа гарлаа.')
      }
    } catch (e) {
      console.error('Failed deleting project', e)
      alert('Сүлжээний алдаа гарлаа.')
    } finally {
      setDeletingToken(null)
    }
  }

  const copyUrl = (token: string, type: 'portal' | 'brief' | 'contract') => {
    const origin = window.location.origin
    let path = `${origin}/client/${token}`
    if (type === 'brief') path = `${origin}/client/brief/${token}`
    if (type === 'contract') path = `${origin}/client/c/${token}`

    navigator.clipboard.writeText(path)
    setCopiedLink(`${token}_${type}`)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const updateStatus = async (token: string, newStatus: ProjectStatus) => {
    setUpdatingToken(token)
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, status: newStatus }),
      })
      if (res.ok) {
        onUpdate()
      }
    } catch (e) {
      console.error('Failed updating status', e)
    } finally {
      setUpdatingToken(null)
    }
  }

  const updateTier = async (token: string, newTier: 'VIP' | 'GROWTH' | 'STANDARD') => {
    setUpdatingToken(token)
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, leadQualityTier: newTier }),
      })
      if (res.ok) {
        onUpdate()
      }
    } catch (e) {
      console.error('Failed updating tier', e)
    } finally {
      setUpdatingToken(null)
    }
  }

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (activeStage !== 'all' && p.status !== activeStage) return false
        if (!searchQuery.trim()) return true

        const q = searchQuery.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.contactName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.phone && p.phone.includes(q)) ||
          p.token.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'readiness') {
          const scoreA = a.brief.analysis?.readinessScore || 0
          const scoreB = b.brief.analysis?.readinessScore || 0
          return scoreB - scoreA
        }
        if (sortBy === 'total') {
          const totalA = a.contract?.total || 0
          const totalB = b.contract?.total || 0
          return totalB - totalA
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [projects, activeStage, searchQuery, sortBy])

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length }
    for (const p of projects) {
      counts[p.status] = (counts[p.status] || 0) + 1
    }
    return counts
  }, [projects])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Controls: Search, New Client & Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Харилцагч, компани, токен, имэйлээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[#e0e0e0] bg-white py-2.5 pl-10 pr-4 text-xs text-black outline-none transition focus:border-black shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-[#e0e0e0] bg-white px-3 py-2 text-xs text-[#666666] shadow-sm">
            <span className="text-[11px] font-medium text-[#888888]">Эрэмбэлэх:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'readiness' | 'total')}
              className="bg-transparent font-bold text-black outline-none cursor-pointer"
            >
              <option value="date">Сүүлд нэмэгдсэн</option>
              <option value="readiness">Бэлэн байдал (TypeSafe)</option>
              <option value="total">Гэрээний дүн</option>
            </select>
          </div>

          {onNewClient && (
            <button
              onClick={onNewClient}
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#222222] transition shadow-sm"
            >
              <Plus className="size-3.5" /> Шинэ харилцагч
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Stage Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STAGES.map((st) => {
          const count = stageCounts[st.key] || 0
          const isActive = activeStage === st.key
          return (
            <button
              key={st.key}
              onClick={() => setActiveStage(st.key)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'border-black bg-black text-white shadow-sm'
                  : 'border-[#e0e0e0] bg-white text-[#666666] hover:border-black hover:text-black'
              }`}
            >
              <span>{st.label}</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : st.countColor
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* CRM Client Table */}
      <div className="rounded-3xl border border-[#e0e0e0] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                <th className="py-4 px-4 sm:px-6">Харилцагч & Компани</th>
                <th className="py-4 px-3">CRM Үе шат</th>
                <th className="py-4 px-3">TypeSafe Үнэлгээ</th>
                <th className="py-4 px-3">Зэрэглэл</th>
                <th className="py-4 px-3">Бриф явц</th>
                <th className="py-4 px-3">Гэрээний дүн</th>
                <th className="py-4 px-3">Шуурхай холбоосууд</th>
                <th className="py-4 px-4 sm:px-6 text-right">Удирдлага</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-[#888888]">
                    Харилцагч олдсонгүй. Шүүлтүүр эсвэл хайлтын үгээ шалгана уу.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => {
                  const analysis = proj.brief.analysis
                  const score = analysis?.readinessScore || 0
                  const answersCount = Object.keys(proj.brief.answers || {}).length

                  return (
                    <tr
                      key={proj.token}
                      className="hover:bg-[#fafafa] transition duration-100"
                    >
                      {/* Name & Company */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white shadow-sm">
                            {proj.company ? proj.company[0].toUpperCase() : 'B'}
                          </div>
                          <div>
                            <Link
                              href={`/admin/projects/${proj.token}`}
                              className="font-bold text-black hover:underline"
                            >
                              {proj.name}
                            </Link>
                            <p className="text-[11px] text-[#666666] flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-black">{proj.company}</span>
                              <span>·</span>
                              <span>{proj.contactName}</span>
                            </p>
                            <p className="text-[10px] text-[#888888] font-mono mt-0.5">
                              {proj.phone || proj.email || `token: ${proj.token}`}
                            </p>

                            {/* Client timeline & budget tags if provided */}
                            {(proj.brief?.answers?.timeline || proj.brief?.answers?.budget) && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {proj.brief.answers.timeline && (
                                  <span className="rounded-md bg-[#fff7ed] px-1.5 py-0.5 text-[9px] font-bold text-[#c2410c] border border-[#fed7aa]">
                                    ⏱️ {proj.brief.answers.timeline}
                                  </span>
                                )}
                                {proj.brief.answers.budget && (
                                  <span className="rounded-md bg-[#f0fdf4] px-1.5 py-0.5 text-[9px] font-bold text-[#166534] border border-[#bbf7d0]">
                                    💰 {proj.brief.answers.budget}
                                  </span>
                                )}
                              </div>
                            )}

                            {proj.status === 'brief_submitted' && (
                              <div className="mt-1.5">
                                <Link
                                  href={`/admin/contracts?token=${proj.token}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-700 transition shadow-xs"
                                >
                                  Үнийн санал бэлтгэх →
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CRM Status Dropdown */}
                      <td className="py-4 px-3">
                        <select
                          value={proj.status}
                          disabled={updatingToken === proj.token}
                          onChange={(e) => updateStatus(proj.token, e.target.value as ProjectStatus)}
                          className={`rounded-xl border px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer transition ${
                            proj.status === 'lead'
                              ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3]'
                              : proj.status === 'brief_pending'
                              ? 'border-[#fef08a] bg-[#fefce8] text-[#854d0e]'
                              : proj.status === 'brief_submitted'
                              ? 'border-[#bae6fd] bg-[#f0f9ff] text-[#0369a1]'
                              : proj.status === 'proposal_sent'
                              ? 'border-[#fde68a] bg-[#fefce8] text-[#b45309]'
                              : proj.status === 'contract_pending'
                              ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                              : proj.status === 'active'
                              ? 'border-[#d2ebd6] bg-[#f0fdf4] text-[#226738]'
                              : proj.status === 'review_needed'
                              ? 'border-[#e9d5ff] bg-[#faf5ff] text-[#6b21a8]'
                              : 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]'
                          }`}
                        >
                          <option value="lead">1. Шинэ Lead</option>
                          <option value="brief_pending">2. Бриф бөглөж буй</option>
                          <option value="brief_submitted">3. Бриф ирсэн (Санал илгээх)</option>
                          <option value="proposal_sent">4. Үнийн санал илгээсэн</option>
                          <option value="contract_pending">5. Гэрээ байгуулах</option>
                          <option value="active">6. Идэвхтэй төсөл</option>
                          <option value="review_needed">7. Хяналт / Санал</option>
                          <option value="completed">8. Дууссан</option>
                        </select>
                      </td>

                      {/* TypeSafe Readiness Score */}
                      <td className="py-4 px-3">
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
                          {analysis?.readinessTier || 'Тодорхойлох'}
                        </span>
                      </td>

                      {/* Lead Tier Dropdown */}
                      <td className="py-4 px-3">
                        <select
                          value={analysis?.leadQualityTier || 'STANDARD'}
                          disabled={updatingToken === proj.token}
                          onChange={(e) =>
                            updateTier(proj.token, e.target.value as 'VIP' | 'GROWTH' | 'STANDARD')
                          }
                          className={`rounded-lg border px-2 py-1 text-[11px] font-extrabold outline-none cursor-pointer ${
                            analysis?.leadQualityTier === 'VIP'
                              ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                              : analysis?.leadQualityTier === 'GROWTH'
                              ? 'border-[#d2ebd6] bg-[#f0fdf4] text-[#226738]'
                              : 'border-[#e0e0e0] bg-[#fafafa] text-[#666666]'
                          }`}
                        >
                          <option value="VIP">⭐ VIP</option>
                          <option value="GROWTH">📈 GROWTH</option>
                          <option value="STANDARD">⚪ STANDARD</option>
                        </select>
                      </td>

                      {/* Brief Completion */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          {proj.brief.complete ? (
                            <span className="rounded-full border border-[#d2ebd6] bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-bold text-[#226738]">
                              Бүрэн ({answersCount})
                            </span>
                          ) : answersCount > 0 ? (
                            <span className="rounded-full border border-[#fef08a] bg-[#fefce8] px-2 py-0.5 text-[10px] font-bold text-[#854d0e]">
                              Явц: {proj.brief.progress || Math.round((answersCount / 7) * 100)}%
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#999999]">Бөглөөгүй</span>
                          )}
                        </div>
                      </td>

                      {/* Contract Amount */}
                      <td className="py-4 px-3 font-semibold text-black">
                        {proj.contract?.total && proj.contract.total > 0 ? (
                          <>
                            {formatCurrency(proj.contract.total)}
                            <p className="text-[10px] text-[#888888] font-normal">
                              {proj.contract?.status === 'signed'
                                ? '✅ Батлагдсан'
                                : proj.contract?.isPublishedToClient
                                ? '📨 Санал илгээсэн'
                                : '⏳ Ноорог'}
                            </p>
                          </>
                        ) : (
                          <div>
                            <span className="text-[10px] font-bold text-[#c2410c] bg-[#fff7ed] border border-[#fed7aa] px-2 py-0.5 rounded-full inline-block">
                              Үнийн санал өгөх
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Quick Copy Links */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1">
                          {/* Portal Link */}
                          <button
                            onClick={() => copyUrl(proj.token, 'portal')}
                            title="Client Portal линк хуулах"
                            className="rounded-lg border border-[#e0e0e0] bg-white px-2 py-1 text-[10px] font-semibold text-black hover:bg-[#fafafa] transition"
                          >
                            {copiedLink === `${proj.token}_portal` ? (
                              <Check className="size-3 text-[#226738]" />
                            ) : (
                              'Portal'
                            )}
                          </button>

                          {/* Brief Link */}
                          <button
                            onClick={() => copyUrl(proj.token, 'brief')}
                            title="AI Бриф бөглөх линк хуулах"
                            className="rounded-lg border border-[#e0e0e0] bg-white px-2 py-1 text-[10px] font-semibold text-black hover:bg-[#fafafa] transition"
                          >
                            {copiedLink === `${proj.token}_brief` ? (
                              <Check className="size-3 text-[#226738]" />
                            ) : (
                              'Бриф'
                            )}
                          </button>

                          {/* Contract Link */}
                          <button
                            onClick={() => copyUrl(proj.token, 'contract')}
                            title="Гэрээ батлах линк хуулах"
                            className="rounded-lg border border-[#e0e0e0] bg-white px-2 py-1 text-[10px] font-semibold text-black hover:bg-[#fafafa] transition"
                          >
                            {copiedLink === `${proj.token}_contract` ? (
                              <Check className="size-3 text-[#226738]" />
                            ) : (
                              'Гэрээ'
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/contracts?token=${proj.token}`}
                            title="Үнийн санал & гэрээ боловсруулах"
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition shadow-xs ${
                              !proj.contract?.isPublishedToClient || !proj.contract?.total
                                ? 'border border-[#fed7aa] bg-[#fffaf5] text-[#9a3412] hover:bg-[#fff1e6]'
                                : 'border border-[#e0e0e0] bg-white text-black hover:bg-[#f0f0f0]'
                            }`}
                          >
                            <FileText className="size-3" />
                            <span className="hidden xl:inline">
                              {!proj.contract?.isPublishedToClient || !proj.contract?.total
                                ? 'Үнийн санал'
                                : 'Гэрээ засах'}
                            </span>
                          </Link>

                          <ContractExportButton
                            project={proj}
                            variant="outline"
                            buttonText="Гэрээ"
                          />

                          <button
                            onClick={() => {
                              setSelectedProject(proj)
                              setModalOpen(true)
                            }}
                            className="flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition shadow-sm"
                          >
                            <Eye className="size-3" /> Бриф
                          </button>

                          <Link
                            href={`/admin/projects/${proj.token}`}
                            className="flex items-center gap-1 rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#222222] transition"
                          >
                            Удирдах <ArrowUpRight className="size-3" />
                          </Link>

                          <button
                            onClick={() => handleDeleteProject(proj.token, proj.name)}
                            disabled={deletingToken === proj.token}
                            title="Төсөл устгах"
                            className="flex size-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition disabled:opacity-50"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brief Detail Modal */}
      <BriefAnalysisDetailModal
        project={selectedProject}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={onUpdate}
      />
    </div>
  )
}
