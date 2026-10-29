'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Check,
  Sparkles,
  Eye,
  ExternalLink,
  ArrowUpRight,
  Plus,
  Briefcase,
  CheckCircle2,
  Clock,
  Send,
  X,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'

interface ContractProjectSelectorProps {
  projects: Project[]
  currentProject: Project | null
  onSelectProject: (project: Project) => void
  onOpenBriefModal: () => void
  onOpenAIScopeModal: () => void
}

export default function ContractProjectSelector({
  projects,
  currentProject,
  onSelectProject,
  onOpenBriefModal,
  onOpenAIScopeModal,
}: ContractProjectSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'proposal_sent' | 'signed'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navigation: previous / next project
  const currentIndex = projects.findIndex((p) => p.token === currentProject?.token)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < projects.length - 1

  const handlePrev = () => {
    if (hasPrev) {
      onSelectProject(projects[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (hasNext) {
      onSelectProject(projects[currentIndex + 1])
    }
  }

  // Filter projects by search and status
  const filteredProjects = projects.filter((p) => {
    const isSigned = p.contract?.status === 'signed'
    const isPub = p.contract?.isPublishedToClient === true
    const isPending = !isSigned && !isPub

    if (statusFilter === 'signed' && !isSigned) return false
    if (statusFilter === 'proposal_sent' && (!isPub || isSigned)) return false
    if (statusFilter === 'pending' && (!isPending || isSigned)) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = (p.name || '').toLowerCase().includes(q)
      const matchCompany = (p.company || '').toLowerCase().includes(q)
      const matchContact = (p.contactName || '').toLowerCase().includes(q)
      const matchEmail = (p.email || '').toLowerCase().includes(q)
      if (!matchName && !matchCompany && !matchContact && !matchEmail) return false
    }

    return true
  })

  // Status Counts
  const countSigned = projects.filter((p) => p.contract?.status === 'signed').length
  const countSent = projects.filter((p) => p.contract?.isPublishedToClient && p.contract?.status !== 'signed').length
  const countPending = projects.filter((p) => !p.contract?.isPublishedToClient && p.contract?.status !== 'signed').length

  const isContractSigned = currentProject?.contract?.status === 'signed'
  const isContractPublished = currentProject?.contract?.isPublishedToClient === true

  return (
    <div className="relative rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-5 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Project Selector Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
            Төсөл сонгох:
          </span>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-3 rounded-2xl border border-[#e0e0e0] bg-white px-4 py-2.5 text-left text-xs font-bold text-black shadow-xs hover:border-black transition-all cursor-pointer min-w-[280px] max-w-md"
            >
              <div className="flex size-7 items-center justify-center rounded-xl bg-black text-[11px] font-bold text-white shrink-0">
                {(currentProject?.company || currentProject?.name || 'P').charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-black">
                  {currentProject?.company || 'Байгууллага сонгоогүй'}
                </p>
                <p className="truncate text-[11px] font-normal text-[#666666]">
                  {currentProject?.name || 'Төслийн нэр байхгүй'}
                </p>
              </div>

              <ChevronDown
                className={`size-4 text-[#888888] shrink-0 transition-transform ${
                  dropdownOpen ? 'rotate-180 text-black' : ''
                }`}
              />
            </button>

            {/* Custom Searchable Dropdown Popover */}
            {dropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-[380px] sm:w-[440px] rounded-3xl border border-[#e0e0e0] bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                {/* Search Box */}
                <div className="relative mb-3">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="text"
                    placeholder="Төсөл, харилцагчийн нэрээр хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-2xl border border-[#e0e0e0] bg-[#fafafa] pl-10 pr-4 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: `Бүгд (${projects.length})` },
                    { id: 'pending', label: `⏳ Хүлээгдэж буй (${countPending})` },
                    { id: 'proposal_sent', label: `📨 Илгээсэн (${countSent})` },
                    { id: 'signed', label: `✅ Зурсан (${countSigned})` },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                        statusFilter === tab.id
                          ? 'bg-black text-white'
                          : 'bg-[#fafafa] text-[#666666] hover:bg-[#eaeaea] hover:text-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Project List */}
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
                  {filteredProjects.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#888888]">
                      Тохирох төсөл олдсонгүй
                    </div>
                  ) : (
                    filteredProjects.map((p) => {
                      const isSelected = p.token === currentProject?.token
                      const isSigned = p.contract?.status === 'signed'
                      const isPub = p.contract?.isPublishedToClient === true

                      return (
                        <div
                          key={p.token}
                          onClick={() => {
                            onSelectProject(p)
                            setDropdownOpen(false)
                          }}
                          className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-black text-white'
                              : 'hover:bg-[#fafafa] text-black border border-transparent hover:border-[#e0e0e0]'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs truncate">
                                {p.company || 'Байгууллага тодорхойгүй'}
                              </span>
                              {isSelected && (
                                <span className="flex size-4 items-center justify-center rounded-full bg-white text-black text-[10px]">
                                  <Check className="size-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] truncate mt-0.5 ${
                                isSelected ? 'text-neutral-300' : 'text-[#666666]'
                              }`}
                            >
                              {p.name} · {p.contactName || 'Захиалагч'}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isSigned
                                  ? isSelected
                                    ? 'bg-emerald-500/30 text-emerald-300'
                                    : 'bg-emerald-100 text-emerald-800'
                                  : isPub
                                  ? isSelected
                                    ? 'bg-blue-500/30 text-blue-300'
                                    : 'bg-blue-100 text-blue-800'
                                  : isSelected
                                  ? 'bg-neutral-800 text-neutral-300'
                                  : 'bg-neutral-100 text-[#666666]'
                              }`}
                            >
                              {isSigned ? '✅ Баталсан' : isPub ? '📨 Илгээсэн' : '⏳ Хүлээгдэж буй'}
                            </span>
                            {p.contract?.total && p.contract.total > 0 ? (
                              <p
                                className={`text-[10px] font-semibold mt-1 ${
                                  isSelected ? 'text-neutral-300' : 'text-[#888888]'
                                }`}
                              >
                                {p.contract.total.toLocaleString()} ₮
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer Link to Project Pipeline */}
                <div className="mt-3 pt-3 border-t border-[#e0e0e0] flex items-center justify-between text-[11px] text-[#666666]">
                  <span>Нийт {projects.length} төсөл бүртгэлтэй</span>
                  <Link
                    href="/admin"
                    className="font-bold text-black hover:underline inline-flex items-center gap-1"
                  >
                    <span>Бүх төслүүд</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prev / Next Switchers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!hasPrev}
              title="Өмнөх төсөл"
              className="flex size-9 items-center justify-center rounded-xl border border-[#e0e0e0] bg-white text-black hover:bg-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext}
              title="Дараагийн төсөл"
              className="flex size-9 items-center justify-center rounded-xl border border-[#e0e0e0] bg-white text-black hover:bg-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Direct link to 5-stage project pipeline */}
          {currentProject && (
            <Link
              href={`/admin/projects/${currentProject.id || currentProject.token}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e0e0e0] bg-white px-3 py-2 text-xs font-semibold text-[#52525b] hover:text-black hover:bg-[#fafafa] transition shadow-xs"
              title="Төслийн 5 үе шаттай дэлгэрэнгүй хуудсыг шинэ таб дээр нээх"
            >
              <Briefcase className="size-3.5" />
              <span>Төслийн хуудас руу очих</span>
              <ArrowUpRight className="size-3 text-[#888888]" />
            </Link>
          )}
        </div>

        {/* Right: Actions, AI Advisor & Status Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Scope Advisor Trigger Button */}
          <button
            type="button"
            onClick={onOpenAIScopeModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition shadow-xs"
          >
            <Sparkles className="size-3.5 text-yellow-300" />
            <span>AI Цар хүрээ & Санал гаргагч</span>
          </button>

          {/* View Brief Modal Button */}
          {currentProject && (
            <button
              type="button"
              onClick={onOpenBriefModal}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition shadow-xs"
            >
              <Eye className="size-3.5 text-[#666666]" />
              <span>Бриф харах</span>
            </button>
          )}

          {/* Status Badge */}
          <span
            className={`rounded-2xl px-3.5 py-2 text-xs font-bold border transition-colors ${
              isContractSigned
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : isContractPublished
                ? 'border-blue-200 bg-blue-50 text-blue-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {isContractSigned
              ? '✅ Цахим гарын үсэг зурсан'
              : isContractPublished
              ? `📨 Үнийн санал илгээсэн (${currentProject?.contract?.total ? currentProject.contract.total.toLocaleString() + ' ₮' : ''})`
              : '⏳ Үнийн санал хүлээгдэж буй'}
          </span>
        </div>
      </div>
    </div>
  )
}
