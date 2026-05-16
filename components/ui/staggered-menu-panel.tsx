"use client"

import { useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"

export interface MenuItem {
  label: string
  href: string
}

export interface SocialItem {
  label: string
  href: string
}

interface Props {
  open: boolean
  onClose: () => void
  items: MenuItem[]
  socialItems?: SocialItem[]
  langSwitcher?: React.ReactNode
  colors?: string[]
  accentColor?: string
}

export default function StaggeredMenuPanel({
  open,
  onClose,
  items,
  socialItems = [],
  langSwitcher,
  colors = ["#bfdbfe", "#2563eb"],
  accentColor = "#2563eb",
}: Props) {
  const panelRef      = useRef<HTMLDivElement>(null)
  const preLayersRef  = useRef<HTMLDivElement>(null)
  const layerElsRef   = useRef<Element[]>([])
  const openTlRef     = useRef<gsap.core.Timeline | null>(null)
  const closeTlRef    = useRef<gsap.core.Tween | null>(null)
  const prevOpenRef   = useRef(false)
  const readyRef      = useRef(false)

  // Initial off-screen position — runs once after mount
  useEffect(() => {
    const panel = panelRef.current
    const pre   = preLayersRef.current
    if (!panel || readyRef.current) return
    readyRef.current = true

    const layers = pre ? Array.from(pre.querySelectorAll(".smp-layer")) : []
    layerElsRef.current = layers
    gsap.set([panel, ...layers], { xPercent: 100 })
  }, [])

  const buildOpen = useCallback(() => {
    const panel  = panelRef.current
    const layers = layerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    closeTlRef.current?.kill()

    // Reset animated children
    const labels  = Array.from(panel.querySelectorAll<HTMLElement>(".smp-label"))
    const socials = Array.from(panel.querySelectorAll<HTMLElement>(".smp-social-link"))
    const bottom  = panel.querySelector<HTMLElement>(".smp-bottom")

    if (labels.length)  gsap.set(labels,  { yPercent: 130, rotate: 8 })
    if (socials.length) gsap.set(socials, { y: 20, opacity: 0 })
    if (bottom)         gsap.set(bottom,  { opacity: 0, y: 14 })

    const tl = gsap.timeline({ paused: true })

    // Stagger pre-layers
    layers.forEach((el, i) => {
      tl.fromTo(
        el,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.46, ease: "power4.out" },
        i * 0.06
      )
    })

    const panelAt = layers.length ? (layers.length - 1) * 0.06 + 0.06 : 0

    // Panel slides in
    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.6, ease: "power4.out" },
      panelAt
    )

    // Nav labels rise up with stagger
    if (labels.length) {
      tl.to(
        labels,
        { yPercent: 0, rotate: 0, duration: 0.85, ease: "power4.out", stagger: 0.08 },
        panelAt + 0.1
      )
    }

    // Social links fade in
    if (socials.length) {
      tl.to(
        socials,
        { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.06 },
        panelAt + 0.32
      )
    }

    // Bottom section
    if (bottom) {
      tl.to(
        bottom,
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        panelAt + 0.38
      )
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    const panel  = panelRef.current
    const layers = layerElsRef.current
    if (!panel) return

    closeTlRef.current?.kill()
    closeTlRef.current = gsap.to([...layers, panel], {
      xPercent: 100,
      duration: 0.28,
      ease: "power3.in",
      overwrite: "auto",
    })
  }, [])

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      buildOpen()?.play(0)
    } else if (!open && prevOpenRef.current) {
      playClose()
    }
    prevOpenRef.current = open
  }, [open, buildOpen, playClose])

  return (
    <>
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0 z-[145]"
        style={{ pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Stagger pre-layers */}
      <div
        ref={preLayersRef}
        className="fixed top-0 right-0 bottom-0 left-0 z-[146] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {colors.slice(0, 2).map((c, i) => (
          <div
            key={i}
            className="smp-layer absolute inset-0"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* Main panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full bg-white z-[147] flex flex-col pt-[68px] overflow-y-auto"
        aria-hidden={!open}
        style={{ "--smp-accent": accentColor } as React.CSSProperties}
      >
        {/* Nav items */}
        <ul className="flex-1 flex flex-col justify-center px-8 pt-8 pb-4 list-none m-0 gap-0">
          {items.map((item) => (
            <li key={item.href} className="overflow-hidden leading-none">
              <Link
                href={item.href}
                className="smp-item inline-block no-underline leading-[1.1]"
                onClick={onClose}
              >
                <span
                  className="smp-label inline-block will-change-transform text-black font-black text-[clamp(2.8rem,12vw,4.5rem)] tracking-[-0.04em] hover:text-blue-600 transition-colors duration-200"
                  style={{ transformOrigin: "50% 100%" }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom: socials + lang switcher */}
        <div className="smp-bottom px-8 py-8 border-t border-[#ebebeb] flex flex-col gap-5">
          {socialItems.length > 0 && (
            <ul className="flex flex-row flex-wrap gap-4 list-none m-0 p-0">
              {socialItems.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="smp-social-link text-[#888888] text-[13px] font-medium hover:text-black transition-colors duration-200 no-underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {langSwitcher && (
            <div>{langSwitcher}</div>
          )}
        </div>
      </div>
    </>
  )
}
