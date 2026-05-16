"use client"

import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function ServicesTicker() {
  const { lang } = useLang()
  const services = translations[lang].ticker
  const tickerContent = [...services, ...services]

  return (
    <div className="w-full overflow-hidden border-t border-b border-[#e0e0e0] py-5">
      <div className="ticker-track flex whitespace-nowrap">
        {tickerContent.map((service, i) => (
          <span
            key={i}
            className="text-[#888888] text-[14px] font-medium tracking-[0.1em] uppercase inline-flex items-center"
          >
            {service}
            <span className="mx-8 text-[#cccccc]">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
