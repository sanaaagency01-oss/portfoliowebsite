'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Clock3,
  Copy,
  FileCheck2,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Users,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'
import NewProjectWizardModal from '@/components/studio/admin/NewProjectWizardModal'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'
import { CloudflareStatusBadge } from '@/components/studio/CloudflareStatusBadge'

export default function StudioAdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  const loadProjects = () => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects)
      })
      .catch((e) => console.error('Failed loading projects', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const copyLink = (targetToken: string, pathType: 'portal' | 'contract' = 'portal') => {
    const origin = window.location.origin
    const url = pathType === 'contract' ? `${origin}/client/c/${targetToken}` : `${origin}/client/${targetToken}`
    navigator.clipboard.writeText(url)
    setCopiedToken(`${targetToken}_${pathType}`)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const totalRevenue = projects.reduce((acc, p) => acc + (p.contract?.total || 0), 0)
  const pendingApprovals = projects.filter((p) => p.status === 'contract_pending' || p.status === 'review_needed').length

  return (
    <main className="min-h-screen bg-white text-black">
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
              className="flex items-center gap-2.5 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white"
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

        {/* Main Content */}
        <section className="min-w-0 flex-1">
          <header className="flex h-[68px] items-center justify-between border-b border-[#e0e0e0] px-6 sm:px-8 bg-white">
            <div>
              <p className="text-[11px] font-medium text-[#888888]">
                {new Date().toLocaleDateString('mn-MN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="mt-0.5 text-base font-bold tracking-tight text-black">
                Тавтай морил, Өсөхөө.
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/crm"
                className="hidden items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition sm:flex shadow-sm"
              >
                <Users className="size-3.5" /> CRM & Бриф судалгаа
              </Link>
              <Link
                href="/admin/contracts"
                className="hidden items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition sm:flex"
              >
                Гэрээний удирдлага
              </Link>
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#222222]"
              >
                <Plus className="size-3.5" /> Шинэ харилцагч & Гэрээ үүсгэх
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-8 lg:px-10">
            {/* Metric cards */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888888]">Нийт төслүүд</span>
                  <FolderOpen className="size-4 text-[#888888]" />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tight text-black">{projects.length}</span>
                  <span className="text-[11px] font-semibold text-[#226738]">Студийн багтаамж хэвийн</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888888]">Гэрээ хүлээгдэж буй</span>
                  <Clock3 className="size-4 text-[#888888]" />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tight text-black">{pendingApprovals}</span>
                  <span className="text-[11px] font-semibold text-[#9a4d13]">Гарын үсэг хүлээж буй</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888888]">Нийт төсөв</span>
                  <CircleDollarSign className="size-4 text-[#888888]" />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tight text-black">
                    {formatCurrency(totalRevenue)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#226738]">Батлагдсан болон ноорог</span>
                </div>
              </div>
            </div>

            {/* Projects Table & List */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-black">Төслүүд & Ажлын талбар</h2>
                  <p className="text-xs text-[#888888] mt-0.5">Бүх харилцагчдын явц, гэрээний төлөв болон линкүүд</p>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-[#888888]">
                  Төслүүдийг ачаалж байна...
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-3">
                  {projects.map((proj) => (
                    <div
                      key={proj.token}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e0e0e0] bg-white p-5 sm:flex-row sm:items-center shadow-sm hover:border-[#cccccc] transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
                          {(proj.name || 'P').slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <Link
                              href={`/admin/projects/${proj.token}`}
                              className="font-bold text-sm text-black hover:underline"
                            >
                              {proj.name}
                            </Link>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                proj.contract?.status === 'signed'
                                  ? 'border border-[#d2ebd6] bg-[#f0fdf4] text-[#226738]'
                                  : proj.status === 'contract_pending'
                                  ? 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                                  : proj.status === 'proposal_sent'
                                  ? 'border border-[#fef08a] bg-[#fefce8] text-[#854d0e]'
                                  : proj.status === 'brief_submitted'
                                  ? 'border border-[#bae6fd] bg-[#f0f9ff] text-[#0369a1]'
                                  : 'border border-[#e0e0e0] bg-[#fafafa] text-[#666666]'
                              }`}
                            >
                              {proj.contract?.status === 'signed'
                                ? '✅ Гэрээ баталгаажсан'
                                : proj.status === 'contract_pending'
                                ? '✍️ Санал зөвшөөрсөн (Гарын үсэг хүлээж буй)'
                                : proj.status === 'proposal_sent'
                                ? '📨 Үнийн санал илгээсэн'
                                : proj.status === 'brief_submitted'
                                ? '📥 Бриф ирсэн'
                                : '⏳ Бриф хийгдэж буй'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-[#666666]">
                            {proj.company || 'Байгууллага'} · Төлөвлөсөн: {proj.due || 'Товлоогүй'} · {proj.contract?.tasks?.length || 0} task · {proj.contract?.deliverables?.length || 0} материал
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="hidden w-28 sm:block">
                          <div className="mb-1 flex justify-between text-[10px] text-[#888888]">
                            <span>Явц</span>
                            <span className="font-bold text-black">{proj.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                            <div
                              className="h-full rounded-full bg-black"
                              style={{ width: `${proj.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => copyLink(proj.token, 'portal')}
                          className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
                        >
                          {copiedToken === `${proj.token}_portal` ? (
                            <>
                              <Check className="size-3 text-[#226738]" /> Хуулагдлаа
                            </>
                          ) : (
                            <>
                              <Copy className="size-3 text-[#666666]" /> Client линк
                            </>
                          )}
                        </button>

                        <Link
                          href={`/admin/projects/${proj.token}`}
                          className="flex items-center gap-1 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#222222] transition"
                        >
                          Удирдах <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* COMPREHENSIVE NEW CLIENT & CONTRACT WIZARD MODAL */}
      <NewProjectWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={loadProjects}
      />
    </main>
  )
}
