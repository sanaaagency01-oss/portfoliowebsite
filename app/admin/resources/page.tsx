'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Sparkles,
  FileCheck2,
  ShieldCheck,
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Edit,
  Copy,
  Trash2,
  FileText,
  Download,
  Wrench,
  CheckCircle2,
  Clock,
  Archive,
  ArrowUpRight,
  Filter,
  Tag,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { ResourceItem, ResourceType, ResourceStatus, ResourceCategory } from '@/lib/resources/types'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'
import { CloudflareStatusBadge } from '@/components/studio/CloudflareStatusBadge'

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | ResourceStatus>('all')
  const [selectedType, setSelectedType] = useState<'all' | ResourceType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/resources')
      if (res.ok) {
        const data = await res.json()
        if (data.resources) setResources(data.resources)
        if (data.categories) setCategories(data.categories)
      }
    } catch (e) {
      console.error('Failed loading resources in admin', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTogglePublish = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/resources/${id}/publish`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.resource) {
          setResources((prev) => prev.map((r) => (r.id === id ? data.resource : r)))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/resources/${id}/duplicate`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.resource) {
          setResources((prev) => [data.resource, ...prev])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`"${title}" нөөцийг устгахдаа итгэлтэй байна уу?`)) return
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filter items
  const filteredResources = resources.filter((r) => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false
    if (selectedType !== 'all' && r.type !== selectedType) return false
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = r.title.toLowerCase().includes(q)
      const matchSummary = r.summary.toLowerCase().includes(q)
      const matchSlug = r.slug.toLowerCase().includes(q)
      const matchTags = r.tags.some((t) => t.toLowerCase().includes(q))
      if (!matchTitle && !matchSummary && !matchSlug && !matchTags) return false
    }

    return true
  })

  // Stats
  const totalCount = resources.length
  const publishedCount = resources.filter((r) => r.status === 'published').length
  const draftCount = resources.filter((r) => r.status === 'draft').length
  const archivedCount = resources.filter((r) => r.status === 'archived').length

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'article':
        return <FileText className="size-3.5 text-blue-600" />
      case 'download':
        return <Download className="size-3.5 text-emerald-600" />
      case 'tool':
        return <Wrench className="size-3.5 text-purple-600" />
    }
  }

  const getTypeBadge = (type: ResourceType) => {
    switch (type) {
      case 'article':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'download':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'tool':
        return 'bg-purple-50 text-purple-700 border-purple-200'
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen">
        {/* Studio OS Sidebar */}
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
              href="/admin/resources"
              className="flex items-center gap-2.5 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white"
            >
              <BookOpen className="size-4" />
              Resources CMS
            </Link>
            <Link
              href="/admin/contracts"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#666666] hover:bg-[#eaeaea] hover:text-black transition"
            >
              <FileCheck2 className="size-4" />
              Contracts
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

        {/* Main Content Workspace */}
        <section className="min-w-0 flex-1 p-6 md:p-10">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717a] mb-1">
                <span>Studio OS</span>
                <span>/</span>
                <span className="font-semibold text-black">Resources Manager</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                Resources CMS
              </h1>
              <p className="text-xs text-[#71717a] mt-1">
                Нийтлэл, татах загвар, хэрэгслүүдийг код бичих, deploy хийхгүйгээр шууд удирдах
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e4e4e7] text-xs font-semibold text-[#52525b] hover:bg-[#fafafa] transition"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Шинэчлэх</span>
              </button>

              <Link
                href="/admin/resources/categories"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e0e0e0] bg-white text-xs font-semibold text-black hover:bg-[#fafafa] transition"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Ангилал ({categories.length})</span>
              </Link>

              <Link
                href="/admin/resources/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Шинэ Resource</span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                Нийт ресурс
              </span>
              <div className="text-2xl font-black text-black mt-2">{totalCount}</div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Нийтлэгдсэн (Published)
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-2">{publishedCount}</div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Ноорог (Draft)
              </span>
              <div className="text-2xl font-black text-amber-600 mt-2">{draftCount}</div>
            </div>

            <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                Архив (Archived)
              </span>
              <div className="text-2xl font-black text-[#52525b] mt-2">{archivedCount}</div>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: `Бүгд (${totalCount})` },
                { id: 'published', label: `Нийтлэгдсэн (${publishedCount})` },
                { id: 'draft', label: `Ноорог (${draftCount})` },
                { id: 'archived', label: `Архив (${archivedCount})` },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedStatus === tab.id
                      ? 'bg-black text-white'
                      : 'bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Select */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="rounded-xl border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none"
              >
                <option value="all">Бүх төрөл</option>
                <option value="article">Нийтлэл (Article)</option>
                <option value="download">Татах файл (Download)</option>
                <option value="tool">Хэрэгсэл (Tool)</option>
              </select>

              {/* Category Select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none"
              >
                <option value="all">Бүх ангилал</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameMn}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="relative w-full md:w-56">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                <input
                  type="text"
                  placeholder="Хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#e0e0e0] bg-[#fafafa] text-xs text-black focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Resources Table */}
          <div className="rounded-3xl border border-[#e0e0e0] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e0e0e0] text-[#71717a] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Ресурс / Гарчиг</th>
                    <th className="px-6 py-4">Төрөл & Ангилал</th>
                    <th className="px-6 py-4 text-center">Төлөв</th>
                    <th className="px-6 py-4 text-center">Үзэлт / Таталт</th>
                    <th className="px-6 py-4">Огноо</th>
                    <th className="px-6 py-4 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e0e0]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#71717a]">
                        <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Уншиж байна...</span>
                      </td>
                    </tr>
                  ) : filteredResources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#71717a]">
                        Тохирох ресурс олдсонгүй.
                      </td>
                    </tr>
                  ) : (
                    filteredResources.map((res) => (
                      <tr
                        key={res.id}
                        className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                        onClick={() => window.location.assign(`/admin/resources/${res.id}/edit`)}
                      >
                        {/* Title & Cover */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-[#f4f4f5] border border-[#e0e0e0] overflow-hidden shrink-0 flex items-center justify-center">
                              {res.coverImage ? (
                                <img
                                  src={res.coverImage}
                                  alt=""
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    ;(e.target as any).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <BookOpen className="size-5 text-[#888888]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-black text-sm truncate max-w-sm">
                                  {res.title}
                                </p>
                                {res.featured && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                    ★ Онцлох
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#71717a] truncate max-w-sm mt-0.5">
                                /resources/{res.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type & Category */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getTypeBadge(
                                res.type
                              )}`}
                            >
                              {getTypeIcon(res.type)}
                              <span className="uppercase">{res.type}</span>
                            </span>
                            <span className="text-[11px] text-[#52525b] font-medium">
                              {categories.find((c) => c.id === res.category)?.nameMn || res.category}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                              res.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : res.status === 'draft'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {res.status === 'published'
                              ? 'Нийтлэгдсэн'
                              : res.status === 'draft'
                              ? 'Ноорог'
                              : 'Архив'}
                          </span>
                        </td>

                        {/* Views & Downloads */}
                        <td className="px-6 py-4 text-center text-[#52525b] font-semibold">
                          <div className="flex items-center justify-center gap-3 text-[11px]">
                            <span>👁️ {res.viewsCount || 0}</span>
                            {res.type === 'download' && <span>📥 {res.downloadsCount || 0}</span>}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-[#71717a] text-[11px]">
                          {new Date(res.updatedAt || res.createdAt).toLocaleDateString('mn-MN')}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Publish / Unpublish Toggle */}
                            <button
                              type="button"
                              onClick={(e) => handleTogglePublish(res.id, e)}
                              disabled={actionLoadingId === res.id}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
                                res.status === 'published'
                                  ? 'border-neutral-200 text-[#52525b] hover:bg-neutral-100'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={res.status === 'published' ? 'Ноорог болгох' : 'Нийтлэх'}
                            >
                              <CheckCircle2 className="size-4" />
                            </button>

                            {/* View Public / Preview */}
                            <Link
                              href={res.destinationUrl || `/resources/${res.slug}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg border border-neutral-200 text-[#52525b] hover:text-black hover:bg-neutral-100 transition"
                              title="Урьдчилан харах"
                            >
                              <ExternalLink className="size-4" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={(e) => handleDuplicate(res.id, e)}
                              disabled={actionLoadingId === res.id}
                              className="p-1.5 rounded-lg border border-neutral-200 text-[#52525b] hover:text-black hover:bg-neutral-100 transition"
                              title="Хувилах (Duplicate)"
                            >
                              <Copy className="size-4" />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/resources/${res.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg border border-neutral-200 text-[#52525b] hover:text-black hover:bg-neutral-100 transition"
                              title="Засах"
                            >
                              <Edit className="size-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(e) => handleDelete(res.id, res.title, e)}
                              disabled={actionLoadingId === res.id}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
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
