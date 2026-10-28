'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Layers,
  Plus,
  ExternalLink,
  MessageSquare,
  Send,
  FileCheck2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import VisualPinpointCanvas from '@/components/studio/visual-pinpoint-canvas'
import ProjectTasksManager from '@/components/studio/admin/ProjectTasksManager'
import ProjectDeliverablesManager from '@/components/studio/admin/ProjectDeliverablesManager'
import BriefAnalysisDetailModal from '@/components/studio/admin/BriefAnalysisDetailModal'
import AIScopeAdvisorModal from '@/components/studio/admin/AIScopeAdvisorModal'
import ContractExportButton from '@/components/studio/ContractExportButton'
import { openInvoicePrintWindow } from '@/lib/invoice-export'
import { Project, DesignAsset, ProjectMessage, ProjectTask, DeliverableItem } from '@/lib/types/studio'
import { calculateProjectProgress, formatCurrency } from '@/lib/studio-utils'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'

export default function AdminProjectInspectorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [token, setToken] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showBriefModal, setShowBriefModal] = useState(false)
  const [showAIScopeModal, setShowAIScopeModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'deliverables' | 'canvas' | 'messages'>('deliverables')

  // Mockup Asset State
  const [newAssetTitle, setNewAssetTitle] = useState('')
  const [newAssetUrl, setNewAssetUrl] = useState('')
  const [showAddAsset, setShowAddAsset] = useState(false)

  // Project Conversation
  const [messages, setMessages] = useState<ProjectMessage[]>([])
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = (projectToken: string) => {
    fetch(`/api/messages?projectToken=${projectToken}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages)
      })
      .catch((e) => console.error('Failed loading messages', e))
  }

  useEffect(() => {
    params.then(({ id }) => {
      setToken(id)
      fetch(`/api/projects/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.project) setProject(data.project)
        })
        .finally(() => setLoading(false))

      loadMessages(id)
    })
  }, [params])

  useEffect(() => {
    if (activeTab === 'messages' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, activeTab])

  const copyClientLink = (type: 'portal' | 'contract') => {
    const origin = window.location.origin
    const path = type === 'portal' ? `/client/${token}` : `/client/c/${token}`
    navigator.clipboard.writeText(`${origin}${path}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleUpdateTasks = (updatedTasks: ProjectTask[]) => {
    if (!project) return
    const updatedContract = { ...project.contract, tasks: updatedTasks }
    const newProgress = calculateProjectProgress(updatedContract)
    setProject({
      ...project,
      progress: newProgress,
      contract: updatedContract,
    })
  }

  const handleUpdateDeliverables = (updatedDeliverables: DeliverableItem[]) => {
    if (!project) return
    const updatedContract = { ...project.contract, deliverables: updatedDeliverables }
    const newProgress = calculateProjectProgress(updatedContract)
    setProject({
      ...project,
      progress: newProgress,
      contract: updatedContract,
    })
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newAssetTitle.trim() || !newAssetUrl.trim()) return

    const newAsset: DesignAsset = {
      id: `asset_${Date.now()}`,
      title: newAssetTitle.trim(),
      imageUrl: newAssetUrl.trim(),
      version: `v${project.assets.length + 1}.0`,
      type: 'concept',
      uploadedAt: new Date().toISOString(),
    }

    const updatedAssets = [...project.assets, newAsset]

    try {
      const res = await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: updatedAssets }),
      })

      if (res.ok) {
        setProject({ ...project, assets: updatedAssets })
        setNewAssetTitle('')
        setNewAssetUrl('')
        setShowAddAsset(false)
      }
    } catch (e) {
      console.error('Failed adding asset', e)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || sendingReply) return
    const content = replyText.trim()
    setReplyText('')
    setSendingReply(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectToken: token,
          authorRole: 'DESIGNER',
          authorName: 'Т. Өсөхбаяр',
          content,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
      }
    } catch (e) {
      console.error('Failed sending reply', e)
    } finally {
      setSendingReply(false)
    }
  }

  const handleApplyAISuggestion = async (data: {
    deliverables: DeliverableItem[]
    tasks: ProjectTask[]
    stages: any[]
    total: number
    proposalNote: string
    durationDays: number
  }) => {
    if (!project) return

    const updatedContract = {
      ...project.contract,
      deliverables: data.deliverables,
      tasks: data.tasks,
      stages: data.stages.length > 0 ? data.stages : project.contract.stages,
      total: data.total || project.contract.total,
      proposalNote: data.proposalNote || project.contract.proposalNote,
    }

    const updatedProject = {
      ...project,
      contract: updatedContract,
    }

    setProject(updatedProject)

    try {
      await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: updatedContract,
        }),
      })
    } catch (e) {
      console.error('Failed applying AI scope to project', e)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-xs text-[#888888]">
        Төслийн мэдээллийг ачаалж байна...
      </main>
    )
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white p-5 text-center">
        <h1 className="text-xl font-bold text-black">Төсөл олдсонгүй</h1>
        <Link href="/admin" className="mt-4 rounded-full bg-black px-5 py-2 text-xs font-semibold text-white">
          Админ руу буцах
        </Link>
      </main>
    )
  }

  const tasks = project.contract.tasks || []
  const deliverables = project.contract.deliverables || []
  const completedTasksCount = tasks.filter((t) => t.completed).length
  const completedDeliverablesCount = deliverables.filter((d) => d.completed || d.status === 'approved').length
  const selectedAsset = project.assets[selectedAssetIndex] || project.assets[0]

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-[#e0e0e0] bg-white px-6 sm:px-8 h-[68px] flex items-center">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs font-semibold text-[#666666] hover:text-black transition">
              <ArrowLeft className="mr-1 inline size-3.5" /> Бүх төслүүд
            </Link>
            <span className="text-[#e0e0e0]">/</span>
            <Link href="/admin/crm" className="text-xs font-semibold text-[#666666] hover:text-black transition">
              CRM & Бриф
            </Link>
            <span className="text-[#e0e0e0]">/</span>
            <span className="text-xs font-semibold text-[#888888]">{project.company}</span>
            <span className="text-[#e0e0e0]">/</span>
            <span className="text-xs font-bold text-black">{project.name}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowBriefModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-black bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] transition shadow-sm"
            >
              <Sparkles className="size-3 text-white" />
              Бриф судалгаа (AI)
            </button>
            <button
              onClick={() => copyClientLink('portal')}
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              <Copy className="size-3 text-[#666666]" />
              {copiedLink ? 'Хуулагдлаа!' : 'Client линк'}
            </button>
            <Link
              href={`/client/${token}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              Client талбар <ExternalLink className="size-3" />
            </Link>
            {project && <ContractExportButton project={project} variant="black" />}
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-6 py-8 sm:px-8">
        {/* Project Meta Bar */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Захиалагч</span>
            <p className="mt-1 font-bold text-sm text-black">{project.contactName}</p>
            <p className="text-xs text-[#666666]">{project.email || project.phone || 'И-мэйлгүй'}</p>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Гэрээний төлөв</span>
            <p className="mt-1 font-bold text-sm">
              {project.contract.status === 'signed' ? (
                <span className="text-[#166534]">✅ Баталгаажсан (Ажил эхэлсэн)</span>
              ) : (
                <span className="text-[#c2410c]">⏳ Гарын үсэг хүлээгдэж буй</span>
              )}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Link href={`/client/c/${token}`} target="_blank" className="text-xs font-semibold underline text-black inline-block">
                Гэрээ үзэх →
              </Link>
              <span className="text-[#cccccc]">·</span>
              {project && <ContractExportButton project={project} variant="white" buttonText="PDF / Текст татах" />}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Гүйцэтгэлийн явц</span>
            <p className="mt-1 font-bold text-sm text-black">
              {project.progress}% ({tasks.length > 0 ? `${completedTasksCount} / ${tasks.length} task` : `${completedDeliverablesCount} / ${deliverables.length} ажил`})
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div className="h-full rounded-full bg-black" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Төсөв & Баримт</span>
            <p className="mt-1 font-bold text-sm text-black">
              {formatCurrency(project.contract.total)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => openInvoicePrintWindow(project)}
                className="text-xs font-semibold underline text-black hover:opacity-75"
              >
                Баримт (Нэхэмжлэх) татах →
              </button>
            </div>
          </div>
        </div>

        {/* Client Proposal Alert */}
        {(project.contract.clientNote || (project.contract.proposals && project.contract.proposals.length > 0)) && (
          <div className="mt-6 rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#c2410c]">
              <AlertCircle className="size-4.5" />
              <h4 className="text-sm font-bold">Харилцагчаас гэрээнд санал / өөрчлөлт ирсэн байна</h4>
            </div>
            {project.contract.clientNote && (
              <p className="mt-2 text-xs leading-relaxed text-[#431407] bg-white/70 p-3 rounded-xl border border-[#ffedd5]">
                <strong>Харилцагчийн тэмдэглэл:</strong> {project.contract.clientNote}
              </p>
            )}
            <p className="mt-2 text-[11px] text-[#9a3412]">
              Та доорх ажлын жагсаалтад өөрчлөлт оруулах эсвэл харилцан ярианд хариу өгнө үү.
            </p>
          </div>
        )}

        {/* Section Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-between border-b border-[#e0e0e0] pb-4 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition ${
                activeTab === 'deliverables'
                  ? 'bg-black text-white shadow-xs'
                  : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
              }`}
            >
              <FileCheck2 className="size-3.5" />
              Хийх task-ууд & Материалууд
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === 'deliverables' ? 'bg-white/20 text-white' : 'bg-[#e0e0e0] text-black'
                }`}
              >
                {tasks.length > 0 ? `${completedTasksCount}/${tasks.length}` : `${completedDeliverablesCount}/${deliverables.length}`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                activeTab === 'canvas'
                  ? 'bg-black text-white shadow-xs'
                  : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
              }`}
            >
              Visual Pinpoint Feedback & Mockup
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition ${
                activeTab === 'messages'
                  ? 'bg-black text-white shadow-xs'
                  : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
              }`}
            >
              <MessageSquare className="size-3.5" />
              Төслийн харилцан яриа
              {messages.length > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-[#e0e0e0] text-black'
                  }`}
                >
                  {messages.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIScopeModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-black bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#222222] transition shadow-xs cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              OpenAI: Таск & Гаралт санал авах
            </button>

            {activeTab === 'canvas' && (
              <button
                onClick={() => setShowAddAsset(!showAddAsset)}
                className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#222222] transition"
              >
                <Plus className="size-3.5" /> Шинэ дизайн хувилбар оруулах
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: DELIVERABLES & TASKS CHECKLIST */}
        {activeTab === 'deliverables' && (
          <div className="mt-6 flex flex-col gap-8">
            {/* 1. Tasks Section */}
            <ProjectTasksManager
              tasks={tasks}
              projectToken={token}
              contractEnd={project.contract.end}
              onTasksUpdated={handleUpdateTasks}
            />

            {/* 2. Deliverables Section */}
            <ProjectDeliverablesManager
              deliverables={deliverables}
              projectToken={token}
              contractEnd={project.contract.end}
              stepNumber={tasks.length > 0 ? 2 : 1}
              onDeliverablesUpdated={handleUpdateDeliverables}
            />
          </div>
        )}

        {/* TAB 2: Visual Mockup Canvas */}
        {activeTab === 'canvas' && (
          <div className="mt-6">
            {showAddAsset && (
              <form onSubmit={handleAddAsset} className="mb-6 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Шинэ mockup / хувилбар нэмэх
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    value={newAssetTitle}
                    onChange={(e) => setNewAssetTitle(e.target.value)}
                    placeholder="Гарчиг (Жишээ: Logo Concept V4 - Dark theme)"
                    className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                  <input
                    value={newAssetUrl}
                    onChange={(e) => setNewAssetUrl(e.target.value)}
                    placeholder="Зургийн зам эсвэл URL (Жишээ: /projects/...)"
                    className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAsset(false)}
                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#666666] hover:text-black"
                  >
                    Болих
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-black px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] transition"
                  >
                    Хадгалах
                  </button>
                </div>
              </form>
            )}

            {project.assets.length > 1 && (
              <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
                {project.assets.map((asset, idx) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetIndex(idx)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      selectedAssetIndex === idx
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-[#e0e0e0] bg-white text-[#666666] hover:border-[#cccccc] hover:text-black'
                    }`}
                  >
                    <Layers className="size-3.5" />
                    {asset.title} ({asset.version})
                  </button>
                ))}
              </div>
            )}

            <div>
              {selectedAsset ? (
                <VisualPinpointCanvas
                  asset={selectedAsset}
                  projectToken={token}
                  currentUserRole="DESIGNER"
                  currentUserName="Т. Өсөхбаяр"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white p-12 text-center text-xs text-[#888888]">
                  Одоогоор дизайн mockup хуулагдаагүй байна.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Project Messages */}
        {activeTab === 'messages' && (
          <div className="mt-6 rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e0e0] pb-5">
              <div>
                <h3 className="text-lg font-bold text-black">Төслийн харилцан яриа</h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Харилцагч {project.contactName} ({project.company})-тай харилцах албан ёсны зурвасууд
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-1.5 text-xs text-[#666666]">
                <span className="size-2 rounded-full bg-[#226738] animate-pulse" />
                <span>Харилцагчийн талбарт бодитоор харагдаж байна</span>
              </div>
            </div>

            <div
              ref={chatScrollRef}
              className="mt-6 flex flex-col gap-4 overflow-y-auto max-h-[500px] rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 sm:p-6"
            >
              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#888888]">
                  Харилцан яриа одоогоор эхлээгүй байна.
                </div>
              ) : (
                messages.map((msg) => {
                  const isDesigner = msg.authorRole === 'DESIGNER'
                  const dateFormatted = new Date(msg.createdAt).toLocaleTimeString('mn-MN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <div key={msg.id} className={`flex flex-col ${isDesigner ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-[#888888]">
                          {isDesigner ? 'Т. Өсөхбаяр (Та · Дизайнер)' : `${msg.authorName} · Харилцагч`}
                        </span>
                        <span className="text-[10px] text-[#aaaaaa]">{dateFormatted}</span>
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                          isDesigner ? 'bg-black text-white rounded-tr-sm' : 'bg-white border border-[#e0e0e0] text-[#111111] rounded-tl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 rounded-xl border border-[#e0e0e0] bg-white p-3 focus-within:border-black transition-colors">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                  placeholder="Харилцагчид хариу зурвас бичих (Enter дарж илгээнэ)..."
                  rows={2}
                  className="min-h-14 flex-1 resize-none bg-transparent p-2 text-sm text-black outline-none placeholder:text-[#aaaaaa]"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sendingReply}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#222222] disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                  {sendingReply ? 'Илгээж байна...' : 'Илгээх'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TypeSafe Brief & Research Analysis Detail Modal */}
      <BriefAnalysisDetailModal
        project={project}
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        onUpdate={() => {
          fetch(`/api/projects/${token}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.project) setProject(data.project)
            })
        }}
      />

      {/* OpenAI Scope & Tasks Advisor Modal */}
      <AIScopeAdvisorModal
        isOpen={showAIScopeModal}
        onClose={() => setShowAIScopeModal(false)}
        project={project}
        onApplyAll={handleApplyAISuggestion}
      />
    </main>
  )
}
