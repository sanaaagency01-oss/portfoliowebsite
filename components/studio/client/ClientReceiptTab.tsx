'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Printer,
  Download,
  Save,
  Check,
  Plus,
  Trash2,
  Building,
  User,
  CreditCard,
  Calendar,
  Sparkles,
  Eye,
} from 'lucide-react'
import { Project, InvoiceInfo, InvoiceItem } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'
import {
  getDefaultInvoiceFromProject,
  openInvoicePrintWindow,
  downloadInvoiceText,
} from '@/lib/invoice-export'

interface ClientReceiptTabProps {
  project: Project
  token: string
  onProjectUpdated?: (updated: Project) => void
}

export default function ClientReceiptTab({
  project,
  token,
  onProjectUpdated,
}: ClientReceiptTabProps) {
  const [invoice, setInvoice] = useState<InvoiceInfo>(() =>
    getDefaultInvoiceFromProject(project)
  )
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activePreviewPage, setActivePreviewPage] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    setInvoice(getDefaultInvoiceFromProject(project))
  }, [project])

  const handleFieldChange = (section: keyof InvoiceInfo, field: string, value: any) => {
    setInvoice((prev) => {
      const sectionVal = prev[section]
      if (typeof sectionVal === 'object' && sectionVal !== null && !Array.isArray(sectionVal)) {
        return {
          ...prev,
          [section]: {
            ...sectionVal,
            [field]: value,
          },
        }
      }
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleTotalOrAdvanceChange = (field: 'totalAmount' | 'advancePaid', val: number) => {
    setInvoice((prev) => {
      const total = field === 'totalAmount' ? val : prev.totalAmount
      const advance = field === 'advancePaid' ? val : prev.advancePaid
      const balance = Math.max(0, total - advance)
      return {
        ...prev,
        totalAmount: total,
        advancePaid: advance,
        balanceDue: balance,
      }
    })
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => {
      const updatedItems = prev.items.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0)
          }
          return updated
        }
        return it
      })
      const newTotal = updatedItems.reduce((acc, it) => acc + (it.amount || 0), 0)
      const balance = Math.max(0, newTotal - prev.advancePaid)
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotal,
        balanceDue: balance,
      }
    })
  }

  const handleAddItem = () => {
    setInvoice((prev) => {
      const newItem: InvoiceItem = {
        id: `item_${Date.now()}`,
        name: 'Нэмэлт үйлчилгээ / Ажил',
        description: '',
        quantity: 1,
        unitPrice: 500000,
        amount: 500000,
      }
      const updatedItems = [...prev.items, newItem]
      const newTotal = updatedItems.reduce((acc, it) => acc + (it.amount || 0), 0)
      const balance = Math.max(0, newTotal - prev.advancePaid)
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotal,
        balanceDue: balance,
      }
    })
  }

  const handleRemoveItem = (id: string) => {
    setInvoice((prev) => {
      const updatedItems = prev.items.filter((it) => it.id !== id)
      const newTotal = updatedItems.reduce((acc, it) => acc + (it.amount || 0), 0)
      const balance = Math.max(0, newTotal - prev.advancePaid)
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotal,
        balanceDue: balance,
      }
    })
  }

  const handleSaveInvoice = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      })
      if (res.ok) {
        const data = await res.json()
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        if (onProjectUpdated && data.project) {
          onProjectUpdated(data.project)
        }
      }
    } catch (e) {
      console.error('Failed saving invoice', e)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    openInvoicePrintWindow(project, invoice)
  }

  const handleDownloadTxt = () => {
    downloadInvoiceText(project, invoice)
  }

  return (
    <div className="mt-8 space-y-8 animate-in fade-in duration-150">
      {/* Top Banner Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <FileText className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-black">
                Албан ёсны төлбөрийн баримт (Нэхэмжлэх)
              </h2>
              <span className="rounded-full border border-black bg-black px-2.5 py-0.5 text-[10px] font-bold text-white">
                3 Хуудас загвар
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#666666]">
              Талбаруудыг систем дээр тохируулан, албан ёсны хар ковер хуудас болон дэлгэрэнгүй задаргаагаар PDF татах боломжтой
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition shadow-xs"
          >
            <Download className="size-3.5 text-[#666666]" /> Текст (.txt)
          </button>

          <button
            type="button"
            onClick={handleSaveInvoice}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-[#f0f0f0] transition shadow-xs disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="size-3.5 text-[#226738]" /> Хадгалагдлаа!
              </>
            ) : (
              <>
                <Save className="size-3.5 text-[#666666]" />
                {saving ? 'Хадгалж байна...' : 'Мэдээлэл хадгалах'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-[#222222] transition shadow-sm"
          >
            <Printer className="size-4 text-white" />
            Баримт (Нэхэмжлэх) PDF татах
          </button>
        </div>
      </div>

      {/* Main Grid: Left Config Form + Right Visual Preview */}
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Left Column: Form Editor */}
        <div className="space-y-6">
          {/* Section 1: Basic Info & Invoice Details */}
          <div className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-4">
              Нэхэмжлэхийн үндсэн дугаар & Хугацаа
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Нэхэмжлэхийн дугаар
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) =>
                    setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Үүссэн огноо
                </label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Төлбөр төлөх хугацаа (хоног)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={invoice.dueDateDays}
                  onChange={(e) =>
                    setInvoice((prev) => ({
                      ...prev,
                      dueDateDays: Number(e.target.value) || 3,
                    }))
                  }
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parties Information (Contractor & Client) */}
          <div className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-4">
              Талуудын албан ёсны мэдээлэл
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Contractor */}
              <div className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-4.5 space-y-3">
                <p className="text-xs font-bold text-black">1. Үйлчилгээ үзүүлэгч (Дизайнер)</p>
                <div>
                  <label className="block text-[11px] text-[#666666] mb-1">Нэр</label>
                  <input
                    type="text"
                    value={invoice.contractor.name}
                    onChange={(e) => handleFieldChange('contractor', 'name', e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black font-semibold outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#666666] mb-1">Байгууллага / Студи</label>
                  <input
                    type="text"
                    value={invoice.contractor.company}
                    onChange={(e) => handleFieldChange('contractor', 'company', e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black font-semibold outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#666666] mb-1">Имэйл</label>
                    <input
                      type="email"
                      value={invoice.contractor.email}
                      onChange={(e) => handleFieldChange('contractor', 'email', e.target.value)}
                      className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#666666] mb-1">Утас</label>
                    <input
                      type="text"
                      value={invoice.contractor.phone}
                      onChange={(e) => handleFieldChange('contractor', 'phone', e.target.value)}
                      className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Client */}
              <div className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-4.5 space-y-3">
                <p className="text-xs font-bold text-black">3. Захиалагч (Client)</p>
                <div>
                  <label className="block text-[11px] text-[#666666] mb-1">Байгууллагын нэр</label>
                  <input
                    type="text"
                    value={invoice.client.company}
                    onChange={(e) => handleFieldChange('client', 'company', e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black font-semibold outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#666666] mb-1">Төлөөлөгчийн нэр</label>
                  <input
                    type="text"
                    value={invoice.client.name}
                    onChange={(e) => handleFieldChange('client', 'name', e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black font-semibold outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#666666] mb-1">Имэйл</label>
                    <input
                      type="email"
                      value={invoice.client.email}
                      onChange={(e) => handleFieldChange('client', 'email', e.target.value)}
                      className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#666666] mb-1">Утас</label>
                    <input
                      type="text"
                      value={invoice.client.phone}
                      onChange={(e) => handleFieldChange('client', 'phone', e.target.value)}
                      className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-black outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Line Items (4. Үйлчилгээний дэлгэрэнгүй) */}
          <div className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  4. Үйлчилгээний задаргаа (Line Items)
                </h3>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Нэхэмжлэх дээр гарах үйлчилгээний нэр, тайлбар, нэгж үнэ
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#fafafa] transition"
              >
                <Plus className="size-3.5" /> Мөр нэмэх
              </button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-3.5 sm:p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Үйлчилгээний нэр"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="flex-1 rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-bold text-black outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#888888] hover:text-black p-1 transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Тайлбар (Заавал биш)"
                        value={item.description || ''}
                        onChange={(e) =>
                          handleItemChange(item.id, 'description', e.target.value)
                        }
                        className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs text-[#555] outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Тоо"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, 'quantity', Number(e.target.value) || 1)
                        }
                        className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="50000"
                        placeholder="Нэгж үнэ ₮"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, 'unitPrice', Number(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-bold text-black outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Row */}
            <div className="mt-6 rounded-2xl bg-[#f5f5f5] p-5 border border-[#e5e5e5]">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#888888] mb-1">
                    Нийт дүн
                  </label>
                  <p className="text-xl font-extrabold text-black">
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#888888] mb-1">
                    Урьдчилгаа төлсөн дүн ₮
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={invoice.advancePaid}
                    onChange={(e) =>
                      handleTotalOrAdvanceChange('advancePaid', Number(e.target.value) || 0)
                    }
                    className="w-full rounded-xl border border-[#cccccc] bg-white px-3 py-1.5 text-sm font-bold text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#888888] mb-1">
                    Төлөх үлдэгдэл
                  </label>
                  <p className="text-xl font-extrabold text-[#c2410c]">
                    {formatCurrency(invoice.balanceDue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details (6. Төлбөр хийх мэдээлэл) */}
          <div className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-4">
              6. Төлбөр хийх банкны мэдээлэл
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Банк</label>
                <input
                  type="text"
                  value={invoice.bank.bankName}
                  onChange={(e) => handleFieldChange('bank', 'bankName', e.target.value)}
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Дансны эзэмшигчийн нэр
                </label>
                <input
                  type="text"
                  value={invoice.bank.accountName}
                  onChange={(e) => handleFieldChange('bank', 'accountName', e.target.value)}
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Дансны дугаар
                </label>
                <input
                  type="text"
                  value={invoice.bank.accountNumber}
                  onChange={(e) => handleFieldChange('bank', 'accountNumber', e.target.value)}
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-mono font-bold text-black outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">
                  Гүйлгээний утга
                </label>
                <input
                  type="text"
                  value={invoice.bank.transactionValue}
                  onChange={(e) =>
                    handleFieldChange('bank', 'transactionValue', e.target.value)
                  }
                  className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-[#c2410c] outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual 3-Page Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-2">
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Баримтын загвар (Preview)
            </span>
            <div className="flex gap-1">
              {([1, 2, 3] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePreviewPage(p)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    activePreviewPage === p
                      ? 'bg-black text-white'
                      : 'bg-[#f0f0f0] text-[#666666] hover:text-black'
                  }`}
                >
                  Хуудас {p}
                </button>
              ))}
            </div>
          </div>

          {/* PAGE 1 PREVIEW: BLACK COVER */}
          {activePreviewPage === 1 && (
            <div className="aspect-[210/297] w-full rounded-2xl bg-[#1e1e1e] text-white p-7 flex flex-col justify-between shadow-lg border border-[#333]">
              <div>
                <span className="text-[10px] font-mono text-[#888]">PAGE 1 / 3 · COVER</span>
                <h1 className="mt-12 text-3xl font-extrabold tracking-tight text-white">
                  Нэхэмжлэх
                </h1>
              </div>

              <div className="space-y-4 text-[10px] text-[#ccc] border-t border-[#333] pt-4">
                <div>
                  <span className="text-[#888] block text-[9px]">Created by:</span>
                  <p className="font-semibold text-white">{invoice.contractor.name} ({invoice.contractor.company})</p>
                  <p className="text-[9px] text-[#aaa]">№: {invoice.invoiceNumber} · {invoice.date}</p>
                </div>
                <div>
                  <span className="text-[#888] block text-[9px]">Created for:</span>
                  <p className="font-semibold text-white">{invoice.client.company}</p>
                  <p className="text-[9px] text-[#aaa]">{invoice.client.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2 PREVIEW: LINE ITEMS */}
          {activePreviewPage === 2 && (
            <div className="aspect-[210/297] w-full rounded-2xl bg-white text-black p-6 flex flex-col justify-between shadow-lg border border-[#e0e0e0] text-[10px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[#888] text-[9px]">PAGE 2 / 3</span>
                  <span className="font-bold text-black text-xs">baysaass.</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] mb-4 pb-3 border-b border-[#f0f0f0]">
                  <div>
                    <span className="font-bold text-black block">1. Дизайнер</span>
                    <p>{invoice.contractor.name}</p>
                  </div>
                  <div>
                    <span className="font-bold text-black block">3. Захиалагч</span>
                    <p>{invoice.client.company}</p>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-black block text-[10px] mb-2">4. Үйлчилгээний задаргаа</span>
                  <div className="space-y-1.5">
                    {invoice.items.slice(0, 4).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[9px] border-b border-[#f5f5f5] pb-1">
                        <span className="truncate max-w-[140px] text-[#c2410c] font-medium">{it.name}</span>
                        <span className="font-mono text-[#c2410c]">{formatCurrency(it.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-2 border-t border-[#eee] text-right space-y-0.5 text-[9px]">
                    <div>Нийт: <strong>{formatCurrency(invoice.totalAmount)}</strong></div>
                    <div>Урьдчилгаа: <strong>{formatCurrency(invoice.advancePaid)}</strong></div>
                    <div className="text-[10px] text-[#c2410c] font-bold">Үлдэгдэл: {formatCurrency(invoice.balanceDue)}</div>
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-[#888] border-t border-[#eee] pt-2 flex justify-between">
                <span>Шаардлагын шинжилгээ баримт бичиг</span>
                <span>2</span>
              </div>
            </div>
          )}

          {/* PAGE 3 PREVIEW: BANK & SIGNATURE */}
          {activePreviewPage === 3 && (
            <div className="aspect-[210/297] w-full rounded-2xl bg-white text-black p-6 flex flex-col justify-between shadow-lg border border-[#e0e0e0] text-[10px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[#888] text-[9px]">PAGE 3 / 3</span>
                  <span className="font-bold text-black text-xs">baysaass.</span>
                </div>

                <div className="mb-6">
                  <span className="font-bold text-black block text-[10px] mb-2">6. Төлбөр хийх мэдээлэл</span>
                  <div className="space-y-1 text-[9px] text-[#444] bg-[#fafafa] p-3 rounded-xl border border-[#eee]">
                    <div>Банк: <strong className="text-black">{invoice.bank.bankName}</strong></div>
                    <div>Дансны нэр: <strong className="text-black">{invoice.bank.accountName}</strong></div>
                    <div>Данс: <strong className="font-mono text-black">{invoice.bank.accountNumber}</strong></div>
                    <div>Утга: <strong className="text-[#c2410c]">{invoice.bank.transactionValue}</strong></div>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-black block text-[10px] mb-1">10. Гарын үсэг</span>
                  <p className="text-[8px] text-[#666] leading-relaxed">
                    Энэхүү нэхэмжлэх нь гүйцэтгэсэн үйлчилгээний төлбөрийг албан ёсоор нэхэмжилж буй баримт болно.
                  </p>
                  <div className="mt-8 text-right">
                    <div className="font-serif italic text-lg text-black">T. Usukhbayar</div>
                    <div className="text-[8px] text-[#888]">Огноо: [{invoice.date}]</div>
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-[#888] border-t border-[#eee] pt-2 flex justify-between">
                <span>Шаардлагын шинжилгээ баримт бичиг</span>
                <span>3</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-center">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full rounded-full bg-black py-2.5 text-xs font-bold text-white hover:bg-[#222222] transition shadow-sm"
            >
              Бүрэн 3 хуудсыг PDF-ээр татах
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
