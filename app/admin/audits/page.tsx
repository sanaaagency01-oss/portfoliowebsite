'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Sparkles,
  FileCheck2,
  ShieldCheck,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Plus,
  BookOpen,
  RotateCw,
  Download,
} from 'lucide-react'
import { BrandAuditRecord } from '@/lib/brand-audit/types'
import { openAuditPrintWindow } from '@/lib/brand-audit/export'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'
import { CloudflareStatusBadge } from '@/components/studio/CloudflareStatusBadge'

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<BrandAuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [rerunningId, setRerunningId] = useState<string | null>(null)

  const handleRerun = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRerunningId(id)
    try {
      const res = await fetch(`/api/brand-audit/${id}/rerun`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.audit) {
          setAudits((prev) => prev.map((a) => (a.id === id ? data.audit : a)))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRerunningId(null)
    }
  }

  const loadAudits = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/brand-audit')
      if (res.ok) {
        const data = await res.json()
        if (data.audits) setAudits(data.audits)
      }
    } catch (e) {
      console.error('Failed loading audits', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudits()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Энэ аудитын тайланг устгахдаа итгэлтэй байна уу?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/brand-audit/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAudits((prev) => prev.filter((a) => a.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredAudits = audits.filter((a) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      a.company.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      a.scope.toLowerCase().includes(q)
    )
  })

  const avgScore =
    audits.length > 0
      ? Math.round(audits.reduce((acc, a) => acc + (a.qualityScore || 0), 0) / audits.length)
      : 0
  const criticalCount = audits.filter((a) => (a.qualityScore || 0) < 50).length
  const highQualityCount = audits.filter((a) => (a.qualityScore || 0) >= 80).length

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
              className="flex items-center gap-2.5 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white"
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
        <section className="min-w-0 flex-1 p-6 md:p-10">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717a] mb-1">
                <span>Studio OS</span>
                <span>/</span>
                <span className="font-semibold text-black">Brand Audits</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                Брэндбүүк чанарын аудитууд
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAudits}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e4e4e7] text-xs font-semibold text-[#52525b] hover:bg-[#fafafa] transition"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Шинэчлэх</span>
              </button>
              <Link
                href="/brand-audit/new"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Шинэ аудит эхлүүлэх</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                Нийт аудит
              </span>
              <div className="text-2xl font-black text-black mt-2">{audits.length}</div>
            </div>

            <div className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                Дундаж оноо
              </span>
              <div className="text-2xl font-black text-blue-600 mt-2">
                {avgScore}<span className="text-sm font-semibold text-[#71717a]">/100</span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Сайжруулах шаардлагатай
              </span>
              <div className="text-2xl font-black text-rose-600 mt-2">{criticalCount}</div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Өндөр чанартай (80+)
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-2">{highQualityCount}</div>
            </div>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
              <input
                type="text"
                placeholder="Байгууллагын нэр, имэйлээр хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e4e4e7] bg-white text-xs text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Audits Table */}
          <div className="rounded-3xl border border-[#e4e4e7] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e4e4e7] text-[#71717a] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Брэнд / Компани</th>
                    <th className="px-6 py-4">Хүрээ & Орчин</th>
                    <th className="px-6 py-4 text-center">Чанарын оноо</th>
                    <th className="px-6 py-4 text-center">Хамралт</th>
                    <th className="px-6 py-4">Алдааны тоо</th>
                    <th className="px-6 py-4">Огноо</th>
                    <th className="px-6 py-4 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e4e7]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#71717a]">
                        <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Уншиж байна...</span>
                      </td>
                    </tr>
                  ) : filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#71717a]">
                        Одоогоор ямар ч брэнд аудит бүртгэгдээгүй байна.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                        onClick={() => window.open(`/brand-audit/${a.id}`, '_blank')}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-black text-sm">{a.company}</p>
                          <p className="text-[11px] text-[#71717a]">{a.email || 'Имэйлгүй'}</p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f4f5] text-[#18181b] border border-[#e4e4e7]">
                            {a.scope}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                              a.qualityScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.qualityScore >= 50
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {a.qualityScore}/100
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center font-semibold text-black">
                          {a.coveragePct}%
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[11px]">
                            {a.criticalFindingsCount > 0 && (
                              <span className="text-rose-600 font-bold">
                                {a.criticalFindingsCount} чухал
                              </span>
                            )}
                            <span className="text-amber-600">
                              {a.improvementFindingsCount} зөвлөмж
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[#71717a]">
                          {new Date(a.createdAt).toLocaleDateString('mn-MN')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openAuditPrintWindow(a)
                              }}
                              className="p-2 rounded-lg text-black hover:bg-[#eaeaea] transition"
                              title="Тайлан татах / PDF"
                            >
                              <Download className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRerun(a.id, e)}
                              disabled={rerunningId === a.id}
                              className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition disabled:opacity-50"
                              title="Дахин бодох / шинэчлэх"
                            >
                              <RotateCw className={`size-4 ${rerunningId === a.id ? 'animate-spin' : ''}`} />
                            </button>
                            <Link
                              href={`/brand-audit/${a.id}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg text-[#52525b] hover:text-black hover:bg-[#eaeaea] transition"
                              title="Тайлан харах"
                            >
                              <ExternalLink className="size-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(a.id, e)}
                              disabled={deletingId === a.id}
                              className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                              title="Устгах"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
