'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { AuditScope, AuditMedium } from '@/lib/brand-audit/types'
import { extractText } from 'unpdf'

export default function NewBrandAuditPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [scope, setScope] = useState<AuditScope>('full_brandbook')
  const [medium, setMedium] = useState<AuditMedium>('both')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Зөвхөн PDF файл оруулна уу.')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Зөвхөн PDF файл оруулна уу.')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUseSample = () => {
    setCompany('Nomad Roast Coffee')
    setEmail('contact@nomadroast.mn')
    setScope('full_brandbook')
    setMedium('both')
    setSelectedFile(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim()) {
      setError('Байгууллага эсвэл брэндийн нэрээ оруулна уу.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('company', company.trim())
      formData.append('email', email.trim())
      formData.append('scope', scope)
      formData.append('medium', medium)

      if (selectedFile) {
        formData.append('fileName', selectedFile.name)
        formData.append('fileSizeBytes', String(selectedFile.size))

        // 1. Direct upload raw binary to Cloudflare R2 (Bypasses Vercel 4.5MB limit completely)
        let uploadedFileKey = ''
        try {
          const urlRes = await fetch('/api/brand-audit/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: selectedFile.name,
              contentType: selectedFile.type || 'application/pdf',
              fileSizeBytes: selectedFile.size,
            }),
          })
          if (urlRes.ok) {
            const { uploadUrl, fileKey } = await urlRes.json()
            if (uploadUrl) {
              const r2Res = await fetch(uploadUrl, {
                method: 'PUT',
                body: selectedFile,
                headers: { 'Content-Type': selectedFile.type || 'application/pdf' },
              })
              if (r2Res.ok) {
                uploadedFileKey = fileKey
                formData.append('fileKey', fileKey)
              }
            }
          }
        } catch (r2Err) {
          console.warn('[Direct R2 upload attempt error, continuing with client extraction]', r2Err)
        }

        // 2. Pre-extract text in browser using unpdf for zero-latency audit analysis
        let extractedClientText = ''
        let clientPagesCount = 12

        try {
          const arrayBuffer = await selectedFile.arrayBuffer()
          const result = await extractText(new Uint8Array(arrayBuffer))
          const rawPages = Array.isArray(result.text) ? result.text : [result.text]
          clientPagesCount = Math.max(1, result.totalPages || rawPages.length || 1)
          extractedClientText = rawPages.filter(Boolean).join('\n\n').trim()
        } catch (clientErr) {
          console.warn('[Client PDF text extraction error, falling back to server]:', clientErr)
        }

        if (extractedClientText && extractedClientText.length > 50) {
          formData.append('extractedText', extractedClientText)
          formData.append('totalPages', String(clientPagesCount))
        }

        // Only attach binary directly to Vercel route if file is under 4MB and R2 wasn't already uploaded
        if (!uploadedFileKey && selectedFile.size < 4 * 1024 * 1024) {
          formData.append('file', selectedFile)
        } else if (!uploadedFileKey && (!extractedClientText || extractedClientText.length <= 50)) {
          throw new Error('Файлын хэмжээ 4.5MB-аас их бөгөөд уншигдах бичвэр олдсонгүй (сканнердсан зураг байх магадлалтай). 4.5MB-аас бага эсвэл вектор бичвэртэй PDF оруулна уу.')
        }
      } else {
        // If sample, pass rich representative brandbook text
        const sampleText = `
        ${company} Brand Identity Guidelines and Standards
        Эрхэм зорилго: Монголын кофе соёлыг дэлхийн жишигт хүргэж, байгальд ээлтэй тогтвортой хөгжлийг дэмжих.
        Үнэт зүйлс: Чанар, Шударга худалдаа, Олон нийтийн оролцоо.
        Брэндийн нэр: Nomad Roast Coffee. Текст дотор зөвхөн эхний үсгүүдийг томоор бичнэ. Товчлохыг хориглоно.
        Лого систем:
        Үндсэн лого нь хэвтээ болон босоо байрлалтай.
        Хамгаалалтын зай: Логоны эргэн тойронд тэмдэгтийн өндрийн 50% буюу 'X' зай байна.
        Хамгийн бага хэмжээ: Хэвлэлд 20мм, дэлгэцэнд 32px байна.
        Хориглох хэрэглээ: Логоны харьцааг сунгах, өнгийг дур мэдэн өөрчлөх, зургийн эсрэгцэлгүй дэвсгэр дээр тавихыг хатуу хориглоно.
        Өнгөний систем:
        Primary Amber: CMYK: 0 45 95 0 | RGB: 245 158 11 | HEX: #f59e0b | Pantone 137C
        Deep Espresso: CMYK: 30 70 80 85 | RGB: 30 15 10 | HEX: #1e0f0a | Pantone 4625C
        Warm Cream: CMYK: 2 4 10 0 | RGB: 250 245 235 | HEX: #faf5eb
        Typography:
        Үндсэн гарчгийн фонт: Syne Bold (Aa-Zz, 0-9)
        Текстийн фонт: Inter Regular, Medium, Bold. Кирилл болон латин дэмжлэгтэй.
        Fallback систем фонт: Arial, sans-serif.
        Мэдээллийн шатлал: H1: 48pt, H2: 32pt, Body: 14pt, Leading: 1.5.
        Дүрслэл ба хэрэглээ:
        Гэрэл зургийн өнгө аяс нь дулаан, байгалийн гэрэлтэй, кофе бэлтгэж буй бодит агшныг харуулна.
        Хэвлэлийн стандарт: Цаас 350gsm матт бүрэлттэй, зүсэлтийн зай 3мм bleed.
        `
        formData.append('extractedText', sampleText)
        formData.append('totalPages', '16')
      }

      const res = await fetch('/api/brand-audit', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const status = res.status
        const text = await res.text()
        let errMsg = 'Аудит эхлүүлэхэд алдаа гарлаа.'
        if (status === 413) {
          errMsg = 'Файлын хэмжээ серверийн хязгаараас (4.5MB) хэтэрсэн байна. Бага хэмжээтэй файл эсвэл шахсан PDF оруулна уу.'
        } else {
          try {
            const parsed = JSON.parse(text)
            if (parsed.error) errMsg = parsed.error
          } catch {
            if (text) errMsg = `Серверийн хариу: ${text.slice(0, 120)}`
          }
        }

        // Log the upload error to our tracker
        try {
          await fetch('/api/brand-audit/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company: company.trim(),
              fileName: selectedFile?.name || 'unknown.pdf',
              fileSizeBytes: selectedFile?.size || 0,
              errorMessage: errMsg,
              statusCode: status,
            }),
          })
        } catch {}

        throw new Error(errMsg)
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Аудит эхлүүлэхэд алдаа гарлаа')
      }

      router.push(`/brand-audit/${data.auditId}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Сүлжээний алдаа гарлаа. Дахин оролдоно уу.')
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />

      <main className="bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32 min-h-screen">
        <div className="max-w-[860px] mx-auto px-6 md:px-10">
          {/* Back Link */}
          <Link
            href="/brand-audit"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#888888] hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Брэнд аудит руу буцах</span>
          </Link>

          {/* Title */}
          <div className="mb-10">
            <p className="text-[#888888] text-[11px] sm:text-[12px] font-medium tracking-[0.18em] uppercase mb-2">
              Baysaass Brandbook Quality Auditor
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black">
              Брэндбүүк чанарын аудит эхлүүлэх
            </h1>
            <p className="text-[#666666] text-sm md:text-base mt-3 leading-relaxed">
              Брэндийн нэр болон PDF файлаа оруулахад систем 30 шалгуураар бодит заалтуудыг нэг бүрчлэн үнэлнэ.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
              <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Card 1: Basic Info */}
            <div className="rounded-3xl border border-[#e0e0e0] p-6 md:p-8 bg-[#fafafa]">
              <h2 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                  1
                </span>
                <span>Байгууллагын мэдээлэл</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">
                    Брэнд / Компанийн нэр <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: Nomad Roast Coffee"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#e0e0e0] bg-white text-sm text-black focus:outline-none focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">
                    Холбоо барих и-мэйл (Нэмэлт)
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.mn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#e0e0e0] bg-white text-sm text-black focus:outline-none focus:border-black transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Scope & Medium Selection */}
            <div className="rounded-3xl border border-[#e0e0e0] p-6 md:p-8 bg-[#fafafa]">
              <h2 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                  2
                </span>
                <span>Аудитын хүрээ ба орчин</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-black mb-2">
                    Баримт бичгийн төрөл (Scope)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'full_brandbook',
                        label: 'Бүрэн брэндбүүк',
                        desc: '9 модуль, 30 шалгуур бүрэн хамрагдана',
                      },
                      {
                        id: 'visual_identity',
                        label: 'Visual Identity',
                        desc: 'Лого, өнгө, үсэг, дүрслэл, хэрэглээ',
                      },
                      {
                        id: 'logo_only',
                        label: 'Лого гарын авлага',
                        desc: 'Логоны дүрэм, зай, өнгө, хэмжээ',
                      },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setScope(item.id as AuditScope)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          scope === item.id
                            ? 'border-black bg-white ring-2 ring-black shadow-xs'
                            : 'border-[#e0e0e0] bg-white hover:border-[#888888]'
                        }`}
                      >
                        <p className="text-xs font-bold text-black">{item.label}</p>
                        <p className="text-[11px] text-[#666666] mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-2">
                    Ашиглах орчин (Medium)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'both', label: 'Хоёулаа (Print & Digital)' },
                      { id: 'digital', label: 'Зөвхөн Дижитал' },
                      { id: 'print', label: 'Зөвхөн Хэвлэмэл' },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMedium(m.id as AuditMedium)}
                        className={`text-center py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                          medium === m.id
                            ? 'border-black bg-black text-white'
                            : 'border-[#e0e0e0] bg-white text-[#666666] hover:border-[#888888]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: File Upload */}
            <div className="rounded-3xl border border-[#e0e0e0] p-6 md:p-8 bg-[#fafafa]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-black flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                    3
                  </span>
                  <span>Брэндбүүк PDF файл оруулах</span>
                </h2>

                <button
                  type="button"
                  onClick={handleUseSample}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Жишээ өгөгдөл бөглөх
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-blue-600 bg-blue-50/50'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-[#d0d0d0] bg-white hover:border-black'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="size-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <FileText className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-black">{selectedFile.name}</p>
                    <p className="text-xs text-[#888888] mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Өөрчлөх бол товшино уу
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="size-12 rounded-2xl bg-[#f4f4f5] text-[#52525b] flex items-center justify-center mb-3">
                      <UploadCloud className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-black">
                      PDF файлаа чирж эсвэл товшиж сонгоно уу
                    </p>
                    <p className="text-xs text-[#888888] mt-1">
                      Хамгийн ихдээ 50MB хүртэлх албан ёсны brandbook / guideline PDF
                    </p>
                  </div>
                )}
              </div>

              {!selectedFile && (
                <p className="text-[11px] text-[#888888] mt-3">
                  Хэрэв танд яг одоо PDF файл байхгүй бол дээрх "Жишээ өгөгдөл бөглөх" товчийг дарж туршиж болно.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-semibold tracking-tight shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Аудитыг боловсруулж байна...</span>
                  </>
                ) : (
                  <>
                    <span>Аудит эхлүүлж тайлан харах &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  )
}
