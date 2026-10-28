'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Check,
  Layers,
  Plus,
  ExternalLink,
  MessageSquare,
  Send,
  FileCheck2,
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Info,
  Trash2,
  Edit3,
  Briefcase,
  Layers as LayersIcon,
  HelpCircle,
} from 'lucide-react'
import VisualPinpointCanvas from '@/components/studio/visual-pinpoint-canvas'
import ProjectTasksManager from '@/components/studio/admin/ProjectTasksManager'
import ProjectDeliverablesManager from '@/components/studio/admin/ProjectDeliverablesManager'
import BriefAnalysisDetailModal from '@/components/studio/admin/BriefAnalysisDetailModal'
import AIScopeAdvisorModal from '@/components/studio/admin/AIScopeAdvisorModal'
import ContractExportButton from '@/components/studio/ContractExportButton'
import { openInvoicePrintWindow } from '@/lib/invoice-export'
import {
  Project,
  DesignAsset,
  ProjectMessage,
  ProjectTask,
  DeliverableItem,
} from '@/lib/types/studio'
import { calculateProjectProgress, formatCurrency } from '@/lib/studio-utils'
import { getOfficialContractArticles } from '@/lib/contract-template'
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

  // 5-Stage Sequential Pipeline Tabs
  const [activeTab, setActiveTab] = useState<'brief' | 'proposal' | 'contract' | 'workspace' | 'messages'>('brief')

  // Proposal Configuration State
  const [proposalTotal, setProposalTotal] = useState<number>(3500000)
  const [proposalStart, setProposalStart] = useState<string>(new Date().toISOString().split('T')[0])
  const [proposalEnd, setProposalEnd] = useState<string>(
    new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]
  )
  const [proposalRevisions, setProposalRevisions] = useState<number>(2)
  const [proposalNote, setProposalNote] = useState<string>('')
  const [proposalDeliverables, setProposalDeliverables] = useState<DeliverableItem[]>([])
  const [proposalTasks, setProposalTasks] = useState<ProjectTask[]>([])
  const [publishingProposal, setPublishingProposal] = useState(false)
  const [proposalToast, setProposalToast] = useState<string | null>(null)

  // Inline Add Deliverable / Task
  const [showAddDeliv, setShowAddDeliv] = useState(false)
  const [newDelivName, setNewDelivName] = useState('')
  const [newDelivDesc, setNewDelivDesc] = useState('')
  const [newDelivQuantity, setNewDelivQuantity] = useState('1 багц')
  const [newDelivDue, setNewDelivDue] = useState('')

  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')

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
          if (data.project) {
            const p = data.project as Project
            setProject(p)

            // Populate proposal form state
            const c = p.contract || ({} as any)
            setProposalTotal(c.total || 3500000)
            setProposalStart(c.start || new Date().toISOString().split('T')[0])
            setProposalEnd(c.end || new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0])
            setProposalRevisions(c.revisions || 2)
            setProposalNote(c.proposalNote || '')
            setProposalDeliverables(c.deliverables || [])
            setProposalTasks(c.tasks || [])

            // Smart tab default based on lifecycle status
            if (c.status === 'signed' || p.status === 'active' || p.status === 'completed') {
              setActiveTab('workspace')
            } else if (p.status === 'contract_pending') {
              setActiveTab('contract')
            } else if (p.status === 'proposal_sent' || (c.isPublishedToClient && c.total > 0)) {
              setActiveTab('proposal')
            } else {
              setActiveTab('brief')
            }
          }
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
    setProposalTasks(updatedTasks)
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
    setProposalDeliverables(updatedDeliverables)
    setProject({
      ...project,
      progress: newProgress,
      contract: updatedContract,
    })
  }

  // Inline add deliverable to proposal
  const handleAddDeliverable = () => {
    if (!newDelivName.trim()) return
    const newItem: DeliverableItem = {
      id: `deliv_${Date.now()}`,
      name: newDelivName.trim(),
      description: newDelivDesc.trim() || 'Үйлчлүүлэгчид хүлээлгэн өгөх үндсэн материал',
      quantity: newDelivQuantity.trim() || '1 багц',
      due: newDelivDue || proposalEnd,
      status: 'pending',
      completed: false,
    }
    const updated = [...proposalDeliverables, newItem]
    setProposalDeliverables(updated)
    setNewDelivName('')
    setNewDelivDesc('')
    setNewDelivQuantity('1 багц')
    setShowAddDeliv(false)
  }

  const handleRemoveDeliverable = (id: string) => {
    setProposalDeliverables(proposalDeliverables.filter((d) => d.id !== id))
  }

  // Inline add task to proposal
  const handleAddTask = () => {
    if (!newTaskName.trim()) return
    const newItem: ProjectTask = {
      id: `task_${Date.now()}`,
      name: newTaskName.trim(),
      description: newTaskDesc.trim() || 'Дизайнерын дотоод гүйцэтгэх даалгавар',
      due: newTaskDue || proposalEnd,
      completed: false,
    }
    const updated = [...proposalTasks, newItem]
    setProposalTasks(updated)
    setNewTaskName('')
    setNewTaskDesc('')
    setShowAddTask(false)
  }

  const handleRemoveTask = (id: string) => {
    setProposalTasks(proposalTasks.filter((t) => t.id !== id))
  }

  // Publish proposal to client -> sets status to proposal_sent and notifies client
  const handlePublishProposal = async () => {
    if (!project) return
    setPublishingProposal(true)

    try {
      const updatedContract = {
        ...project.contract,
        total: Number(proposalTotal) || project.contract?.total || 3500000,
        start: proposalStart,
        end: proposalEnd,
        revisions: Number(proposalRevisions) || 2,
        proposalNote: proposalNote,
        deliverables: proposalDeliverables,
        tasks: proposalTasks,
        isPublishedToClient: true,
        status: 'sent' as const,
        proposalSentAt: new Date().toISOString(),
      }

      const res = await fetch(`/api/contracts/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedContract,
          isPublishedToClient: true,
          status: 'sent',
          total: Number(proposalTotal),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.project) {
          setProject(data.project)
        } else {
          setProject({
            ...project,
            status: 'proposal_sent',
            contract: updatedContract,
          })
        }
        setProposalToast('Үнийн санал харилцагчийн талбарт амжилттай илгээгдлээ!')
        setTimeout(() => setProposalToast(null), 4000)
        // Transition to contract tab
        setActiveTab('contract')
      }
    } catch (e) {
      console.error('Failed publishing proposal', e)
    } finally {
      setPublishingProposal(false)
    }
  }

  // Save proposal as draft
  const handleSaveProposalDraft = async () => {
    if (!project) return
    setPublishingProposal(true)

    try {
      const updatedContract = {
        ...project.contract,
        total: Number(proposalTotal) || project.contract?.total || 0,
        start: proposalStart,
        end: proposalEnd,
        revisions: Number(proposalRevisions) || 2,
        proposalNote: proposalNote,
        deliverables: proposalDeliverables,
        tasks: proposalTasks,
      }

      const res = await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: updatedContract,
        }),
      })

      if (res.ok) {
        setProject({
          ...project,
          contract: updatedContract,
        })
        setProposalToast('Санал ноорог байдлаар хадгалагдлаа!')
        setTimeout(() => setProposalToast(null), 3000)
      }
    } catch (e) {
      console.error('Failed saving draft', e)
    } finally {
      setPublishingProposal(false)
    }
  }

  // Handle OpenAI Scope Advisor applied
  const handleApplyAISuggestion = async (data: {
    deliverables: DeliverableItem[]
    tasks: ProjectTask[]
    stages: any[]
    total: number
    proposalNote: string
    durationDays: number
  }) => {
    if (!project) return

    setProposalDeliverables(data.deliverables)
    setProposalTasks(data.tasks)
    if (data.total) setProposalTotal(data.total)
    if (data.proposalNote) setProposalNote(data.proposalNote)

    let endCalculated = proposalEnd
    if (data.durationDays) {
      const end = new Date(Date.now() + data.durationDays * 86400000)
      endCalculated = end.toISOString().split('T')[0]
      setProposalEnd(endCalculated)
    }

    const updatedContract = {
      ...project.contract,
      deliverables: data.deliverables,
      tasks: data.tasks,
      stages: data.stages.length > 0 ? data.stages : project.contract?.stages || [],
      total: data.total || project.contract?.total || 0,
      proposalNote: data.proposalNote || project.contract?.proposalNote || '',
      start: proposalStart,
      end: endCalculated,
    }

    setProject({
      ...project,
      contract: updatedContract,
    })
    setActiveTab('proposal')

    try {
      await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: updatedContract,
        }),
      })
      setProposalToast('OpenAI-ийн ажлын санал амжилттай тусгагдлаа!')
      setTimeout(() => setProposalToast(null), 4000)
    } catch (e) {
      console.error('Failed applying AI scope to project', e)
    }
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newAssetTitle.trim() || !newAssetUrl.trim()) return

    const newAsset: DesignAsset = {
      id: `asset_${Date.now()}`,
      title: newAssetTitle.trim(),
      imageUrl: newAssetUrl.trim(),
      version: `v${(project.assets || []).length + 1}.0`,
      type: 'concept',
      uploadedAt: new Date().toISOString(),
    }

    const updatedAssets = [...(project.assets || []), newAsset]

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-xs text-[#888888]">
        Төслийн ажлын талбарыг ачаалж байна...
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

  const tasks = project.contract?.tasks || []
  const deliverables = project.contract?.deliverables || []
  const completedTasksCount = tasks.filter((t) => t.completed).length
  const completedDeliverablesCount = deliverables.filter((d) => d.completed || d.status === 'approved').length
  const selectedAsset = (project.assets || [])[selectedAssetIndex] || project.assets?.[0]
  const answers = project.brief?.answers || {}

  // Official Contract Articles Generator
  const contractArticles = getOfficialContractArticles({
    projectName: project.name,
    company: project.company,
    contactName: project.contactName,
    totalAmount: Number(project.contract?.total) || 0,
    startDate: project.contract?.start || proposalStart,
    endDate: project.contract?.end || proposalEnd,
    designerName: 'Т. Өсөхбаяр',
    designerRd: 'УК02251016',
  })

  // Payment Breakdown
  const totalNum = Number(proposalTotal) || 0
  const upfront50 = Math.round(totalNum * 0.5)
  const milestone30 = Math.round(totalNum * 0.3)
  const final20 = totalNum - upfront50 - milestone30

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Toast Notification */}
      {proposalToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-[#d2ebd6] bg-[#f0fdf4] px-4 py-3 text-xs font-bold text-[#166534] shadow-lg animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{proposalToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-[#e0e0e0] bg-white px-6 sm:px-8 h-[68px] flex items-center sticky top-0 z-20">
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
              Client харагдац <ExternalLink className="size-3" />
            </Link>
            {project && <ContractExportButton project={project} variant="black" />}
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-6 py-8 sm:px-8">
        {/* Project Meta Metrics Bar */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Захиалагч</span>
            <p className="mt-1 font-bold text-sm text-black">{project.contactName}</p>
            <p className="text-xs text-[#666666]">{project.email || project.phone || 'И-мэйлгүй'}</p>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Гэрээний төлөв</span>
            <p className="mt-1 font-bold text-sm">
              {project.contract?.status === 'signed' ? (
                <span className="text-[#166534]">✅ Баталгаажсан (Ажил эхэлсэн)</span>
              ) : project.status === 'contract_pending' ? (
                <span className="text-[#c2410c]">✍️ Санал зөвшөөрсөн (Гарын үсэг хүлээж буй)</span>
              ) : project.status === 'proposal_sent' ? (
                <span className="text-[#854d0e]">📨 Үнийн санал илгээсэн</span>
              ) : (
                <span className="text-[#666666]">⏳ Бриф шалгаж буй</span>
              )}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Link href={`/client/c/${token}`} target="_blank" className="text-xs font-semibold underline text-black inline-block">
                Гэрээ үзэх →
              </Link>
              <span className="text-[#cccccc]">·</span>
              {project && <ContractExportButton project={project} variant="white" buttonText="PDF / Word татах" />}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Гүйцэтгэлийн явц</span>
            <p className="mt-1 font-bold text-sm text-black">
              {project.progress || 0}% ({tasks.length > 0 ? `${completedTasksCount}/${tasks.length} task` : `${completedDeliverablesCount}/${deliverables.length} ажил`})
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div className="h-full rounded-full bg-black" style={{ width: `${project.progress || 0}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-[#888888]">Төсөв & Баримт</span>
            <p className="mt-1 font-bold text-sm text-black">
              {formatCurrency(project.contract?.total || 0)}
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

        {/* Client Note Alert */}
        {(project.contract?.clientNote || (project.contract?.proposals && project.contract.proposals.length > 0)) && (
          <div className="mt-6 rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#c2410c]">
              <AlertCircle className="size-4.5" />
              <h4 className="text-sm font-bold">Харилцагчаас санал / өөрчлөлтийн хүсэлт ирсэн байна</h4>
            </div>
            {project.contract.clientNote && (
              <p className="mt-2 text-xs leading-relaxed text-[#431407] bg-white/70 p-3 rounded-xl border border-[#ffedd5]">
                <strong>Харилцагчийн тэмдэглэл:</strong> {project.contract.clientNote}
              </p>
            )}
          </div>
        )}

        {/* 5-STEP GUIDED LIFECYCLE TABS */}
        <div className="mt-10 border-b border-[#e0e0e0] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* TAB 1: BRIEF */}
              <button
                onClick={() => setActiveTab('brief')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'brief'
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
                }`}
              >
                <HelpCircle className="size-3.5" />
                <span>1. Бриф судалгаа</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    activeTab === 'brief'
                      ? 'bg-white/20 text-white'
                      : project.brief?.complete
                      ? 'bg-[#d2ebd6] text-[#226738]'
                      : 'bg-[#fed7aa] text-[#c2410c]'
                  }`}
                >
                  {project.brief?.complete ? 'Бүрэн ирсэн' : 'Хүлээгдэж буй'}
                </span>
              </button>

              {/* TAB 2: PROPOSAL & SCOPE */}
              <button
                onClick={() => setActiveTab('proposal')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'proposal'
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
                }`}
              >
                <Sparkles className="size-3.5" />
                <span>2. Цар хүрээ & Үнийн санал</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    activeTab === 'proposal'
                      ? 'bg-white/20 text-white'
                      : project.status === 'proposal_sent'
                      ? 'bg-[#fefce8] text-[#854d0e]'
                      : 'bg-[#e0e0e0] text-[#555555]'
                  }`}
                >
                  {project.status === 'proposal_sent' ? 'Илгээсэн' : `${proposalDeliverables.length} гаралт`}
                </span>
              </button>

              {/* TAB 3: CONTRACT */}
              <button
                onClick={() => setActiveTab('contract')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'contract'
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
                }`}
              >
                <FileText className="size-3.5" />
                <span>3. Гэрээний төсөл</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    activeTab === 'contract'
                      ? 'bg-white/20 text-white'
                      : project.contract?.status === 'signed'
                      ? 'bg-[#d2ebd6] text-[#226738]'
                      : project.status === 'contract_pending'
                      ? 'bg-[#fed7aa] text-[#c2410c]'
                      : 'bg-[#e0e0e0] text-[#666666]'
                  }`}
                >
                  {project.contract?.status === 'signed'
                    ? 'Баталгаажсан'
                    : project.status === 'contract_pending'
                    ? 'Зөвшөөрсөн'
                    : 'Ноорог'}
                </span>
              </button>

              {/* TAB 4: WORKSPACE & CANVAS */}
              <button
                onClick={() => setActiveTab('workspace')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'workspace'
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
                }`}
              >
                <Layers className="size-3.5" />
                <span>4. Гүйцэтгэл & Canvas</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    activeTab === 'workspace' ? 'bg-white/20 text-white' : 'bg-[#e0e0e0] text-black'
                  }`}
                >
                  {project.progress || 0}%
                </span>
              </button>

              {/* TAB 5: MESSAGES */}
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'messages'
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black'
                }`}
              >
                <MessageSquare className="size-3.5" />
                <span>5. Харилцан яриа</span>
                {messages.length > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-[#e0e0e0] text-black'
                    }`}
                  >
                    {messages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Context CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIScopeModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-black bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#222222] transition shadow-xs cursor-pointer"
              >
                <Sparkles className="size-3.5 text-amber-300" />
                OpenAI Санал авах
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: BRIEF REVIEW (Ажлын шаардлага & Бриф шалгах) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'brief' && (
          <div className="mt-6 flex flex-col gap-6">
            {/* Top Brief Header Card */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0f0f0] pb-5">
                <div>
                  <span className="rounded-full bg-[#f0fdf4] border border-[#d2ebd6] px-3 py-0.5 text-[10px] font-bold text-[#166534]">
                    AI Brief Analysis Complete
                  </span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-black">
                    Харилцагчийн илгээсэн Ажлын шаардлага (Brief)
                  </h3>
                  <p className="mt-1 text-xs text-[#666666]">
                    Харилцагч энэхүү шаардлагаа AI туслахтай чатлан баталгаажуулсан байна.
                  </p>
                </div>

                <button
                  onClick={() => setShowBriefModal(true)}
                  className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
                >
                  <Sparkles className="size-3 text-amber-500" />
                  TypeSafe & Jev үнэлгээ дэлгэрэнгүй
                </button>
              </div>

              {/* Jev & AI Evaluation Bar */}
              {project.brief?.classifiedType && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a3412]">Төслийн ангилал</span>
                    <p className="mt-0.5 text-sm font-bold text-black">{project.brief.classifiedType}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a3412]">Aesthetic түвшин</span>
                    <p className="mt-0.5 text-sm font-bold text-black">{project.brief.aestheticScore || '4'} / 5</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a3412]">Бэлэн байдлын явц</span>
                    <p className="mt-0.5 text-sm font-bold text-emerald-700">100% Бүрэн баталгаажсан</p>
                  </div>
                </div>
              )}

              {/* Brief Answers Q&A Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">1. Төслийн төрөл</span>
                  <p className="mt-1 text-sm font-bold text-black">{answers.projectType || project.type || 'Brand Identity'}</p>
                </div>

                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">2. Бизнесийн мөн чанар</span>
                  <p className="mt-1 text-sm font-medium text-black leading-relaxed">{answers.business || 'Тодорхойлоогүй'}</p>
                </div>

                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">3. Гол зорилго & Ялгарал</span>
                  <p className="mt-1 text-sm font-medium text-black leading-relaxed">{answers.goal || 'Тодорхойлоогүй'}</p>
                </div>

                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">4. Зорилтот хэрэглэгчид</span>
                  <p className="mt-1 text-sm font-medium text-black leading-relaxed">{answers.audience || 'Тодорхойлоогүй'}</p>
                </div>

                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">5. Өнгө аяс & Хэв маяг</span>
                  <p className="mt-1 text-sm font-medium text-black leading-relaxed">{answers.style || 'Минимал & Цэвэрхэн'}</p>
                </div>

                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">6. Хүлээлгэн өгөх материалууд</span>
                  <p className="mt-1 text-sm font-medium text-black leading-relaxed">{answers.deliverables || 'Лого систем, Өнгө & Фонт, Эх файл'}</p>
                </div>

                <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2410c]">7. Хүссэн хугацаа (Deadline)</span>
                  <p className="mt-1 text-sm font-bold text-black">{answers.timeline || 'Уян хатан (Тохиролцох)'}</p>
                </div>

                <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2410c]">8. Төсвийн төлөвлөгөө</span>
                  <p className="mt-1 text-sm font-bold text-black">{answers.budget || 'Санал болгох үнийг харах'}</p>
                </div>

                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">9. Үйлчилгээний цар хүрээ хүлээн зөвшөөрөлт</span>
                  <p className="mt-1 text-sm font-medium text-black leading-relaxed">{answers.serviceScope || 'Харилцагч үйлчилгээний цар хүрээг хүлээн зөвшөөрсөн'}</p>
                </div>
              </div>
            </div>

            {/* Guided Bottom CTA to Step 2 */}
            <div className="rounded-2xl border border-black bg-black p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Дараагийн алхам</p>
                <h4 className="mt-1 text-lg font-bold text-white">
                  Бриф дээр үндэслэн ажлын гаралт, үнэ, хугацааны санал бэлтгэх
                </h4>
                <p className="mt-1 text-xs text-white/80">
                  OpenAI зөвлөх ашиглан хийх ажлууд болон үнийн саналыг шууд тооцоолж болно.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('proposal')}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#eeeeee] transition shrink-0 shadow-sm"
              >
                <span>Үргэлжлүүлэх: Цар хүрээ & Үнийн санал бэлтгэх</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SCOPE & PROPOSAL CONFIGURATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'proposal' && (
          <div className="mt-6 flex flex-col gap-8">
            {/* AI Advisor Banner */}
            <div className="rounded-2xl border border-[#fef08a] bg-[#fefce8] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-black text-white shrink-0">
                  <Sparkles className="size-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">
                    OpenAI: Бриф дээр үндэслэн санал автоматаар тооцоолох
                  </h4>
                  <p className="mt-0.5 text-xs text-[#713f12]">
                    Клиентийн бриф дээр тулгуурлан хийх ажлын гаралтууд, даалгаврууд, үнэ, хугацааг 1 товшилтоор санал болгоно.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAIScopeModal(true)}
                className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-[#222222] transition shrink-0 shadow-sm"
              >
                <Sparkles className="size-3.5 text-amber-300" />
                <span>AI Санал авах</span>
              </button>
            </div>

            {/* SECTION 1: DELIVERABLES TO CLIENT */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Хүлээлгэн өгөх материалууд</span>
                  <h3 className="mt-0.5 text-base font-bold text-black">
                    Харилцагчид хүлээлгэн өгөх гаралтууд ({proposalDeliverables.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddDeliv(!showAddDeliv)}
                  className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
                >
                  <Plus className="size-3.5" /> Шинэ гаралт нэмэх
                </button>
              </div>

              {/* Inline Add Deliverable Form */}
              {showAddDeliv && (
                <div className="mb-6 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                  <h4 className="text-xs font-bold text-black mb-3">Шинэ хүлээлгэн өгөх гаралт нэмэх</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      value={newDelivName}
                      onChange={(e) => setNewDelivName(e.target.value)}
                      placeholder="Материалын нэр (Жишээ: Лого систем вектор эх файл)"
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black sm:col-span-2"
                    />
                    <input
                      value={newDelivQuantity}
                      onChange={(e) => setNewDelivQuantity(e.target.value)}
                      placeholder="Тоо ширхэг (Жишээ: 1 багц)"
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                    />
                    <input
                      value={newDelivDesc}
                      onChange={(e) => setNewDelivDesc(e.target.value)}
                      placeholder="Дэлгэрэнгүй тодорхойлолт, формат (AI, SVG, PDF)"
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black sm:col-span-2"
                    />
                    <input
                      type="date"
                      value={newDelivDue}
                      onChange={(e) => setNewDelivDue(e.target.value)}
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDeliv(false)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#666666] hover:text-black"
                    >
                      Болих
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="rounded-full bg-black px-5 py-1.5 text-xs font-bold text-white hover:bg-[#222222] transition"
                    >
                      Гаралт нэмэх
                    </button>
                  </div>
                </div>
              )}

              {/* Deliverables List */}
              <div className="flex flex-col gap-2.5">
                {proposalDeliverables.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#888888] rounded-xl border border-dashed border-[#e0e0e0]">
                    Одоогоор гаралт нэмэгдээгүй байна. Дээрх &quot;AI Санал авах&quot; эсвэл &quot;Шинэ гаралт нэмэх&quot; товчийг дарна уу.
                  </div>
                ) : (
                  proposalDeliverables.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 text-xs hover:border-[#e0e0e0] transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-black text-[11px] font-bold text-white shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-black">{item.name}</p>
                          <p className="mt-0.5 text-[#666666] leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-[#888888] font-mono">{item.quantity}</span>
                        <span className="text-[11px] text-[#888888] font-mono">{item.due || proposalEnd}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(item.id)}
                          className="p-1 text-[#aaaaaa] hover:text-red-500 transition"
                          title="Устгах"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 2: INTERNAL TASKS CHECKLIST */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Дотоод ажлын төлөвлөгөө</span>
                  <h3 className="mt-0.5 text-base font-bold text-black">
                    Дизайнерын гүйцэтгэх таскууд ({proposalTasks.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
                >
                  <Plus className="size-3.5" /> Шинэ таск нэмэх
                </button>
              </div>

              {/* Inline Add Task Form */}
              {showAddTask && (
                <div className="mb-6 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                  <h4 className="text-xs font-bold text-black mb-3">Шинэ таск нэмэх</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Таск нэр (Жишээ: Концепт 3 хувилбар боловсруулах)"
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black sm:col-span-2"
                    />
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                    />
                    <input
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Тайлбар / алхмууд"
                      className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black sm:col-span-3"
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#666666] hover:text-black"
                    >
                      Болих
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="rounded-full bg-black px-5 py-1.5 text-xs font-bold text-white hover:bg-[#222222] transition"
                    >
                      Таск нэмэх
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div className="flex flex-col gap-2.5">
                {proposalTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#888888] rounded-xl border border-dashed border-[#e0e0e0]">
                    Одоогоор таск нэмэгдээгүй байна.
                  </div>
                ) : (
                  proposalTasks.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="flex items-center justify-between rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 text-xs hover:border-[#e0e0e0] transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-[#888888] w-5 text-right shrink-0">
                          {idx + 1}.
                        </span>
                        <div>
                          <p className="font-bold text-black">{t.name}</p>
                          {t.description && <p className="mt-0.5 text-[#666666]">{t.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono text-[#888888]">{t.due || proposalEnd}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(t.id)}
                          className="p-1 text-[#aaaaaa] hover:text-red-500 transition"
                          title="Устгах"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 3: PRICING & TIMELINE SETTINGS */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="border-b border-[#f0f0f0] pb-4 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Санхүү & Хугацааны тохиргоо</span>
                <h3 className="mt-0.5 text-base font-bold text-black">
                  Нийт төсвийн үнийн санал болон товлосон хугацаа
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Price Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#666666] mb-1.5">
                    Нийт үнийн санал (₮)
                  </label>
                  <input
                    type="number"
                    value={proposalTotal}
                    onChange={(e) => setProposalTotal(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
                  />
                  <p className="mt-1 text-[11px] text-[#888888]">
                    Формат: {Number(proposalTotal).toLocaleString()} ₮
                  </p>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#666666] mb-1.5">
                    Эхлэх огноо
                  </label>
                  <input
                    type="date"
                    value={proposalStart}
                    onChange={(e) => setProposalStart(e.target.value)}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#666666] mb-1.5">
                    Дуусах товлосон огноо
                  </label>
                  <input
                    type="date"
                    value={proposalEnd}
                    onChange={(e) => setProposalEnd(e.target.value)}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white"
                  />
                </div>

                {/* Revisions Count */}
                <div>
                  <label className="block text-xs font-semibold text-[#666666] mb-1.5">
                    Үнэгүй засварын тоо
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={proposalRevisions}
                    onChange={(e) => setProposalRevisions(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-xs text-black outline-none focus:border-black focus:bg-white"
                  />
                  <p className="mt-1 text-[11px] text-[#888888]">Үе шат бүрт тооцогдоно</p>
                </div>
              </div>

              {/* 3-Stage Payment Split Preview */}
              <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  3 үе шаттай санхүүжилтийн хуваарилалт (Автомат тооцоолол)
                </span>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white p-3 border border-[#e0e0e0]">
                    <span className="text-[10px] text-[#888888]">1-р шат: 50% Урьдчилгаа</span>
                    <p className="mt-1 font-bold text-sm text-black">{upfront50.toLocaleString()} ₮</p>
                    <p className="text-[10px] text-[#666666]">Гэрээ баталгаажиж, судалгаа эхлэхэд</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-[#e0e0e0]">
                    <span className="text-[10px] text-[#888888]">2-р шат: 30% Дундын баталгаа</span>
                    <p className="mt-1 font-bold text-sm text-black">{milestone30.toLocaleString()} ₮</p>
                    <p className="text-[10px] text-[#666666]">Эхний концепц батлагдахад</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-[#e0e0e0]">
                    <span className="text-[10px] text-[#888888]">3-р шат: 20% Эцсийн хүлээлцэл</span>
                    <p className="mt-1 font-bold text-sm text-black">{final20.toLocaleString()} ₮</p>
                    <p className="text-[10px] text-[#666666]">Бүх эх файлуудыг хүлээлгэн өгөхөд</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: PROPOSAL NOTE FOR CLIENT */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="border-b border-[#f0f0f0] pb-4 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Харилцагчид очих зурвас</span>
                <h3 className="mt-0.5 text-base font-bold text-black">
                  Дизайнерын зөвлөмж тайлбар (Proposal Note)
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Энэ бичвэр харилцагчийн талбарт үнийн саналтай хамт тодорхой харагдана.
                </p>
              </div>

              <textarea
                rows={4}
                value={proposalNote}
                onChange={(e) => setProposalNote(e.target.value)}
                placeholder="Сайн байна уу! Таны бриф судалгаатай танилцаж, танай брэндийн зорилго болон өрсөлдөх зах зээлд тохируулан дээрх ажлын цар хүрээ, гаралтууд болон хугацааны саналаа боловсрууллаа..."
                className="w-full rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs text-black outline-none focus:border-black focus:bg-white leading-relaxed"
              />
            </div>

            {/* GUIDED ACTION BAR (ҮРГЭЛЖЛҮҮЛЭХ & ХАРИЛЦАГЧИД ИЛГЭЭХ) */}
            <div className="rounded-2xl border border-black bg-black p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Шат 2-оос Шат 3 руу шилжих</p>
                <h4 className="mt-1 text-lg font-bold text-white">
                  Үнийн саналыг баталгаажуулж харилцагчид илгээх
                </h4>
                <p className="mt-1 text-xs text-white/80">
                  Харилцагч талын талбарт үнийн санал очиж, зөвшөөрснөөр гэрээний шат руу автоматаар орно.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveProposalDraft}
                  disabled={publishingProposal}
                  className="rounded-full border border-white/30 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition disabled:opacity-40"
                >
                  Ноорог хадгалах
                </button>

                <button
                  type="button"
                  onClick={handlePublishProposal}
                  disabled={publishingProposal}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#eeeeee] transition shadow-sm disabled:opacity-50"
                >
                  <Send className="size-3.5 text-black" />
                  <span>{publishingProposal ? 'Илгээж байна...' : 'Үнийн санал илгээж, Гэрээ рүү шилжих →'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CONTRACT & SIGNATURES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'contract' && (
          <div className="mt-6 flex flex-col gap-6">
            {/* Status Banner */}
            {project.contract?.status === 'signed' ? (
              <div className="rounded-2xl border border-[#d2ebd6] bg-[#f0fdf4] p-6 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#166534] text-white">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                      Гэрээ албан ёсоор баталгаажсан
                    </span>
                    <h3 className="mt-0.5 text-base sm:text-lg font-bold text-black">
                      Цахим гарын үсэг зурагдсан ({project.contract.signedAt ? new Date(project.contract.signedAt).toLocaleDateString('mn-MN') : 'Батлагдсан'})
                    </h3>
                    <p className="mt-0.5 text-xs text-[#666666]">
                      Захиалагч: <strong>{project.contract.clientName || project.contactName}</strong> ({project.company})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('workspace')}
                  className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-[#222222] transition shadow-sm shrink-0"
                >
                  <span>Ажлын гүйцэтгэл (Canvas & Таск) рүү шилжих →</span>
                </button>
              </div>
            ) : project.status === 'contract_pending' ? (
              <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#c2410c] text-white">
                    <Clock className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2410c]">
                      Харилцагч үнийн саналыг хүлээн зөвшөөрсөн!
                    </span>
                    <h3 className="mt-0.5 text-base sm:text-lg font-bold text-black">
                      Гэрээнд цахим гарын үсэг зурахыг хүлээж байна
                    </h3>
                    <p className="mt-0.5 text-xs text-[#7c2d12]">
                      Харилцагч талын портал дээр 10 заалттай гэрээ болон гарын үсэг зурах самбар гарсан байгаа.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyClientLink('contract')}
                    className="flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-white px-4 py-2 text-xs font-semibold text-[#9a3412] hover:bg-[#fff1e6] transition"
                  >
                    <Copy className="size-3 text-[#9a3412]" />
                    <span>Гэрээний линк хуулах</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#fef08a] bg-[#fefce8] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#854d0e] text-white">
                    <Info className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#854d0e]">
                      Үнийн санал илгээгдсэн
                    </span>
                    <h3 className="mt-0.5 text-base sm:text-lg font-bold text-black">
                      Харилцагч үнийн санал, хугацааг хүлээн зөвшөөрөхийг хүлээж байна
                    </h3>
                    <p className="mt-0.5 text-xs text-[#713f12]">
                      Харилцагч &quot;Үнийн саналыг зөвшөөрөх&quot; товч дарж баталгаажуулснаар гэрээний шат идэвхжинэ.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('proposal')}
                  className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition shrink-0"
                >
                  <Edit3 className="size-3" />
                  <span>Санал засах</span>
                </button>
              </div>
            )}

            {/* Contract Document Card */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0f0f0] pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                    Албан ёсны 10 заалттай гэрээний төсөл
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-black">
                    № {project.contract?.number || 'BT-2026-001'} · Дизайн ажил гүйцэтгэх гэрээ
                  </h3>
                  <p className="mt-0.5 text-xs text-[#666666]">
                    Нийт дүн: <strong>{formatCurrency(project.contract?.total || 0)}</strong> · Хугацаа: {project.contract?.start} — {project.contract?.end}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {project && <ContractExportButton project={project} variant="black" />}
                  <button
                    type="button"
                    onClick={() => openInvoicePrintWindow(project)}
                    className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
                  >
                    Нэхэмжлэх татах
                  </button>
                </div>
              </div>

              {/* 10 Contract Articles Preview */}
              <div className="mt-6 flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-5 sm:p-6 text-xs text-[#333333]">
                {contractArticles.map((art, idx) => (
                  <div key={idx} className="border-b border-[#e5e5e5] pb-4 last:border-b-0">
                    <h4 className="font-bold text-black text-sm mb-2">{art.title}</h4>
                    <ul className="space-y-1.5 leading-relaxed">
                      {art.paragraphs.map((p, pIdx) => (
                        <li key={pIdx} className="text-[#555555]">
                          • {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Guided Bottom CTA */}
            <div className="rounded-2xl border border-black bg-black p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Шат 3-аас Шат 4 рүү шилжих</p>
                <h4 className="mt-1 text-lg font-bold text-white">
                  {project.contract?.status === 'signed'
                    ? 'Гэрээ баталгаажсан тул ажлын гүйцэтгэлд шилжих боломжтой'
                    : 'Гэрээний холбоосоо харилцагчид илгээж гарын үсэг авна уу'}
                </h4>
                <p className="mt-1 text-xs text-white/80">
                  Гарын үсэг зурагдмагц төслийн статус автоматаар &quot;Active&quot; болж гүйцэтгэлийн явц идэвхжинэ.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => copyClientLink('contract')}
                  className="rounded-full border border-white/30 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  Client гэрээний линк хуулах
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('workspace')}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#eeeeee] transition shadow-sm"
                >
                  <span>Ажлын гүйцэтгэл (Canvas & Таск) рүү шилжих →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: WORKSPACE & CANVAS (Гүйцэтгэл) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'workspace' && (
          <div className="mt-6 flex flex-col gap-8">
            {/* 1. Tasks Section */}
            <ProjectTasksManager
              tasks={tasks}
              projectToken={token}
              contractEnd={project.contract?.end || proposalEnd}
              onTasksUpdated={handleUpdateTasks}
            />

            {/* 2. Deliverables Section */}
            <ProjectDeliverablesManager
              deliverables={deliverables}
              projectToken={token}
              contractEnd={project.contract?.end || proposalEnd}
              stepNumber={tasks.length > 0 ? 2 : 1}
              onDeliverablesUpdated={handleUpdateDeliverables}
            />

            {/* 3. Visual Mockup Canvas */}
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0f0f0] pb-5 mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Visual Pinpoint Feedback</span>
                  <h3 className="mt-0.5 text-base font-bold text-black">
                    Дизайн Mockup хувилбарууд & Харилцагчийн санал хүсэлт
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAsset(!showAddAsset)}
                  className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#222222] transition"
                >
                  <Plus className="size-3.5" /> Шинэ mockup хуулах
                </button>
              </div>

              {showAddAsset && (
                <form onSubmit={handleAddAsset} className="mb-6 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
                    Шинэ mockup / хувилбар нэмэх
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
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

              {(project.assets || []).length > 1 && (
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
                    Одоогоор дизайн mockup хуулагдаагүй байна. Дээрх товчоор шинэ дизайн нэмнэ үү.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: PROJECT MESSAGES */}
        {/* ------------------------------------------------------------- */}
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

            {/* Reply Input Box */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                placeholder="Харилцагчид хариу бичих..."
                className="flex-1 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-xs text-black outline-none focus:border-black focus:bg-white transition"
              />
              <button
                type="button"
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="flex items-center gap-1.5 rounded-2xl bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#222222] disabled:opacity-40"
              >
                <Send className="size-3.5" />
                <span>Илгээх</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Brief Detail Modal */}
      {project && (
        <BriefAnalysisDetailModal
          isOpen={showBriefModal}
          onClose={() => setShowBriefModal(false)}
          project={project}
        />
      )}

      {/* AI Scope Advisor Modal */}
      {project && (
        <AIScopeAdvisorModal
          isOpen={showAIScopeModal}
          onClose={() => setShowAIScopeModal(false)}
          project={project}
          onApplyAll={handleApplyAISuggestion}
        />
      )}
    </main>
  )
}
