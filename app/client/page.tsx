'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function ClientLandingPage() {
  const [tokenInput, setTokenInput] = useState('')
  const router = useRouter()

  const handleEnterPortal = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = tokenInput.trim()
    if (clean) {
      router.push(`/client/${clean}`)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-black">
      <div className="w-full max-w-md rounded-2xl border border-[#e0e0e0] bg-white p-8 sm:p-10 shadow-sm">
        <Link href="/" className="inline-block text-[20px] font-bold tracking-tight text-black">
          baysaass<span className="text-[#888888]">.</span>
        </Link>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
          Client Access
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-black">
          Харилцагчийн талбар
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#666666]">
          Танд ирсэн төслийн нууц кодыг (Token) оруулж ажлын явцаа хянана уу.
        </p>

        <form onSubmit={handleEnterPortal} className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Төслийн кодоо оруулна уу..."
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-sm text-black outline-none focus:border-black focus:bg-white transition placeholder:text-[#aaaaaa]"
          />

          <button
            type="submit"
            disabled={!tokenInput.trim()}
            className="flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#222222] disabled:opacity-40"
          >
            Талбар луу нэвтрэх <ArrowRight className="size-4" />
          </button>
        </form>

        {/* Start new brief CTA for new visitors */}
        <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-black">
            <Sparkles className="size-3.5" /> Шинэ төсөл эхлүүлэх үү?
          </div>
          <p className="mt-1 text-[11px] text-[#666666]">
            Хэрэв танд код байхгүй бол манай AI туслахтай чатлан ажлын шаардлагаа илгээгээрэй.
          </p>
          <Link
            href="/client/brief"
            className="mt-2.5 inline-flex items-center text-xs font-bold text-black underline underline-offset-4 hover:opacity-75 transition-opacity"
          >
            Ажлын шаардлага (AI бриф) илгээх →
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center border-t border-[#f0f0f0] pt-5 text-xs">
          <span className="flex items-center gap-1.5 text-[11px] text-[#888888]">
            <ShieldCheck className="size-3.5" /> Төслийн бүх мэдээлэл нууцлагдсан
          </span>
        </div>
      </div>
    </main>
  )
}
