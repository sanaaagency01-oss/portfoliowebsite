'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Lock, ArrowLeft } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin route error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] p-6 text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-8 sm:p-10 shadow-sm text-center">
        <Link href="/" className="inline-block text-xl font-bold tracking-tight text-black mb-6">
          baysaass<span className="text-[#888888]">.</span>
        </Link>

        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] mb-4">
          <AlertTriangle className="size-6" />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
          Studio OS · System Notice
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-black">
          Админ хуудсыг ачаалахад алдаа гарлаа
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#666666]">
          Түр зуурын сүлжээний холболт эсвэл сесс хугацаа дууссан байж болзошгүй. Дахин ачааллах эсвэл админ системдээ дахин нэвтэрнэ үү.
        </p>

        {error?.message && (
          <div className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#f7f7f7] p-3 text-left">
            <p className="text-[10px] font-mono font-medium text-[#666666] break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-1 text-[9px] font-mono text-[#999999]">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

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
            href="/admin/login"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e0e0e0] bg-white py-3 text-xs font-semibold text-black transition hover:bg-[#fafafa]"
          >
            <Lock className="size-3.5 text-[#666666]" />
            <span>Админ нэвтрэх рүү очих</span>
          </Link>

          <Link
            href="/"
            className="mt-2 text-xs text-[#888888] hover:text-black transition"
          >
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </main>
  )
}
