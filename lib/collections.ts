export interface CollectionItem {
  id: string
  title: string
  titleMn?: string
  client: string
  description: string
  descriptionMn?: string
  year: string
  images: string[]
  downloadUrl?: string
}

export interface Collection {
  id: string
  slug: string
  name: string
  nameMn?: string
  category: "Typography" | "Fonts" | "Poster"
  cover: string
  items: CollectionItem[]
}

const P  = "/projects/poster collection"
const TC = "/projects/typography collection"
const NT = "/projects/naadam typography"
const FC = "/projects/font collection"

export const collections: Collection[] = [
  // ─── TYPOGRAPHY ───────────────────────────────────────────────────────────
  {
    id: "c1",
    slug: "typography-collection",
    name: "Typography Collection",
    nameMn: "Типографи коллекц",
    category: "Typography",
    cover: `${TC}/typography (1).webp`,
    items: [
      {
        id: "tc1",
        title: "Naadam",
        titleMn: "Наадам",
        client: "Personal",
        description: "Typography exploration inspired by Mongolia's national festival and the architectural forms of the Bogd Khan Winter Palace Museum.",
        descriptionMn: "Монголын үндэсний наадам болон Богд хааны зуны ордны архитектур хэлбэрээс санаа авсан typography судалгаа.",
        year: "2025",
        images: [
          `${TC}/Наадам.webp`,
          `${NT}/198492229719067.686a12b98ad11.webp`,
          `${NT}/dbfaaa229719067.686a12b98a254.webp`,
          `${NT}/5c1933229719067.686a12b98b4e1.webp`,
        ],
      },
      {
        id: "tc2",
        title: "Typography Series",
        titleMn: "Типографи цуврал",
        client: "Personal",
        description: "A personal typography series made as a hobby — drawing inspiration from Mongolian visual culture and contemporary design language.",
        descriptionMn: "Монголын дүрслэх соёл болон орчин үеийн дизайны хэлнээс санаа аван өөрийн хоббигоор хийсэн typography бүтээлүүдийн цуврал.",
        year: "2025",
        images: Array.from({ length: 6 }, (_, i) => `${TC}/typography (${i + 1}).webp`),
      },
    ],
  },

  // ─── POSTER ───────────────────────────────────────────────────────────────
  {
    id: "c2",
    slug: "poster-collection",
    name: "Poster Collection",
    nameMn: "Постер коллекц",
    category: "Poster",
    cover: `${P}/typographyposter (1).webp`,
    items: [
      {
        id: "pc-typo",
        title: "Typography Poster",
        titleMn: "Типографи постер",
        client: "Personal",
        description: "A series of experimental typography posters exploring letterform, layout, and visual hierarchy.",
        descriptionMn: "Үсгийн хэлбэр, зохион байгуулалт, харааны шатлал судалсан typography poster цуврал.",
        year: "2025",
        images: [1, 2, 4, 7, 9, 10, 11, 12, 13].map(n => `${P}/typographyposter (${n}).webp`),
      },
      {
        id: "pc-tsagaansar",
        title: "Tsagaan Sar",
        titleMn: "Цагаан Сар",
        client: "Personal",
        description: "Poster series for Mongolian Lunar New Year — traditional motifs combined with modern graphic design language.",
        descriptionMn: "Монголын Цагаан Сарын баярын poster цуврал — уламжлалт хээ дизайны орчин үеийн хэлтэй нийлүүлэн 0 зургийн бүрдэл.",
        year: "2025",
        images: Array.from({ length: 13 }, (_, i) => `${P}/tsagaansar (${i + 1}).webp`),
      },
      {
        id: "pc-beautytechsalon",
        title: "Beautytech Salon",
        titleMn: "Бьютитек Салон",
        client: "Beautytech LLC",
        description: "Promotional posters for Beautytech Salon — minimal, feminine compositions with typographic accents.",
        descriptionMn: "Бьютитек салоны зар сурталчилгааны постер цуврал — mininal, эмэгтэйлэг бүрдэл, typography.",
        year: "2025",
        images: Array.from({ length: 5 }, (_, i) => `${P}/beautytechsalon (${i + 1}).webp`),
      },
      {
        id: "pc-goldenmouse",
        title: "Golden Mouse",
        titleMn: "Алтан Хулгана",
        client: "Personal",
        description: "An entry for the Golden Mouse competition in the poster category.",
        descriptionMn: "Алтан Хулгана тэмцээний poster төрөлд оролцсон бүтээл.",
        year: "2025",
        images: Array.from({ length: 3 }, (_, i) => `${P}/goldenmouse (${i + 1}).webp`),
      },
      {
        id: "pc-callofdutr",
        title: "Call of Duty R",
        titleMn: "Дуудлага",
        client: "Personal",
        description: "Typography artwork for Call of Duty rendered in traditional Mongolian script.",
        descriptionMn: "Монголын уламжлалт бичгээр Call of duty тоглоомын typography зурсан бүтээл.",
        year: "2025",
        images: Array.from({ length: 9 }, (_, i) => `${P}/callofdutr (${i + 1}).webp`),
      },
      {
        id: "pc-hiddenpath",
        title: "Hidden Path",
        titleMn: "Нуугдмал Зам",
        client: "Personal",
        description: "A poster series created for the Design Syndrome day-by-day challenge.",
        descriptionMn: "Design syndrome day by day challenge д оролцсон poster цуврал.",
        year: "2025",
        images: [
          `${P}/hidden path (1).webp`,
          `${P}/hidden path (2).webp`,
          `${P}/hidden path (3).webp`,
        ],
      },
      {
        id: "pc-maralcoffee",
        title: "Maral Coffee Shop",
        titleMn: "Марал кофе шоп",
        client: "Maral Coffee Shop",
        description: "Product posters for Maral Coffee Shop.",
        descriptionMn: "Марал кофе шопын бүтээгдэхүүний poster-ууд",
        year: "2025",
        images: [
          `${P}/maralcoffeeshop (1).webp`,
          `${P}/maralcoffeeshop (2).webp`,
        ],
      },
      {
        id: "pc-sport",
        title: "Sport Poster",
        titleMn: "Спорт постер",
        client: "Personal",
        description: "Posters promoting games from Mongolia's top basketball and handball leagues.",
        descriptionMn: "Монгол улсын сагсан бөмбөг болон Гар бөмбөгийн дээд лигүүдийн тоглолтын тухай мэдээлэл түгээх poster.",
        year: "2025",
        images: [
          `${P}/sportposter (1).webp`,
          `${P}/sportposter (2).webp`,
        ],
      },
      {
        id: "pc-people",
        title: "People Drawing",
        titleMn: "Хүний Зураг",
        client: "Personal",
        description: "A personal series of poster compositions featuring human figures.",
        descriptionMn: "Хүний дүрс бүхий постер бүтээлийн хувийн цуврал.",
        year: "2025",
        images: Array.from({ length: 8 }, (_, i) => `${P}/people drawing poster (${i + 1}).webp`),
      },
      {
        id: "pc-infographic",
        title: "Infographic",
        titleMn: "Инфографик",
        client: "wildberries",
        description: "CTR-optimized product posters for Wildberries.",
        descriptionMn: "Бүтээгдэхүүний CTR өсгөх зорилго бүхий poster-ууд.",
        year: "2025",
        images: [
          `${P}/infographic (4).webp`,
          `${P}/infographic (5).webp`,
          `${P}/infographic (6).webp`,
          `${P}/infographic (7).webp`,
          `${P}/infographic (8).jpg`,
        ],
      },
      {
        id: "pc-poster",
        title: "Poster Series",
        titleMn: "Постер цуврал",
        client: "Personal",
        description: "A graphic design poster series made to improve personal skills.",
        descriptionMn: "Өөрийн ур чадварыг сайжруулах зорилгоор хийсэн график дизайны poster цуврал.",
        year: "2024–2025",
        images: Array.from({ length: 20 }, (_, i) => `${P}/poster (${i + 1}).webp`),
      },
      {
        id: "pc-kimbo",
        title: "Kimbo",
        titleMn: "Кимбо",
        client: "Prime Coffee LLC",
        description: "Commissioned by the official distributor of Kimbo Coffee in Mongolia.",
        descriptionMn: "Kimbo coffee бүтээгдэхүүний монгол дахь албан ёсны борлуулагчын захиалга.",
        year: "2024",
        images: [`${P}/kimbo-cover.webp`],
      },
    ],
  },

  // ─── FONTS ────────────────────────────────────────────────────────────────
  // downloadUrl — зөвхөн fonts/ дотор .otf файл байгаа тохиолдолд
  {
    id: "c3",
    slug: "fonts-collection",
    name: "Fonts Collection",
    nameMn: "Фонт коллекц",
    category: "Fonts",
    cover: `${FC}/starbubblemn (1).webp`,
    items: [
      {
        id: "fc-starbubble",
        title: "Starbubble MN",
        titleMn: "Старбабл МН",
        client: "Personal",
        description: "A display typeface with bubble letterforms covering the full 35-character Mongolian alphabet.",
        descriptionMn: "Display font бөгөөд bubble хэлбэртэй цагаан толгойн 35 үсэг бүхий typeface.",
        year: "2025",
        images: Array.from({ length: 5 }, (_, i) => `${FC}/starbubblemn (${i + 1}).webp`),
        // fonts/ дотор Starbubble OTF байхгүй → downloadUrl байхгүй
      },
      {
        id: "fc-khanserif",
        title: "Khan Serif",
        titleMn: "Хан Сериф",
        client: "Personal",
        description: "A serif typeface covering the full 35-character Mongolian alphabet — refined strokes and classical proportions.",
        descriptionMn: "Serif төрөлд хамаарагдах цагаан толгойн 35 үсэг бүхий typeface. Нарийн зураасан, сонгодог пропорцтой.",
        year: "2025",
        images: [
          `${FC}/Khan serif.webp`,
          `${FC}/Khatan serif.webp`,
        ],
        downloadUrl: `${FC}/fonts/KhanSerif-Regular.otf`,
      },
    ],
  },
]

export const getCollectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug)
