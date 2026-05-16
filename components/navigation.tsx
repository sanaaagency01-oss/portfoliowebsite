"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"
import StaggeredMenuPanel from "@/components/ui/staggered-menu-panel"

const SOCIAL_ITEMS = [
  { label: "Instagram", href: "https://www.instagram.com/_baysaa_notfound/" },
  { label: "Behance",   href: "https://www.behance.net/uskhuulevi" },
  { label: "Facebook",  href: "https://www.facebook.com/sanaaagency0/" },
  { label: "TikTok",    href: "https://www.tiktok.com/@_baysaa_notfound" },
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const n = translations[lang].nav

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const btnClass = (active: boolean) =>
    `text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150 ${
      active ? "text-black" : "text-[#aaaaaa] hover:text-[#666666]"
    }`

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
    return `nav-link text-[15px] font-medium tracking-wide hidden md:block transition-colors duration-150 ${
      active ? "text-black" : "text-[#888888] hover:text-black"
    }`
  }

  const mobileBtnClass = (active: boolean) =>
    `text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors duration-150 ${
      active ? "text-black" : "text-[#aaaaaa]"
    }`

  const menuItems = [
    { label: n.work,    href: "/work" },
    { label: n.about,   href: "/about" },
    { label: n.contact, href: "/contact" },
  ]

  const langSwitcher = (
    <div className="flex items-center gap-4">
      <button onClick={() => setLang("mn")} className={mobileBtnClass(lang === "mn")}>MN</button>
      <span className="text-[#dddddd] text-[12px]">/</span>
      <button onClick={() => setLang("en")} className={mobileBtnClass(lang === "en")}>EN</button>
    </div>
  )

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
          {/* Left */}
          <div className="flex items-center gap-8">
            <Link href="/about" className={linkClass("/about")}>
              {n.about}
            </Link>
          </div>

          {/* Center: MN · baysaass · EN */}
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

          {/* Right */}
          <div className="flex items-center gap-8">
            <Link href="/work" className={linkClass("/work")}>
              {n.work}
            </Link>
            <Link href="/contact" className={linkClass("/contact")}>
              {n.contact}
            </Link>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-black text-[13px] font-semibold tracking-widest uppercase nav-link"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen
                ? (lang === "mn" ? "Хаах" : "Close")
                : (lang === "mn" ? "Цэс"  : "Menu")}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile StaggeredMenu panel */}
      <div className="md:hidden">
        <StaggeredMenuPanel
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
          socialItems={SOCIAL_ITEMS}
          langSwitcher={langSwitcher}
          colors={["#bfdbfe", "#2563eb"]}
          accentColor="#2563eb"
        />
      </div>
    </>
  )
}
