'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || '/admin'

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Нууц үг буруу байна')
        setLoading(false)
        return
      }

      // Successful login -> navigate to the requested admin page
      window.location.href = nextParam
    } catch (err) {
      console.error('Login error', err)
      setError('Холболтын алдаа гарлаа. Дахин оролдоно уу.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] p-4 sm:p-6 text-black selection:bg-black selection:text-white">
      {/* Back to Site Header */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#888888] hover:text-black transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>Нүүр хуудас</span>
        </Link>
      </div>

      <div className="w-full max-w-[420px]">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-black">
              baysaass<span className="text-[#888888]">.</span>
            </span>
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[#888888]">
            Studio OS · Admin Control
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-7 sm:p-9 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-black text-white shadow-xs">
                <Lock className="size-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-black">
                  Админ нэвтрэх
                </h1>
                <p className="text-[11px] text-[#888888]">
                  Хамгаалагдсан удирдлагын систем
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full border border-[#d2ebd6] bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-bold text-[#166534]">
              <ShieldCheck className="size-3" />
              <span>SSL 256-bit</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1.5">
                Админ нууц үг
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  placeholder="Нууц үгээ оруулна уу..."
                  className="w-full rounded-2xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-sm text-black outline-none focus:border-black focus:bg-white transition pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-[#fecdd3] bg-[#fff1f2] p-3 text-xs text-[#be123c]">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-xs font-bold text-white transition hover:bg-[#222222] disabled:opacity-40 shadow-sm"
            >
              {loading ? (
                <span>Шалгаж байна...</span>
              ) : (
                <>
                  <span>Системд нэвтрэх</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Studio Disclaimer */}
        <p className="mt-6 text-center text-[11px] text-[#aaaaaa]">
          © {new Date().getFullYear()} baysaass Studio OS · Бүх эрх хуулиар хамгаалагдсан
        </p>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-xs text-[#888888]">
          Ачаалж байна...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}
