'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App-level error boundary:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-8 sm:p-10 shadow-sm text-center">
        <Link href="/" className="inline-block text-xl font-bold tracking-tight text-black mb-6">
          baysaass<span className="text-[#888888]">.</span>
        </Link>

        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#fafafa] border border-[#e5e5e5] text-black mb-4">
          <AlertCircle className="size-6 text-[#666666]" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-black">
          Хуудсыг ачаалахад алдаа гарлаа
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#666666]">
          Түр зуурын саатал гарлаа. Та дахин оролдоно уу эсвэл нүүр хуудас руу шилжинэ үү.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => {
              reset()
              window.location.reload()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-xs font-bold text-white transition hover:bg-[#222222] shadow-sm"
          >
            <RefreshCw className="size-3.5" />
            <span>Дахин ачааллах</span>
          </button>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e0e0e0] bg-white py-3 text-xs font-semibold text-black transition hover:bg-[#fafafa]"
          >
            <Home className="size-3.5 text-[#666666]" />
            <span>Нүүр хуудас руу очих</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
