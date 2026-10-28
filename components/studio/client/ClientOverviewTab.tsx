'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock3,
  CircleDollarSign,
  Receipt,
  MessageSquare,
  Send,
} from 'lucide-react'
import { Project, ProjectMessage, VatInfo } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'

interface ClientOverviewTabProps {
  project: Project
  token: string
  vat: VatInfo
  onOpenReceiptTab: () => void
  onToggleVat: (enabled: boolean) => void
}

export default function ClientOverviewTab({
  project,
  token,
  vat,
  onOpenReceiptTab,
  onToggleVat,
}: ClientOverviewTabProps) {
  const isContractSigned = project.contract.status === 'signed'
  const basePrice = project.contract.total
  const vatAmount = Math.round(basePrice * 0.1)
  const totalPriceWithVat = basePrice + vatAmount

  // Conversation State
  const [messages, setMessages] = useState<ProjectMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = () => {
    fetch(`/api/messages?projectToken=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages)
      })
      .catch((e) => console.error('Failed loading messages', e))
  }

  useEffect(() => {
    loadMessages()
  }, [token])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMessage) return
    const content = messageText.trim()
    setMessageText('')
    setSendingMessage(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectToken: token,
          authorRole: 'CLIENT',
          authorName: project.contactName,
          content,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
      }
    } catch (e) {
      console.error('Failed sending message', e)
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Project Metrics Summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
            Төслийн явц
          </span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-black tracking-tight text-black">{project.progress}%</span>
            <span className="text-xs font-semibold text-[#166534]">Хуваарийн дагуу</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full bg-black" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
            Төлөвлөсөн хугацаа
          </span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-black">{project.due}</span>
            <Clock3 className="size-4 text-[#888888]" />
          </div>
          <p className="mt-2 text-xs text-[#888888]">Эцсийн хүлээлгэн өгөх огноо</p>
        </div>

        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
            Төлбөрийн нөхцөл
          </span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-black">
              {formatCurrency(vat.enabled ? totalPriceWithVat : basePrice)}
            </span>
            <CircleDollarSign className="size-4 text-[#888888]" />
          </div>
          <p className="mt-1 text-xs text-[#888888]">
            {vat.enabled ? '10% НӨАТ багтсан (И-Баримт олгогдоно)' : '50% Урьдчилгаа + 50% Эцсийн төлбөр'}
          </p>

          {!vat.enabled ? (
            <button
              type="button"
              onClick={() => onToggleVat(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-black underline underline-offset-4 hover:opacity-75 transition-opacity"
            >
              <Receipt className="size-3.5 text-blue-600" /> НӨАТ-ын баримт авах хүсэлт гаргах →
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenReceiptTab}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] hover:underline"
            >
              <CheckCircle2 className="size-3.5" /> Төлбөрийн баримт харах →
            </button>
          )}
        </div>
      </div>

      {/* 1. Project Tasks & Workflow Milestones Tracker Card */}
      {project.contract.tasks && project.contract.tasks.length > 0 && (
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e0e0] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                  Төслийн явцад хийх ажлууд (Tasks)
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isContractSigned
                      ? 'border border-[#d2ebd6] bg-[#f0fdf4] text-[#166534]'
                      : 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                  }`}
                >
                  {isContractSigned ? '⚡ Ажил албан ёсоор эхэлсэн' : '⏳ Гэрээ баталгаажсаны дараа ажил эхэлнэ'}
                </span>
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-black">
                Гүйцэтгэлийн шат дараалал & Task-ууд
              </h3>
              <p className="mt-0.5 text-xs text-[#666666]">
                Дизайнер хийж гүйцэтгэсэн ажлаа шалгаж тэмдэглэхэд төслийн явц автоматаар шинэчлэгдэнэ
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-black">
                {project.contract.tasks.filter((t) => t.completed).length} / {project.contract.tasks.length}
              </span>
              <span className="text-xs text-[#888888] ml-1.5 font-medium">task дууссан ({project.progress}%)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-full rounded-full bg-black transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Tasks Checklist for Client */}
          <div className="mt-6 flex flex-col gap-3">
            {project.contract.tasks.map((task, idx) => {
              const isDone = task.completed
              return (
                <div
                  key={task.id || idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                    isDone ? 'border-[#bbf7d0] bg-[#f0fdf4]/40' : 'border-[#e0e0e0] bg-[#fafafa]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="size-5 text-[#166534]" />
                      ) : (
                        <Circle className="size-5 text-[#cccccc]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-[#666666]' : 'text-black'}`}>
                          {task.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            isDone ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]' : 'border-[#e0e0e0] bg-white text-[#888888]'
                          }`}
                        >
                          {isDone ? '✅ Дизайнер гүйцэтгэсэн' : '⏳ Хийгдэж буй'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-[#555555] leading-relaxed">{task.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#888888]">
                        {task.due && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> Төлөвлөсөн хугацаа: {task.due}
                          </span>
                        )}
                        {task.completedAt && (
                          <span className="text-[#166534]">
                            Хийж дууссан: {new Date(task.completedAt).toLocaleDateString('mn-MN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Contract Deliverables & Progress Tracker Card */}
      {project.contract.deliverables && project.contract.deliverables.length > 0 && (
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e0e0] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                  Гэрээний дагуу хүлээлгэн өгөх материалууд
                </span>
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-black">
                Эцсийн материалуудын шалгах хуудас
              </h3>
              <p className="mt-0.5 text-xs text-[#666666]">
                Гэрээнд баталгаажсан материалууд (Дизайнер тухай бүр гүйцэтгэлийг баталгаажуулна)
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-black">
                {project.contract.deliverables.filter((d) => d.completed || d.status === 'approved').length} / {project.contract.deliverables.length}
              </span>
              <span className="text-xs text-[#888888] ml-1.5 font-medium">материал хүлээлгэн өгсөн</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {project.contract.deliverables.map((item, idx) => {
              const isDone = item.completed || item.status === 'approved'
              return (
                <div
                  key={item.id || idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                    isDone ? 'border-[#bbf7d0] bg-[#f0fdf4]/40' : 'border-[#e0e0e0] bg-[#fafafa]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="size-5 text-[#166534]" />
                      ) : (
                        <Circle className="size-5 text-[#cccccc]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-[#666666]' : 'text-black'}`}>
                          {item.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            isDone ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]' : 'border-[#e0e0e0] bg-white text-[#888888]'
                          }`}
                        >
                          {isDone ? '✅ Хүлээлгэн өгсөн' : '⏳ Хийгдэж буй'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#555555] leading-relaxed">{item.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#888888]">
                        <span>Үзүүлэлт: <strong className="text-black font-medium">{item.quantity}</strong></span>
                        {item.due && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> Хугацаа: {item.due}
                          </span>
                        )}
                        {item.completedAt && (
                          <span className="text-[#166534]">
                            Хүлээлгэн өгсөн: {new Date(item.completedAt).toLocaleDateString('mn-MN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dedicated Conversation Thread between Client and Designer */}
      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e0e0] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Төслийн харилцан яриа</h3>
              <p className="text-xs text-[#888888]">
                Дизайнер болон захиалагчийн хоорондох албан ёсны явцын хэлэлцүүлэг
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-1.5 text-xs text-[#666666]">
            <span className="size-2 rounded-full bg-[#226738] animate-pulse" />
            <span>Telegram шуурхай холболттой</span>
          </div>
        </div>

        {/* Chat Message Scrollable Container */}
        <div
          ref={chatScrollRef}
          className="mt-6 flex flex-col gap-4 overflow-y-auto max-h-[460px] rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 sm:p-6"
        >
          {messages.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#888888]">
              Одоогоор зурвас ирээгүй байна. Дизайнерт хэлэх саналаа энд бичиж эхлүүлнэ үү.
            </div>
          ) : (
            messages.map((msg) => {
              const isClient = msg.authorRole === 'CLIENT'
              const dateFormatted = new Date(msg.createdAt).toLocaleTimeString('mn-MN', {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
              })

              return (
                <div key={msg.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-[#888888]">
                      {isClient ? `Та (${msg.authorName})` : `${msg.authorName} · Дизайнер`}
                    </span>
                    <span className="text-[10px] text-[#aaaaaa]">{dateFormatted}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                      isClient ? 'bg-black text-white rounded-tr-sm' : 'bg-white border border-[#e0e0e0] text-[#111111] rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Composer Input */}
        <div className="mt-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 rounded-xl border border-[#e0e0e0] bg-white p-3 focus-within:border-black transition-colors">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Төслийн явц, асуулт, саналаа энд бичнэ үү (Enter дарж илгээнэ)..."
              rows={2}
              className="min-h-14 flex-1 resize-none bg-transparent p-2 text-sm text-black outline-none placeholder:text-[#aaaaaa]"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendingMessage}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#222222] disabled:opacity-40"
            >
              <Send className="size-3.5" />
              {sendingMessage ? 'Илгээж байна...' : 'Илгээх'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
