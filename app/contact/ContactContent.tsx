"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const { lang } = useLang()
  const T = translations[lang].contact

  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", project: "", budget: "", message: "" })

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
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-20">
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
            <p className="text-[#888888] text-[clamp(1rem,1.5vw,1.125rem)] mt-6 max-w-[480px] leading-relaxed">
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

        {/* Form */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pb-28 md:pb-36">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                className="py-20 text-center"
              >
                <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-4">
                  {T.successLabel}
                </p>
                <h2 className="text-black text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.04em] leading-[1.0]">
                  {T.successHeading}
                </h2>
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
                    id="message" name="message" required rows={6}
                    value={form.message} onChange={handleChange} placeholder={T.messagePh}
                    className={`${inputCls} resize-none`}
                  />
                </motion.div>

                {/* Submit — prominent CTA */}
                <motion.div variants={fieldVariant} className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[15px] font-semibold tracking-tight px-6 py-4 rounded-full shadow-lg transition-colors duration-200"
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
        </section>
      </main>

      <Footer />
    </>
  )
}
