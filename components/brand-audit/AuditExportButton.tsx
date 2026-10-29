'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  Printer,
  FileText,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { BrandAuditRecord } from '@/lib/brand-audit/types'
import {
  openAuditPrintWindow,
  downloadAuditDocument,
  buildAuditMarkdownText,
} from '@/lib/brand-audit/export'

interface AuditExportButtonProps {
  audit: BrandAuditRecord
  className?: string
  buttonText?: string
  variant?: 'black' | 'white' | 'outline'
}

export default function AuditExportButton({
  audit,
  className = '',
  buttonText = 'Тайлан татах / PDF',
  variant = 'black',
}: AuditExportButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePrint = () => {
    openAuditPrintWindow(audit)
    setMenuOpen(false)
  }

  const handleDownloadMd = () => {
    downloadAuditDocument(audit, 'md')
    setMenuOpen(false)
  }

  const handleDownloadTxt = () => {
    downloadAuditDocument(audit, 'txt')
    setMenuOpen(false)
  }

  const handleDownloadJson = () => {
    downloadAuditDocument(audit, 'json')
    setMenuOpen(false)
  }

  const handleCopySummary = () => {
    const summary = `${audit.company} — Брэндбүүк Чанарын Аудитын Тайлан\nОноо: ${audit.qualityScore}/100\nХамралт: ${audit.coveragePct}%\n\n${audit.executiveSummaryMn}\n\nДэлгэрэнгүйг https://baysaass.space/brand-audit/${audit.id} үзэх боломжтой.`
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setMenuOpen(false)
    }, 1500)
  }

  const baseStyle =
    variant === 'black'
      ? 'bg-black text-white hover:bg-[#27272a] border-transparent'
      : variant === 'white'
      ? 'bg-white text-black hover:bg-[#fafafa] border-[#e4e4e7]'
      : 'bg-transparent text-black hover:bg-[#fafafa] border-[#e4e4e7]'

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Split Button: Primary Action (PDF) + Dropdown Toggle */}
      <div className="inline-flex rounded-full border border-inherit shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={handlePrint}
          title="Албан ёсны тайланг A4 PDF хэлбэрээр татах эсвэл хэвлэх"
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition ${baseStyle}`}
        >
          <Download className="size-3.5" />
          <span>{buttonText}</span>
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          title="Бусад форматаар татах сонголтууд"
          className={`border-l border-white/20 px-2.5 py-2 transition ${baseStyle}`}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#e4e4e7] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-[#f4f4f5] mb-1">
            <p className="text-[11px] font-bold text-black uppercase tracking-wider">
              Тайлан экспортлох сонголтууд
            </p>
            <p className="text-[10px] text-[#71717a]">
              {audit.company} · {audit.qualityScore}/100 оноо
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Printer className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold">Албан ёсны PDF татах / Хэвлэх</div>
                <div className="text-[10px] text-[#71717a]">A4 стандарттай, брэндийн тамгатай</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDownloadMd}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <FileText className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold">Markdown баримт (.md)</div>
                <div className="text-[10px] text-[#71717a]">Notion, Obsidian, GitHub-д шууд хуулах</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 shrink-0">
                <FileText className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold">Энгийн текст файл (.txt)</div>
                <div className="text-[10px] text-[#71717a]">Word эсвэл имэйлд хавсаргах</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-black hover:bg-[#fafafa] transition"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <FileCode className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold">JSON өгөгдөл (.json)</div>
                <div className="text-[10px] text-[#71717a]">Бүх 30 шалгуурын бүрэн API өгөгдөл</div>
              </div>
            </button>

            <div className="border-t border-[#f4f4f5] my-1 pt-1">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#52525b] hover:bg-[#fafafa] hover:text-black transition"
              >
                <div className="flex size-6 items-center justify-center rounded-md bg-neutral-100 shrink-0">
                  {copied ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3 text-[#71717a]" />
                  )}
                </div>
                <span className="text-[11px]">
                  {copied ? 'Дүгнэлт хуулагдлаа!' : 'Хураангуй дүгнэлтийг хуулах'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
