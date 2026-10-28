import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/client",
          "/client/*",
          "/api/*",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot-Extended",
          "CCBot",
          "Google-Extended",
        ],
        allow: [
          "/",
          "/work",
          "/work/*",
          "/about",
          "/contact",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: [
          "/admin/*",
          "/client/*",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://baysaass.space/sitemap.xml",
    host: "https://baysaass.space",
  }
}
