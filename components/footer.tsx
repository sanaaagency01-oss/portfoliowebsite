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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-16 border-b border-blue-500">
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
                  { key: "audit", href: "/brand-audit" },
                  { key: "resources", href: "/resources" },
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

        {/* Bottom Legal Sub-bar for Merchant & Bank Compliance */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200 border-b border-blue-500/60">
          <p>&copy; {currentYear} baysaass. {lang === "mn" ? "Бүх эрх хуулиар хамгаалагдсан." : "All rights reserved."}</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="text-white hover:text-blue-100 transition-colors underline-offset-4 hover:underline"
            >
              {lang === "mn" ? "Үйлчилгээний нөхцөл, Хүргэлт & Буцаалт" : "Terms, Delivery & Refund"}
            </Link>
            <span className="text-blue-400">·</span>
            <Link
              href="/privacy"
              className="text-white hover:text-blue-100 transition-colors underline-offset-4 hover:underline"
            >
              {lang === "mn" ? "Нууцлалын бодлого" : "Privacy Policy"}
            </Link>
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
