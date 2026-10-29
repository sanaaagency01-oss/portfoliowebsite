'use client'

import React, { useState, useEffect, use } from 'react'
import { ResourceItem, ResourceCategory } from '@/lib/resources/types'
import { DEFAULT_CATEGORIES } from '@/lib/resources/defaults'
import ResourceEditorForm from '@/components/studio/admin/ResourceEditorForm'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function EditResourceAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [resource, setResource] = useState<ResourceItem | null>(null)
  const [categories, setCategories] = useState<ResourceCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/resources/${id}`).then((r) => r.json()),
      fetch('/api/admin/resources/categories').then((r) => r.json()),
    ])
      .then(([resData, catData]) => {
        if (resData.resource) setResource(resData.resource)
        else setError('Resource олдсонгүй')

        if (catData.categories && catData.categories.length > 0) {
          setCategories(catData.categories)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-black" />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-white text-black p-10 text-center">
        <AlertCircle className="size-10 text-rose-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Resource олдсонгүй</h1>
        <Link
          href="/admin/resources"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold"
        >
          Буцах
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black p-6 md:p-10">
      <div className="max-w-[1000px] mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
          Resource засварлах
        </h1>
        <p className="text-xs text-[#71717a] mt-1">
          {resource.title}
        </p>
      </div>

      <ResourceEditorForm
        initialResource={resource}
        categories={categories}
        isEditing={true}
      />
    </main>
  )
}
