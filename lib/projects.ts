export type GalleryRow =
  | { type: "pair"; images: [string, string] }
  | { type: "pair-natural"; images: string[] }
  | { type: "diptych"; images: [string, string] }
  | { type: "triple"; images: [string, string, string] }
  | { type: "full"; image: string }

export interface Project {
  id: string
  slug: string
  name: string
  tagline: string
  taglineMn?: string
  category: string
  year: string
  client: string
  services: string[]
  description: string
  descriptionMn?: string
  cover: string
  images: string[]
  galleryLayout?: GalleryRow[]
  featured: boolean
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "one-more-night",
    name: "One More Night",
    tagline: "Brands That Feel Like Music.",
    taglineMn: "Хөгжил шиг мэдрэгдэх брэнд.",
    category: "Brand Identity",
    year: "2023",
    client: "One More Night",
    services: ["Brand Identity", "Typography", "Art Direction"],
    description:
      "One More Night is a creative brand built around music, mood, and night culture. My challenge was to design a visual identity that didn't just represent the brand — but felt like it. I developed a complete brand system with a visual language rooted in rhythm, atmosphere, and motion. Every element — from the logotype to the colour palette — was crafted to evoke the feeling of a night that never quite ends. The identity extends across merchandise, social media, and campaign materials, creating a brand world that resonates with its audience on a deeply emotional level.",
    descriptionMn:
      "One More Night бол хөгжил, сэтгэл хөдлөл болон шөнийн соёл дээр тулгуурласан бүтээлч брэнд. Миний зорилт нь зөвхөн брэндийг төлөөлөх биш, харин тэр мэдрэмжийг өөрөө дамжуулах харааны айдентити бий болгох байлаа. Хэмнэл, уур амьсгал, хөдөлгөөнд суурилсан харааны хэлтэй бүрэн брэнд систем боловсруулсан. Логотипоос өнгөний палитр хүртэл бүх элемент нь дуусахгүй шөнийн мэдрэмжийг дамжуулахаар бүтээгдсэн. Айдентити нь мерчендайз, сошиал медиа болон кампанийн материалуудад тэлж, хамт олонтойгоо сэтгэл хөдлөлийн түвшинд нийцдэг брэнд ертөнц бүрдүүлсэн.",
    cover: "/projects/One more night branding/01bc89185771485.65694fdb6b312.webp",
    images: [
      "/projects/One more night branding/01bc89185771485.65694fdb6b312.webp",
      "/projects/One more night branding/t-shirt.png",
      "/projects/One more night branding/pattern.png",
      "/projects/One more night branding/Instagram post - 234.jpg",
      "/projects/One more night branding/hoodie.png",
      "/projects/One more night branding/shoppin bag.png",
      "/projects/One more night branding/880285185771485.65694fdb6c167.webp",
    ],
    galleryLayout: [
      { type: "pair", images: ["/projects/One more night branding/t-shirt.png",   "/projects/One more night branding/pattern.png"] },
      { type: "full", image:  "/projects/One more night branding/Instagram post - 234.jpg" },
      { type: "pair", images: ["/projects/One more night branding/hoodie.png",     "/projects/One more night branding/shoppin bag.png"] },
      { type: "full", image:  "/projects/One more night branding/880285185771485.65694fdb6c167.webp" },
    ],
    featured: true,
  },
  {
    id: "2",
    slug: "cae-logo",
    name: "CAE",
    tagline: "Mark of Authority.",
    taglineMn: "Эрх мэдлийн тэмдэг.",
    category: "Logo Design",
    year: "2025",
    client: "CAE",
    services: ["Logo Design", "Brand Identity", "Visual System"],
    description:
      "CAE approached me to design a brand mark that would carry the weight of their authority in their industry. I developed a comprehensive visual identity system — including a logomark, logotype, custom colour system, and detailed usage guidelines. The challenge was to create something that felt established and credible without being rigid or cold. The result is a mark that communicates precision and trust, built to scale consistently across every brand touchpoint — from digital platforms and printed materials to signage and environmental graphics.",
    descriptionMn:
      "CAE надад тухайн салбарт эрх мэдлийг нь илэрхийлэх брэнд тэмдэг бүтээхийг даалгасан. Лого тэмдэг, лого бичвэр, өнгөний систем болон хэрэглэх заавар бүхий цогц харааны айдентити систем боловсруулсан. Хатуу буюу хүйтэн мэдрэмжгүйгээр байгуулагдсан, итгэл даах мэт санагдуулах зүйл бүтээх нь гол сорилт байв. Үр дүн нь нарийвчлал болон итгэлийг илэрхийлэх, цахим платформоос хэвлэмэл материал болон орчны дизайн хүртэл нэгдмэл байдлаар ашиглагдах тэмдэг болсон.",
    cover: "/projects/CAE logo/f57a8e221632127.67d82fadeec41.webp",
    images: [
      "/projects/CAE logo/1.webp",
      "/projects/CAE logo/2.webp",
      "/projects/CAE logo/3.webp",
      "/projects/CAE logo/4.webp",
      "/projects/CAE logo/5.webp",
      "/projects/CAE logo/6.webp",
      "/projects/CAE logo/7.webp",
      "/projects/CAE logo/8.webp",
      "/projects/CAE logo/9.webp",
      "/projects/CAE logo/10.webp",
      "/projects/CAE logo/11.webp",
      "/projects/CAE logo/12.webp",
      "/projects/CAE logo/13.webp",
      "/projects/CAE logo/14.webp",
      "/projects/CAE logo/15.webp",
      "/projects/CAE logo/16.webp",
      "/projects/CAE logo/17.webp",
    ],
    galleryLayout: [
      { type: "pair-natural", images: ["/projects/CAE logo/1.webp",  "/projects/CAE logo/2.webp"]  },
      { type: "pair-natural", images: ["/projects/CAE logo/3.webp",  "/projects/CAE logo/4.webp"]  },
      { type: "pair-natural", images: ["/projects/CAE logo/5.webp",  "/projects/CAE logo/6.webp"]  },
      { type: "pair-natural", images: ["/projects/CAE logo/7.webp",  "/projects/CAE logo/8.webp"]  },
      { type: "pair-natural", images: ["/projects/CAE logo/9.webp",  "/projects/CAE logo/10.webp"] },
      { type: "pair-natural", images: ["/projects/CAE logo/11.webp", "/projects/CAE logo/12.webp"] },
      { type: "pair-natural", images: ["/projects/CAE logo/13.webp", "/projects/CAE logo/14.webp"] },
      { type: "pair-natural", images: ["/projects/CAE logo/15.webp", "/projects/CAE logo/16.webp"] },
      { type: "full",         image:  "/projects/CAE logo/17.webp"                                 },
    ],
    featured: false,
  },
  {
    id: "3",
    slug: "tsuiwan-package",
    name: "Tsuiwan",
    tagline: "Wrapped in Tradition.",
    taglineMn: "Уламжлалд ороосон.",
    category: "Packaging",
    year: "2024",
    client: "Tsuiwan",
    services: ["Packaging Design", "Label Design", "Print Design"],
    description:
      "Tsuiwan is a Mongolian food brand centred around one of the country's most beloved dishes. I was tasked with creating packaging that honoured the product's cultural roots while giving it a confident, modern shelf presence. The design balances clean contemporary structure with references to Mongolian visual heritage — making it feel familiar locally while remaining compelling internationally. Every detail, from the label layout to the typographic choices, was designed to position the product as premium without sacrificing its authenticity.",
    descriptionMn:
      "Цуйван бол Монголын хамгийн дуртай хоолуудын нэгэнд зориулагдсан хоолны брэнд. Надад бүтээгдэхүүний соёлын үндэсийг хүндэтгэхийн зэрэгцээ итгэлтэй, орчин үеийн дэлгүүрийн тавцан дээр тод харагдах сав баглаа боодол бүтээх даалгавар өгсөн. Дизайн нь Монголын харааны уламжлалыг лавлан авсан цэвэр орчин үеийн бүтэцтэй тэнцвэртэй хослуулж, дотооддоо таних төрхтэй бас гадаадад ч сонирхол татахуйц болгосон. Шошгоны байрлалаас типографийн сонголт хүртэл бүх дэлгэрэнгүй зүйлийг жинхэнэ чанарыг нь алдагдуулалгүй бүтээгдэхүүнийг premium мэт байрлуулахаар бүтээсэн.",
    cover: "/projects/Tsuiwan package/mockup.png",
    images: [
      "/projects/Tsuiwan package/fa1483206384133.66cc0254f3d2a.webp",
      "/projects/Tsuiwan package/9673ca206384133.66cc0254f382f.webp",
      "/projects/Tsuiwan package/mockup.png",
    ],
    galleryLayout: [
      { type: "pair-natural", images: ["/projects/Tsuiwan package/9673ca206384133.66cc0254f382f.webp", "/projects/Tsuiwan package/fa1483206384133.66cc0254f3d2a.webp"] },
      { type: "full",         image:  "/projects/Tsuiwan package/mockup.png" },
    ],
    featured: false,
  },
  {
    id: "4",
    slug: "endeno-label",
    name: "Endeno",
    tagline: "Distilled to Perfection.",
    taglineMn: "Төгс болтол нэрлэсэн.",
    category: "Label Design",
    year: "2025",
    client: "Endeno",
    services: ["Label Design", "Packaging Design", "Print Design"],
    description:
      "Endeno is a premium beverage brand that required a label with strong shelf presence and a refined sensibility. The design challenge was to create something typographically bold — a label that commands attention without relying on illustration or excessive ornament. I built the identity around a precise typographic system with a carefully chosen material palette, letting the confidence of the letterforms carry the weight of the design. The result is a label that communicates the quality of the product through restraint and clarity.",
    descriptionMn:
      "Endeno бол дэлгүүрийн тавцан дээр тод харагдах, нарийн мэдрэмжтэй шошго шаардсан шилдэг ундааны брэнд. Дизайны сорилт нь зураг дүрс буюу хэт их чимэглэлд тулгуурлалгүй тавцан дээр анхаарал татах, типографийн хувьд зоримог зүйл бүтээх явдал байв. Дизайны жинг үсгийн хэлбэрийн итгэлд нь үлдээж, нарийн сонгосон материалын палитр бүхий яг нарийн типографийн систем дээр айдентитийг тулгуурлуулсан. Үр дүн нь хязгаарлалт болон тодорхой байдлаар бүтээгдэхүүний чанарыг илэрхийлдэг шошго болсон.",
    cover: "/projects/endeno label/541669682_1524688988526674_6611917079199196278_n.jpg",
    images: [
      "/projects/endeno label/541669682_1524688988526674_6611917079199196278_n.jpg",
      "/projects/endeno label/538261610_1131163758426809_2803289798167802632_n.jpg",
      "/projects/endeno label/540403715_1311914166999310_4849172590497464622_n.jpg",
      "/projects/endeno label/541035607_1501327104119881_2444444645785567830_n.jpg",
      "/projects/endeno label/541173687_4046432698953321_2418384311932412590_n.jpg",
      "/projects/endeno label/541264213_1138321078229712_346475796688327848_n.jpg",
      "/projects/endeno label/930d02228040247.684b867d2f287.webp",
      "/projects/endeno label/ad3bda228040247.684b867d2ed3a.webp",
      "/projects/endeno label/c3d654228040247.684b867c32271.webp",
      "/projects/endeno label/df6976228040247.684b867c33510.webp",
      "/projects/endeno label/e4ed01228040247.684b867c327c8.webp",
      "/projects/endeno label/fd818f228040247.684b867c34d34.webp",
      "/projects/endeno label/wall.png",
    ],
    galleryLayout: [
      { type: "pair-natural", images: ["/projects/endeno label/538261610_1131163758426809_2803289798167802632_n.jpg",  "/projects/endeno label/540403715_1311914166999310_4849172590497464622_n.jpg"] },
      { type: "pair-natural", images: ["/projects/endeno label/541035607_1501327104119881_2444444645785567830_n.jpg",  "/projects/endeno label/541173687_4046432698953321_2418384311932412590_n.jpg"] },
      { type: "pair-natural", images: ["/projects/endeno label/541264213_1138321078229712_346475796688327848_n.jpg",   "/projects/endeno label/930d02228040247.684b867d2f287.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/ad3bda228040247.684b867d2ed3a.webp",                    "/projects/endeno label/c3d654228040247.684b867c32271.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/df6976228040247.684b867c33510.webp",                    "/projects/endeno label/e4ed01228040247.684b867c327c8.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/fd818f228040247.684b867c34d34.webp",                    "/projects/endeno label/wall.png"] },
    ],
    featured: false,
  },
  {
    id: "5",
    slug: "beautytech-logo",
    name: "Beautytech LLC",
    tagline: "Beauty, Elevated.",
    taglineMn: "Гоо сайхан, дээшилсэн.",
    category: "Logo Design",
    year: "2023",
    client: "Beautytech LLC",
    services: ["Logo Design", "Brand Identity", "Visual System"],
    description:
      "Beautytech LLC is a Mongolian beauty technology company positioned at the intersection of beauty and innovation. They needed an identity that felt modern and credible without losing warmth and approachability — two qualities that are often difficult to balance. I developed a logo and complete brand identity system built on clean, precise forms with a visual tone that makes the brand feel accessible and trustworthy. The system was designed to work cohesively across digital and physical touchpoints, from product packaging and app interfaces to retail environments.",
    descriptionMn:
      "Beautytech LLC бол гоо сайхан болон инновацийн уулзвар дахь Монголын гоо сайхны технологийн компани. Тэдэнд дулаан, хүртээмжтэй мэдрэмжийг алдагдуулалгүй орчин үеийн, итгэмжлэлтэй мэт санагдуулах айдентити хэрэгтэй байсан — ихэвчлэн тэнцвэрлэхэд хэцүү хоёр шинж чанар. Брэндийг хүртээмжтэй, итгэлтэй мэдрэгдүүлдэг харааны аяс бүхий цэвэр, нарийвчлалтай хэлбэрүүд дээр тулгуурлан лого болон бүрэн брэнд айдентити систем боловсруулсан. Систем нь бүтээгдэхүүний сав баглааснаас апп интерфэйс болон жижиглэн худалдааны орчин хүртэл нэгдмэл байдлаар ажилладгаар бүтээгдсэн.",
    cover: "/projects/beautytech llc logo/52730b202740915.668ba7ab75cda.webp",
    images: [
      "/projects/beautytech llc logo/52730b202740915.668ba7ab75cda.webp",
      "/projects/beautytech llc logo/1.webp",
      "/projects/beautytech llc logo/2.webp",
      "/projects/beautytech llc logo/3.webp",
      "/projects/beautytech llc logo/4.webp",
      "/projects/beautytech llc logo/5.webp",
      "/projects/beautytech llc logo/6.webp",
      "/projects/beautytech llc logo/7.webp",
      "/projects/beautytech llc logo/8.webp",
      "/projects/beautytech llc logo/9.webp",
      "/projects/beautytech llc logo/10.webp",
      "/projects/beautytech llc logo/11.webp",
    ],
    galleryLayout: [
      { type: "pair-natural", images: ["/projects/beautytech llc logo/1.webp",  "/projects/beautytech llc logo/2.webp"]  },
      { type: "pair-natural", images: ["/projects/beautytech llc logo/3.webp",  "/projects/beautytech llc logo/4.webp"]  },
      { type: "pair-natural", images: ["/projects/beautytech llc logo/5.webp",  "/projects/beautytech llc logo/6.webp"]  },
      { type: "pair-natural", images: ["/projects/beautytech llc logo/7.webp",  "/projects/beautytech llc logo/8.webp"]  },
      { type: "pair-natural", images: ["/projects/beautytech llc logo/9.webp",  "/projects/beautytech llc logo/10.webp"] },
      { type: "full",         image:  "/projects/beautytech llc logo/11.webp"                                            },
    ],
    featured: true,
  },
  {
    id: "6",
    slug: "chandmani-goyl",
    name: "Chandmani Goyl",
    tagline: "Байгалийн нугын амт.",
    category: "Brand Identity",
    year: "2023",
    client: "Chandmani Goyl",
    services: ["Brand Identity", "Logo Design"],
    description:
      "Chandmani Goyl is a brand deeply rooted in Mongolia's natural heritage. I was brought in to develop an identity that could communicate the purity, authenticity, and quiet beauty of the Mongolian landscape without falling into cliché. The challenge was to draw from natural imagery and cultural references in a way that felt considered and contemporary rather than decorative. The result is a restrained, confident identity — one that lets the brand's origins speak clearly while remaining relevant and competitive in a modern market.",
    descriptionMn:
      "Чандмань Гоул бол Монголын байгалийн өвд гүнзгий үндэслэсэн брэнд. Монголын уудам нутгийн цэвэр ариун байдал, жинхэнэ чанар болон нам гүм гоо сайхныг хэвшмэл ойлголтод орохгүйгээр дамжуулж чадах айдентити боловсруулахад оролцсон. Сорилт нь байгалийн дүрс болон соёлын лавлагаанаас чимэглэлт биш, харин бодолцсон, орчин үеийн байдлаар авах явдал байв. Үр дүн нь орчин үеийн зах зээлд хамааралтай, өрсөлдөхүйц байхын зэрэгцээ брэндийн гарал үүслийг тодорхой ярьдаг хязгаарлагдмал, итгэлтэй айдентити болсон.",
    cover: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 6.png",
    images: [
      "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 6.png",
      "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 1.png",
      "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 2.png",
      "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 3.png",
      "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 4.png",
      "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 5.png",
    ],
    galleryLayout: [
      { type: "full", image: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 1.png" },
      { type: "full", image: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 2.png" },
      { type: "full", image: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 3.png" },
      { type: "full", image: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 4.png" },
      { type: "full", image: "/projects/Chandmani Goyl/3bf4ea194423431.65fbbbf0bda70 5.png" },
    ],
    featured: false,
  },
  {
    id: "7",
    slug: "zen-tarot-candle",
    name: "Zen Tarot Candle",
    tagline: "Light the Ritual.",
    taglineMn: "Зан үйлийг гэрэлтүүл.",
    category: "Label Design",
    year: "2023",
    client: "Zen Tarot",
    services: ["Label Design", "Packaging", "Print Design"],
    description:
      "Zen Tarot is a spiritual wellness brand that needed a candle label communicating ritual, intention, and a sense of the sacred. I approached the design by layering gold detailing against deep, dark tones — creating a visual language that feels simultaneously luxurious and grounded. The spiritual motifs are woven into the composition with care, supporting the label's legibility rather than overwhelming it. The result is a label that feels like an object of ritual as much as a product — elevated on a retail shelf while staying completely true to its esoteric identity.",
    descriptionMn:
      "Zen Tarot бол зан үйл, зорилго болон ариун мэдрэмжийг илэрхийлсэн лааны шошго шаардсан оюун санааны эрүүл мэндийн брэнд. Гүн харанхуй өнгийн аясаас алтан чимэглэлийг давхарлах замаар дизайнд хандсан — тансаг болон газарлаг мэт хоёр аль мэдрэмжийг нэгэн зэрэг дамжуулдаг харааны хэл бүтээсэн. Оюун санааны сэдвийг шошгоны унших боломжийг дарангуйлалгүй найрлагад нарийн нэгтгэсэн. Үр дүн нь жижиглэн худалдааны тавцан дээр өргөмжлөгдсөн байдлаар харагдахын зэрэгцээ нууцлаг айдентитэдээ бүрэн үнэнч, бүтээгдэхүүнээс илүүтэйгээр зан үйлийн эд зүйлс мэт мэдрэгдэх шошго болсон.",
    cover: "/projects/Zen tarot candle label/mockup1.png",
    images: [
      "/projects/Zen tarot candle label/mockup1.png",
      "/projects/Zen tarot candle label/d2f224187363641.6586c7238b876.webp",
      "/projects/Zen tarot candle label/d5dceb187363641.6586c722cc718.webp",
      "/projects/Zen tarot candle label/d7e355187363641.6586c722cb13e.webp",
      "/projects/Zen tarot candle label/d769bd187363641.6586c722c9d12.webp",
      "/projects/Zen tarot candle label/477c58187363641.6586c7238c558.webp",
      "/projects/Zen tarot candle label/78c4d0187363641.6586c7238ab20.webp",
      "/projects/Zen tarot candle label/mockup2.png",
      "/projects/Zen tarot candle label/mockup3.png",
      "/projects/Zen tarot candle label/0790f2187363641.6586c86632a9a.webp",
    ],
    galleryLayout: [
      { type: "full",         image:  "/projects/Zen tarot candle label/d2f224187363641.6586c7238b876.webp" },
      { type: "triple",       images: ["/projects/Zen tarot candle label/d5dceb187363641.6586c722cc718.webp", "/projects/Zen tarot candle label/d7e355187363641.6586c722cb13e.webp", "/projects/Zen tarot candle label/d769bd187363641.6586c722c9d12.webp"] },
      { type: "full",         image:  "/projects/Zen tarot candle label/477c58187363641.6586c7238c558.webp" },
      { type: "full",         image:  "/projects/Zen tarot candle label/78c4d0187363641.6586c7238ab20.webp" },
      { type: "pair-natural", images: ["/projects/Zen tarot candle label/mockup1.png", "/projects/Zen tarot candle label/mockup2.png"] },
      { type: "full",         image:  "/projects/Zen tarot candle label/mockup3.png" },
      { type: "full",         image:  "/projects/Zen tarot candle label/0790f2187363641.6586c86632a9a.webp" },
    ],
    featured: false,
  },
  {
    id: "8",
    slug: "naadam-typography",
    name: "Naadam",
    tagline: "Монгол хэл, орчин дизайн.",
    category: "Typography",
    year: "2025",
    client: "Personal",
    services: ["Typography", "Art Direction", "Poster Design"],
    description:
      "Naadam is a personal typographic project exploring Mongolia's greatest national festival through a contemporary design lens. My goal was to bridge traditional Mongolian script and modern typographic systems — to demonstrate that cultural heritage and contemporary design sensibility are not opposites, but conversation partners. I developed a series of poster compositions that take inspiration from the structure and geometry of the Mongolian script while expressing it through a confident, modern visual voice. The project is both a design exploration and a cultural statement.",
    descriptionMn:
      "Наадам бол Монголын хамгийн агуу үндэсний наадмыг орчин үеийн дизайны призмээр судалсан хувийн типографийн төсөл. Миний зорилт нь уламжлалт Монгол бичиг болон орчин үеийн типографийн системийн хоорондох зайг гүүрдэх — соёлын өв болон орчин үеийн дизайны мэдрэмж нь эсрэг тэсрэг биш, харин ярилцагч нар гэдгийг харуулах байлаа. Монгол бичгийн бүтэц болон геометриэс урам авсан боловч итгэлтэй, орчин үеийн харааны дуугаар илэрхийлдэг нэг цуврал постерын найрлагуудыг боловсруулсан. Энэхүү төсөл нь дизайны судалгаа бөгөөд соёлын мэдэгдэл хоёул юм.",
    cover: "/projects/naadam typography/198492229719067.686a12b98ad11.webp",
    images: [
      "/projects/naadam typography/198492229719067.686a12b98ad11.webp",
      "/projects/naadam typography/dbfaaa229719067.686a12b98a254.webp",
      "/projects/naadam typography/5c1933229719067.686a12b98b4e1.webp",
    ],
    galleryLayout: [
      { type: "full", image: "/projects/naadam typography/dbfaaa229719067.686a12b98a254.webp" },
      { type: "full", image: "/projects/naadam typography/5c1933229719067.686a12b98b4e1.webp" },
    ],
    featured: true,
  },
  {
    id: "9",
    slug: "zen-tarot-incense",
    name: "Zen Tarot Incense",
    tagline: "Scent as Sacred Ritual.",
    taglineMn: "Анхилуун үнэр — ариун зан үйл.",
    category: "Packaging",
    year: "2026",
    client: "Zen Tarot",
    services: ["Packaging Design", "Label Design", "Print Design"],
    description:
      "Zen Tarot approached me to design packaging for their Thyme and Khomool incense line — two botanicals with deep roots in Mongolian ritual and healing practice. The challenge was to create a visual system that felt ceremonial and premium without being inaccessible. I developed a packaging identity that layers botanical illustration, refined typography, and a muted natural colour palette to evoke the meditative quality of the product. The result is a cohesive package system that honours the cultural significance of both ingredients while positioning the line as a considered, contemporary wellness offering.",
    descriptionMn:
      "Zen Tarot надад тэдний Гангa болон Хөмөөл утлагын шугамын сав баглаа боодлыг бүтээхийг даалгасан — Монголын зан үйл болон эмчилгээний практикт гүнзгий үндэстэй хоёр ургамал. Сорилт нь хүртээмжгүй санагдуулалгүй зан үйлийн, шилдэг мэт мэдрэгдэх харааны систем бий болгох явдал байв. Бүтээгдэхүүний бясалгалын чанарыг татан дуудахын тулд ургамлын дүрслэл, нарийн типографи болон хэмжсэн байгалийн өнгөний палитрыг давхарласан сав баглаа боодлын айдентити боловсруулсан. Үр дүн нь хоёр орцын соёлын ач холбогдлыг хүндэтгэхийн зэрэгцээ шугамыг бодолцсон, орчин үеийн эрүүл мэндийн бүтээгдэхүүн болгон байрлуулдаг нэгдмэл сав баглаа боодлын систем болсон.",
    cover: "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__0ee3f537-da0c-4c75-bb9c-fadfa4444266.png",
    images: [
      "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__0ee3f537-da0c-4c75-bb9c-fadfa4444266.png",
      "/projects/ganga and khomool/Corrugated_Box_Mockup_41.png",
      "/projects/ganga and khomool/Corrugated_Box_Mockup_51.png",
      "/projects/ganga and khomool/Instagram post - 101.jpg",
      "/projects/ganga and khomool/Instagram post - 102.jpg",
      "/projects/ganga and khomool/mockup1.png",
      "/projects/ganga and khomool/mockup2.png",
      "/projects/ganga and khomool/Instagram post - 103.jpg",
      "/projects/ganga and khomool/Instagram post - 104.jpg",
      "/projects/ganga and khomool/mockup3.png",
      "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__d37788ed-113d-49a9-8c1c-270e8e4d5e03.png",
      "/projects/ganga and khomool/u8229143814_httpss.mj.runpOSIYnnL8l4_top_view_high_angle_shot.__2d2bf6a5-d292-46d5-af84-4c82802e32c5.png",
    ],
    galleryLayout: [
      { type: "pair",         images: ["/projects/ganga and khomool/Corrugated_Box_Mockup_41.png", "/projects/ganga and khomool/Corrugated_Box_Mockup_51.png"] },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 101.jpg" },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 102.jpg" },
      { type: "pair-natural", images: ["/projects/ganga and khomool/mockup1.png", "/projects/ganga and khomool/mockup2.png"] },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 103.jpg" },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 104.jpg" },
      { type: "pair-natural", images: ["/projects/ganga and khomool/mockup3.png", "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__d37788ed-113d-49a9-8c1c-270e8e4d5e03.png"] },
      { type: "full",         image:  "/projects/ganga and khomool/u8229143814_httpss.mj.runpOSIYnnL8l4_top_view_high_angle_shot.__2d2bf6a5-d292-46d5-af84-4c82802e32c5.png" },
    ],
    featured: true,
  },
]

export const getFeaturedProjects = () => projects.filter((p) => p.featured)
export const getAllProjects = () => projects
export const getProjectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
