'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  Printer,
  FileText,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Project } from '@/lib/types/studio'
import {
  openContractPrintWindow,
  downloadContractDocument,
  buildContractDocumentText,
} from '@/lib/contract-export'

interface ContractExportButtonProps {
  project: Project
  className?: string
  buttonText?: string
  variant?: 'black' | 'white' | 'outline'
  showDropdownOnly?: boolean
}

export default function ContractExportButton({
  project,
  className = '',
  buttonText = 'Гэрээ экспортлох / PDF',
  variant = 'black',
}: ContractExportButtonProps) {
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
    openContractPrintWindow(project)
    setMenuOpen(false)
  }

  const handleDownloadTxt = () => {
    downloadContractDocument(project, 'txt')
    setMenuOpen(false)
  }

  const handleDownloadMd = () => {
    downloadContractDocument(project, 'md')
    setMenuOpen(false)
  }

  const handleCopyText = () => {
    const text = buildContractDocumentText(project)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setMenuOpen(false)
    }, 1500)
  }

  const baseStyle =
    variant === 'black'
      ? 'bg-black text-white hover:bg-[#222222] border-transparent'
      : variant === 'white'
      ? 'bg-white text-black hover:bg-[#fafafa] border-[#e0e0e0]'
      : 'bg-transparent text-black hover:bg-[#fafafa] border-[#e0e0e0]'

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Split Button: Main Export Action + Dropdown Toggle */}
      <div className="inline-flex rounded-full border border-inherit shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={handlePrint}
          title="Гэрээг A4 хэлбэрээр хэвлэх эсвэл PDF болгон хадгалах"
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition ${baseStyle}`}
        >
          <Printer className="size-3.5" />
          <span>{buttonText}</span>
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          title="Бусад форматаар экспортлох сонголтууд"
          className={`border-l border-white/20 px-2.5 py-2 transition ${baseStyle}`}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-[#e0e0e0] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
            Гэрээ экспортлох сонголтууд
          </p>

          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-black hover:bg-[#f5f5f5] transition"
          >
            <Printer className="size-4 text-black" />
            <div className="text-left">
              <div>PDF татах / Хэвлэх (A4)</div>
              <span className="text-[10px] text-[#888888] font-normal">Хэвлэхэд бэлтгэсэн албан хуудас</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-black hover:bg-[#f5f5f5] transition"
          >
            <FileText className="size-4 text-[#555555]" />
            <div className="text-left">
              <div>Текст баримт (.txt)</div>
              <span className="text-[10px] text-[#888888] font-normal">Энгийн текст файл хэлбэрээр татах</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleDownloadMd}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-black hover:bg-[#f5f5f5] transition"
          >
            <Download className="size-4 text-[#555555]" />
            <div className="text-left">
              <div>Markdown файл (.md)</div>
              <span className="text-[10px] text-[#888888] font-normal">Бүтэцчилсэн markdown баримт</span>
            </div>
          </button>

          <div className="my-1 border-t border-[#f0f0f0]" />

          <button
            type="button"
            onClick={handleCopyText}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-black hover:bg-[#f5f5f5] transition"
          >
            {copied ? <Check className="size-4 text-[#226738]" /> : <Copy className="size-4 text-[#555555]" />}
            <div className="text-left">
              <div>{copied ? 'Гэрээ хуулагдлаа!' : 'Гэрээний текстийг хуулах'}</div>
              <span className="text-[10px] text-[#888888] font-normal">Clipboard руу шууд хуулах</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
