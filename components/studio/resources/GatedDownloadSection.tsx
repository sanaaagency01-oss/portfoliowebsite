'use client'

import React, { useState, useEffect } from 'react'
import { Download, Lock, Unlock, Mail, User, CheckCircle2, AlertCircle, Loader2, Sparkles, FileText, ArrowRight } from 'lucide-react'
import { DownloadFileItem } from '@/lib/resources/types'

interface GatedDownloadSectionProps {
  resourceId: string
  resourceTitle: string
  downloadFiles: DownloadFileItem[]
  gated?: boolean
}

export default function GatedDownloadSection({
  resourceId,
  resourceTitle,
  downloadFiles,
  gated = true,
}: GatedDownloadSectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(!gated)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [activeFiles, setActiveFiles] = useState<DownloadFileItem[]>(downloadFiles || [])
  const [unlockedUserEmail, setUnlockedUserEmail] = useState<string | null>(null)

  useEffect(() => {
    setActiveFiles(downloadFiles || [])
  }, [downloadFiles])

  // Check localStorage on mount
  useEffect(() => {
    if (!gated) {
      setIsUnlocked(true)
      return
    }

    try {
      const unlocked = localStorage.getItem(`baysaass_unlocked_${resourceId}`) === 'true'
      const savedEmail = localStorage.getItem('baysaass_lead_email')
      const savedName = localStorage.getItem('baysaass_lead_name')

      if (savedName) setName(savedName)
      if (savedEmail) {
        setEmail(savedEmail)
        setUnlockedUserEmail(savedEmail)
      }

      if (unlocked) {
        setIsUnlocked(true)
      }
    } catch {
      // LocalStorage not accessible
    }
  }, [resourceId, gated])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName || cleanName.length < 2) {
      setError('Өөрийн нэрээ бүрэн оруулна уу (доод тал нь 2 үсэг).')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Зөв Gmail эсвэл и-мэйл хаяг оруулна уу (жишээ: нэр@gmail.com).')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/resources/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          resourceTitle,
          name: cleanName,
          email: cleanEmail,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Файл татах эрх нээхэд алдаа гарлаа')
      }

      // Persist in localStorage
      try {
        localStorage.setItem(`baysaass_unlocked_${resourceId}`, 'true')
        localStorage.setItem('baysaass_lead_email', cleanEmail)
        localStorage.setItem('baysaass_lead_name', cleanName)
      } catch {
        // LocalStorage fallback
      }

      if (data.downloadFiles && Array.isArray(data.downloadFiles) && data.downloadFiles.length > 0) {
        setActiveFiles(data.downloadFiles)
      }

      setUnlockedUserEmail(cleanEmail)
      setIsUnlocked(true)
      setSuccessMsg('Файл татах эрх амжилттай нээгдлээ!')

      // If there's a primary file, trigger download automatically
      if (activeFiles.length > 0 && activeFiles[0].fileUrl) {
        const link = document.createElement('a')
        link.href = activeFiles[0].fileUrl
        link.download = activeFiles[0].name || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err: any) {
      setError(err.message || 'Сүлжээний алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  if (activeFiles.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-8 text-center text-xs text-[#888888]">
        Одоогоор татах файл байршуулаагүй байна.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-10 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-[#e4e4e7]">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {isUnlocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">
              Татаж авах файлууд
            </h2>
          </div>
          <p className="text-xs text-[#666666] mt-1 ml-10">
            {isUnlocked
              ? 'Дараах эх файлуудыг өөрийн брэнд дизайны төсөлд үнэгүй ашиглах боломжтой.'
              : 'Энэхүү файлыг татаж авахын тулд өөрийн нэр болон Gmail хаягаа бүртгүүлнэ үү.'}
          </p>
        </div>

        {isUnlocked && unlockedUserEmail && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span className="truncate max-w-[200px]">{unlockedUserEmail}</span>
          </div>
        )}
      </div>

      {/* Success banner if just unlocked */}
      {successMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <div className="flex-1 text-xs text-emerald-900 font-medium">
            <p className="font-bold">Амжилттай нээгдлээ!</p>
            <p className="text-emerald-700 mt-0.5">Файлууд нээгдсэн бөгөөд татаж авах товчийг дарж авна уу.</p>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-3 mb-8">
        {activeFiles.map((file, idx) => (
          <div
            key={file.id || idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#e0e0e0] bg-white hover:border-black/30 transition shadow-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  {file.format || 'FILE'}
                </span>
                <p className="font-bold text-sm text-black truncate">{file.name}</p>
              </div>
              {file.description && (
                <p className="text-xs text-[#666666] mt-1">{file.description}</p>
              )}
              <span className="text-[11px] text-[#888888] mt-1 block">
                Хэмжээ: {file.fileSize || 'Тодорхойгүй'}
              </span>
            </div>

            {isUnlocked ? (
              <a
                href={file.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0 shadow-lg"
              >
                <Download className="size-3.5" />
                <span>Файл татах</span>
              </a>
            ) : (
              <div className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-bold shrink-0 border border-neutral-200">
                <Lock className="size-3.5" />
                <span>Түгжээтэй</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gated Unlock Form if locked */}
      {!isUnlocked && (
        <div className="rounded-3xl border border-blue-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-black tracking-tight">
                Эх файлыг үнэгүй татах эрхээ нээнэ үү
              </h3>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Өөрийн нэр болон Gmail хаягаа оруулснаар татах эрх шууд нээгдэх бөгөөд та файлыг хүссэн цагтаа дахин татаж авах боломжтой болно.
              </p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Таны нэр <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="size-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: Бат, Саруул..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e0e0e0] bg-[#fafafa] text-xs font-medium text-black focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Gmail / И-мэйл хаяг <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="size-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="жишээ@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e0e0e0] bg-[#fafafa] text-xs font-medium text-black focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Шалгаж байна...</span>
                  </>
                ) : (
                  <>
                    <span>Нээгээд шууд татах (Үнэгүй)</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#71717a] flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Спам илгээхгүй. Зөвхөн дизайны шинэ загвар, нийтлэл хүргэнэ.</span>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

