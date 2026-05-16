"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const n = translations[lang].nav

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const btnClass = (active: boolean) =>
    `text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150 ${
      active ? "text-black" : "text-[#aaaaaa] hover:text-[#666666]"
    }`

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-[150] transition-colors duration-300 ${
          scrolled ? "bg-[#ffffff] border-b border-[#e0e0e0]" : "bg-transparent"
        }`}
      >
        <nav
          className="max-w-[1320px] mx-auto flex items-center justify-between px-6 md:px-10 h-[68px]"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Left group */}
          <div className="flex items-center gap-8">
            <Link href="/about" className="nav-link text-black text-[15px] font-medium tracking-wide hidden md:block">
              {n.about}
            </Link>
          </div>

          {/* Center: MN  [./]  EN */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={() => setLang("mn")}
              className={`hidden md:block ${btnClass(lang === "mn")}`}
            >
              MN
            </button>
            <Link
              href="/"
              className="nav-link text-black text-[18px] font-bold tracking-tight"
              aria-label="Home"
            >
              baysaass
            </Link>
            <button
              onClick={() => setLang("en")}
              className={`hidden md:block ${btnClass(lang === "en")}`}
            >
              EN
            </button>
          </div>

          {/* Right group */}
          <div className="flex items-center gap-8">
            <Link href="/work" className="nav-link text-black text-[15px] font-medium tracking-wide hidden md:block">
              {n.projects}
            </Link>
            <Link href="/contact" className="nav-link text-black text-[15px] font-medium tracking-wide hidden md:block">
              {n.contact}
            </Link>
            <button
              className="md:hidden text-black text-[14px] font-medium tracking-widest uppercase nav-link"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen
                ? (lang === "mn" ? "Хаах" : "Close")
                : (lang === "mn" ? "Цэс" : "Menu")}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[200] bg-[#ffffff] flex flex-col items-center justify-center gap-10"
          >
            <Link href="/" className="text-black text-4xl font-black tracking-tight nav-link">
              baysaass
            </Link>
            <Link href="/work" className="text-black text-3xl font-bold tracking-tight nav-link">
              {n.work}
            </Link>
            <Link href="/about" className="text-black text-3xl font-bold tracking-tight nav-link">
              {n.about}
            </Link>
            <Link href="/contact" className="text-black text-3xl font-bold tracking-tight nav-link">
              {n.contact}
            </Link>
            {/* Mobile lang switcher */}
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => setLang("mn")} className={btnClass(lang === "mn")}>MN</button>
              <span className="text-[#dddddd] text-[12px]">/</span>
              <button onClick={() => setLang("en")} className={btnClass(lang === "en")}>EN</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
