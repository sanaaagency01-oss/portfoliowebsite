"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import FadeUp from "@/components/fade-up"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    project: "",
    budget: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const fields = [
    {
      id: "name",
      label: "Name",
      type: "input",
      inputType: "text",
      placeholder: "Your name",
    },
    {
      id: "email",
      label: "Email",
      type: "input",
      inputType: "email",
      placeholder: "your@email.com",
    },
    { id: "project", label: "Project Type", type: "select-project" },
    { id: "budget", label: "Budget Range", type: "select-budget" },
    { id: "message", label: "Message", type: "textarea" },
  ]

  return (
    <>
      <Navigation />

      <main className="pt-[68px]">
        {/* ── Header ── */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-20">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-8">
              Contact
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-black text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.95] text-balance max-w-[800px]">
              Designing brands is a collaborative process.
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-[#888888] text-[clamp(1rem,1.5vw,1.125rem)] mt-6 max-w-[480px] leading-relaxed">
              Reach out and let’s explore your idea together.
            </p>
            <a
              href="mailto:baysaauskhuu@gmail.com"
              className="inline-block mt-4 text-[#888888] text-[15px] nav-link hover:text-black transition-colors duration-200"
            >
              baysaauskhuu@gmail.com
            </a>
          </FadeUp>
        </section>

        {/* ── Form ── */}
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
                  Message sent
                </p>
                <h2 className="text-black text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.04em] leading-[1.0]">
                  Talk soon.
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
                <motion.div
                  className="flex flex-col gap-2"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }}
                >
                  <label htmlFor="name" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="bg-[#f5f5f5] border border-[#cccccc] text-black text-[15px] px-4 py-3.5 outline-none focus:border-black transition-colors duration-200 placeholder:text-[#aaaaaa]"
                  />
                </motion.div>

                {/* Email */}
                <motion.div
                  className="flex flex-col gap-2"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }}
                >
                  <label htmlFor="email" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-[#f5f5f5] border border-[#cccccc] text-black text-[15px] px-4 py-3.5 outline-none focus:border-black transition-colors duration-200 placeholder:text-[#aaaaaa]"
                  />
                </motion.div>

                {/* Project type */}
                <motion.div
                  className="flex flex-col gap-2"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }}
                >
                  <label htmlFor="project" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                    Project Type
                  </label>
                  <select
                    id="project"
                    name="project"
                    value={form.project}
                    onChange={handleChange}
                    className="bg-[#f5f5f5] border border-[#cccccc] text-black text-[15px] px-4 py-3.5 outline-none focus:border-black transition-colors duration-200 appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-[#aaaaaa]">Select a service</option>
                    <option value="brand-identity">Brand Identity</option>
                    <option value="packaging">Packaging</option>
                    <option value="lettering">Lettering / Typography</option>
                    <option value="web-design">Web Design</option>
                    <option value="brand-strategy">Brand Strategy</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                {/* Budget */}
                <motion.div
                  className="flex flex-col gap-2"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }}
                >
                  <label htmlFor="budget" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className="bg-[#f5f5f5] border border-[#cccccc] text-black text-[15px] px-4 py-3.5 outline-none focus:border-black transition-colors duration-200 appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-[#aaaaaa]">Select a range</option>
                    <option value="5k-10k">$5,000 – $10,000</option>
                    <option value="10k-25k">$10,000 – $25,000</option>
                    <option value="25k-50k">$25,000 – $50,000</option>
                    <option value="50k+">$50,000+</option>
                    <option value="discuss">Prefer to discuss</option>
                  </select>
                </motion.div>

                {/* Message */}
                <motion.div
                  className="flex flex-col gap-2"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }}
                >
                  <label htmlFor="message" className="text-[#888888] text-[11px] font-medium tracking-[0.12em] uppercase">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project…"
                    className="bg-[#f5f5f5] border border-[#cccccc] text-black text-[15px] px-4 py-3.5 outline-none focus:border-black transition-colors duration-200 placeholder:text-[#aaaaaa] resize-none"
                  />
                </motion.div>

                {/* Submit */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } }}
                >
                  <button
                    type="submit"
                    className="text-black text-[15px] font-bold tracking-tight nav-link"
                  >
                    Send message &rarr;
                  </button>
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
