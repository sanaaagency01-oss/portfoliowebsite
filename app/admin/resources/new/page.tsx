'use client'

import React, { useState, useEffect } from 'react'
import { ResourceCategory } from '@/lib/resources/types'
import { DEFAULT_CATEGORIES } from '@/lib/resources/defaults'
import ResourceEditorForm from '@/components/studio/admin/ResourceEditorForm'
import { Loader2 } from 'lucide-react'

export default function NewResourceAdminPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/resources/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-black" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black p-6 md:p-10">
      <div className="max-w-[1000px] mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
          Шинэ Resource үүсгэх
        </h1>
        <p className="text-xs text-[#71717a] mt-1">
          Нийтлэл, татах загвар, эсвэл хэрэгслийн мэдээллийг оруулж нийтлээрэй
        </p>
      </div>

      <ResourceEditorForm categories={categories} />
    </main>
  )
}
