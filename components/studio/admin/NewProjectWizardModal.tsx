'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Plus,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import { Project, DeliverableItem, ProjectTask } from '@/lib/types/studio'
import {
  DEFAULT_PRESET_TASKS,
  DEFAULT_PRESET_DELIVERABLES,
  generateClientShareMessage,
} from '@/lib/studio-utils'

interface NewProjectWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (project: Project) => void
}

export default function NewProjectWizardModal({
  isOpen,
  onClose,
  onSuccess,
}: NewProjectWizardModalProps) {
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [token, setToken] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('Brand Identity')
  const [totalFee, setTotalFee] = useState('3500000')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0])
  const [revisions, setRevisions] = useState(2)
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([])
  const [creating, setCreating] = useState(false)
  const [createdSuccess, setCreatedSuccess] = useState<Project | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setToken(Math.random().toString(36).substring(2, 8))
      setName('')
      setCompany('')
      setContactName('')
      setEmail('')
      setPhone('')
      setType('Brand Identity')
      setTotalFee('3500000')
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate(new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0])
      setRevisions(2)
      setTasks([...DEFAULT_PRESET_TASKS])
      setDeliverables([...DEFAULT_PRESET_DELIVERABLES])
      setWizardStep(1)
      setCreatedSuccess(null)
      setCopiedToken(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddTask = () => {
    const newTask: ProjectTask = {
      id: `task_${Date.now()}`,
      name: '',
      description: '',
      due: endDate,
      completed: false,
    }
    setTasks([...tasks, newTask])
  }

  const handleUpdateTask = (index: number, field: keyof ProjectTask, value: any) => {
    const updated = [...tasks]
    updated[index] = { ...updated[index], [field]: value }
    setTasks(updated)
  }

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleAddDeliverable = () => {
    const newItem: DeliverableItem = {
      id: `del_${Date.now()}`,
      name: '',
      description: '',
      quantity: '1',
      due: endDate,
    }
    setDeliverables([...deliverables, newItem])
  }

  const handleUpdateDeliverable = (index: number, field: keyof DeliverableItem, value: string) => {
    const updated = [...deliverables]
    updated[index] = { ...updated[index], [field]: value }
    setDeliverables(updated)
  }

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index))
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(id)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleCreateProjectWithContract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || creating) return

    setCreating(true)
    try {
      const contractNumber = `BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
      const payload = {
        token,
        name: name.trim(),
        company: company.trim() || name.trim(),
        contactName: contactName.trim() || 'Харилцагч',
        email: email.trim(),
        phone: phone.trim(),
        type,
        status: 'contract_pending',
        progress: 0,
        due: endDate,
        contract: {
          number: contractNumber,
          date: startDate,
          start: startDate,
          end: endDate,
          total: Number(totalFee) || 3500000,
          revisions: Number(revisions) || 2,
          status: 'draft' as const,
          tasks: tasks.filter((t) => t.name.trim().length > 0),
          deliverables: deliverables.filter((d) => d.name.trim().length > 0),
          stages: [
            { id: '1', name: 'Судалгаа ба нээлт', result: 'Чиглэл, ойлголт', payment: '50% урьдчилгаа' },
            { id: '2', name: 'Брэнд стратеги', result: 'Байршуулалт', payment: 'Стратеги батлагдсаны дараа' },
            { id: '3', name: 'Дизайн боловсруулалт', result: '3 чиглэлийн концепц', payment: 'Дизайн сонгосны дараа' },
            { id: '4', name: 'Эцэслэлт ба хүлээлгэн өгөлт', result: 'Эх файл, брэндбүүк', payment: '50% эцсийн төлбөр' },
          ],
          customSections: [
            {
              title: 'Оюуны өмч ба нэмэлт ажил',
              content: 'Тохиролцоогүй нэмэлт ажил нь тусдаа үнийн санал болон бичгээр баталгаажилт шаардлагатай.',
            },
          ],
        },
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setCreatedSuccess(data.project)
        if (onSuccess) onSuccess(data.project)
      }
    } catch (e) {
      console.error('Failed creating project and contract', e)
    } finally {
      setCreating(false)
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-[#e0e0e0] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-5 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-black text-white">
              <FileText className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                Шинэ харилцагч & Гэрээ үүсгэх
              </h3>
              <p className="text-xs text-[#888888]">
                Шууд линк үүсгэж, ажлын хөлс болон хүлээлгэн өгөх материалуудыг тодорхойлно
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-[#888888] hover:bg-[#eeeeee] hover:text-black transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Success State */}
        {createdSuccess ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center max-h-[85vh] overflow-y-auto">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] mb-3">
              <Check className="size-7" />
            </div>
            <h4 className="text-xl font-bold text-black">Төсөл & Гэрээний линк амжилттай үүсгэгдлээ!</h4>
            <p className="mt-1 text-xs text-[#666666] max-w-md">
              Харилцагч <strong>{createdSuccess.contactName}</strong> ({createdSuccess.company})-д өгөх токен болон холбоосууд бэлэн боллоо.
            </p>

            <div className="mt-5 w-full max-w-lg rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5 text-left flex flex-col gap-4">
              {/* Secret Token Banner */}
              <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3.5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e40af] block">
                    🔑 Нууц Токен (Token)
                  </span>
                  <span className="font-mono text-base font-black text-[#1e3a8a] tracking-wider">
                    {createdSuccess.token}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(createdSuccess.token, 'token')}
                  className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1d4ed8] transition"
                >
                  <Copy className="size-3" />
                  {copiedToken === 'token' ? 'Токен хуулагдлаа!' : 'Токен хуулах'}
                </button>
              </div>

              {/* 1. Client Portal Link */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  1. Харилцагчийн талбарын линк (Client Portal)
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-[#e0e0e0] bg-white p-2.5 text-xs font-mono text-black">
                  <span className="truncate">{`${origin}/client/${createdSuccess.token}`}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(`${origin}/client/${createdSuccess.token}`, 'portal')}
                      className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#222222] transition"
                    >
                      <Copy className="size-3" />
                      {copiedToken === 'portal' ? 'Хуулагдлаа!' : 'Хуулах'}
                    </button>
                    <a
                      href={`/client/${createdSuccess.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-2.5 py-1.5 text-[11px] font-semibold text-black hover:bg-[#f0f0f0] transition"
                      title="Шинэ таб дээр нээх"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. Direct Contract Link */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                  2. Гэрээний шууд линк (Direct Contract)
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-[#e0e0e0] bg-white p-2.5 text-xs font-mono text-black">
                  <span className="truncate">{`${origin}/client/c/${createdSuccess.token}`}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(`${origin}/client/c/${createdSuccess.token}`, 'contract')}
                      className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-[#f5f5f5] transition"
                    >
                      <Copy className="size-3" />
                      {copiedToken === 'contract' ? 'Хуулагдлаа!' : 'Хуулах'}
                    </button>
                    <a
                      href={`/client/c/${createdSuccess.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-2.5 py-1.5 text-[11px] font-semibold text-black hover:bg-[#f0f0f0] transition"
                      title="Гэрээ үзэх"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Copy Client Message Template */}
              <div className="pt-2 border-t border-[#e8e8e8]">
                <button
                  type="button"
                  onClick={() => copyText(generateClientShareMessage(createdSuccess, origin), 'invite')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#cccccc] bg-white py-2.5 px-3 text-xs font-semibold text-black hover:border-black transition"
                >
                  <Share2 className="size-3.5 text-[#555555]" />
                  {copiedToken === 'invite'
                    ? '✅ Харилцагч руу илгээх мессеж хуулагдлаа!'
                    : '📋 Харилцагч руу илгээх бэлэн мессежийг бүхлээр нь хуулах'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/admin/projects/${createdSuccess.token}`}
                className="rounded-full bg-black px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#222222] transition"
              >
                Төслийг удирдах хуудас руу очих →
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#e0e0e0] bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
              >
                Хаах
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateProjectWithContract} className="flex flex-col flex-1 overflow-hidden">
            {/* Generated Link Alert Banner */}
            <div className="border-b border-[#e0e0e0] bg-[#f0f9ff] px-6 py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-medium">
                <Link2 className="size-4 shrink-0 text-blue-600" />
                <span>Автомат үүсэх токен: <strong className="font-mono bg-blue-100 px-2 py-0.5 rounded-md text-blue-800">{token}</strong></span>
              </div>
              <span className="text-[11px] text-blue-700 font-mono hidden sm:inline">
                /client/{token}
              </span>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
              {/* Step Tabs */}
              <div className="flex border-b border-[#e0e0e0] pb-3 gap-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className={`text-xs font-bold pb-1 transition-colors ${
                    wizardStep === 1 ? 'border-b-2 border-black text-black' : 'text-[#888888] hover:text-black'
                  }`}
                >
                  1. Харилцагч & Төслийн мэдээлэл
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className={`text-xs font-bold pb-1 transition-colors ${
                    wizardStep === 2 ? 'border-b-2 border-black text-black' : 'text-[#888888] hover:text-black'
                  }`}
                >
                  2. Гэрээ, Ажлын хөлс & Хийгдэх ажлууд
                </button>
              </div>

              {wizardStep === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Төслийн нэр *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Жишээ: Signature Lounge — Брэндийн Дизайн"
                      className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Захиалагч компани / Брэнд
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Жишээ: BeautyTech LLC"
                      className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Төлөөлөгчийн нэр
                    </label>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Жишээ: Бат Болд"
                      className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      И-мэйл хаяг
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Жишээ: bat@beautytech.mn"
                      className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Утасны дугаар
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Жишээ: +976 99112233"
                      className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Төслийн үндсэн чиглэл
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white transition"
                    >
                      <option value="Brand Identity">Brand Identity (Брэндийн таних тэмдэг & хэв маяг)</option>
                      <option value="Logo System">Logo System (Лого дизайн ба хувилбарууд)</option>
                      <option value="Packaging & Print">Packaging & Print (Сав баглаа боодол, шошго)</option>
                      <option value="UI/UX & Web Design">UI/UX & Web Design (Вебсайт, системийн дизайн)</option>
                      <option value="Rebranding">Rebranding (Брэндийн шинэчлэл)</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="flex flex-col gap-6">
                  {/* Financials & Timeline */}
                  <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1">
                        Ажлын хөлс (₮) *
                      </label>
                      <input
                        type="number"
                        required
                        value={totalFee}
                        onChange={(e) => setTotalFee(e.target.value)}
                        placeholder="3500000"
                        className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-sm font-bold text-black outline-none focus:border-black"
                      />
                      <span className="text-[10px] text-[#888888] mt-1 block">50% урьдчилгаа + 50% эцсийн</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1">
                        Эхлэх огноо
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1">
                        Дуусах огноо
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-xs text-black outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* 1. Tasks Section (Хийгдэх ажлын шатууд - Deliverables-ийн өмнө) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                            1
                          </span>
                          <h4 className="text-sm font-bold text-black">
                            Төслийн явцад хийх Task-ууд (Workflow Tasks & Milestones)
                          </h4>
                        </div>
                        <p className="text-xs text-[#888888] mt-0.5">
                          Дизайнерын гүйцэтгэх шат дараалсан ажлууд (Харилцагчийн порталд төслийн явц болон шалгагдана)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTask}
                        className="flex items-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] transition"
                      >
                        <Plus className="size-3" /> Task нэмэх
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {tasks.map((task, idx) => (
                        <div
                          key={task.id || idx}
                          className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-2xs flex flex-col gap-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-xs font-bold text-black">
                                {idx + 1}
                              </span>
                              <input
                                required
                                value={task.name}
                                onChange={(e) => handleUpdateTask(idx, 'name', e.target.value)}
                                placeholder="Task-ын нэр (Жишээ: 1. Судалгаа & Мудборд боловсруулах)"
                                className="flex-1 font-bold text-sm text-black outline-none border-b border-transparent focus:border-black px-1 py-0.5"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(idx)}
                              className="text-[#aaaaaa] hover:text-[#dc2626] transition p-1"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <textarea
                            value={task.description}
                            onChange={(e) => handleUpdateTask(idx, 'description', e.target.value)}
                            placeholder="Task-ын тайлбар: юу хийгдэх, ямар үр дүн гарах..."
                            rows={2}
                            className="w-full rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-2.5 text-xs text-[#333333] outline-none focus:border-black focus:bg-white resize-none"
                          />

                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-[10px] text-[#888888]">Төлөвлөсөн хугацаа:</span>
                            <input
                              type="date"
                              value={task.due}
                              onChange={(e) => handleUpdateTask(idx, 'due', e.target.value)}
                              className="rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-1 text-xs text-black outline-none focus:border-black"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Deliverables Section */}
                  <div className="pt-2 border-t border-[#e8e8e8]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                            2
                          </span>
                          <h4 className="text-sm font-bold text-black">
                            Хүлээлгэн өгөх материалууд (Deliverables)
                          </h4>
                        </div>
                        <p className="text-xs text-[#888888] mt-0.5">
                          Гэрээний дагуу хүлээлгэн өгөх эцсийн биет болон цахим файлууд, тоо ширхэг
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="flex items-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] transition"
                      >
                        <Plus className="size-3" /> Материал нэмэх
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {deliverables.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-2xs flex flex-col gap-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-xs font-bold text-black">
                                {idx + 1}
                              </span>
                              <input
                                required
                                value={item.name}
                                onChange={(e) => handleUpdateDeliverable(idx, 'name', e.target.value)}
                                placeholder="Материалын нэр (Жишээ: Лого систем)"
                                className="flex-1 font-bold text-sm text-black outline-none border-b border-transparent focus:border-black px-1 py-0.5"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(idx)}
                              className="text-[#aaaaaa] hover:text-[#dc2626] transition p-1"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <textarea
                            value={item.description}
                            onChange={(e) => handleUpdateDeliverable(idx, 'description', e.target.value)}
                            placeholder="Тайлбар: Үндсэн агуулга, өнгө, фонт, ямар ямар хувилбарууд багтахыг тайлбарлаж бичнэ..."
                            rows={2}
                            className="w-full rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-2.5 text-xs text-[#333333] outline-none focus:border-black focus:bg-white resize-none"
                          />

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] text-[#888888] block mb-0.5">Тоо ширхэг / Үзүүлэлт</span>
                              <input
                                value={item.quantity}
                                onChange={(e) => handleUpdateDeliverable(idx, 'quantity', e.target.value)}
                                placeholder="Жишээ: 1 систем / 24 хуудас"
                                className="w-full rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-[#888888] block mb-0.5">Хугацаа</span>
                              <input
                                type="date"
                                value={item.due}
                                onChange={(e) => handleUpdateDeliverable(idx, 'due', e.target.value)}
                                className="w-full rounded-lg border border-[#e8e8e8] bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#e0e0e0] px-6 py-4 bg-[#fafafa]">
              {wizardStep === 1 ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[#e0e0e0] bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-[#f5f5f5]"
                >
                  Болих
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="rounded-full border border-[#e0e0e0] bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-[#f5f5f5]"
                >
                  ← Өмнөх алхам
                </button>
              )}

              {wizardStep === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) return alert('Төслийн нэрийг оруулна уу')
                    setWizardStep(2)
                  }}
                  className="rounded-full bg-black px-6 py-2 text-xs font-semibold text-white hover:bg-[#222222]"
                >
                  Дараах: Гэрээ & Материалууд →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-[#222222] disabled:opacity-50"
                >
                  {creating ? 'Гэрээ үүсгэж байна...' : 'Төсөл & Гэрээг албан ёсоор үүсгэх'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
