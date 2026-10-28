"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import FadeUp from "@/components/fade-up"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

const projectValues = ["brand-identity", "packaging", "lettering", "web-design", "brand-strategy", "other"]
const budgetValues   = ["5k-10k", "10k-25k", "25k-50k", "50k+", "discuss"]

const inputCls = "w-full bg-[#f5f5f5] border border-[#cccccc] text-black text-[15px] px-4 py-3.5 rounded outline-none focus:border-black transition-colors duration-200 placeholder:text-[#aaaaaa]"

function SelectField({
  id,
  name,
  value,
  onChange,
  placeholder,
  options,
  values,
}: {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder: string
  options: readonly string[]
  values: string[]
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputCls} appearance-none cursor-pointer pr-10`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt, i) => (
          <option key={opt} value={values[i]}>{opt}</option>
        ))}
      </select>
      {/* Custom chevron */}
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888888]">
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  )
}

export default function ContactContent() {
  const router = useRouter()
  const { lang } = useLang()
  const T = translations[lang].contact

  const [submitted, setSubmitted] = useState(false)
  const [briefUrl, setBriefUrl] = useState("")
  const [sending, setSending] = useState(false)
  const [startingBrief, setStartingBrief] = useState(false)
  const [sendError, setSendError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", project: "", budget: "", message: "" })

  const handleStartBrief = async () => {
    setStartingBrief(true)
    try {
      const res = await fetch("/api/brief/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          projectType: form.project,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.briefUrl) {
          router.push(data.briefUrl)
          return
        }
      }
    } catch (e) {
      console.error("Failed to start brief", e)
    } finally {
      setStartingBrief(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      if (data.briefUrl) setBriefUrl(data.briefUrl)
      setSubmitted(true)
    } catch {
      setSendError(
        lang === "mn"
          ? "Илгээхэд алдаа гарлаа. Дахин оролдоно уу."
          : "Something went wrong. Please try again."
      )
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const fieldVariant = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  }

  return (
    <>
      <Navigation />

      <main className="pt-[68px]">
        {/* Header */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-8">
              {T.label}
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-black text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.95] text-balance max-w-[1000px]">
              {T.heading}
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-[#888888] text-[clamp(1rem,1.5vw,1.125rem)] mt-6 max-w-[520px] leading-relaxed">
              {T.subheading}
            </p>
            <a
              href="mailto:sanaaagency01@gmail.com"
              className="inline-block mt-4 text-[#888888] text-[15px] nav-link hover:text-black transition-colors duration-200"
            >
              sanaaagency01@gmail.com
            </a>
          </FadeUp>
        </section>

        {/* Content Section: AI Brief Action & Traditional Contact Form */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pb-28 md:pb-36">
          {/* 1. Primary Action: AI Brief Assistant Card */}
          <FadeUp delay={0.2}>
            <div className="mb-14 rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-black text-white">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                    {lang === "mn" ? "AI Дизайн Зөвлөх" : "AI Design Assistant"}
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-black">
                  {lang === "mn" ? "Ажлын шаардлага (Бриф) илгээх" : "Submit Project Brief (AI Guided)"}
                </h3>
                <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                  {lang === "mn"
                    ? "Манай AI туслахтай чатлан брэндийн зорилго, хэв маяг, хүлээлгэн өгөх материалуудаа 3 минутад алхам алхмаар тодорхойлж дизайнерт шууд илгээх боломжтой."
                    : "Formulate your project requirements, style preferences, and goals step-by-step with our AI assistant in 3 minutes."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartBrief}
                disabled={startingBrief}
                className="shrink-0 flex items-center gap-2.5 rounded-full bg-black px-7 py-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#222222] disabled:opacity-40"
              >
                <Sparkles className="size-3.5" />
                {startingBrief
                  ? (lang === "mn" ? "Бэлтгэж байна..." : "Starting...")
                  : (lang === "mn" ? "Ажлын шаардлага илгээх (AI чат) →" : "Start Project Brief (AI Chat) →")}
              </button>
            </div>
          </FadeUp>

          {/* 2. Traditional Contact Form */}
          <div className="mt-6 border-t border-[#e0e0e0] pt-12">
            <p className="mb-8 text-xs font-semibold uppercase tracking-[0.14em] text-[#888888]">
              {lang === "mn" ? "Эсвэл шууд зурвас үлдээх:" : "Or send a direct message:"}
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                  className="py-16 text-center rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-8 max-w-[680px]"
                >
                  <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-3">
                    {T.successLabel}
                  </p>
                  <h2 className="text-black text-3xl font-black tracking-tight">
                    {T.successHeading}
                  </h2>
                  <p className="mt-3 text-sm text-[#666666] max-w-md mx-auto">
                    {lang === "mn"
                      ? "Таны зурвасыг хүлээн авлаа. Хэрэв хүсвэл одоо төслийн дэлгэрэнгүй шаардлагаа AI туслахтай шууд бэлтгэж болно."
                      : "We received your message. You can also formulate detailed project requirements now with our AI assistant."}
                  </p>
                  {briefUrl && (
                    <div className="mt-6 flex justify-center">
                      <Link
                        href={briefUrl}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-xs font-semibold text-white transition hover:bg-[#222222]"
                      >
                        <Sparkles className="size-3.5" />
                        {lang === "mn"
                          ? "Ажлын шаардлагаа AI туслахаар дэлгэрүүлэх (3 мин) →"
                          : "Complete Project Brief with AI →"}
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="max-w-[680px] flex flex-col gap-8"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                >
                  {/* Name */}
                  <motion.div className="flex flex-col gap-2" variants={fieldVariant}>
                    <label htmlFor="name" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                      {T.nameLbl}
                    </label>
                    <input
                      id="name" name="name" type="text" required
                      value={form.name} onChange={handleChange} placeholder={T.namePh}
                      className={inputCls}
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div className="flex flex-col gap-2" variants={fieldVariant}>
                    <label htmlFor="email" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                      {T.emailLbl}
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      value={form.email} onChange={handleChange} placeholder={T.emailPh}
                      className={inputCls}
                    />
                  </motion.div>

                  {/* Project type */}
                  <motion.div className="flex flex-col gap-2" variants={fieldVariant}>
                    <label htmlFor="project" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                      {T.projectLbl}
                    </label>
                    <SelectField
                      id="project" name="project" value={form.project} onChange={handleChange}
                      placeholder={T.projectPh}
                      options={T.projectOptions as readonly string[]}
                      values={projectValues}
                    />
                  </motion.div>

                  {/* Budget */}
                  <motion.div className="flex flex-col gap-2" variants={fieldVariant}>
                    <label htmlFor="budget" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                      {T.budgetLbl}
                    </label>
                    <SelectField
                      id="budget" name="budget" value={form.budget} onChange={handleChange}
                      placeholder={T.budgetPh}
                      options={T.budgetOptions as readonly string[]}
                      values={budgetValues}
                    />
                  </motion.div>

                  {/* Message */}
                  <motion.div className="flex flex-col gap-2" variants={fieldVariant}>
                    <label htmlFor="message" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                      {T.messageLbl}
                    </label>
                    <textarea
                      id="message" name="message" required rows={5}
                      value={form.message} onChange={handleChange} placeholder={T.messagePh}
                      className={`${inputCls} resize-none`}
                    />
                  </motion.div>

                  {/* Submit button */}
                  <motion.div variants={fieldVariant} className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-black hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-semibold tracking-tight px-6 py-4 rounded-full shadow-sm transition-colors duration-200"
                    >
                      {sending
                        ? (lang === "mn" ? "Илгээж байна…" : "Sending…")
                        : <>{T.send} &rarr;</>
                      }
                    </button>
                    {sendError && (
                      <p className="text-red-500 text-[13px] text-center">{sendError}</p>
                    )}
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
