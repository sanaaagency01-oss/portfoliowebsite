"use client"

import Link from "next/link"
import { LayoutGroup, motion } from "framer-motion"
import Navigation from "@/components/navigation"
import ServicesTicker from "@/components/services-ticker"
import ProjectCard from "@/components/project-card"
import Footer from "@/components/footer"
import FadeUp from "@/components/fade-up"
import { getFeaturedProjects } from "@/lib/projects"
import { TextRotate } from "@/components/ui/text-rotate"
import { RevealImageList } from "@/components/ui/reveal-images"
import ScrollFloat from "@/components/ui/scroll-float"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

const portfolioImages = [
  { src: "/projects/One more night branding/t-shirt.png",                                                                          alt: "One More Night t-shirt" },
  { src: "/projects/Zen tarot candle label/mockup1.png",                                                                           alt: "Zen Tarot candle" },
  { src: "/projects/ganga and khomool/mockup1.png",                                                                                alt: "Zen Tarot Incense" },
  { src: "/projects/Tsuiwan package/mockup.png",                                                                                   alt: "Tsuiwan packaging" },
  { src: "/projects/beautytech llc logo/52730b202740915.668ba7ab75cda.webp",                                                       alt: "Beautytech logo" },
  { src: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 6.png",                                                          alt: "Chandmani Goyl" },
  { src: "/projects/naadam typography/198492229719067.686a12b98ad11.webp",                                                         alt: "Naadam typography" },
  { src: "/projects/CAE logo/f57a8e221632127.67d82fadeec41.webp",                                                                  alt: "CAE logo" },
]

export default function HomeContent() {
  const featured = getFeaturedProjects()
  const { lang } = useLang()
  const T = translations[lang]

  return (
    <>
      <Navigation />

      <main>
        {/* Hero */}
        <section className="w-full h-screen overflow-hidden flex flex-col items-center justify-center relative bg-white">
          <Floating sensitivity={-0.5} className="h-full pointer-events-none">
            <FloatingElement depth={0.5} className="top-[18%] left-[2%] md:top-[20%] md:left-[4%]">
              <motion.img
                src={portfolioImages[0].src}
                alt={portfolioImages[0].alt}
                className="w-20 h-14 md:w-32 md:h-24 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </FloatingElement>

            <FloatingElement depth={1} className="top-[4%] left-[2%] md:top-[5%] md:left-[10%]">
              <motion.img
                src={portfolioImages[1].src}
                alt={portfolioImages[1].alt}
                className="w-20 h-16 sm:w-28 sm:h-20 md:w-52 md:h-40 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-12 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              />
            </FloatingElement>

            <FloatingElement depth={4} className="top-[72%] left-[2%] md:top-[72%] md:left-[7%]">
              <motion.img
                src={portfolioImages[2].src}
                alt={portfolioImages[2].alt}
                className="w-20 h-20 md:w-56 md:h-56 object-cover -rotate-[4deg] pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              />
            </FloatingElement>

            <FloatingElement depth={2} className="top-[4%] left-[76%] md:top-[3%] md:left-[82%]">
              <motion.img
                src={portfolioImages[3].src}
                alt={portfolioImages[3].alt}
                className="w-20 h-16 sm:w-28 sm:h-24 md:w-56 md:h-48 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              />
            </FloatingElement>

            <FloatingElement depth={1} className="top-[68%] left-[74%] md:top-[65%] md:left-[81%]">
              <motion.img
                src={portfolioImages[4].src}
                alt={portfolioImages[4].alt}
                className="w-20 h-20 md:w-64 md:h-64 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[10deg] rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              />
            </FloatingElement>

            {/* Image 6 — middle left */}
            <FloatingElement depth={3} className="top-[45%] left-[0%] md:top-[43%] md:left-[2%]">
              <motion.img
                src={portfolioImages[5].src}
                alt={portfolioImages[5].alt}
                className="w-16 h-16 md:w-44 md:h-36 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform rotate-[8deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              />
            </FloatingElement>

            {/* Image 7 — middle right */}
            <FloatingElement depth={2} className="top-[34%] left-[76%] md:top-[32%] md:left-[78%]">
              <motion.img
                src={portfolioImages[6].src}
                alt={portfolioImages[6].alt}
                className="w-16 h-20 md:w-40 md:h-52 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[5deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
              />
            </FloatingElement>

            {/* Image 8 — between top-right and bottom-right */}
            <FloatingElement depth={1.5} className="top-[54%] left-[77%] md:top-[51%] md:left-[80%]">
              <motion.img
                src={portfolioImages[7].src}
                alt={portfolioImages[7].alt}
                className="w-14 h-14 md:w-36 md:h-36 object-cover pointer-events-auto hover:scale-105 duration-200 cursor-pointer transition-transform rotate-[3deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9 }}
              />
            </FloatingElement>
          </Floating>

          <div className="flex flex-col justify-center items-center w-[340px] sm:w-[440px] md:w-[620px] lg:w-[820px] z-10 pointer-events-auto text-center">
            <motion.p
              className="text-[#888888] text-[11px] sm:text-[12px] font-medium tracking-[0.18em] uppercase mb-5"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            >
              {T.hero.label}
            </motion.p>

            <motion.h1
              className={`font-black tracking-[-0.04em] leading-[0.95] text-black w-full ${
                lang === "mn"
                  ? "text-[clamp(1.9rem,5.5vw,4.2rem)]"
                  : "text-[clamp(2.4rem,7vw,5.5rem)]"
              }`}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
            >
              <span className="block">{T.hero.greeting}</span>
              <LayoutGroup>
                <motion.span layout className="flex justify-center whitespace-pre flex-wrap mt-1">
                  <motion.span
                    layout
                    className="flex whitespace-pre"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    {T.hero.iDesign}{" "}
                  </motion.span>
                  <TextRotate
                    texts={T.hero.rotating as unknown as string[]}
                    mainClassName="overflow-hidden text-blue-600 py-0 pb-1"
                    staggerDuration={0.03}
                    staggerFrom="last"
                    rotationInterval={3000}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                </motion.span>
              </LayoutGroup>
            </motion.h1>

            <motion.p
              className="text-[#666666] text-[clamp(0.9rem,1.8vw,1.15rem)] mt-6 max-w-[460px] leading-relaxed"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.5 }}
            >
              {T.hero.description}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-8 sm:gap-6 mt-10"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.7 }}
            >
              <motion.div whileHover={{ scale: 1.05, transition: { type: "spring", damping: 30, stiffness: 400 } }}>
                <Link
                  href="/work"
                  className="text-white bg-blue-600 text-[14px] sm:text-[15px] font-semibold tracking-tight px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {T.hero.viewWork} &rarr;
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, transition: { type: "spring", damping: 30, stiffness: 400 } }}>
                <Link
                  href="/contact"
                  className="text-blue-600 text-[14px] sm:text-[15px] font-semibold tracking-tight px-6 py-3 rounded-full border border-blue-300 hover:border-blue-600 transition-colors whitespace-nowrap"
                >
                  {T.hero.getInTouch}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services ticker */}
        <ServicesTicker />

        {/* Selected Work */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <FadeUp>
                <p className="text-[#888888] text-[12px] font-medium tracking-[0.12em] uppercase">
                  {T.selectedWork.label}
                </p>
              </FadeUp>
              <FadeUp delay={0.15} className="hidden md:block shrink-0">
                <Link href="/work" className="text-[#888888] text-[14px] nav-link">
                  {T.selectedWork.viewAll} &rarr;
                </Link>
              </FadeUp>
            </div>
            <ScrollFloat
              containerClassName="text-black text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.03em] leading-tight"
              scrollStart="center bottom+=40%"
              scrollEnd="bottom bottom-=30%"
              stagger={0.02}
            >
              {T.selectedWork.heading}
            </ScrollFloat>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14">
            {featured.map((project, i) => (
              <FadeUp key={project.id} delay={i * 0.07}>
                <ProjectCard project={project} />
              </FadeUp>
            ))}
          </div>

          <div className="mt-12 md:hidden">
            <Link href="/work" className="text-[#888888] text-[14px] nav-link">
              {T.selectedWork.viewAll} &rarr;
            </Link>
          </div>
        </section>

        {/* Services */}
        <section className="max-w-[1320px] mx-auto border-t border-[#e0e0e0] mt-8">
          <RevealImageList />
        </section>

        {/* CTA section */}
        <section className="border-t border-[#e0e0e0] py-14 md:py-20 text-center px-6">
          <FadeUp>
            <p className="text-[#888888] text-[12px] font-medium tracking-[0.15em] uppercase mb-6">
              {T.cta.label}
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-black text-[clamp(2rem,4.5vw,3.5rem)] font-black tracking-[-0.04em] leading-[1.0] text-balance max-w-[700px] mx-auto">
              {T.cta.heading}
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="mt-10">
              <Link
                href="/contact"
                className="text-blue-600 text-[clamp(1rem,2.5vw,1.5rem)] font-bold nav-link tracking-tight"
              >
                {T.cta.link} &rarr;
              </Link>
            </div>
          </FadeUp>
        </section>
      </main>

      <Footer />
    </>
  )
}
