'use client'

import React, { useMemo, useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  Plus,
  Send,
  Trash2,
  ArrowLeft,
  Link2,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { DeliverableItem, StageItem, Project, ProjectTask } from '@/lib/types/studio'
import ContractExportButton from '@/components/studio/ContractExportButton'
import BriefAnalysisDetailModal from '@/components/studio/admin/BriefAnalysisDetailModal'
import AIScopeAdvisorModal from '@/components/studio/admin/AIScopeAdvisorModal'
import AdminLogoutButton from '@/components/studio/admin/AdminLogoutButton'

const defaultDeliverables: DeliverableItem[] = [
  { id: '1', name: 'Брэндбүүк', description: 'Брендийн дүр төрх болон хэрэглээний дүрмийг агуулсан иж бүрэн гарын авлага', quantity: '1', due: '2026-06-30' },
  { id: '2', name: 'Лого систем', description: 'Үндсэн лого, хэвтээ ба босоо хувилбар, хар цагаан хувилбар, доод хэмжээний хязгаар', quantity: '1', due: '2026-05-20' },
  { id: '3', name: 'Өнгөний систем', description: 'Брэндийн өнгөний багц (HEX, RGB, CMYK кодуудын хамт)', quantity: '1', due: '2026-05-25' },
  { id: '4', name: 'Бичгийн хэлбэр', description: 'Сонгосон фонт болон хэрэглээний зааврын баримт', quantity: '1', due: '2026-05-25' },
  { id: '5', name: 'Брэндийн хэрэглээний жишээнүүд', description: 'Брошур, нэрийн хуудас, бүтээгдэхүүний цэс, сошиал медиа постын жишээ дизайн', quantity: '1', due: '2026-06-15' },
  { id: '6', name: 'Бүх хувилбарын эх файлууд', description: 'AI, EPS, SVG, PNG, PDF форматаар вектор эх хувиуд', quantity: '1', due: '2026-06-30' },
  { id: '7', name: 'Хэрэглээний зааварчилгаа', description: 'Захиалагчид зориулсан хэрэглээний зааварчилгаа бүхий гарын авлага', quantity: '1', due: '2026-06-30' },
]

const defaultStages: StageItem[] = [
  { id: '1', name: 'Судалгаа ба Нээлт', result: 'Шаардлагын баримт (brief), судалгааны тайлан, байршлын тодорхойлолт', payment: '50% урьдчилгаа' },
  { id: '2', name: 'Стратеги', result: 'Брэндийн стратегийн баримт бичиг: байр суурь, зан чанар, утга санаа', payment: 'Суурь баримт батлагдсанаар' },
  { id: '3', name: 'Дизайн боловсруулалт', result: 'Лого хувилбарууд, өнгөний систем, фонтын сонголт', payment: '30% төлбөр батлагдсаны дараа' },
  { id: '4', name: 'Брендийн дүр төрх', result: 'Эцсийн лого систем, өнгөний систем, фонт, хэрэглээний жишээ', payment: 'Дүр төрх батлагдсанаар' },
  { id: '5', name: 'Брэндбүүк & Хүлээлгэн өгөлт', result: 'Брэндбүүк (PDF), бүх эх файл (AI/EPS/SVG), экспорт файл', payment: '20% үлдэгдэл төлбөр' },
]

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#666666]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
      />
    </label>
  )
}

function ContractsEditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTokenParam = searchParams.get('token')

  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [token, setToken] = useState(initialTokenParam || '')

  // Form State
  const [client, setClient] = useState({
    company: '',
    contact: '',
    email: '',
    project: '',
  })
  const [meta, setMeta] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
    total: '',
    revisions: '2',
  })
  const [proposalNote, setProposalNote] = useState('')
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(defaultDeliverables)
  const [stages, setStages] = useState<StageItem[]>(defaultStages)
  const [customSections, setCustomSections] = useState([
    {
      title: 'Оюуны өмч ба нэмэлт ажил',
      content: 'Тохиролцоогүй нэмэлт ажил нь тусдаа үнийн санал болон бичгээр баталгаажилт шаардлагатай.',
    },
  ])

  const [savingDraft, setSavingDraft] = useState(false)
  const [sendingProposal, setSendingProposal] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [draftSavedSuccess, setDraftSavedSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBriefModal, setShowBriefModal] = useState(false)
  const [showAIScopeModal, setShowAIScopeModal] = useState(false)

  const handleApplyAISuggestion = async (data: {
    deliverables: DeliverableItem[]
    tasks: ProjectTask[]
    stages: StageItem[]
    total: number
    proposalNote: string
    durationDays: number
  }) => {
    if (data.deliverables && data.deliverables.length > 0) {
      setDeliverables(data.deliverables)
    }
    if (data.stages && data.stages.length > 0) {
      setStages(data.stages)
    }

    const today = new Date()
    const endIso = new Date(today.getTime() + (data.durationDays || 28) * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0]

    setMeta((prev) => ({
      ...prev,
      total: String(data.total),
      end: endIso,
    }))

    if (data.proposalNote) {
      setProposalNote(data.proposalNote)
    }

    // Persist tasks and deliverables to project store in background
    if (token) {
      try {
        await fetch(`/api/projects/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contract: {
              tasks: data.tasks,
              deliverables: data.deliverables,
              stages: data.stages,
              total: data.total,
              end: endIso,
              proposalNote: data.proposalNote,
            },
          }),
        })
      } catch (e) {
        console.warn('Failed auto-saving tasks from AI suggestion', e)
      }
    }
  }

  // Load all projects for project picker
  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const res = await fetch('/api/admin/crm')
      if (res.ok) {
        const data = await res.json()
        const projs: Project[] = data.projects || []
        setProjectsList(projs)

        // Select initial project
        const targetToken = initialTokenParam || token || (projs.length > 0 ? projs[0].token : '')
        if (targetToken) {
          const match = projs.find((p) => p.token === targetToken) || projs[0]
          if (match) {
            selectProject(match)
          }
        }
      }
    } catch (e) {
      console.error('Failed loading projects in contracts page', e)
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [initialTokenParam])

  const selectProject = (proj: Project) => {
    setCurrentProject(proj)
    setToken(proj.token)
    setClient({
      company: proj.company || 'Захиалагч байгууллага',
      contact: proj.contactName || 'Захиалагч',
      email: proj.email || '',
      project: proj.name || 'Брэндийн дизайны үйлчилгээ',
    })

    const c = proj.contract
    const today = new Date().toISOString().split('T')[0]
    setMeta({
      number: c?.number || `BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: c?.date || today,
      start: c?.start || today,
      end: c?.end || new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0],
      total: c?.total && c.total > 0 ? String(c.total) : '',
      revisions: String(c?.revisions || 2),
    })

    setProposalNote(c?.proposalNote || '')

    // Use project deliverables if present, otherwise populate from brief
    if (c?.deliverables && c.deliverables.length > 0) {
      setDeliverables(c.deliverables)
    } else if (proj.brief?.answers?.deliverables) {
      const items = proj.brief.answers.deliverables.split(',').map((s, idx) => ({
        id: String(idx + 1),
        name: s.trim(),
        description: 'Бриф дээр тусгагдсан ажлын хэрэгцээ',
        quantity: '1',
        due: c?.end || today,
      }))
      setDeliverables(items.length > 0 ? items : defaultDeliverables)
    } else {
      setDeliverables(defaultDeliverables)
    }

    if (c?.stages && c.stages.length > 0) {
      setStages(c.stages)
    } else {
      setStages(defaultStages)
    }

    if (c?.customSections && c.customSections.length > 0) {
      setCustomSections(c.customSections)
    }

    setSentSuccess(false)
    setDraftSavedSuccess(false)
  }

  const handleSelectChange = (newToken: string) => {
    const found = projectsList.find((p) => p.token === newToken)
    if (found) {
      router.push(`/admin/contracts?token=${newToken}`)
      selectProject(found)
    }
  }

  const amount = Number(meta.total || 0)
  const upfront50 = useMemo(() => (amount ? Math.round(amount * 0.5) : 0), [amount])
  const milestone30 = useMemo(() => (amount ? Math.round(amount * 0.3) : 0), [amount])
  const final20 = useMemo(
    () => (amount ? amount - upfront50 - milestone30 : 0),
    [amount, upfront50, milestone30]
  )

  const addDeliverable = () =>
    setDeliverables((items) => [
      ...items,
      { id: String(Date.now()), name: 'Шинэ ажил', description: '', quantity: '1', due: meta.end },
    ])

  const addStage = () =>
    setStages((items) => [
      ...items,
      { id: String(Date.now()), name: 'Шинэ үе шат', result: '', payment: '' },
    ])

  // Save Draft (isPublishedToClient = false)
  const handleSaveDraft = async () => {
    if (!token) return
    setSavingDraft(true)
    try {
      const res = await fetch(`/api/contracts/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: meta.number,
          date: meta.date,
          start: meta.start,
          end: meta.end,
          total: amount,
          revisions: Number(meta.revisions),
          proposalNote: proposalNote.trim(),
          deliverables,
          stages,
          customSections,
          status: 'draft',
          isPublishedToClient: false,
        }),
      })

      if (res.ok) {
        setDraftSavedSuccess(true)
        setTimeout(() => setDraftSavedSuccess(false), 3000)
        // Refresh local project state
        loadProjects()
      }
    } catch (e) {
      console.error('Failed saving draft', e)
    } finally {
      setSavingDraft(false)
    }
  }

  // Publish / Send Official Proposal to Client (isPublishedToClient = true, status = 'sent')
  const handlePublishProposal = async () => {
    if (!token) return
    if (!amount || amount <= 0) {
      alert('Харилцагчид үнийн санал илгээхийн тулд нийт төсвийг оруулна уу!')
      return
    }

    setSendingProposal(true)
    try {
      const res = await fetch(`/api/contracts/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: meta.number,
          date: meta.date,
          start: meta.start,
          end: meta.end,
          total: amount,
          revisions: Number(meta.revisions),
          proposalNote: proposalNote.trim(),
          deliverables,
          stages,
          customSections,
          status: 'sent',
          isPublishedToClient: true,
          proposalSentAt: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setSentSuccess(true)
        loadProjects()
      }
    } catch (e) {
      console.error('Failed sending proposal', e)
    } finally {
      setSendingProposal(false)
    }
  }

  const copyClientLink = () => {
    if (!token) return
    const url = `${window.location.origin}/client/${token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentProjectForExport: Project = currentProject
    ? {
        ...currentProject,
        contract: {
          ...currentProject.contract,
          number: meta.number,
          date: meta.date,
          start: meta.start,
          end: meta.end,
          total: amount,
          revisions: Number(meta.revisions),
          proposalNote,
          deliverables,
          stages,
          customSections,
        },
      }
    : {
        id: `proj_${token}`,
        token,
        name: client.project,
        company: client.company,
        contactName: client.contact,
        email: client.email,
        type: 'Brand Identity',
        status: 'contract_pending',
        progress: 0,
        due: meta.end,
        createdAt: meta.date,
        contract: {
          number: meta.number,
          date: meta.date,
          start: meta.start,
          end: meta.end,
          total: amount,
          revisions: Number(meta.revisions),
          status: 'sent',
          isPublishedToClient: true,
          proposalNote,
          deliverables,
          stages,
          customSections,
        },
        brief: { answers: {}, messages: [], progress: 0, complete: false },
        assets: [],
      }

  const isContractSigned = currentProject?.contract?.status === 'signed'
  const isContractPublished = currentProject?.contract?.isPublishedToClient === true

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="flex h-[68px] items-center justify-between gap-4 border-b border-[#e0e0e0] bg-white px-6 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xs font-semibold text-[#666666] hover:text-black transition">
            <ArrowLeft className="mr-1 inline size-3.5" /> Дэшбоард
          </Link>
          <span className="text-[#e0e0e0]">/</span>
          <Link href="/admin/crm" className="text-xs font-semibold text-[#666666] hover:text-black transition">
            CRM & Бриф
          </Link>
          <span className="text-[#e0e0e0]">/</span>
          <Link href="/admin/audits" className="text-xs font-semibold text-[#666666] hover:text-black transition">
            Брэнд аудит
          </Link>
          <span className="text-[#e0e0e0]">/</span>
          <h1 className="text-base font-bold tracking-tight text-black">
            Үнийн санал & Гэрээ боловсруулах
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ContractExportButton project={currentProjectForExport} variant="white" buttonText="Экспортлох" />

          <button
            type="button"
            onClick={copyClientLink}
            className="rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
          >
            <Copy className="mr-1.5 inline size-3.5 text-[#666666]" />
            {copied ? 'Хуулагдлаа' : 'Client линк'}
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft || sendingProposal}
            className="rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition disabled:opacity-50"
          >
            <Save className="mr-1.5 inline size-3.5 text-black" />
            {savingDraft ? 'Хадгалж байна...' : draftSavedSuccess ? 'Ноорог хадгалагдлаа' : 'Ноорог хадгалах'}
          </button>

          <button
            type="button"
            onClick={handlePublishProposal}
            disabled={sendingProposal || savingDraft}
            className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white transition hover:bg-[#222222] disabled:opacity-50 shadow-sm"
          >
            <Send className="mr-1.5 inline size-3.5" />
            {sendingProposal ? 'Илгээж байна...' : sentSuccess ? 'Санал илгээгдлээ!' : 'Үнийн санал & Гэрээ санал болгох →'}
          </button>

          <AdminLogoutButton />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="mx-auto grid max-w-[1360px] gap-8 px-6 py-8 xl:grid-cols-[minmax(0,1fr)_440px] sm:px-8">
        {/* Editor Sections */}
        <div className="flex flex-col gap-6">
          {/* PROJECT SELECTOR BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                Төсөл сонгох:
              </span>
              <select
                value={token}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black cursor-pointer shadow-xs max-w-sm truncate"
              >
                {projectsList.map((p) => {
                  const isSigned = p.contract?.status === 'signed'
                  const isPub = p.contract?.isPublishedToClient
                  const badge = isSigned ? '✅ Баталгаажсан' : isPub ? '📨 Санал илгээсэн' : '⏳ Үнийн санал хүлээж буй'
                  return (
                    <option key={p.token} value={p.token}>
                      {p.name} ({p.company}) · {badge}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isContractSigned
                    ? 'border border-[#d2ebd6] bg-[#f0fdf4] text-[#166534]'
                    : currentProject?.status === 'contract_pending'
                    ? 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                    : currentProject?.status === 'proposal_sent'
                    ? 'border border-[#fef08a] bg-[#fefce8] text-[#854d0e]'
                    : 'border border-[#fed7aa] bg-[#fffaf5] text-[#9a3412]'
                }`}
              >
                {isContractSigned
                  ? '✅ Цахим гарын үсэг зурсан'
                  : currentProject?.status === 'contract_pending'
                  ? '✍️ Санал батлагдсан (Гарын үсэг хүлээж буй)'
                  : currentProject?.status === 'proposal_sent'
                  ? `📨 Үнийн санал илгээсэн (${currentProject?.contract?.total?.toLocaleString()} ₮)`
                  : '⏳ Харилцагч үнийн санал хүлээж байна'}
              </span>

              {currentProject && (
                <button
                  type="button"
                  onClick={() => setShowBriefModal(true)}
                  className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-[#fafafa]"
                >
                  <Eye className="size-3.5 text-[#888888]" /> Бриф харах
                </button>
              )}
            </div>
          </div>

          {/* Success Banner when Proposal is Sent */}
          {sentSuccess && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-xs text-[#166534]">
              <CheckCircle2 className="size-5 shrink-0 text-[#166534] mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">
                  Үнийн санал ба хугацааны санал харилцагчийн талбарт амжилттай илгээгдлээ!
                </p>
                <p className="mt-1 leading-relaxed text-[#15803d]">
                  Нийт <strong>{amount.toLocaleString()} ₮</strong> төсөв болон {meta.start} — {meta.end} товлосон хугацаатай санал харилцагчийн хуудсанд гарсан байна. Харилцагч уг саналыг хянаж зөвшөөрсний дараа албан ёсны 10 заалттай гэрээний шат руу автоматаар шилжинэ.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={copyClientLink}
                    className="rounded-full bg-[#166534] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#14532d] transition"
                  >
                    Client холбоосыг хуулах
                  </button>
                  <Link
                    href={`/client/${token}`}
                    target="_blank"
                    className="flex items-center gap-1 font-semibold text-[#166534] hover:underline"
                  >
                    <span>Client хуудсыг нээх</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* CLIENT BRIEF & TYPESAFE RESEARCH SUMMARY */}
          {currentProject?.brief && (
            <section className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-6 sm:p-7 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#fed7aa]/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[#c2410c]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9a3412]">
                    Харилцагчийн AI Бриф & Судалгааны дүгнэлт
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {currentProject.brief.analysis && (
                    <span className="rounded-full bg-white border border-[#fed7aa] px-2.5 py-0.5 text-[10px] font-bold text-[#c2410c]">
                      Бэлэн байдал: {currentProject.brief.analysis.readinessScore}% · {currentProject.brief.analysis.leadQualityTier}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowBriefModal(true)}
                    className="text-xs font-bold text-[#9a3412] hover:underline"
                  >
                    Дэлгэрэнгүй →
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-[#888888]">Хүссэн төрөл</p>
                  <p className="mt-1 font-bold text-black">
                    {currentProject.brief.answers?.projectType || currentProject.type}
                  </p>
                </div>
                <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-[#c2410c]">Харилцагчийн хүссэн хугацаа</p>
                  <p className="mt-1 font-bold text-black">
                    {currentProject.brief.answers?.timeline || 'Тодорхойлоогүй'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-[#c2410c]">Төлөвлөсөн төсвийн хүлээлт</p>
                  <p className="mt-1 font-bold text-black">
                    {currentProject.brief.answers?.budget || 'Тодорхойлоогүй'}
                  </p>
                </div>
                {currentProject.brief.answers?.serviceScope && (
                  <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] font-bold uppercase text-[#166534]">
                      ✅ Харилцагчийн баталгаажуулсан үйлчилгээний цар хүрээ
                    </p>
                    <p className="mt-1 font-bold text-black leading-relaxed">
                      {currentProject.brief.answers.serviceScope}
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-[#888888]">Өнгө аяс & Хэв маяг</p>
                  <p className="mt-1 font-bold text-black">
                    {currentProject.brief.answers?.style || 'Тодорхойлоогүй'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase text-[#888888]">Зорилтот хэрэглэгчид</p>
                  <p className="mt-1 font-medium text-black truncate">
                    {currentProject.brief.answers?.audience || 'Тодорхойлоогүй'}
                  </p>
                </div>

                {currentProject.brief.answers?.deliverables && (
                  <div className="rounded-xl border border-[#fed7aa]/60 bg-white p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] font-bold uppercase text-[#888888]">
                      Харилцагчийн хүссэн материалууд (Touchpoints)
                    </p>
                    <p className="mt-1 font-semibold text-black leading-relaxed">
                      {currentProject.brief.answers.deliverables}
                    </p>
                  </div>
                )}

                {/* OpenAI Scope & Task Proposal CTA */}
                <div className="sm:col-span-2 lg:col-span-3 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black bg-black p-4.5 text-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">OpenAI — Ажлын цар хүрээ, Таск & Гаралт санал болгох</h4>
                      <p className="text-[11px] text-white/70">
                        Харилцагчийн брифт нийцсэн цар хүрээ, дотоод таскууд, болон хүлээлгэн өгөх материалуудыг автоматаар бэлтгэх.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAIScopeModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-[#f0f0f0] transition shadow-xs cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-amber-600" />
                    AI Санал дэвшүүлэгч нээх →
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 01: Information */}
          <section className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                  01 · Талуудын мэдээлэл
                </p>
                <h2 className="mt-1 text-lg font-bold text-black">Үндсэн мэдээлэл</h2>
              </div>
              <span className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-1 text-xs font-mono font-bold text-black">
                {meta.number}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Захиалагч компани" value={client.company} onChange={(v) => setClient({ ...client, company: v })} />
              <Field label="Төлөөлөгчийн нэр" value={client.contact} onChange={(v) => setClient({ ...client, contact: v })} />
              <Field label="И-мэйл" value={client.email} onChange={(v) => setClient({ ...client, email: v })} type="email" />
              <Field label="Төслийн нэр" value={client.project} onChange={(v) => setClient({ ...client, project: v })} />
              <Field label="Гэрээний дугаар" value={meta.number} onChange={(v) => setMeta({ ...meta, number: v })} />
              <Field label="Гүйцэтгэгч" value="Т. Өсөхбаяр (РД: КЮ03252818)" onChange={() => {}} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Гэрээний огноо" value={meta.date} onChange={(v) => setMeta({ ...meta, date: v })} type="date" />
              <Field label="Эхлэх огноо" value={meta.start} onChange={(v) => setMeta({ ...meta, start: v })} type="date" />
              <Field label="Дуусах огноо" value={meta.end} onChange={(v) => setMeta({ ...meta, end: v })} type="date" />
            </div>
          </section>

          {/* 02: Proposed Deliverables */}
          <section className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                  02 · Deliverables
                </p>
                <h2 className="mt-1 text-lg font-bold text-black">Хүлээлгэн өгөх материалууд</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIScopeModal(true)}
                  className="flex items-center gap-1.5 rounded-full border border-black bg-black px-4 py-1.5 text-xs font-bold text-white hover:bg-[#222222] transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="size-3.5 text-amber-300" />
                  AI Санал авах
                </button>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="flex items-center gap-1.5 rounded-full border border-[#cccccc] bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition"
                >
                  <Plus className="size-3.5" /> Нэмэх
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {deliverables.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4">
                  <div className="grid gap-3 sm:grid-cols-[1.2fr_1.8fr_80px_130px_30px]">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        setDeliverables((items) =>
                          items.map((it, i) => (i === index ? { ...it, name: e.target.value } : it))
                        )
                      }
                      placeholder="Материалын нэр"
                      className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-xs font-semibold text-black outline-none focus:border-black"
                    />
                    <input
                      value={item.description}
                      onChange={(e) =>
                        setDeliverables((items) =>
                          items.map((it, i) => (i === index ? { ...it, description: e.target.value } : it))
                        )
                      }
                      placeholder="Тайлбар"
                      className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-xs text-black outline-none focus:border-black"
                    />
                    <input
                      value={item.quantity}
                      onChange={(e) =>
                        setDeliverables((items) =>
                          items.map((it, i) => (i === index ? { ...it, quantity: e.target.value } : it))
                        )
                      }
                      placeholder="Тоо"
                      className="rounded-lg border border-[#e0e0e0] bg-white px-2.5 py-2 text-xs text-center font-bold text-black outline-none focus:border-black"
                    />
                    <input
                      type="date"
                      value={item.due}
                      onChange={(e) =>
                        setDeliverables((items) =>
                          items.map((it, i) => (i === index ? { ...it, due: e.target.value } : it))
                        )
                      }
                      className="rounded-lg border border-[#e0e0e0] bg-white px-2 py-2 text-xs text-black outline-none focus:border-black"
                    />
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDeliverables((items) => items.filter((_, i) => i !== index))}
                        className="text-[#888888] hover:text-[#9a4d13] flex items-center justify-center transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 03: Proposed Pricing & Designer Note */}
          <section className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
              03 · Pricing & Terms
            </p>
            <h2 className="mt-1 text-lg font-bold text-black">
              Санал болгох үнэ & Төлбөрийн нөхцөл
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Нийт үнийн санал (₮)"
                placeholder="Жишээ: 4500000"
                value={meta.total}
                onChange={(v) => setMeta({ ...meta, total: v })}
                type="number"
              />
              <Field
                label="Багтсан засвар, итерацийн тоо"
                value={meta.revisions}
                onChange={(v) => setMeta({ ...meta, revisions: v })}
                type="number"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4">
                <p className="text-xs font-bold text-black">1 · 50% Урьдчилгаа</p>
                <p className="mt-2 text-xl font-bold text-black">{upfront50.toLocaleString()} ₮</p>
                <p className="mt-1 text-[11px] text-[#666666]">Гэрээ хүчин төгөлдөр болсноор</p>
              </div>
              <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4">
                <p className="text-xs font-bold text-black">2 · 30% Дизайн батлагдсанаар</p>
                <p className="mt-2 text-xl font-bold text-black">{milestone30.toLocaleString()} ₮</p>
                <p className="mt-1 text-[11px] text-[#666666]">Дизайн боловсруулалт батлагдсаны дараа</p>
              </div>
              <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4">
                <p className="text-xs font-bold text-black">3 · 20% Үлдэгдэл төлбөр</p>
                <p className="mt-2 text-xl font-bold text-black">{final20.toLocaleString()} ₮</p>
                <p className="mt-1 text-[11px] text-[#666666]">Нийт ажил бүрэн хүлээлгэн өгснөөр</p>
              </div>
            </div>

            {/* Proposal Note from Designer */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-[#666666] mb-1.5">
                Дизайнерын тайлбар тэмдэглэл (Харилцагчийн гэрээний хуудсанд харагдана)
              </label>
              <textarea
                value={proposalNote}
                onChange={(e) => setProposalNote(e.target.value)}
                placeholder="Жишээ: Таны ирүүлсэн бриф дээр үндэслэн 4 долоо хоногийн хугацаанд 3 чиглэлийн лого концепц болон брэндбүүк бэлтгэж хүлээлгэн өгөхөөр санал болгож байна..."
                rows={3}
                className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-3.5 text-xs text-black outline-none focus:border-black focus:bg-white transition resize-none"
              />
            </div>
          </section>
        </div>

        {/* Live Contract Preview Sidebar */}
        <aside className="h-fit xl:sticky xl:top-6">
          <div className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#fafafa] px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                  Бодит харагдац
                </p>
                <p className="text-xs font-bold text-black">Гэрээний санал & нөхцөл</p>
              </div>
              <FileText className="size-4 text-[#888888]" />
            </div>

            <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-6 text-xs leading-relaxed text-[#444444]">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ
              </p>
              <h3 className="mt-2 text-center text-base font-bold text-black">{client.project}</h3>

              <div className="mt-5 grid grid-cols-2 gap-2 border-y border-[#e0e0e0] py-3.5 text-xs">
                <span className="text-[#888888]">Захиалагч:</span>
                <strong className="text-right text-black">{client.company}</strong>
                <span className="text-[#888888]">Гүйцэтгэгч:</span>
                <strong className="text-right text-black">Т. Өсөхбаяр</strong>
                <span className="text-[#888888]">Гэрээний №:</span>
                <strong className="text-right text-black">{meta.number}</strong>
                <span className="text-[#888888]">Нийт санал:</span>
                <strong className="text-right text-black">{amount.toLocaleString()} ₮</strong>
                <span className="text-[#888888]">Хугацаа:</span>
                <strong className="text-right text-black">{meta.start} — {meta.end}</strong>
              </div>

              {proposalNote && (
                <div className="mt-4 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-3 text-[11px] text-[#7c2d12]">
                  <p className="font-bold text-[#9a3412] mb-1">Дизайнерын тайлбар:</p>
                  <p>{proposalNote}</p>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-3 text-[11px]">
                <p className="font-bold text-black mb-1.5">3 үе шаттай төлбөрийн нөхцөл:</p>
                <div className="flex justify-between text-[#666666]">
                  <span>50% Урьдчилгаа:</span>
                  <strong className="text-black">{upfront50.toLocaleString()} ₮</strong>
                </div>
                <div className="flex justify-between text-[#666666] mt-1">
                  <span>30% Дизайн батлагдсанаар:</span>
                  <strong className="text-black">{milestone30.toLocaleString()} ₮</strong>
                </div>
                <div className="flex justify-between text-[#666666] mt-1">
                  <span>20% Үлдэгдэл:</span>
                  <strong className="text-black">{final20.toLocaleString()} ₮</strong>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <p className="font-bold text-black">Хүлээлгэн өгөх материалууд ({deliverables.length}):</p>
                {deliverables.map((d, i) => (
                  <p key={d.id} className="text-[#555555]">
                    {i + 1}. {d.name} — {d.description || 'Тодорхойлолтгүй'}
                  </p>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs">
                <p className="font-bold text-black">Цахим гарын үсэг</p>
                <p className="mt-1 text-[#666666]">
                  {isContractSigned
                    ? '✅ Харилцагч цахим гарын үсгээр баталгаажуулсан'
                    : isContractPublished
                    ? '⏳ Харилцагчид илгээгдсэн. Гарын үсэг зурахаар хүлээж буй'
                    : 'Үнийн саналаа илгээсний дараа харилцагч гарын үсэг зурах боломжтой болно.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handlePublishProposal}
              disabled={sendingProposal}
              className="flex items-center justify-center gap-2 rounded-full bg-black py-3.5 text-xs font-bold text-white shadow-sm hover:bg-[#222222] transition disabled:opacity-50"
            >
              <Send className="size-4" />
              {sendingProposal ? 'Илгээж байна...' : 'Үнийн санал & Гэрээ санал болгох (Харилцагчид илгээх)'}
            </button>

            <button
              type="button"
              onClick={copyClientLink}
              className="flex items-center justify-center gap-2 rounded-full border border-[#e0e0e0] bg-white py-3 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              <Link2 className="size-4" />
              {copied ? 'Хуулагдлаа!' : 'Харилцагчийн талбарын линк хуулах'}
            </button>

            {token && (
              <Link
                href={`/client/${token}`}
                target="_blank"
                className="flex items-center justify-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white py-2.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
              >
                Client хуудсыг шалгах <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* Brief Detail Modal */}
      <BriefAnalysisDetailModal
        project={currentProject}
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        onUpdate={loadProjects}
      />

      {/* OpenAI Scope & Tasks Advisor Modal */}
      <AIScopeAdvisorModal
        isOpen={showAIScopeModal}
        onClose={() => setShowAIScopeModal(false)}
        project={currentProject}
        onApplyAll={handleApplyAISuggestion}
      />
    </main>
  )
}

export default function AdminContractsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-xs text-[#888888]">
          Гэрээ боловсруулах системийг ачаалж байна...
        </div>
      }
    >
      <ContractsEditorContent />
    </Suspense>
  )
}
