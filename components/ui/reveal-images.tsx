"use client"
import { cn } from "@/lib/utils"
import ScrollFloat from "@/components/ui/scroll-float"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface ImageSource {
  src: string
  alt: string
}

interface RevealImageListItemProps {
  text: string
  images: [ImageSource, ImageSource]
}

function RevealImageListItem({ text, images }: RevealImageListItemProps) {
  const container = "absolute right-8 -top-1 z-40 h-20 w-16"
  const effect =
    "relative duration-500 delay-100 shadow-none group-hover:shadow-xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 group-hover:w-full group-hover:h-full w-16 h-16 overflow-hidden transition-all rounded-lg"

  return (
    <div className="group relative h-fit w-fit overflow-visible py-5 md:py-6">
      <ScrollFloat
        containerClassName="text-[clamp(2.8rem,6vw,5.5rem)] font-black tracking-[-0.04em] text-black transition-all duration-500 group-hover:opacity-30 leading-none"
        scrollStart="center bottom+=30%"
        scrollEnd="bottom bottom-=20%"
        stagger={0.03}
      >
        {text}
      </ScrollFloat>
      <div className={container}>
        <div className={effect}>
          <img alt={images[1].alt} src={images[1].src} className="h-full w-full object-cover" />
        </div>
      </div>
      <div
        className={cn(
          container,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12",
        )}
      >
        <div className={cn(effect, "duration-200")}>
          <img alt={images[0].alt} src={images[0].src} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}

const imageData: [ImageSource, ImageSource][] = [
  [
    { src: "/projects/One more night branding/01bc89185771485.65694fdb6b312.webp", alt: "One More Night branding" },
    { src: "/projects/CAE logo/f57a8e221632127.67d82fadeec41.webp",               alt: "CAE logo" },
  ],
  [
    { src: "/projects/Tsuiwan package/mockup.webp",           alt: "Tsuiwan packaging" },
    { src: "/projects/ganga and khomool/mockup2.webp",        alt: "Zen Tarot Incense" },
  ],
  [
    { src: "/projects/beautytech llc logo/52730b202740915.668ba7ab75cda.webp",             alt: "Beautytech logo" },
    { src: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 6.webp", alt: "Chandmani Goyl" },
  ],
  [
    { src: "/projects/naadam typography/198492229719067.686a12b98ad11.webp", alt: "Naadam typography" },
    { src: "/projects/naadam typography/dbfaaa229719067.686a12b98a254.webp", alt: "Naadam poster" },
  ],
]

function RevealImageList() {
  const { lang } = useLang()
  const s = translations[lang].services

  return (
    <div className="flex flex-col px-6 md:px-10 py-2">
      <p className="text-[#888888] text-[11px] font-medium tracking-[0.18em] uppercase mb-2">
        {s.label}
      </p>
      {s.items.map((text, index) => (
        <RevealImageListItem key={index} text={text} images={imageData[index]} />
      ))}
    </div>
  )
}

export { RevealImageList }
