'use client'

import Link from 'next/link'
import { useRef, useState, useEffect, type PointerEvent } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Eraser,
  Lock,
  FileText,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react'
import { Project, ContractProposal } from '@/lib/types/studio'
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

export default function ClientContractPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const [token, setToken] = useState('7xK92m')
  const [project, setProject] = useState<Project | null>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signed, setSigned] = useState(false)

  // Client Proposal State
  const [showProposalBox, setShowProposalBox] = useState(false)
  const [proposalNote, setProposalNote] = useState('')
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [proposalSentSuccess, setProposalSentSuccess] = useState(false)

  useEffect(() => {
    params.then(({ token: currentToken }) => {
      setToken(currentToken)
      fetch(`/api/projects/${currentToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.project) {
            setProject(data.project)
            setName(data.project.contactName || '')
            setEmail(data.project.email || '')
            if (data.project.contract.status === 'signed') {
              setSigned(true)
            }
          }
        })
    })
  }, [params])

  const handleSendProposal = async () => {
    if (!proposalNote.trim() || submittingProposal || !project) return
    setSubmittingProposal(true)
    try {
      const newProposal: ContractProposal = {
        id: `prop_${Date.now()}`,
        authorRole: 'CLIENT',
        authorName: name || project.contactName || 'Захиалагч',
        note: proposalNote.trim(),
        deliverables: project.contract.deliverables,
        createdAt: new Date().toISOString(),
        status: 'pending',
      }

      const res = await fetch(`/api/contracts/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal: newProposal,
          clientNote: proposalNote.trim(),
        }),
      })

      if (res.ok) {
        setProposalSentSuccess(true)
        setShowProposalBox(false)
        setProposalNote('')
        setTimeout(() => setProposalSentSuccess(false), 6000)

        // Refresh project
        fetch(`/api/projects/${token}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.project) setProject(d.project)
          })
      }
    } catch (e) {
      console.error('Failed sending proposal', e)
    } finally {
      setSubmittingProposal(false)
    }
  }

  const handleSignContract = async () => {
    if (!signatureData || !confirmed || !name.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/contracts/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: name.trim(),
          clientEmail: email.trim(),
          signatureDataUrl: signatureData,
        }),
      })

      if (res.ok) {
        setSigned(true)
      }
    } catch (e) {
      console.error('Failed to sign contract', e)
    } finally {
      setSubmitting(false)
    }
  }

  if (signed) {
    return (
      <main className="min-h-screen bg-white text-black">
        <header className="border-b border-[#e0e0e0] bg-white px-6 md:px-10 h-[68px] flex items-center">
          <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[18px] font-bold tracking-tight text-black">
                baysaass<span className="text-[#888888]">.</span>
              </span>
            </Link>
            <Link
              href={`/client/${token}`}
              className="text-xs font-semibold text-[#666666] hover:text-black transition"
            >
              <ArrowLeft className="mr-1.5 inline size-3.5" /> Төслийн талбар
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-8 sm:p-14 shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-xl bg-black text-white">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
              Гэрээ амжилттай баталгаажлаа
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Таны төсөл идэвхжлээ.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#555555]">
              Баярлалаа, {name}. Таны дижитал гарын үсэг зурсан Ажил гүйцэтгэх гэрээ баталгаажиж, төслийн хамтын ажиллагааны талбар албан ёсоор нээгдлээ.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {project && <ContractExportButton project={project} />}
              <Link
                href={`/client/${token}`}
                className="flex items-center rounded-full border border-[#e0e0e0] bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-[#fafafa]"
              >
                Төслийн ажлын талбар луу очих →
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const isContractPublished = Boolean(
    project &&
      project.contract &&
      project.contract.isPublishedToClient &&
      project.contract.total > 0 &&
      project.contract.status !== 'draft'
  )

  if (project && !isContractPublished) {
    const answers = project.brief?.answers || {}

    return (
      <main className="min-h-screen bg-white text-black">
        <header className="border-b border-[#e0e0e0] bg-white px-6 md:px-10 h-[68px] flex items-center">
          <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[18px] font-bold tracking-tight text-black">
                baysaass<span className="text-[#888888]">.</span>
              </span>
            </Link>
            <Link
              href={`/client/${token}`}
              className="text-xs font-semibold text-[#666666] hover:text-black transition"
            >
              <ArrowLeft className="mr-1.5 inline size-3.5" /> Төслийн талбар луу буцах
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[800px] px-6 py-12">
          <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#9a3412] text-white shadow-sm">
                <Clock className="size-5" />
              </div>
              <div>
                <span className="rounded-full border border-[#fed7aa] bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9a3412]">
                  ⏳ Үнийн санал тооцоолж буй
                </span>
                <h2 className="mt-1 text-xl font-bold text-black">
                  Үнийн санал & Ажлын хугацааг тооцоолж байна
                </h2>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#7c2d12]">
              Баярлалаа, {project.contactName}. Таны ирүүлсэн бриф болон дизайны шаардлагыг дизайнер <strong>Т. Өсөхбаяр</strong> нягтлан үзэж байна. Төслийн цар хүрээнд нийцсэн албан ёсны үнийн санал, хугацааны хуваарийг боловсруулан энэхүү гэрээний хуудсанд удахгүй нийтлэх болно.
            </p>

            <div className="mt-6 rounded-xl border border-[#fed7aa]/60 bg-white p-5 text-xs text-[#555555]">
              <p className="font-bold text-black mb-2">Хүлээн авсан бриф мэдээлэл:</p>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div><span className="text-[#888888]">Төсөл:</span> <strong className="text-black">{project.name}</strong></div>
                <div><span className="text-[#888888]">Компани:</span> <strong className="text-black">{project.company}</strong></div>
                <div><span className="text-[#888888]">Чиглэл:</span> <strong className="text-black">{answers.projectType || project.type}</strong></div>
                <div><span className="text-[#888888]">Хүссэн материалууд:</span> <strong className="text-black">{answers.deliverables || 'Лого, брэндбүүк'}</strong></div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/client/${token}`}
                className="rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-[#222222] transition"
              >
                Төслийн ажлын талбар луу очих →
              </Link>
              <Link
                href={`/client/brief/${token}`}
                className="rounded-full border border-[#fed7aa] bg-white px-5 py-2.5 text-xs font-semibold text-[#9a3412] hover:bg-[#fff1e6] transition"
              >
                Бриф шалгах / засах
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const totalAmount = project?.contract?.total || 0
  const upfront50 = Math.round(totalAmount * 0.5)
  const milestone30 = Math.round(totalAmount * 0.3)
  const final20 = totalAmount - upfront50 - milestone30

  const officialArticles = getOfficialContractArticles({
    projectName: project?.name || 'Брэндийн дизайны үйлчилгээ',
    company: project?.company || 'Захиалагч байгууллага',
    contactName: name || project?.contactName || 'Захиалагч',
    totalAmount,
    startDate: project?.contract?.start || project?.contract?.date || '2026.04.22',
    endDate: project?.contract?.end || '2026.06.30',
  })

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Studio Header */}
      <header className="border-b border-[#e0e0e0] bg-white px-6 md:px-10 h-[68px] flex items-center">
        <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[18px] font-bold tracking-tight text-black">
              baysaass<span className="text-[#888888]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#888888] hidden sm:inline">Албан ёсны гэрээ баталгаажуулалт</span>
            {project && <ContractExportButton project={project} />}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1040px] px-6 py-10 sm:px-10 lg:py-14">
        <Link
          href={`/client/${token}`}
          className="inline-flex items-center text-xs font-semibold text-[#666666] hover:text-black transition"
        >
          <ArrowLeft className="mr-1.5 inline size-3.5" /> Төслийн талбар руу буцах
        </Link>

        <div className="mt-6 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
            Ажил гүйцэтгэх гэрээ · {project?.contract.number || 'BT-2026-001'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            {project?.name || 'Брэндийн дизайны үйлчилгээ'}
          </h1>
          <p className="mt-2 text-xs text-[#666666]">
            {project?.contract.date || '2026.04.22'} · Улаанбаатар хот · Хувилбар 1.0 (Цахим)
          </p>
        </div>

        {/* Contract Paper Box */}
        <article className="mt-8 rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-6">
            <div>
              <p className="text-sm font-bold text-black">{project?.company || 'Захиалагч байгууллага'}</p>
              <p className="mt-1 text-xs text-[#666666]">
                Төлөөлөгч: {name} · {email}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-[#f5dfc6] bg-[#fff8f0] px-3.5 py-1 text-[11px] font-bold text-[#9a4d13]">
                Гарын үсэг хүлээгдэж байна
              </span>
              {project && <ContractExportButton project={project} variant="white" />}
            </div>
          </div>

          {/* Official Legal Preamble */}
          <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 text-xs leading-relaxed text-[#444444]">
            <p>
              Энэхүү гэрээг нэг талаас <strong>{project?.company || 'Захиалагч'}</strong> (цаашид «Захиалагч» гэх),
              төлөөлж <strong>{name || project?.contactName || 'Захиалагч'}</strong>, нөгөө талаас иргэн <strong>Т. Өсөхбаяр</strong> (РД: КЮ03252818)
              (цаашид «Ажил гүйцэтгэгч» гэх) нар харилцан тохиролцож дараах нөхцөлөөр байгуулав.
            </p>
          </div>

          {/* Designer Proposal Note */}
          {project?.contract.proposalNote && (
            <div className="mt-6 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-5">
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

          {/* Schedule & Revision Note */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-5 py-3 text-xs text-[#555555]">
            <div>
              <span className="text-[#888888]">Гүйцэтгэх хугацаа: </span>
              <strong className="text-black font-semibold">{project?.contract.start} — {project?.contract.end}</strong>
            </div>
            <div>
              <span className="text-[#888888]">Засварын үе шат: </span>
              <strong className="text-black font-semibold">{project?.contract.revisions} удаагийн албан ёсны итераци багтсан</strong>
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
          {project?.contract.deliverables && project.contract.deliverables.length > 0 && (
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
            </div>
          )}

          {/* Signing section */}
          <div className="mt-12 border-t border-[#e0e0e0] pt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
              Цахим гарын үсгээр баталгаажуулах
            </h3>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#666666]">
                  Захиалагчийн бүтэн нэр
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#666666]">
                  И-мэйл хаяг
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold text-black">
                Таны дижитал гарын үсэг
              </label>
              <SignaturePad onDraw={setSignatureData} />
            </div>

            <label className="mt-5 flex items-start gap-2.5 text-xs text-[#555555] cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 size-4 accent-black"
              />
              <span>
                Би энэхүү Ажил гүйцэтгэх гэрээний бүх нөхцөлтэй танилцсан бөгөөд дээрх мэдээлэл болон гарын үсэг үнэн зөв болохыг баталж байна.
              </span>
            </label>

            <button
              type="button"
              disabled={!signatureData || !confirmed || !name.trim() || submitting}
              onClick={handleSignContract}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-xs font-bold text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Lock className="size-3.5 text-white" />
              {submitting ? 'Гэрээг баталгаажуулж байна...' : 'Гарын үсэг зурж, гэрээг баталгаажуулах & Ажлыг албан ёсоор эхлүүлэх'}
            </button>
            <p className="mt-3 text-center text-[11px] text-[#888888]">
              <Check className="mr-1 inline size-3" /> Баталгаажуулсны дараа хоёр талын хуулбар түгжигдэж, төсөл албан ёсоор идэвхжинэ.
            </p>
          </div>
        </article>
      </div>
    </main>
  )
}
