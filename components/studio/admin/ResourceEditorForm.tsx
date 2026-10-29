'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Download,
  Wrench,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  Globe,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Quote,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { ResourceItem, ResourceType, ResourceStatus, ResourceCategory, DownloadFileItem } from '@/lib/resources/types'

interface ResourceEditorFormProps {
  initialResource?: ResourceItem
  categories: ResourceCategory[]
  isEditing?: boolean
}

export default function ResourceEditorForm({
  initialResource,
  categories,
  isEditing = false,
}: ResourceEditorFormProps) {
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const downloadFileInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Form states
  const [type, setType] = useState<ResourceType>(initialResource?.type || 'article')
  const [title, setTitle] = useState(initialResource?.title || '')
  const [slug, setSlug] = useState(initialResource?.slug || '')
  const [summary, setSummary] = useState(initialResource?.summary || '')
  const [coverImage, setCoverImage] = useState(initialResource?.coverImage || '')
  const [category, setCategory] = useState(initialResource?.category || (categories[0]?.id || 'guides'))
  const [tagsInput, setTagsInput] = useState(initialResource?.tags?.join(', ') || '')
  const [content, setContent] = useState(initialResource?.content || '')
  const [downloadFiles, setDownloadFiles] = useState<DownloadFileItem[]>(initialResource?.downloadFiles || [])
  const [destinationUrl, setDestinationUrl] = useState(initialResource?.destinationUrl || '')
  const [ctaLabel, setCtaLabel] = useState(
    initialResource?.ctaLabel || (type === 'download' ? 'Татаж авах (PDF)' : type === 'tool' ? 'Хэрэгсэл нээх' : 'Нийтлэл унших')
  )
  const [featured, setFeatured] = useState(initialResource?.featured || false)
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialResource?.readTimeMinutes || 5)
  const [status, setStatus] = useState<ResourceStatus>(initialResource?.status || 'draft')

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialResource?.seo?.title || '')
  const [seoDescription, setSeoDescription] = useState(initialResource?.seo?.description || '')

  // UI state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Auto-generate slug on title change
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isEditing || !slug) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
        .replace(/^-|-$/g, '')
      setSlug(autoSlug)
    }
  }

  // Cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setUploadingCover(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/resources/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Зураг хуулахад алдаа гарлаа')
      setCoverImage(data.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingCover(false)
    }
  }

  // Downloadable file upload
  const handleDownloadFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setUploadingFile(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/resources/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Файл хуулахад алдаа гарлаа')

      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
      const newItem: DownloadFileItem = {
        id: `dl_${Date.now()}`,
        name: data.fileName || file.name,
        fileUrl: data.url,
        fileSize: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        format: ext,
        description: 'Үйлдвэрлэлийн эх файл',
      }
      setDownloadFiles((prev) => [...prev, newItem])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingFile(false)
    }
  }

  // Insert markdown snippet into content
  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = contentTextareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${prefix}${selected || 'бичвэр'}${suffix}`
    const nextContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(nextContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 7))
    }, 0)
  }

  // Save handler
  const handleSave = async (targetStatus: ResourceStatus) => {
    if (!title.trim()) {
      setError('Гарчиг заавал шаардлагатай.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      type,
      title: title.trim(),
      slug: slug.trim() || `resource-${Date.now()}`,
      summary: summary.trim(),
      coverImage: coverImage.trim() || '/work/one-more-night/01.jpg',
      category,
      tags,
      content,
      downloadFiles,
      destinationUrl: type === 'tool' ? destinationUrl.trim() : undefined,
      ctaLabel: ctaLabel.trim(),
      featured,
      readTimeMinutes: Number(readTimeMinutes) || 5,
      status: targetStatus,
      seo: {
        title: seoTitle.trim() || title.trim(),
        description: seoDescription.trim() || summary.trim(),
      },
    }

    try {
      const endpoint = isEditing && initialResource?.id ? `/api/admin/resources/${initialResource.id}` : '/api/admin/resources'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Хадгалахад алдаа гарлаа')
      }

      setStatus(targetStatus)
      setSuccessMsg(targetStatus === 'published' ? 'Амжилттай нийтлэгдлээ!' : 'Ноорог амжилттай хадгалагдлаа!')
      setTimeout(() => setSuccessMsg(null), 3000)

      if (!isEditing && data.resource?.id) {
        router.push(`/admin/resources/${data.resource.id}/edit`)
      }
    } catch (err: any) {
      setError(err.message || 'Сүлжээний алдаа')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-28">
      {/* Back button & Title */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e0e0e0]">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#71717a] hover:text-black transition"
        >
          <ArrowLeft className="size-4" />
          <span>Бүх ресурсууд руу буцах</span>
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              status === 'published'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {status === 'published' ? '● Нийтлэгдсэн' : '○ Ноорог (Draft)'}
          </span>

          {slug && (
            <Link
              href={`/resources/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e0e0e0] text-xs font-semibold text-[#52525b] hover:text-black hover:bg-[#fafafa] transition"
            >
              <Eye className="size-3.5" />
              <span>Шууд үзэх</span>
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 font-medium">{successMsg}</p>
        </div>
      )}

      {/* 1. RESOURCE TYPE SELECTION */}
      <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 mb-8 shadow-xs">
        <label className="block text-xs font-bold text-[#18181b] mb-3">
          Ресурсын төрөл сонгох <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'article',
              label: 'Article / Guide',
              desc: 'Website дээр шууд унших удирдамж, нийтлэл',
              icon: FileText,
            },
            {
              id: 'download',
              label: 'Download / Template',
              desc: 'PDF, ZIP, загвар файл татаж авах нөөц',
              icon: Download,
            },
            {
              id: 'tool',
              label: 'Tool / Application',
              desc: 'Brandbook Auditor, AI Brief зэрэг интерактив хэрэгсэл',
              icon: Wrench,
            },
          ].map((item) => {
            const Icon = item.icon
            const isSelected = type === item.id
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setType(item.id as ResourceType)
                  if (!isEditing) {
                    setCtaLabel(item.id === 'download' ? 'Татаж авах (PDF)' : item.id === 'tool' ? 'Хэрэгсэл нээх' : 'Нийтлэл унших')
                  }
                }}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-black bg-white ring-2 ring-black shadow-xs'
                    : 'border-[#e0e0e0] bg-white hover:border-[#a1a1aa]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`size-4 ${isSelected ? 'text-black' : 'text-[#888888]'}`} />
                  <p className="text-xs font-bold text-black">{item.label}</p>
                </div>
                <p className="text-[11px] text-[#71717a] leading-relaxed">{item.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. GENERAL INFORMATION */}
      <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 mb-8 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-black uppercase tracking-wider">
          Үндсэн мэдээлэл
        </h2>

        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">
            Гарчиг (Title) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Жишээ: Лого дизайны үйлдвэрлэлийн өмнөх шалгуур (Checklist)"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[#e0e0e0] bg-white text-sm font-semibold text-black focus:outline-none focus:border-black transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">
            URL Slug <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center rounded-2xl border border-[#e0e0e0] bg-white px-4 py-2.5 text-xs text-[#71717a] focus-within:border-black">
            <span className="shrink-0 select-none font-mono">baysaass.space/resources/</span>
            <input
              type="text"
              required
              placeholder="logo-design-checklist"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-transparent font-mono text-black outline-none font-semibold pl-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">
            Товч тайлбар (Summary) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="Карт болон сошиал сүлжээнд харагдах 1-2 өгүүлбэр бүхий товч тайлбар..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-[#e0e0e0] bg-white text-xs text-black focus:outline-none focus:border-black transition"
          />
        </div>

        {/* Cover Image Upload / Input */}
        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">
            Нүүр зураг (Cover Image)
          </label>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="size-20 rounded-2xl bg-white border border-[#e0e0e0] overflow-hidden shrink-0 flex items-center justify-center">
              {coverImage ? (
                <img src={coverImage} alt="Cover preview" className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-6 text-[#888888]" />
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e0e0e0] bg-white text-xs font-bold text-black hover:bg-[#fafafa] transition"
                >
                  {uploadingCover ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                  <span>{uploadingCover ? 'Хуулж байна...' : 'Зураг upload хийх'}</span>
                </button>
                <span className="text-[11px] text-[#71717a]">эсвэл URL оруулах:</span>
              </div>
              <input
                type="text"
                placeholder="/work/one-more-night/01.jpg эсвэл https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black focus:outline-none focus:border-black font-mono"
              />
            </div>
          </div>
        </div>

        {/* Category, Tags, CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#18181b] mb-1.5">
              Ангилал (Category)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs font-semibold text-black outline-none focus:border-black"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameMn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181b] mb-1.5">
              Товчлуурын бичвэр (CTA Label)
            </label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs font-semibold text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181b] mb-1.5">
              Унших хугацаа (минут)
            </label>
            <input
              type="number"
              min={1}
              value={readTimeMinutes}
              onChange={(e) => setReadTimeMinutes(Number(e.target.value) || 3)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs font-semibold text-black outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">
            Шошго (Tags — Таслалаар тусгаарлах)
          </label>
          <input
            type="text"
            placeholder="Logo, Branding, Packaging, Typography, Vector"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="size-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-xs font-bold text-black">★ Нүүр хуудас болон онцлох жагсаалтад гаргах (Featured)</span>
          </label>
        </div>
      </div>

      {/* 3. TYPE-SPECIFIC CONTENT EDITORS */}

      {/* Case A: ARTICLE / GUIDE -> Structured Rich Markdown Editor */}
      {type === 'article' && (
        <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <FileText className="size-4" />
              <span>Нийтлэлийн агуулга (Rich Text / Markdown Editor)</span>
            </h2>

            <div className="flex items-center gap-1 rounded-xl bg-white border border-[#e0e0e0] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'edit' ? 'bg-black text-white' : 'text-[#71717a] hover:text-black'
                }`}
              >
                Засварлах
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'preview' ? 'bg-black text-white' : 'text-[#71717a] hover:text-black'
                }`}
              >
                Урьдчилан харах
              </button>
            </div>
          </div>

          {activeTab === 'edit' ? (
            <div>
              {/* Quick Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-t-2xl border border-b-0 border-[#e0e0e0]">
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ')}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="H2 Гарчиг"
                >
                  <Heading2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="H3 Дэд гарчиг"
                >
                  <Heading3 className="size-4" />
                </button>
                <div className="w-[1px] h-4 bg-[#e0e0e0] mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="Тод (Bold)"
                >
                  <Bold className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="Налуу (Italic)"
                >
                  <Italic className="size-4" />
                </button>
                <div className="w-[1px] h-4 bg-[#e0e0e0] mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="Жагсаалт (List)"
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="Ишлэл (Quote)"
                >
                  <Quote className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[Холбоосын нэр](', ')') }
                  className="p-1.5 rounded-lg hover:bg-[#fafafa] text-xs font-bold text-black"
                  title="Холбоос оруулах"
                >
                  <Link2 className="size-4" />
                </button>
              </div>

              <textarea
                ref={contentTextareaRef}
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="## Нийтлэлийн гарчиг&#10;&#10;Нийтлэлийн эхний догол мөр...&#10;&#10;### Дэд сэдэв&#10;- Гол санаа 1&#10;- Гол санаа 2"
                className="w-full px-4 py-3 rounded-b-2xl border border-[#e0e0e0] bg-white text-xs font-mono text-black leading-relaxed focus:outline-none focus:border-black"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 md:p-8 max-h-[500px] overflow-y-auto prose prose-sm max-w-none text-xs leading-relaxed">
              <div className="whitespace-pre-line font-sans text-sm text-[#27272a]">
                {content || 'Одоогоор агуулга бичигдээгүй байна.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Case B: DOWNLOAD / TEMPLATE -> Downloadable Files Manager */}
      {type === 'download' && (
        <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <Download className="size-4" />
                <span>Татаж авах файлууд (Download Assets)</span>
              </h2>
              <p className="text-[11px] text-[#71717a] mt-0.5">
                Хэрэглэгчдийн татаж авах PDF, ZIP, эх файлуудыг энд байршуулна
              </p>
            </div>

            <input
              type="file"
              ref={downloadFileInputRef}
              onChange={handleDownloadFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => downloadFileInputRef.current?.click()}
              disabled={uploadingFile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition"
            >
              {uploadingFile ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
              <span>{uploadingFile ? 'Хуулж байна...' : 'Шинэ файл оруулах'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {downloadFiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white p-8 text-center text-xs text-[#71717a]">
                Одоогоор татах файл байхгүй байна. Дээрх товчийг дарж файл оруулаарай.
              </div>
            ) : (
              downloadFiles.map((file, idx) => (
                <div
                  key={file.id || idx}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#e0e0e0] bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      {file.format}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-black truncate">{file.name}</p>
                      <p className="text-[11px] text-[#71717a] truncate mt-0.5">
                        {file.fileSize} · {file.fileUrl}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDownloadFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    title="Устгах"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Case C: TOOL / APPLICATION -> Destination Link & Description */}
      {type === 'tool' && (
        <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 mb-8 shadow-xs">
          <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2 mb-4">
            <Wrench className="size-4" />
            <span>Хэрэгслийн холбоос (Destination URL)</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18181b] mb-1.5">
                Хэрэгсэл рүү үсрэх хаяг <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Жишээ нь: /brand-audit эсвэл https://..."
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs font-mono text-black focus:outline-none focus:border-black font-semibold"
              />
              <p className="text-[11px] text-[#71717a] mt-1">
                Дотоод хэрэгсэл бол <code>/brand-audit</code>, <code>/client/brief</code>, эсвэл гадны веб бол бүтэн URL бичнэ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. SEO SETTINGS */}
      <div className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 md:p-8 mb-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
          <Globe className="size-4" />
          <span>SEO & Хайлтын системийн тохиргоо (Нэмэлт)</span>
        </h2>

        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">SEO Title</label>
          <input
            type="text"
            placeholder={title || 'Google дээр гарах гарчиг'}
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#18181b] mb-1.5">SEO Description</label>
          <textarea
            rows={2}
            placeholder={summary || 'Google хайлтын тайлбар'}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black outline-none focus:border-black"
          />
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e0e0e0] bg-white/95 backdrop-blur-md px-6 py-4 shadow-lg">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#71717a]">
              Статус: <strong className="text-black capitalize">{status}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e0e0e0] bg-white text-xs font-bold text-black hover:bg-[#fafafa] transition"
            >
              <Save className="size-3.5" />
              <span>Ноороглож хадгалах</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition shadow-md"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5 text-emerald-400" />}
              <span>{isEditing && status === 'published' ? 'Өөрчлөлтийг нийтлэх' : 'Нийтлэх (Publish)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
