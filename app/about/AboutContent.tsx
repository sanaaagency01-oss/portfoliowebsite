"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ServicesTicker from "@/components/services-ticker"
import FadeUp from "@/components/fade-up"
import ScrollFloat from "@/components/ui/scroll-float"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

gsap.registerPlugin(ScrollTrigger)

const clients = [
  "One More Night",
  "CAE",
  "Tsuiwan",
  "Endeno",
  "Beautytech LLC",
  "Chandmani Goyl",
  "Zen Tarot",
  "Naadam",
]

export default function AboutContent() {
  const { lang } = useLang()
  const T = translations[lang].about

  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pin = pinRef.current
    const track = trackRef.current
    if (!pin || !track) return

    const getScrollAmount = () =>
      -(track.scrollWidth - pin.offsetWidth + 40)

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top 68px",
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [lang])

  return (
    <>
      <Navigation />

      <main className="pt-[68px]">
        {/* Intro */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-24 md:pb-32">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-8">
              {T.label}
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
            <div>
              <FadeUp delay={0.05}>
                <h1 className="text-black text-[clamp(2.5rem,5vw,4rem)] font-black tracking-[-0.04em] leading-[1.0] text-balance mb-8">
                  baysaass.
                </h1>
                <p className="text-[#888888] text-[clamp(2rem,4vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.0] text-balance mb-12">
                  {T.role}
                </p>
              </FadeUp>
              <FadeUp delay={0.15}>
                <div className="flex flex-col gap-5 text-[#444444] text-[16px] leading-relaxed">
                  {T.bio.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className="mt-12">
                  <Link href="/contact" className="text-black text-[15px] font-bold nav-link tracking-tight">
                    {T.workWithMe} &rarr;
                  </Link>
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={0.2} className="relative aspect-[4/5] w-full max-w-[480px]">
              <Image
                src="/about-portrait.jpg"
                alt="baysaass - brand designer"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </FadeUp>
          </div>
        </section>

        {/* Services ticker */}
        <ServicesTicker />

        {/* Process — scroll-driven horizontal reveal */}
        <section className="border-t border-[#e0e0e0]">
          {/* Section label — above the pin zone */}
          <div className="max-w-[1320px] mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-10">
            <FadeUp>
              <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase">
                {T.processLabel}
              </p>
            </FadeUp>
          </div>

          {/* Pinned viewport — GSAP pins this while scrolling */}
          <div
            ref={pinRef}
            className="w-full overflow-hidden"
            style={{ height: "calc(42vh + 68px)", minHeight: "320px", paddingTop: "68px" }}
          >
            {/* Horizontal track — GSAP translates this leftward */}
            <div
              ref={trackRef}
              className="flex items-start h-full"
              style={{ width: "max-content", paddingLeft: "max(1.5rem, 2.5vw)", paddingRight: "max(3rem, 10vw)" }}
            >
              {T.steps.map((step, i) => (
                <div
                  key={step.number}
                  className="flex flex-col justify-start h-full"
                  style={{
                    width: "min(72vw, 360px)",
                    minWidth: "260px",
                    paddingLeft: i === 0 ? "0" : "2rem",
                    paddingRight: "2rem",
                    borderLeft: i === 0 ? "none" : "1px solid #e0e0e0",
                  }}
                >
                  <span className="text-[#e0e0e0] text-[2.8rem] font-black tracking-[-0.04em] leading-none tabular-nums block mb-6">
                    {step.number}
                  </span>
                  <h3 className="text-black text-[1.25rem] font-bold tracking-tight leading-tight mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[#666666] text-[14px] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>


        </section>

        {/* Clients list */}
        <section className="border-t border-[#e0e0e0] max-w-[1320px] mx-auto px-6 md:px-10 py-24 md:py-32">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase mb-12">
              {T.clientsLabel}
            </p>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            {clients.map((client, i) => (
              <FadeUp key={client} delay={(i % 4) * 0.07}>
                <p className="text-[#888888] text-[14px] font-medium hover:text-black transition-colors duration-200">
                  {client}
                </p>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#e0e0e0] py-28 md:py-40 text-center px-6">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.15em] uppercase mb-6">
              {T.availableLabel}
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ScrollFloat
              containerClassName="text-black text-[clamp(2.5rem,7vw,6rem)] font-black tracking-[-0.04em] leading-[0.95] text-balance max-w-[1000px] mx-auto"
              scrollStart="center bottom+=40%"
              scrollEnd="bottom bottom-=30%"
              stagger={0.02}
            >
              {T.ctaHeading}
            </ScrollFloat>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="mt-10">
              <Link
                href="/contact"
                className="text-black text-[clamp(1rem,2.5vw,1.5rem)] font-bold nav-link tracking-tight"
              >
                {translations[lang].cta.link} &rarr;
              </Link>
            </div>
          </FadeUp>
        </section>
      </main>

      <Footer />
    </>
  )
}
