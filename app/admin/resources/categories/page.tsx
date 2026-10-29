'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Trash2,
  SlidersHorizontal,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { ResourceCategory } from '@/lib/resources/types'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [nameMn, setNameMn] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadCategories = () => {
    setLoading(true)
    fetch('/api/admin/resources/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameMn.trim()) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const catSlug = slug.trim() || nameMn.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    try {
      const res = await fetch('/api/admin/resources/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: catSlug,
          name: name.trim() || nameMn.trim(),
          nameMn: nameMn.trim(),
          slug: catSlug,
          description: description.trim(),
          sortOrder: categories.length + 1,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Алдаа гарлаа')

      setSuccess('Ангилал амжилттай нэмэгдлээ!')
      setNameMn('')
      setName('')
      setSlug('')
      setDescription('')
      loadCategories()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ангиллыг устгахдаа итгэлтэй байна уу?`)) return

    try {
      const res = await fetch(`/api/admin/resources/categories?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black p-6 md:p-10">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#e0e0e0]">
          <Link
            href="/admin/resources"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#71717a] hover:text-black transition"
          >
            <ArrowLeft className="size-4" />
            <span>Ресурсын удирдлага руу буцах</span>
          </Link>
          <span className="text-xs text-[#71717a] font-semibold">
            Нийт {categories.length} ангилал
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mb-2">
          Ангилал удирдах
        </h1>
        <p className="text-xs text-[#71717a] mb-8">
          Ресурсуудыг сэдэв, чиглэлээр нь бүлэглэх ангиллууд
        </p>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
            {success}
          </div>
        )}

        {/* Add New Category Form */}
        <form onSubmit={handleCreate} className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-6 mb-10 shadow-xs">
          <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="size-4" />
            <span>Шинэ ангилал нэмэх</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#18181b] mb-1.5">
                Монгол нэр <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Жишээ: Сав баглаа боодол"
                value={nameMn}
                onChange={(e) => {
                  setNameMn(e.target.value)
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181b] mb-1.5">
                Англи нэр (Нэмэлт)
              </label>
              <input
                type="text"
                placeholder="Packaging & Print"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#18181b] mb-1.5">
              Тайлбар
            </label>
            <input
              type="text"
              placeholder="Энэ ангилалд багтах агуулгын товч тайлбар..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0e0] bg-white text-xs text-black outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            {submitting ? 'Нэмж байна...' : '+ Ангилал нэмэх'}
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="rounded-3xl border border-[#e0e0e0] bg-white overflow-hidden shadow-xs">
          <div className="p-4 bg-[#fafafa] border-b border-[#e0e0e0] text-xs font-bold uppercase text-[#71717a]">
            Бүртгэлтэй ангиллууд
          </div>
          <div className="divide-y divide-[#e0e0e0]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#71717a]">Уншиж байна...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717a]">Ангилал бүртгэгдээгүй байна.</div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-[#fafafa] transition">
                  <div>
                    <p className="font-bold text-xs text-black">{cat.nameMn}</p>
                    <p className="text-[11px] text-[#71717a]">
                      slug: <code>{cat.slug || cat.id}</code> {cat.description ? `· ${cat.description}` : ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.nameMn)}
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
      </div>
    </main>
  )
}
