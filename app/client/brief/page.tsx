'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'

export default function GenericBriefEntryPage() {
  const router = useRouter()
  const [starting, setStarting] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)
    setStarting(true)

    try {
      const res = await fetch('/api/brief/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.briefUrl) {
          router.push(data.briefUrl)
          return
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.message || 'Бриф эхлүүлэхэд серверээс алдаа буцаалаа. Түр хүлээгээд дахин оролдоно уу.')
      }
    } catch (e: any) {
      console.error('Failed starting brief', e)
      setErrorMessage('Сүлжээний холболтоо шалгаад дахин оролдоно уу.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-black">
      <div className="w-full max-w-md rounded-2xl border border-[#e0e0e0] bg-white p-8 sm:p-10 shadow-sm">
        <Link href="/" className="inline-block text-[20px] font-bold tracking-tight text-black">
          baysaass<span className="text-[#888888]">.</span>
        </Link>

        <div className="mt-8 flex size-12 items-center justify-center rounded-xl bg-black text-white">
          <Sparkles className="size-6" />
        </div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
          AI Brief Assistant
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-black">
          Ажлын шаардлага илгээх
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#666666]">
          Та өөрийн бизнесийн зорилго, хэв маяг, шаардлагатай ажлуудаа манай AI туслахтай чатлан 3 минутад тодорхойлж илгээх боломжтой.
        </p>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-600">
            <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleStart} className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Танай брэнд / Компанийн нэр"
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-sm text-black outline-none focus:border-black focus:bg-white transition placeholder:text-[#aaaaaa]"
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Таны нэр (Заавал биш)"
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-sm text-black outline-none focus:border-black focus:bg-white transition placeholder:text-[#aaaaaa]"
          />

          <button
            type="submit"
            disabled={starting}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-xs font-semibold text-white transition hover:bg-[#222222] disabled:opacity-40"
          >
            {starting ? 'AI бриф бэлтгэж байна...' : 'Бриф чатыг эхлүүлэх'} <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/contact"
            className="text-xs text-[#888888] hover:text-black transition"
          >
            ← Энгийн маягтаар холбогдох
          </Link>
        </div>
      </div>
    </main>
  )
}
