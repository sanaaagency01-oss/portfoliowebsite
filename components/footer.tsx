"use client"

import Link from "next/link"
import { useLang } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { lang } = useLang()
  const f = translations[lang].footer

  return (
    <footer className="bg-blue-600 border-t border-blue-500 pt-20 pb-0 overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-20 border-b border-blue-500">
          {/* Copyright */}
          <div>
            <p className="text-blue-200 text-[12px] font-medium tracking-[0.08em] uppercase mb-5">
              &copy;{currentYear}
            </p>
            <p className="text-blue-200 text-[13px] leading-relaxed">
              baysaass
              <br />
              {f.tagline}
            </p>
          </div>

          {/* Social */}
          <div>
            <h6 className="text-blue-200 text-[12px] font-medium tracking-[0.08em] uppercase mb-5">
              {f.social}
            </h6>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Instagram", href: "https://www.instagram.com/_baysaa_notfound/" },
                { label: "Behance", href: "https://www.behance.net/uskhuulevi" },
                { label: "Facebook", href: "https://www.facebook.com/sanaaagency0/" },
                { label: "Tiktok", href: "https://www.tiktok.com/@_baysaa_notfound" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-[13px] nav-link hover:text-blue-100 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h6 className="text-blue-200 text-[12px] font-medium tracking-[0.08em] uppercase mb-5">
              {f.contact}
            </h6>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:sanaaagency01@gmail.com"
                  className="text-white text-[13px] nav-link hover:text-blue-100 transition-colors duration-200"
                >
                  sanaaagency01@gmail.com
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white text-[13px] nav-link hover:text-blue-100 transition-colors duration-200"
                >
                  {f.getInTouch} &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Site Map */}
          <div>
            <h6 className="text-blue-200 text-[12px] font-medium tracking-[0.08em] uppercase mb-5">
              {f.sitemap}
            </h6>
            <ul className="flex flex-col gap-3">
              {(
                [
                  { key: "home", href: "/" },
                  { key: "work", href: "/work" },
                  { key: "about", href: "/about" },
                  { key: "contact", href: "/contact" },
                ] as const
              ).map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-white text-[13px] nav-link hover:text-blue-100 transition-colors duration-200"
                  >
                    {f.links[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="w-full pt-10 pb-0 overflow-hidden">
        <p className="footer-wordmark px-6" style={{ color: "#ffffff" }}>baysaass</p>
      </div>
    </footer>
  )
}
