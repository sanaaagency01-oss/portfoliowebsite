'use client'

import React, { useState } from 'react'
import { Check, Plus, Trash2, Calendar } from 'lucide-react'
import { DeliverableItem } from '@/lib/types/studio'

interface ProjectDeliverablesManagerProps {
  deliverables: DeliverableItem[]
  projectToken: string
  contractEnd?: string
  stepNumber?: number
  onDeliverablesUpdated: (updatedDeliverables: DeliverableItem[]) => void
}

export default function ProjectDeliverablesManager({
  deliverables,
  projectToken,
  contractEnd,
  stepNumber = 2,
  onDeliverablesUpdated,
}: ProjectDeliverablesManagerProps) {
  const [showAddDeliverable, setShowAddDeliverable] = useState(false)
  const [newDelName, setNewDelName] = useState('')
  const [newDelDesc, setNewDelDesc] = useState('')
  const [newDelQuantity, setNewDelQuantity] = useState('1 багц')
  const [newDelDue, setNewDelDue] = useState('')
  const [saving, setSaving] = useState(false)

  const completedCount = deliverables.filter((d) => d.completed || d.status === 'approved').length

  const handleToggleDeliverable = async (index: number) => {
    const updated = [...deliverables]
    const item = updated[index]
    if (!item) return

    const newCompleted = !item.completed
    updated[index] = {
      ...item,
      completed: newCompleted,
      status: newCompleted ? 'approved' : 'in_progress',
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    }

    onDeliverablesUpdated(updated)

    try {
      setSaving(true)
      await fetch(`/api/projects/${projectToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: { deliverables: updated },
        }),
      })
    } catch (e) {
      console.error('Failed toggling deliverable', e)
    } finally {
      setSaving(false)
    }
  }

  const handleAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDelName.trim()) return

    const newItem: DeliverableItem = {
      id: `del_${Date.now()}`,
      name: newDelName.trim(),
      description: newDelDesc.trim() || 'Тохиролцсон материалын тайлбар',
      quantity: newDelQuantity.trim() || '1',
      due: newDelDue || contractEnd || new Date().toISOString().split('T')[0],
      completed: false,
      status: 'pending',
    }

    const updated = [...deliverables, newItem]
    onDeliverablesUpdated(updated)

    setNewDelName('')
    setNewDelDesc('')
    setNewDelQuantity('1 багц')
    setNewDelDue('')
    setShowAddDeliverable(false)

    try {
      await fetch(`/api/projects/${projectToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: { deliverables: updated },
        }),
      })
    } catch (e) {
      console.error('Failed adding deliverable', e)
    }
  }

  const handleDeleteDeliverable = async (delId: string) => {
    if (!confirm('Энэхүү ажлыг жагсаалтаас хасах уу?')) return
    const updated = deliverables.filter((d) => d.id !== delId)
    onDeliverablesUpdated(updated)

    try {
      await fetch(`/api/projects/${projectToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: { deliverables: updated },
        }),
      })
    } catch (e) {
      console.error('Failed deleting deliverable', e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
            {stepNumber}
          </span>
          <h4 className="text-sm font-bold text-black">
            Хүлээлгэн өгөх материалууд (Deliverables)
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#666666]">
            {completedCount} / {deliverables.length} Хүлээлгэн өгсөн
          </span>
          {saving && <span className="text-[11px] text-[#888888] animate-pulse">Хадгалж байна...</span>}
          <button
            type="button"
            onClick={() => setShowAddDeliverable(!showAddDeliverable)}
            className="flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-[#fafafa]"
          >
            <Plus className="size-3" /> Материал нэмэх
          </button>
        </div>
      </div>

      {/* Add Deliverable Form Modal/Accordion */}
      {showAddDeliverable && (
        <form onSubmit={handleAddDeliverable} className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5 shadow-xs">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
            Төсөлд шинэ хүлээлгэн өгөх ажил нэмэх
          </h5>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-[#666666] block mb-1">Ажлын нэр *</label>
              <input
                required
                value={newDelName}
                onChange={(e) => setNewDelName(e.target.value)}
                placeholder="Жишээ: Сошиал медиа темплэйт 5 хувилбар"
                className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#666666] block mb-1">Тоо ширхэг / Үзүүлэлт</label>
              <input
                value={newDelQuantity}
                onChange={(e) => setNewDelQuantity(e.target.value)}
                placeholder="Жишээ: 5 пост, 5 стори (Figma эх файл)"
                className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-[#666666] block mb-1">Тайлбар</label>
              <textarea
                value={newDelDesc}
                onChange={(e) => setNewDelDesc(e.target.value)}
                placeholder="Хийгдэх ажлын дэлгэрэнгүй тайлбар, агуулга..."
                rows={2}
                className="w-full rounded-xl border border-[#e0e0e0] bg-white p-2.5 text-xs text-black outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddDeliverable(false)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#666666] hover:text-black"
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded-full bg-black px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] transition"
            >
              Ажил нэмэх
            </button>
          </div>
        </form>
      )}

      {/* Deliverables List */}
      <div className="flex flex-col gap-3">
        {deliverables.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] p-10 text-center text-xs text-[#888888]">
            Гэрээнд хүлээлгэн өгөх ажил оруулаагүй байна.
          </div>
        ) : (
          deliverables.map((item, idx) => {
            const isDone = item.completed || item.status === 'approved'
            return (
              <div
                key={item.id || idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition ${
                  isDone ? 'border-[#bbf7d0] bg-[#f0fdf4]/50' : 'border-[#e0e0e0] bg-white hover:border-[#cccccc]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleDeliverable(idx)}
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl border transition-all ${
                      isDone
                        ? 'border-[#166534] bg-[#166534] text-white shadow-xs'
                        : 'border-[#cccccc] bg-white hover:border-black text-transparent hover:text-[#cccccc]'
                    }`}
                    title={isDone ? 'Гүйцэтгэлийг цуцлах' : 'Гүйцэтгэсэн гэж тэмдэглэх'}
                  >
                    <Check className="size-4 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold transition-all ${isDone ? 'line-through text-[#666666]' : 'text-black'}`}>
                        {item.name}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          isDone ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]' : 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                        }`}
                      >
                        {isDone ? '✅ Хүлээлгэн өгсөн' : '⏳ Хийгдэж буй'}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#555555] max-w-2xl leading-relaxed">{item.description}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-[#888888]">
                      <span>Тоо ширхэг: <strong className="text-black font-medium">{item.quantity}</strong></span>
                      {item.due && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> Хугацаа: {item.due}
                        </span>
                      )}
                      {item.completedAt && (
                        <span className="text-[#166534]">
                          Баталгаажсан: {new Date(item.completedAt).toLocaleDateString('mn-MN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleDeliverable(idx)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      isDone ? 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black' : 'bg-black text-white hover:bg-[#222222]'
                    }`}
                  >
                    {isDone ? 'Цуцлах' : 'Хүлээлгэн өгсөн'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDeliverable(item.id)}
                    className="text-[#aaaaaa] hover:text-[#dc2626] transition p-1"
                    title="Устгах"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
