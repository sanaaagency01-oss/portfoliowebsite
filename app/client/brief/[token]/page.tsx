'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, Link2, Send, Sparkles } from 'lucide-react'
import { ThinkingLoader } from '@/components/ui/thinking-loader'

type Question = { key: string; text: string; chips: string[]; category?: string }
type State = {
  answers: Record<string, string>
  messages: { role: 'AI' | 'CLIENT'; content: string }[]
  next?: Question
  progress: number
  complete: boolean
  classifiedType?: string
  aestheticScore?: number
  summary?: string
}

const initial: State = { answers: {}, messages: [], progress: 0, complete: false }

export default function BriefAssistantPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const [token, setToken] = useState('7xK92m')
  const [state, setState] = useState<State>(initial)
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(({ token: current }) => {
      setToken(current)
      fetch(`/api/brief/${current}`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.error) setState(data)
        })
        .catch((e) => console.error('Failed loading brief state', e))
    })
  }, [params])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, sending])

  const sections = useMemo(
    () => [
      ['Төслийн ерөнхий чиглэл', ['projectType', 'business', 'goal']],
      ['Зорилтот зах зээл & Хэрэглэгчид', ['audience']],
      ['Брэндийн өнгө аяс & Хэв маяг', ['style']],
      ['Хүлээлгэн өгөх материалууд', ['deliverables']],
      ['Хугацааны хүлээлт', ['timeline']],
      ['Төсвийн төлөвлөгөө', ['budget']],
      ['Visual референсүүд', ['references']],
      ['Үйлчилгээ баталгаажуулалт', ['serviceScope']],
    ],
    []
  )

  const send = async (answer = value) => {
    const textToSend = answer.trim()
    if (!textToSend || sending || state.complete) return

    setSending(true)
    try {
      const response = await fetch(`/api/brief/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: state.next?.key || 'chat',
          answer: textToSend,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setState(updated)
        setValue('')
      }
    } catch (e) {
      console.error('Failed sending brief response', e)
    } finally {
      setSending(false)
    }
  }

  if (submitted || state.complete) {
    return (
      <main className="min-h-screen bg-white text-black">
        <header className="border-b border-[#e0e0e0] bg-white px-6 md:px-10 h-[68px] flex items-center">
          <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[18px] font-bold tracking-tight text-black">
                baysaass<span className="text-[#888888]">.</span>
              </span>
            </Link>
            <Link
              href={`/client/${token}`}
              className="text-xs font-semibold text-[#666666] hover:text-black transition"
            >
              <ArrowLeft className="mr-1.5 inline size-3.5" /> Төслийн талбар
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-8 sm:p-12 shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-xl bg-black text-white">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
              Үйлчилгээний цар хүрээ & Бриф баталгаажлаа
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Таны бриф дизайнерт амжилттай хүрлээ.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#555555]">
              Таны хүссэн брэндингийн үйлчилгээ, хүлээлгэн өгөх материалууд, хугацааны хүлээлт болон төсвийн төлөвлөгөө бүртгэгдлээ. Дизайнер <strong>Т. Өсөхбаяр</strong> таны бриф дээр үндэслэн ажлын нарийвчилсан үнэ болон товлосон хугацааны саналаа (Proposal) бэлтгэж байна.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.classifiedType && (
                <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs">
                  <span className="text-[#888888] font-medium block">Баталгаажуулсан үйлчилгээ:</span>
                  <p className="mt-1 font-bold text-black">{state.classifiedType}</p>
                  {state.aestheticScore && (
                    <p className="mt-0.5 text-[#666666]">Өнгө аясын үнэлгээ: {state.aestheticScore}/5</p>
                  )}
                </div>
              )}

              {state.answers.timeline && (
                <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs">
                  <span className="text-[#888888] font-medium block">Хүссэн хугацаа:</span>
                  <p className="mt-1 font-bold text-black">{state.answers.timeline}</p>
                </div>
              )}

              {state.answers.budget && (
                <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs">
                  <span className="text-[#888888] font-medium block">Төлөвлөсөн төсвийн хүлээлт:</span>
                  <p className="mt-1 font-bold text-black">{state.answers.budget}</p>
                </div>
              )}

              {state.answers.serviceScope && (
                <div className="rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs">
                  <span className="text-[#888888] font-medium block">Үйлчилгээний цар хүрээ:</span>
                  <p className="mt-1 font-bold text-black truncate">{state.answers.serviceScope}</p>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-4 text-xs text-[#7c2d12]">
              <span className="font-bold block">Дараагийн алхам:</span>
              Дизайнер таны төсөлд зориулсан үнэ ба ажлын хугацааны саналаа төслийн талбарт илгээх бөгөөд та түүнийг хянаж зөвшөөрснөөр албан ёсны гэрээний шат руу шилжинэ.
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/client/${token}`}
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#222222]"
              >
                Төслийн талбар луу очих (Үнийн санал хүлээх) →
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Studio Header */}
      <header className="border-b border-[#e0e0e0] bg-white px-6 md:px-10 h-[68px] flex items-center">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[18px] font-bold tracking-tight text-black">
              baysaass<span className="text-[#888888]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3 py-1 text-[11px] font-medium text-[#666666]">
              <Sparkles className="size-3 text-black" /> Брэнд зөвлөх
            </span>
            <Link
              href={`/client/${token}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-black transition"
            >
              <ArrowLeft className="size-3.5" /> Төслийн талбар руу буцах
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1320px] gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-12">
        {/* Chat Conversation Box */}
        <section className="flex min-h-[680px] flex-col rounded-2xl border border-[#e0e0e0] bg-white shadow-sm">
          <div className="border-b border-[#e0e0e0] px-6 py-5 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                  AI Brief Assistant
                </p>
                <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-black">
                  Дизайн Төслийн Бриф
                </h1>
              </div>
              <span className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-3.5 py-1 text-xs font-bold text-black">
                {state.progress}% бүрдсэн
              </span>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-full rounded-full bg-black transition-all duration-300"
                style={{ width: `${Math.max(5, state.progress)}%` }}
              />
            </div>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 sm:px-8 max-h-[480px]">
            {state.messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === 'CLIENT'
                    ? 'ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-black px-4 py-3 text-sm leading-6 text-white shadow-sm'
                    : 'max-w-[84%] rounded-2xl rounded-bl-sm border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-sm leading-6 text-[#222222]'
                }
              >
                <p
                  className={`mb-1 text-[9px] font-bold uppercase tracking-wider ${
                    message.role === 'CLIENT' ? 'text-white/60' : 'text-[#888888]'
                  }`}
                >
                  {message.role === 'AI' ? 'Дизайн Зөвлөх' : 'Та'}
                </p>
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
            ))}

            {/* Next question prompt & quick chips */}
            {state.next && !state.complete && !sending && (
              <div className="pt-2">
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    {state.next.category || 'Дараагийн асуулт'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-black">{state.next.text}</p>
                </div>
                {state.next.chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {state.next.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => send(chip)}
                        className="rounded-full border border-[#e0e0e0] bg-white px-4 py-1.5 text-xs font-medium text-black transition hover:border-black hover:bg-[#fafafa]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sending && (
              <div className="flex flex-col items-start gap-1.5 pt-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#888888] px-1">
                  Дизайн Зөвлөх
                </p>
                <div className="inline-flex">
                  <ThinkingLoader
                    size="md"
                    variant="pill"
                    phases={[
                      'Хариултыг бодож байна...',
                      'Брифийн шаардлагыг шинжилж байна...',
                      'Дизайн чиглэлийг боловсруулж байна...',
                      'Хариулт бэлтгэж байна...',
                    ]}
                    interval={2000}
                    loop={true}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat text input */}
          <div className="border-t border-[#e0e0e0] p-4 sm:p-5">
            <div className="flex items-end gap-2 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-2 focus-within:border-black focus-within:bg-white transition">
              <textarea
                value={value}
                maxLength={500}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Хариултаа бичих эсвэл дизайны талаар асуулт тавина уу (Enter дарж илгээнэ)..."
                rows={2}
                className="min-h-12 flex-1 resize-none bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-[#999999] text-black"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!value.trim() || sending}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-black text-white transition hover:bg-[#222222] disabled:opacity-30"
              >
                <Send className="size-4" />
              </button>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#888888]">
              <span>💡 Зөвхөн брэнд, лого, сав баглаа, дизайны сэдвээр хариулна.</span>
              <span className="font-mono text-[10px]">{value.length}/500</span>
            </div>
          </div>
        </section>

        {/* Live Structure Sidebar */}
        <aside className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                Брифийн бүтэц
              </p>
              <h2 className="mt-1 text-base font-bold tracking-tight text-black">Бодит явц</h2>
            </div>
            <Sparkles className="size-4 text-[#888888]" />
          </div>

          <div className="mt-6 flex flex-col gap-5">
            {sections.map(([title, keys]) => {
              const completed = (keys as string[]).filter((key) => state.answers[key])
              return (
                <div key={title as string}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-black">{title as string}</p>
                    <span className="text-[10px] font-bold text-[#888888]">
                      {completed.length}/{(keys as string[]).length}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {(keys as string[]).map((key) => (
                      <div key={key} className="flex items-start gap-2 text-xs text-[#555555]">
                        {state.answers[key] ? (
                          <Check className="mt-0.5 size-3.5 shrink-0 text-black font-bold" />
                        ) : (
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#d0d0d0]" />
                        )}
                        <span className="truncate">
                          {state.answers[key] || key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-xs leading-5 text-[#666666]">
            <Link2 className="mr-1 inline size-3.5 text-black" /> Хариултууд автоматаар хадгалагдаж буй тул дундуур нь гарсан ч дараа нь үргэлжлүүлэх боломжтой.
          </div>
        </aside>
      </div>
    </main>
  )
}
