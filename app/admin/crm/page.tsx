'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Sparkles,
  Plus,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import ClientCrmManager from '@/components/studio/admin/ClientCrmManager'
import BriefResearchDashboard from '@/components/studio/admin/BriefResearchDashboard'
import NewProjectWizardModal from '@/components/studio/admin/NewProjectWizardModal'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'
import { CloudflareStatusBadge } from '@/components/studio/CloudflareStatusBadge'

function AdminCrmContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'research' ? 'research' : 'crm'

  const [activeTab, setActiveTab] = useState<'crm' | 'research'>(initialTab)
  const [projects, setProjects] = useState<Project[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  const loadData = () => {
    setLoading(true)
    fetch('/api/admin/crm')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects)
        if (data.metrics) setMetrics(data.metrics)
      })
      .catch((e) => console.error('Failed loading CRM data', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

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
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                activeTab === 'crm'
                  ? 'bg-black text-white'
                  : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
              }`}
              onClick={() => setActiveTab('crm')}
            >
              <Users className="size-4" />
              CRM & Харилцагчид
            </Link>
            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition text-left w-full ${
                activeTab === 'research'
                  ? 'bg-black text-white'
                  : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
              }`}
            >
              <Sparkles className="size-4" />
              Бриф судалгаа (AI)
            </button>
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

        {/* Main Content Area */}
        <section className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex h-[68px] items-center justify-between border-b border-[#e0e0e0] px-6 sm:px-8 bg-white">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-xs font-semibold text-[#666666] hover:text-black transition flex items-center gap-1 sm:hidden"
              >
                <ArrowLeft className="size-3.5" /> Буцах
              </Link>
              <div>
                <h1 className="text-base font-bold tracking-tight text-black flex items-center gap-2">
                  <span>Харилцагчийн CRM & Бриф судалгаа</span>
                  <span className="hidden sm:inline-block rounded-full border border-[#e0e0e0] bg-[#fafafa] px-2.5 py-0.5 text-[10px] font-bold text-[#666666]">
                    TypeSafe Intelligence
                  </span>
                </h1>
                <p className="text-[11px] text-[#888888] hidden sm:block">
                  Харилцагчийн урсгал, хэлэлцээрийн үе шат ба брэндийн судалгааны нэгдсэн систем
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadData}
                title="Мэдээлэл шинэчлэх"
                className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Шинэчлэх</span>
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#222222] transition shadow-sm"
              >
                <Plus className="size-3.5" /> Шинэ харилцагч үүсгэх
              </button>
            </div>
          </header>

          {/* Subheader Navigation Tabs */}
          <div className="border-b border-[#e0e0e0] bg-[#fafafa] px-6 sm:px-8">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('crm')}
                className={`flex items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition ${
                  activeTab === 'crm'
                    ? 'border-black text-black'
                    : 'border-transparent text-[#666666] hover:text-black'
                }`}
              >
                <Users className="size-4" />
                Харилцагчийн удирдлага & CRM ({projects.length})
              </button>

              <button
                onClick={() => setActiveTab('research')}
                className={`flex items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition ${
                  activeTab === 'research'
                    ? 'border-black text-black'
                    : 'border-transparent text-[#666666] hover:text-black'
                }`}
              >
                <Sparkles className="size-4" />
                Бриф судалгааны Dashboard (TypeSafe AI)
              </button>
            </div>
          </div>

          {/* Body Section */}
          <div className="mx-auto max-w-[1360px] px-6 py-8 sm:px-8 lg:px-10">
            {loading && projects.length === 0 ? (
              <div className="py-24 text-center text-xs text-[#888888] flex flex-col items-center justify-center gap-2">
                <RefreshCw className="size-5 animate-spin text-black" />
                <span>Харилцагчид болон судалгааны датаг нэгтгэн тооцоолж байна...</span>
              </div>
            ) : activeTab === 'crm' ? (
              <ClientCrmManager
                projects={projects}
                onUpdate={loadData}
                onNewClient={() => setShowWizard(true)}
              />
            ) : (
              <BriefResearchDashboard
                projects={projects}
                metrics={metrics}
                onRefresh={loadData}
              />
            )}
          </div>
        </section>
      </div>

      {/* New Project Wizard Modal */}
      <NewProjectWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={loadData}
      />
    </main>
  )
}

export default function AdminCrmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-xs text-[#888888]">
          <RefreshCw className="mr-2 size-4 animate-spin text-black" />
          <span>CRM хуудсыг ачаалж байна...</span>
        </div>
      }
    >
      <AdminCrmContent />
    </Suspense>
  )
}
