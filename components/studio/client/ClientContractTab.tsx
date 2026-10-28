'use client'

import React, { useState, useRef, type PointerEvent } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  FileText,
  Printer,
  Eraser,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  Copy,
  Check,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import ContractExportButton from '@/components/studio/ContractExportButton'
import {
  CONTRACT_PROCESS_STAGES,
  getOfficialContractArticles,
} from '@/lib/contract-template'

function SignaturePad({ onDraw }: { onDraw: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const box = canvas.getBoundingClientRect()
    const x = (event.clientX - box.left) * (canvas.width / box.width)
    const y = (event.clientY - box.top) * (canvas.height / box.height)

    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#000000'

    if (event.type === 'pointerdown') {
      drawing.current = true
      canvas.setPointerCapture(event.pointerId)
      context.beginPath()
      context.moveTo(x, y)
    } else if (drawing.current) {
      context.lineTo(x, y)
      context.stroke()
    }

    if (event.type === 'pointerup' || event.type === 'pointerleave') {
      if (drawing.current) {
        drawing.current = false
        onDraw(canvas.toDataURL('image/png'))
      }
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
    onDraw(null)
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-dashed border-[#cccccc] bg-white">
        <canvas
          ref={canvasRef}
          width={900}
          height={240}
          className="h-44 w-full touch-none cursor-crosshair"
          onPointerDown={draw}
          onPointerMove={draw}
          onPointerUp={draw}
          onPointerLeave={draw}
        />
        <span className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-medium text-[#888888]">
          Гарын үсгээ хулгана эсвэл хуруугаараа энд зурна уу
        </span>
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 flex items-center text-xs font-semibold text-[#666666] hover:text-black transition"
      >
        <Eraser className="mr-1 inline size-3.5" /> Цэвэрлэх
      </button>
    </div>
  )
}

interface ClientContractTabProps {
  project: Project
  token: string
  onProjectUpdated: (updated: Project) => void
}

export default function ClientContractTab({
  project,
  token,
  onProjectUpdated,
}: ClientContractTabProps) {
  const isContractSigned = project.contract?.status === 'signed'
  const isProposalAccepted =
    Boolean(project.contract?.proposalAcceptedAt) ||
    project.status === 'contract_pending' ||
    project.status === 'active' ||
    isContractSigned

  const isProposalPublished = Boolean(
    project.contract &&
      project.contract.isPublishedToClient &&
      project.contract.total > 0 &&
      project.contract.status !== 'draft'
  )

  const isWaitingForProposal =
    !isProposalPublished ||
    project.status === 'lead' ||
    project.status === 'brief_pending' ||
    project.status === 'brief_submitted'

  const isReviewingProposal = isProposalPublished && !isProposalAccepted

  // Signing form state
  const [contractName, setContractName] = useState(project.contactName || '')
  const [contractEmail, setContractEmail] = useState(project.email || '')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [contractConfirmed, setContractConfirmed] = useState(false)
  const [submittingContract, setSubmittingContract] = useState(false)

  // Proposal state
  const [acceptingProposal, setAcceptingProposal] = useState(false)
  const [showProposalBox, setShowProposalBox] = useState(false)
  const [proposalNote, setProposalNote] = useState('')
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [proposalSentSuccess, setProposalSentSuccess] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)

  const handleAcceptProposal = async () => {
    setAcceptingProposal(true)
    try {
      const res = await fetch(`/api/contracts/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_proposal' }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.project) {
          onProjectUpdated(data.project)
        }
      }
    } catch (e) {
      console.error('Failed accepting proposal', e)
    } finally {
      setAcceptingProposal(false)
    }
  }

  const handleSignContract = async () => {
    if (!signatureData || !contractConfirmed || !contractName.trim() || submittingContract) return
    setSubmittingContract(true)

    try {
      const signedContract = {
        ...project.contract,
        status: 'signed' as const,
        clientName: contractName.trim(),
        clientEmail: contractEmail.trim(),
        signedAt: new Date().toISOString(),
        signatureDataUrl: signatureData,
      }

      const res = await fetch(`/api/contracts/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: contractName.trim(),
          clientEmail: contractEmail.trim(),
          signatureDataUrl: signatureData,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        onProjectUpdated(data.project)
      }
    } catch (e) {
      console.error('Failed signing contract', e)
    } finally {
      setSubmittingContract(false)
    }
  }

  const handleSendProposal = async () => {
    if (!proposalNote.trim() || submittingProposal) return
    setSubmittingProposal(true)

    try {
      const updatedContract = {
        ...project.contract,
        clientNote: proposalNote.trim(),
        proposals: [
          ...(project.contract.proposals || []),
          {
            id: `prop_${Date.now()}`,
            authorRole: 'CLIENT' as const,
            authorName: project.contactName || 'Захиалагч',
            note: proposalNote.trim(),
            createdAt: new Date().toISOString(),
            status: 'pending' as const,
          },
        ],
      }

      const res = await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract: updatedContract }),
      })

      if (res.ok) {
        onProjectUpdated({ ...project, contract: updatedContract })
        setProposalNote('')
        setShowProposalBox(false)
        setProposalSentSuccess(true)
        setTimeout(() => setProposalSentSuccess(false), 4000)
      }
    } catch (e) {
      console.error('Failed submitting contract proposal', e)
    } finally {
      setSubmittingProposal(false)
    }
  }

  // --------------------------------------------------------------------------
  // STAGE 1: IF WAITING FOR DESIGNER'S PROPOSAL (Brief submitted, awaiting price & timeline)
  // --------------------------------------------------------------------------
  if (isWaitingForProposal) {
    const answers = project.brief?.answers || {}

    return (
      <div className="mt-8 flex flex-col gap-6">
        {/* Top Status Header */}
        <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#9a3412] text-white shadow-sm">
                <Clock className="size-5" />
              </div>
              <div>
                <span className="rounded-full border border-[#fed7aa] bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a3412]">
                  ⏳ Үнийн санал тооцоолж буй
                </span>
                <h3 className="mt-1 text-lg sm:text-xl font-bold text-black">
                  Үнийн санал & Ажлын хугацааг дизайнер тооцоолж байна
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/client/brief/${token}`}
                className="flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-white px-4 py-2 text-xs font-semibold text-[#9a3412] hover:bg-[#fff1e6] transition"
              >
                <span>Бриф шалгах / засах</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#7c2d12]">
            Таны ирүүлсэн бриф болон төслийн шаардлагыг дизайнер <strong>Т. Өсөхбаяр</strong> нягтлан үзэж байна. Төслийн цар хүрээнд нийцсэн үнийн санал болон ажлын нарийвчилсан хуваарийг боловсруулан энэхүү талбарт удахгүй санал болгох болно.
          </p>

          {/* Workflow Steps Indicator */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#fed7aa]/60 pt-6">
            <div className="rounded-xl border border-[#d2ebd6] bg-[#f0fdf4] p-3">
              <p className="text-[10px] font-bold text-[#166534] uppercase tracking-wider">Алхам 1</p>
              <p className="mt-1 text-xs font-bold text-black">Бриф илгээсэн</p>
              <p className="mt-0.5 text-[11px] text-[#166534]">✅ Хүлээн авсан</p>
            </div>

            <div className="rounded-xl border border-[#fed7aa] bg-white p-3 shadow-xs">
              <p className="text-[10px] font-bold text-[#c2410c] uppercase tracking-wider">Алхам 2</p>
              <p className="mt-1 text-xs font-bold text-black">Дизайнер тооцоолох</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#c2410c]">⏳ Яг одоо хийгдэж буй</p>
            </div>

            <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-3 opacity-70">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Алхам 3</p>
              <p className="mt-1 text-xs font-bold text-black">Үнийн санал батлах</p>
              <p className="mt-0.5 text-[11px] text-[#888888]">Хүлээгдэж буй</p>
            </div>

            <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-3 opacity-70">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Алхам 4</p>
              <p className="mt-1 text-xs font-bold text-black">Цахим гарын үсэг</p>
              <p className="mt-0.5 text-[11px] text-[#888888]">Гэрээ батлах</p>
            </div>
          </div>
        </div>

        {/* Submitted Brief Summary Card */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="border-b border-[#e0e0e0] pb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                Хүлээн авсан хүсэлт
              </p>
              <h4 className="mt-1 text-base font-bold text-black">
                Таны баталгаажуулсан бриф & ажлын шаардлагууд
              </h4>
            </div>
            <span className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3 py-1 text-xs font-mono text-[#666666]">
              {project.token}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Төслийн нэр & Компани
              </span>
              <p className="mt-1 text-sm font-bold text-black">{project.name}</p>
              <p className="text-xs text-[#666666]">{project.company}</p>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Төлөөлөгч & Холбогдох
              </span>
              <p className="mt-1 text-sm font-bold text-black">{project.contactName}</p>
              <p className="text-xs text-[#666666]">{project.phone || project.email || 'Бүртгэлтэй'}</p>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Төслийн чиглэл
              </span>
              <p className="mt-1 text-sm font-bold text-black">
                {answers.projectType || project.type || 'Brand Identity'}
              </p>
              <p className="text-xs text-[#666666]">Дизайны үйлчилгээ</p>
            </div>

            {answers.timeline && (
              <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2410c]">
                  Хүссэн хугацаа (Deadline)
                </span>
                <p className="mt-1 text-sm font-bold text-black">
                  {answers.timeline}
                </p>
              </div>
            )}

            {answers.budget && (
              <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2410c]">
                  Төлөвлөсөн төсвийн хүлээлт
                </span>
                <p className="mt-1 text-sm font-bold text-black">
                  {answers.budget}
                </p>
              </div>
            )}

            {answers.serviceScope && (
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                  ✅ Баталгаажуулсан үйлчилгээний цар хүрээ
                </span>
                <p className="mt-1 text-xs font-bold text-black leading-relaxed">
                  {answers.serviceScope}
                </p>
              </div>
            )}

            {answers.goal && (
              <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  Төслийн гол зорилго
                </span>
                <p className="mt-1 text-xs text-black leading-relaxed">
                  {answers.goal}
                </p>
              </div>
            )}

            {answers.deliverables && (
              <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4 sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  Хүссэн хүлээлгэн өгөх материалууд (Deliverables)
                </span>
                <p className="mt-1 text-xs font-semibold text-black leading-relaxed">
                  {answers.deliverables}
                </p>
              </div>
            )}

            {answers.style && (
              <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  Өнгө аяс & Хэв маяг
                </span>
                <p className="mt-1 text-xs text-black leading-relaxed">
                  {answers.style}
                </p>
              </div>
            )}

            {answers.audience && (
              <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  Зорилтот хэрэглэгчид
                </span>
                <p className="mt-1 text-xs text-black leading-relaxed">
                  {answers.audience}
                </p>
              </div>
            )}
          </div>

          {/* Reassuring Banner */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs text-[#555555]">
            <Info className="size-4 shrink-0 text-black mt-0.5" />
            <div>
              <p className="font-semibold text-black">
                Дараагийн алхам юу вэ?
              </p>
              <p className="mt-0.5 leading-relaxed">
                Дизайнер үнийн санал, хугацааны нарийвчилсан хуваариа системд оруулж баталгаажуулан танд илгээмэгц, энэхүү талбарт дизайнерын албан ёсны үнийн санал гарч ирэх бөгөөд та хүлээн зөвшөөрснөөр албан ёсны 10 заалттай гэрээний шат руу шилжих болно.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate payment milestones
  const totalAmount = project.contract.total || 0
  const upfront50 = Math.round(totalAmount * 0.5)
  const milestone30 = Math.round(totalAmount * 0.3)
  const final20 = totalAmount - upfront50 - milestone30

  // --------------------------------------------------------------------------
  // STAGE 2: IF PROPOSAL IS PUBLISHED BUT NOT YET ACCEPTED BY CLIENT (Proposal Review)
  // --------------------------------------------------------------------------
  if (isReviewingProposal) {
    return (
      <div className="mt-8 flex flex-col gap-6">
        {/* Proposal Review Hero Card */}
        <div className="rounded-2xl border border-black bg-black text-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-black shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  📋 Үнийн санал & Хугацаа бэлэн боллоо
                </span>
                <h3 className="mt-1 text-lg sm:text-2xl font-bold text-white tracking-tight">
                  Дизайнерын албан ёсны үнийн санал
                </h3>
              </div>
            </div>

            <button
              onClick={handleAcceptProposal}
              disabled={acceptingProposal}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-black hover:bg-[#f0f0f0] transition shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="size-4 text-emerald-600" />
              {acceptingProposal ? 'Батлаж байна...' : 'Үнийн санал & хугацааг зөвшөөрөх (Гэрээ рүү орох) →'}
            </button>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed max-w-3xl">
            Дизайнер <strong>Т. Өсөхбаяр</strong> таны ирүүлсэн брифтэй танилцаж, төслийн цар хүрээнд тохирсон дараах бодит үнэ болон товлосон хугацааны саналаа боловсрууллаа. Та уг саналыг хүлээн зөвшөөрснөөр дараагийн шат болох албан ёсны 10 заалттай гэрээний шат руу шилжинэ.
          </p>

          {/* 4 Key Proposal Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/20 pt-6">
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Нийт үнийн санал</span>
              <p className="mt-1 text-lg font-black text-white">{totalAmount.toLocaleString()} ₮</p>
              <p className="text-[10px] text-white/70">НӨАТ ороогүй цэвэр дүн</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Ажлын хугацаа</span>
              <p className="mt-1 text-sm font-bold text-white truncate">
                {project.contract.start || '2026.04.22'} — {project.contract.end || '2026.06.30'}
              </p>
              <p className="text-[10px] text-white/70">Товлосон дуусах хугацаа</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Төлбөрийн нөхцөл</span>
              <p className="mt-1 text-sm font-bold text-white">50% · 30% · 20%</p>
              <p className="text-[10px] text-white/70">Урьдчилгаа {upfront50.toLocaleString()} ₮</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Үнэгүй засвар</span>
              <p className="mt-1 text-lg font-black text-white">{project.contract.revisions || 3} удаа</p>
              <p className="text-[10px] text-white/70">Үе шат бүрт багтсан</p>
            </div>
          </div>
        </div>

        {/* Designer Note (if present) */}
        {project.contract.proposalNote && (
          <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-5 sm:p-6 text-xs text-[#7c2d12]">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#c2410c] block">
              💬 Дизайнерын зурвас & Тайлбар:
            </span>
            <p className="mt-2 text-sm text-black leading-relaxed whitespace-pre-line">
              {project.contract.proposalNote}
            </p>
          </div>
        )}

        {/* Proposed Deliverables & Stages Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deliverables List */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <div className="border-b border-[#e0e0e0] pb-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#888888]">
                Хүлээлгэн өгөх ажлууд
              </span>
              <h4 className="mt-0.5 text-base font-bold text-black">
                Багтсан материалууд ({project.contract.deliverables?.length || 0})
              </h4>
            </div>

            <div className="flex flex-col gap-2.5">
              {project.contract.deliverables?.map((item, idx) => (
                <div key={item.id || idx} className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-black">
                    <span>{idx + 1}. {item.name}</span>
                    <span className="text-[10px] text-[#888888] font-normal font-mono">{item.due || project.contract.end}</span>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-[#666666] leading-relaxed">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Schedule (Stages) */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <div className="border-b border-[#e0e0e0] pb-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#888888]">
                Төлбөрийн хуваарь
              </span>
              <h4 className="mt-0.5 text-base font-bold text-black">
                3 үе шаттай санхүүжилт
              </h4>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3.5 text-xs">
                <div className="flex items-center justify-between font-bold text-black">
                  <span>1-р үе: 50% Урьдчилгаа</span>
                  <span className="font-mono text-emerald-700">{upfront50.toLocaleString()} ₮</span>
                </div>
                <p className="mt-1 text-[#555555]">Гэрээ байгуулж, судалгаа & эхний концепц эхлэхэд</p>
              </div>

              <div className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 text-xs">
                <div className="flex items-center justify-between font-bold text-black">
                  <span>2-р үе: 30% Дизайн батлагдсанаар</span>
                  <span className="font-mono text-black">{milestone30.toLocaleString()} ₮</span>
                </div>
                <p className="mt-1 text-[#555555]">Лого хувилбар болон үндсэн чиглэл батлагдсаны дараа</p>
              </div>

              <div className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 text-xs">
                <div className="flex items-center justify-between font-bold text-black">
                  <span>3-р үе: 20% Эцсийн хүлээлгэн өгөлт</span>
                  <span className="font-mono text-black">{final20.toLocaleString()} ₮</span>
                </div>
                <p className="mt-1 text-[#555555]">Бүх эх вектор файл, брэндбүүк бүрэн хүлээлгэн өгөхөд</p>
              </div>
            </div>

            {/* Bank details card for advance payment */}
            <div className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5 text-xs">
              <div className="flex items-center justify-between text-[#888888] text-[10px] uppercase font-bold tracking-wider">
                <span>Гүйцэтгэгчийн хүлээн авах данс</span>
                <span className="text-emerald-700 font-semibold">Баталгаажсан</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-black font-bold">Хаан банк</span>
                  <span className="text-[#cccccc]">·</span>
                  <span className="font-mono font-bold text-black text-sm tracking-wide">5608120471</span>
                  <span className="text-[#cccccc]">·</span>
                  <span className="text-[#555555]">Т. Өсөхбаяр</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('5608120471')
                    setCopiedBank(true)
                    setTimeout(() => setCopiedBank(false), 2000)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-2.5 py-1 text-[11px] font-semibold text-black hover:bg-[#f0f0f0] transition shadow-2xs"
                >
                  {copiedBank ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  {copiedBank ? 'Данс хуулагдлаа' : 'Данс хуулах'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProposalBox(!showProposalBox)}
              className="rounded-full border border-[#cccccc] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:border-black transition"
            >
              💬 Өөрчлөлт / Засвар оруулах хүсэлт илгээх
            </button>
            <Link
              href={`/client/brief/${token}`}
              className="text-xs font-semibold text-[#666666] hover:text-black hover:underline px-2"
            >
              Илгээсэн бриф шалгах →
            </Link>
          </div>

          <button
            onClick={handleAcceptProposal}
            disabled={acceptingProposal}
            className="flex items-center gap-2 rounded-full bg-black px-8 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#222222] transition disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            {acceptingProposal ? 'Батлаж байна...' : 'Үнийн санал & хугацааг зөвшөөрөх (Гэрээ рүү орох) →'}
          </button>
        </div>

        {/* Proposal Negotiation Drawer */}
        {showProposalBox && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <h4 className="text-sm font-bold text-black">
              Үнийн санал, хугацаа эсвэл ажлын цар хүрээнд санал/өөрчлөлт оруулах
            </h4>
            <p className="mt-1 text-xs text-[#666666]">
              Төсвийн хэмжээ, ажлын хугацаа эсвэл хүлээлгэн өгөх файлууд дээр өөрчлөх хүсэлтээ бичнэ үү. Дизайнерт шууд мэдэгдэх болно.
            </p>
            <textarea
              value={proposalNote}
              onChange={(e) => setProposalNote(e.target.value)}
              placeholder="Жишээ нь: Төслийн хугацааг 7 хоногоор наашлуулах боломжтой юу? Эсвэл сав баглаа боодлын загварыг нэмж болох уу?..."
              rows={3}
              className="mt-3 w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-3 text-xs text-black outline-none focus:border-black focus:bg-white"
            />
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowProposalBox(false)}
                className="text-xs text-[#888888] hover:text-black"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleSendProposal}
                disabled={submittingProposal || !proposalNote.trim()}
                className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white hover:bg-[#222222] disabled:opacity-40"
              >
                {submittingProposal ? 'Илгээж байна...' : 'Дизайнерт хүсэлт илгээх'}
              </button>
            </div>
          </div>
        )}

        {proposalSentSuccess && (
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs font-semibold text-[#166534]">
            ✅ Таны өөрчлөлт оруулах хүсэлт дизайнерт амжилттай хүрлээ! Дизайнер танилцаад шинэчилсэн санал илгээнэ.
          </div>
        )}
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // STAGE 3: IF PROPOSAL IS ACCEPTED (Official 10-Article Contract Ready for Signature)
  // --------------------------------------------------------------------------

  const officialArticles = getOfficialContractArticles({
    projectName: project.name || '',
    company: project.company || '',
    contactName: project.contactName || '',
    totalAmount,
    startDate: project.contract.start || project.contract.date || '2026.04.22',
    endDate: project.contract.end || '2026.06.30',
  })

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Contract Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#888888]">
              Албан ёсны гэрээ · {project.contract.number}
            </p>
            <h3 className="text-base font-bold text-black">
              Ажил гүйцэтгэх цахим гэрээ (10 заалт)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3.5 py-1 text-xs font-bold ${
              isContractSigned
                ? 'border border-[#d2ebd6] bg-[#f0fdf4] text-[#166534]'
                : 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
            }`}
          >
            {isContractSigned ? '✅ Баталгаажсан' : '⏳ Гарын үсэг хүлээж буй'}
          </span>

          <ContractExportButton project={project} />
        </div>
      </div>

      {/* Printable Official Contract Paper */}
      <article className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="border-b border-[#e0e0e0] pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
              АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ · {project.contract.number}
            </p>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-black">
              {project.name}
            </h2>
            <p className="mt-1 text-xs text-[#666666]">
              Огноо: {project.contract.date} · Улаанбаатар хот · Хувилбар 1.0 (Цахим)
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-black">{project.company}</p>
            <p className="text-xs text-[#666666]">Төлөөлөгч: {project.contactName}</p>
          </div>
        </div>

        {/* Official Legal Preamble */}
        <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 text-xs leading-relaxed text-[#444444]">
          <p>
            Энэхүү гэрээг нэг талаас <strong>{project.company || 'Захиалагч'}</strong> (цаашид «Захиалагч» гэх),
            төлөөлж <strong>{project.contactName || 'Захиалагч'}</strong>, нөгөө талаас иргэн <strong>Т. Өсөхбаяр</strong> (РД: КЮ03252818)
            (цаашид «Ажил гүйцэтгэгч» гэх) нар харилцан тохиролцож дараах нөхцөлөөр байгуулав.
          </p>
        </div>

        {/* Designer Proposal Note (if provided) */}
        {project.contract.proposalNote && (
          <div className="mt-6 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-5 print:hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#c2410c]" />
              <span className="text-xs font-bold text-[#9a3412]">
                Дизайнерын үнийн санал & хугацааны тайлбар
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#7c2d12] whitespace-pre-line font-medium">
              {project.contract.proposalNote}
            </p>
          </div>
        )}

        {/* Financial & 3-Tier Payment Terms */}
        <div className="mt-8 grid gap-4 rounded-xl bg-[#fafafa] border border-[#e0e0e0] p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Нийт төсөв (НӨАТ орсон)</p>
            <p className="mt-1 text-2xl font-black text-black">
              {totalAmount.toLocaleString()} ₮
            </p>
            <p className="mt-1 text-[11px] text-[#666666]">3 үе шаттай төлбөр</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">1 · 50% Урьдчилгаа</p>
            <p className="mt-1 text-lg font-bold text-black">{upfront50.toLocaleString()} ₮</p>
            <p className="mt-1 text-[11px] text-[#666666]">Гэрээ хүчин төгөлдөр болсноор</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">2 · 30% Дизайн батлагдсанаар</p>
            <p className="mt-1 text-lg font-bold text-black">{milestone30.toLocaleString()} ₮</p>
            <p className="mt-1 text-[11px] text-[#666666]">Дизайн боловсруулалт батлагдсаны дараа</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">3 · 20% Үлдэгдэл</p>
            <p className="mt-1 text-lg font-bold text-black">{final20.toLocaleString()} ₮</p>
            <p className="mt-1 text-[11px] text-[#666666]">Ажлыг бүрэн хүлээлгэн өгснөөр</p>
          </div>
        </div>

        {/* Bank Account Quick Action Banner */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0e0e0] bg-white px-5 py-3 text-xs shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Төлбөр шилжүүлэх данс:</span>
            <span className="font-bold text-black">Хаан банк</span>
            <span className="text-[#cccccc]">·</span>
            <span className="font-mono font-bold text-black tracking-wide text-sm">5608120471</span>
            <span className="text-[#cccccc]">·</span>
            <span className="text-[#555555]">Хүлээн авагч: Т. Өсөхбаяр</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText('5608120471')
              setCopiedBank(true)
              setTimeout(() => setCopiedBank(false), 2000)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition"
          >
            {copiedBank ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copiedBank ? 'Данс хуулагдлаа' : 'Дансны дугаар хуулах'}
          </button>
        </div>

        {/* Schedule & Revision Note */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-5 py-3 text-xs text-[#555555]">
          <div>
            <span className="text-[#888888]">Гүйцэтгэх хугацаа: </span>
            <strong className="text-black font-semibold">{project.contract.start} — {project.contract.end}</strong>
          </div>
          <div>
            <span className="text-[#888888]">Засварын үе шат: </span>
            <strong className="text-black font-semibold">{project.contract.revisions} удаагийн албан ёсны итераци багтсан</strong>
          </div>
        </div>

        {/* Official 10 Articles */}
        <div className="mt-10 flex flex-col gap-6 text-xs leading-relaxed text-[#444444]">
          {officialArticles.map((art) => (
            <section key={art.key} className="rounded-xl border border-[#e8e8e8] bg-[#fcfcfc] p-5 sm:p-6">
              <h4 className="text-xs font-bold text-black mb-3">{art.title}</h4>
              <div className="space-y-2">
                {art.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-[#555555] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {art.hasTable && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-[#e0e0e0] bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e0e0e0] bg-[#fafafa]">
                        <th className="py-2.5 px-3 font-bold text-[#888888] w-12 text-center">№</th>
                        <th className="py-2.5 px-3 font-bold text-black w-44">Үе шат</th>
                        <th className="py-2.5 px-3 font-bold text-black">Хийгдэх ажлын агуулга</th>
                        <th className="py-2.5 px-3 font-bold text-black w-56">Хүлээгдэх үр дүн</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef]">
                      {CONTRACT_PROCESS_STAGES.map((stg) => (
                        <tr key={stg.no} className="hover:bg-[#fafafa]/50 transition-colors">
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#888888]">{stg.no}</td>
                          <td className="py-3 px-3 font-bold text-black align-top">{stg.name}</td>
                          <td className="py-3 px-3 text-[#555555] leading-relaxed align-top">{stg.content}</td>
                          <td className="py-3 px-3 text-black font-medium leading-relaxed align-top">{stg.expectedResult}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Scope of Work & Deliverables List directly in Contract Paper */}
        {project.contract.deliverables && project.contract.deliverables.length > 0 && (
          <div className="mt-10 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e0e0e0] pb-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                Хүлээлгэн өгөх материалуудын албан ёсны жагсаалт (Ажлын цар хүрээ)
              </h4>
              <span className="text-[11px] font-mono text-[#888888]">
                Нийт {project.contract.deliverables.length} ажил
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {project.contract.deliverables.map((del, idx) => (
                <div key={del.id || idx} className="rounded-xl border border-[#e8e8e8] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-black">
                      {idx + 1}. {del.name}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-[#666666]">
                      Үзүүлэлт: {del.quantity} · Хугацаа: {del.due}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#555555] leading-relaxed">
                    {del.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Client Proposal Option before signing */}
            {!isContractSigned && (
              <div className="mt-6 border-t border-[#e0e0e0] pt-4 print:hidden">
                {!showProposalBox ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e0e0e0] rounded-xl p-4">
                    <div>
                      <p className="text-xs font-bold text-black">
                        Гэрээний нөхцөл, хийгдэх ажлуудад санал оруулах уу?
                      </p>
                      <p className="text-[11px] text-[#666666] mt-0.5">
                        Хийгдэх ажил нэмэх, хасах эсвэл засах саналаа дизайнерт шууд илгээх боломжтой.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProposalBox(true)}
                      className="rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-black hover:text-white transition-all shrink-0"
                    >
                      ✏️ Санал, өөрчлөлт оруулах хүсэлт илгээх
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-[#9a3412]">
                        Гэрээний санал / Хийгдэх ажлуудад өөрчлөлт оруулах хүсэлт
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowProposalBox(false)}
                        className="text-xs text-[#888888] hover:text-black"
                      >
                        Хаах
                      </button>
                    </div>
                    <p className="text-[11px] text-[#7c2d12] mt-1 mb-3">
                      Та нэмэх, хасах эсвэл засахыг хүссэн саналаа энд бичиж дизайнерт илгээнэ үү. Дизайнер хүлээн аваад гэрээний нөхцөлийг шинэчлэх болно.
                    </p>
                    <textarea
                      value={proposalNote}
                      onChange={(e) => setProposalNote(e.target.value)}
                      placeholder="Жишээ: Лого дээр 3 биш 4 чиглэл авмаар байна, мөн сошиал медиа постын 5 загвар нэмж оруулаад хугацааг 1 долоо хоногоор наашлуулж болох уу?..."
                      rows={3}
                      className="w-full rounded-xl border border-[#fed7aa] bg-white p-3 text-xs text-black outline-none focus:border-black resize-none"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowProposalBox(false)}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#888888] hover:text-black"
                      >
                        Болих
                      </button>
                      <button
                        type="button"
                        disabled={!proposalNote.trim() || submittingProposal}
                        onClick={handleSendProposal}
                        className="rounded-full bg-black px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] disabled:opacity-40"
                      >
                        {submittingProposal ? 'Илгээж байна...' : 'Санал дизайнерт илгээх →'}
                      </button>
                    </div>
                  </div>
                )}

                {proposalSentSuccess && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-xs text-[#166534]">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Таны санал дизайнерт амжилттай хүргэгдлээ. Дизайнер шалгаад гэрээнд өөрчлөлт оруулах болно.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Signature Section */}
        <div className="mt-12 border-t border-[#e0e0e0] pt-8">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black mb-6">
            Талуудын дижитал гарын үсэг
          </h4>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Designer Signature Box */}
            <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Гүйцэтгэгч тал</p>
              <p className="mt-2 text-sm font-bold text-black">Т. Өсөхбаяр</p>
              <p className="text-xs text-[#666666]">РД: КЮ03252818</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#166534] font-semibold">
                <CheckCircle2 className="size-4" /> Цахим гарын үсэг баталгаажсан
              </div>
            </div>

            {/* Client Signature Box */}
            <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Захиалагч тал</p>
              <p className="mt-2 text-sm font-bold text-black">{project.contract.clientName || project.contactName}</p>
              <p className="text-xs text-[#666666]">{project.contract.clientEmail || project.email || 'И-мэйл бүртгэлтэй'}</p>

              {isContractSigned ? (
                <div className="mt-4">
                  {project.contract.signatureDataUrl ? (
                    <div className="rounded-lg border border-[#e0e0e0] bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.contract.signatureDataUrl}
                        alt="Client Signature"
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#166534] font-semibold">
                    <CheckCircle2 className="size-4" /> Цахим гарын үсгээр баталгаажуулсан
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <span className="text-[11px] text-[#c2410c] font-semibold">
                    ⏳ Гарын үсэг зураагүй байна
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* If Not Signed, Signing Form right inside the tab! */}
          {!isContractSigned && (
            <div className="mt-8 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-6 print:hidden">
              <h5 className="text-xs font-bold uppercase tracking-wider text-black mb-4">
                Гэрээг цахим гарын үсгээр баталгаажуулах
              </h5>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#666666] mb-1">
                    Захиалагчийн бүтэн нэр
                  </label>
                  <input
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#666666] mb-1">
                    И-мэйл хаяг
                  </label>
                  <input
                    type="email"
                    value={contractEmail}
                    onChange={(e) => setContractEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold text-black">
                  Таны дижитал гарын үсэг
                </label>
                <SignaturePad onDraw={setSignatureData} />
              </div>

              <label className="mt-5 flex items-start gap-2.5 text-xs text-[#555555] cursor-pointer">
                <input
                  type="checkbox"
                  checked={contractConfirmed}
                  onChange={(e) => setContractConfirmed(e.target.checked)}
                  className="mt-1 size-4 accent-black"
                />
                <span>
                  Би энэхүү Ажил гүйцэтгэх гэрээний бүх нөхцөлтэй танилцсан бөгөөд дээрх мэдээлэл болон гарын үсэг үнэн зөв болохыг баталж байна.
                </span>
              </label>

              <button
                type="button"
                disabled={!signatureData || !contractConfirmed || !contractName.trim() || submittingContract}
                onClick={handleSignContract}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-xs font-bold text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Lock className="size-3.5 text-white" />
                {submittingContract ? 'Гэрээг баталгаажуулж байна...' : 'Гарын үсэг зурж, гэрээг баталгаажуулах & Ажлыг албан ёсоор эхлүүлэх'}
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
