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
    taglineMn: "Хөгжим шиг мэдрэгдэх брэнд.",
    category: "Brand Identity",
    year: "2023",
    client: "One More Night",
    services: ["Brand Identity", "Typography", "Visual identity"],
    description:
      "One More Night is a creative brand inspired by music, emotion, and night culture. For this project, I developed the visual identity and logo design to capture the brand’s distinctive atmosphere and energy. The design direction focused on translating rhythm, mood, and the feeling of nightlife into a strong visual language. The logotype and supporting graphic elements were created to feel modern, minimal, and emotionally expressive while maintaining a bold and memorable presence. The visual identity was designed to work seamlessly across social media, merchandise, and promotional materials, creating a cohesive and recognizable brand experience across every touchpoint.",
    descriptionMn:
      "One More Night бол хөгжим, мэдрэмж, шөнийн соёлоос санаа авсан бүтээлч брэнд юм. Энэхүү төслийн хүрээнд брэндийн өнгө төрхийг илэрхийлэх visual identity болон logo design-ийг боловсруулсан. Дизайны үндсэн чиглэл нь хэмнэл, уур амьсгал, шөнийн мэдрэмжийг визуал хэлээр илэрхийлэхэд төвлөрсөн. Логотип болон график элементүүдийг орчин үеийн, минимал атлаа хүчтэй мэдрэмж төрүүлэхээр шийдэж, брэндийн онцлог өнгө аясыг бүрдүүлсэн. Үүсгэсэн visual identity нь social media, merchandise болон төрөл бүрийн сурталчилгааны материал дээр уялдаа холбоотой хэрэгжих боломжтойгоор бүтээгдсэн бөгөөд брэндийн мэдрэмжийг бүх сувгаар нэгдмэл байдлаар хүргэх зорилготой.",
    cover: "/projects/One more night branding/01bc89185771485.65694fdb6b312.webp",
    images: [
      "/projects/One more night branding/01bc89185771485.65694fdb6b312.webp",
      "/projects/One more night branding/t-shirt.webp",
      "/projects/One more night branding/pattern.webp",
      "/projects/One more night branding/Instagram post - 234.webp",
      "/projects/One more night branding/hoodie.webp",
      "/projects/One more night branding/shoppin bag.webp",
      "/projects/One more night branding/880285185771485.65694fdb6c167.webp",
    ],
    galleryLayout: [
      { type: "pair", images: ["/projects/One more night branding/t-shirt.webp",   "/projects/One more night branding/pattern.webp"] },
      { type: "full", image:  "/projects/One more night branding/Instagram post - 234.webp" },
      { type: "pair", images: ["/projects/One more night branding/hoodie.webp",     "/projects/One more night branding/shoppin bag.webp"] },
      { type: "full", image:  "/projects/One more night branding/880285185771485.65694fdb6c167.webp" },
    ],
    featured: true,
  },
  {
    id: "2",
    slug: "cae-logo",
    name: "CAE",
    tagline: "Work, Growth, Value.",
    taglineMn: "Хөдөлмөр, хөгжил, үнэ цэнэ.",
    category: "Logo Design",
    year: "2025",
    client: "CAE",
    services: ["Logo Design", "Brand Identity", "Visual System"],
    description:
      "For this project, I developed a complete visual identity system including the logo mark, typography, colour system, logo guidelines, and a range of brand applications. The main challenge was to create a brand identity that felt modern and trustworthy without becoming overly cold or heavy. The logo was designed to communicate movement, stability, and growth through a clean yet powerful visual form inspired by the structure and energy of the industry itself. The final identity system was built to work consistently across both digital and print environments, creating a cohesive and recognizable brand presence across every touchpoint.",
    descriptionMn:
      "Энэхүү төслийн   хүрээнд лого тэмдэг, typography, өнгөний систем, logo guideline болон хэрэглээний бүх үндсэн элементүүдийг нэгдсэн зарчмаар шийдсэн. Гол зорилго нь уул уурхайн салбарын онцлогийг хадгалах атлаа хэт хүнд, хүйтэн мэдрэмж төрүүлэхгүйгээр орчин үеийн, итгэл төрүүлэхүйц визуал төрх бүтээх байсан. Логоны хэлбэр нь хөдөлгөөн, тогтвортой байдал, өсөлтийг илэрхийлж, хүчирхэг атлаа цэвэр минимал хэлбэрээр боловсруулагдсан. Үүсгэсэн visual identity system нь digital болон print орчинд жигд ажиллах боломжтойгоор бүтээгдсэн бөгөөд компанийн брэндийг бүх touchpoint дээр танигдахуйц, нэгдмэл байдлаар илэрхийлэхэд чиглэсэн.",
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
    tagline: "Crafted by hand, tastes like home.",
    taglineMn: "Хийц нь гарын, амт нь гэрийн",
    category: "Packaging",
    year: "2024",
    client: "Tsuiwan",
    services: ["Packaging Design", "Label Design", "Print Design"],
    description:
      "The main challenge was creating a visual identity that could stand out in Mongolia’s highly saturated homemade noodle market, where many small and local brands often share similar packaging styles. The design direction therefore focused on building packaging that feels instantly recognizable on store shelves while giving the brand a stronger, more playful, and contemporary presence. The final design combines a vibrant colour palette, distinctive illustrations, and expressive typography inspired by the warmth of homemade food culture. Every detail, from the label structure to the graphic elements, was carefully crafted to make the product feel approachable, memorable, and visually unique without losing the authentic feeling of traditional Tsuiwan.",
    descriptionMn:
      "Гол сорилт нь Монголд гэрийн болон жижиг дунд үйлдвэрлэлийн хэрчсэн гурилын бүтээгдэхүүнүүд маш олон байдаг зах зээл дээр бусдаас ялгарах визуал төрх бий болгох байв. Иймээс дизайны үндсэн чиглэл нь дэлгүүрийн лангуун дээр шууд танигдахуйц, илүү хүчтэй брэнд мэдрэмжтэй, хөгжилтэй шинэлэг харагдах сав баглаа боодол боловсруулахад төвлөрсөн. Эцсийн дизайн нь гар хийцийн хоолны мэдрэмжийг илэрхийлэх өнгөлөг palette, өвөрмөц illustration, чөлөөтэй typography-г хослуулсан. Шошгоны бүтэц, график элементүүд, дүрслэлийн бүх шийдэл нь бүтээгдэхүүнийг илүү дотно, хөгжилтэй, танигдахуйц харагдуулахын зэрэгцээ уламжлалт мэдрэмжийг алдагдуулахгүй байхаар боловсруулагдсан.",
    cover: "/projects/Tsuiwan package/mockup.webp",
    images: [
      "/projects/Tsuiwan package/fa1483206384133.66cc0254f3d2a.webp",
      "/projects/Tsuiwan package/9673ca206384133.66cc0254f382f.webp",
      "/projects/Tsuiwan package/mockup.webp",
    ],
    galleryLayout: [
      { type: "pair-natural", images: ["/projects/Tsuiwan package/9673ca206384133.66cc0254f382f.webp", "/projects/Tsuiwan package/fa1483206384133.66cc0254f3d2a.webp"] },
      { type: "full",         image:  "/projects/Tsuiwan package/mockup.webp" },
    ],
    featured: false,
  },
  {
    id: "4",
    slug: "endeno-label",
    name: "Endeno",
    tagline: "Less is more",
    taglineMn: "Бага байх нь илүү",
    category: "Label Design",
    year: "2025",
    client: "Endeno",
    services: ["Label Design", "Packaging Design", "Print Design"],
    description:
      "Endeno is a product brand designed to make children’s learning and play environments more creative and colorful. The main goal of the design was to create a visual system that feels recognizable, playful, and organized within a crowded children’s product market. The challenge was to avoid relying on excessive decoration or typical “kids style” aesthetics, and instead find the right balance between modern minimal structure and playful visual expression. Because of this, the design system was built around a vibrant color palette, soft typography, simple illustrations, and clean layout compositions. The packaging and overall graphic language were designed to reflect children’s curiosity and sense of play, while also feeling high-quality, safe, and thoughtfully designed from a parent’s perspective.",
    descriptionMn:
      "Endeno нь хүүхдийн боловсрол, тоглоомын орчинг илүү бүтээлч, өнгөлөг болгох зорилготой бүтээгдэхүүний брэнд бөгөөд дизайны гол зорилго нь хүүхдэд зориулсан бүтээгдэхүүнүүд дундаас илүү танигдахуйц, хөгжилтэй атлаа цэгцтэй визуал систем бүтээх байв. Сорилт нь хэт их чимэглэл эсвэл түгээмэл “kids style” шийдэлд найдалгүйгээр, орчин үеийн minimal бүтэц болон playful мэдрэмжийн зөв тэнцвэрийг олох байсан. Иймээс дизайны үндэс нь тод өнгийн palette, зөөлөн хэлбэртэй typography, энгийн illustration болон цэвэр layout систем дээр төвлөрсөн. Сав баглаа боодол болон бүтээгдэхүүний график хэл нь хүүхдийн сониуч зан, тоглох мэдрэмжийг илэрхийлэхийн зэрэгцээ эцэг эхчүүдэд илүү чанартай, аюулгүй, thoughtfully designed бүтээгдэхүүн мэт харагдахаар боловсруулагдсан.",
    cover: "/projects/endeno label/541669682_1524688988526674_6611917079199196278_n.webp",
    images: [
      "/projects/endeno label/541669682_1524688988526674_6611917079199196278_n.webp",
      "/projects/endeno label/538261610_1131163758426809_2803289798167802632_n.webp",
      "/projects/endeno label/540403715_1311914166999310_4849172590497464622_n.webp",
      "/projects/endeno label/541035607_1501327104119881_2444444645785567830_n.webp",
      "/projects/endeno label/541173687_4046432698953321_2418384311932412590_n.webp",
      "/projects/endeno label/541264213_1138321078229712_346475796688327848_n.webp",
      "/projects/endeno label/930d02228040247.684b867d2f287.webp",
      "/projects/endeno label/ad3bda228040247.684b867d2ed3a.webp",
      "/projects/endeno label/c3d654228040247.684b867c32271.webp",
      "/projects/endeno label/df6976228040247.684b867c33510.webp",
      "/projects/endeno label/e4ed01228040247.684b867c327c8.webp",
      "/projects/endeno label/fd818f228040247.684b867c34d34.webp",
      "/projects/endeno label/wall.webp",
    ],
    galleryLayout: [
      { type: "pair-natural", images: ["/projects/endeno label/538261610_1131163758426809_2803289798167802632_n.webp",  "/projects/endeno label/540403715_1311914166999310_4849172590497464622_n.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/541035607_1501327104119881_2444444645785567830_n.webp",  "/projects/endeno label/541173687_4046432698953321_2418384311932412590_n.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/541264213_1138321078229712_346475796688327848_n.webp",   "/projects/endeno label/930d02228040247.684b867d2f287.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/ad3bda228040247.684b867d2ed3a.webp",                    "/projects/endeno label/c3d654228040247.684b867c32271.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/df6976228040247.684b867c33510.webp",                    "/projects/endeno label/e4ed01228040247.684b867c327c8.webp"] },
      { type: "pair-natural", images: ["/projects/endeno label/fd818f228040247.684b867c34d34.webp",                    "/projects/endeno label/wall.webp"] },
    ],
    featured: false,
  },
  {
    id: "5",
    slug: "beautytech-logo",
    name: "Beautytech LLC",
    tagline: "Professional Beauty Services in Mongolia.",
    taglineMn: "Мэргэжлийн гоо сайхны үйлчилгээ монголд",
    category: "Logo Design",
    year: "2023",
    client: "Beautytech LLC",
    services: ["Logo Design", "Brand Identity", "Visual System"],
    description:
      "Beautytech LLC is a modern brand positioned at the intersection of beauty and technology. The goal of the identity was to create a visual system that feels professional and trustworthy while maintaining a warm and approachable character. The logo and brand system were developed using clean geometric forms, minimal structure, and balanced typography. A monochrome palette combined with a bold accent color helps the brand appear both recognizable and contemporary. The system was designed to work consistently across packaging, printed materials, environmental graphics, and digital platforms.",
    descriptionMn:
      "Beautytech LLC нь гоо сайхан болон технологийн уулзвар дахь орчин үеийн брэнд юм. Энэхүү айдентитигийн зорилго нь мэргэжлийн, итгэл төрүүлэх мэдрэмжийг хадгалахын зэрэгцээ дулаан, хүртээмжтэй өнгө аястай визуал систем бүтээх байв. Лого болон брэндийн систем нь цэвэр геометр хэлбэр, minimal бүтэц, тэнцвэртэй typography дээр тулгуурлан боловсруулагдсан. Хар, цагаан, саарал өнгийн суурь palette-д тод accent өнгө ашигласнаар брэндийг илүү танигдахуйц, орчин үеийн төрхтэй болгосон. Систем нь сав баглаа боодол, хэвлэмэл материал, орчны график болон дижитал орчинд нэгдмэл байдлаар ашиглагдахаар бүтээгдсэн.",
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
    tagline: "Delivering Tradition with Every Step.",
    taglineMn: "Уламжлалыг алхаар түгээв.",
    category: "Brand Identity",
    year: "2023",
    client: "Chandmani Goyl",
    services: ["Brand Identity", "Logo Design"],
    description:
      "Chandmani Goyol is a brand identity project inspired by Mongolia’s traditional metal craftsmanship and silverwork heritage. The goal of the identity was to translate traditional visual elements into a modern, clean, and recognizable design language without directly replicating historical ornamentation. The core form of the logo was developed from the crescent-shaped patterns and textures found in Dariganga silver craftsmanship, combined with the symbolism of the “Chandmani” motif. Repetitive detailed forms and a minimal structure create a refined and premium aesthetic, balancing traditional culture with contemporary design. The color palette, typography, and graphic system were designed to work consistently across packaging, printed materials, and digital platforms, helping communicate the brand’s heritage and values in a clear and modern way.",
    descriptionMn:
      "Чандмань Гоёл нь Монголын уламжлалт дарханы урлал, мөнгөн эдлэлийн өв соёлоос санаа авсан брэнд айдентити төсөл юм. Энэхүү айдентитигийн зорилго нь уламжлалт хэв шинжийг шууд хуулбарлахгүйгээр орчин үеийн, цэвэр бөгөөд танигдахуйц визуал хэл рүү хөрвүүлэх байв. Логоны үндсэн хэлбэр нь Дарьганга хийцийн мөнгөн урлалын хавирган хээ, бүтэц болон “чандмань” бэлгэдлээс үүссэн. Нарийн давтагдсан хэлбэрүүд болон minimal бүтэц нь брэндэд тансаг, нямбай мэдрэмж өгч, уламжлал ба орчин үеийн дизайны тэнцвэрийг бий болгосон. Өнгө, typography болон graphic system нь сав баглаа боодол, хэвлэмэл материал болон дижитал орчинд нэгдмэл байдлаар ажиллахаар боловсруулагдсан бөгөөд брэндийн гарал үүсэл, үнэ цэнийг илүү хүчтэй илэрхийлдэг.",
    cover: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 6.webp",
    images: [
      "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 6.webp",
      "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 1.webp",
      "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 2.webp",
      "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 3.webp",
      "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 4.webp",
      "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 5.webp",
    ],
    galleryLayout: [
      { type: "full", image: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 1.webp" },
      { type: "full", image: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 2.webp" },
      { type: "full", image: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 3.webp" },
      { type: "full", image: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 4.webp" },
      { type: "full", image: "/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 5.webp" },
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
      "Zen Tarot is a candle label design project created to express rituals, inner emotion, and spiritual energy. The identity focuses on combining bold color palettes, mystical symbolism, and distinctive typography to create a visual language that feels both modern and mysterious. Each scent was designed with its own unique color and mood while still functioning within a cohesive visual system. Decorative serif typography and spiritual-inspired graphics were paired with a clean composition, allowing the labels to feel expressive while remaining clear and easy to read.",
    descriptionMn:
      "Zen Tarot нь зан үйл, дотоод мэдрэмж, оюун санааны энергийг илэрхийлэх зорилготой лааны шошгоны дизайн төсөл юм. Энэхүү айдентити нь тод өнгийн палитр, мистик бэлгэдэл болон өвөрмөц typography-ийг хослуулан орчин үеийн атлаа нууцлаг уур амьсгалтай визуал хэл бий болгоход төвлөрсөн. Үнэр бүр өөрийн гэсэн өнгө, мэдрэмжтэйгээр ялгардаг ч нийтдээ нэгэн цогц visual system дотор ажиллахаар шийдэгдсэн. Чимэглэлт serif үсэг болон spiritual хэв маягийн графикуудыг цэвэр зохиомжтой хослуулснаар шошго нь илэрхийлэлтэй мөртлөө ойлгомжтой, уншихад хялбар болсон.",
    cover: "/projects/Zen tarot candle label/mockup1.webp",
    images: [
      "/projects/Zen tarot candle label/mockup1.webp",
      "/projects/Zen tarot candle label/d2f224187363641.6586c7238b876.webp",
      "/projects/Zen tarot candle label/d5dceb187363641.6586c722cc718.webp",
      "/projects/Zen tarot candle label/d7e355187363641.6586c722cb13e.webp",
      "/projects/Zen tarot candle label/d769bd187363641.6586c722c9d12.webp",
      "/projects/Zen tarot candle label/477c58187363641.6586c7238c558.webp",
      "/projects/Zen tarot candle label/78c4d0187363641.6586c7238ab20.webp",
      "/projects/Zen tarot candle label/mockup2.webp",
      "/projects/Zen tarot candle label/mockup3.webp",
      "/projects/Zen tarot candle label/0790f2187363641.6586c86632a9a.webp",
    ],
    galleryLayout: [
      { type: "full",         image:  "/projects/Zen tarot candle label/d2f224187363641.6586c7238b876.webp" },
      { type: "triple",       images: ["/projects/Zen tarot candle label/d5dceb187363641.6586c722cc718.webp", "/projects/Zen tarot candle label/d7e355187363641.6586c722cb13e.webp", "/projects/Zen tarot candle label/d769bd187363641.6586c722c9d12.webp"] },
      { type: "full",         image:  "/projects/Zen tarot candle label/477c58187363641.6586c7238c558.webp" },
      { type: "full",         image:  "/projects/Zen tarot candle label/78c4d0187363641.6586c7238ab20.webp" },
      { type: "pair-natural", images: ["/projects/Zen tarot candle label/mockup2.png", "/projects/Zen tarot candle label/mockup3.webp"] },
      { type: "full",         image:  "/projects/Zen tarot candle label/0790f2187363641.6586c86632a9a.webp" },
    ],
    featured: false,
  },
  {
    id: "8",
    slug: "naadam-typography",
    name: "Naadam",
    tagline: "Reach for the Sky.",
    taglineMn: "Тэнгэр өөд тэмүүл.",
    category: "Typography",
    year: "2025",
    client: "Personal",
    services: ["Typography", "Art Direction", "Poster Design"],
    description:
      "Naadam is a personal typography research project inspired by Mongolia’s national festival and the traditional architectural forms of the Bogd Khan Winter Palace Museum. The project explores how the structure, rooflines, and geometry of Mongolian temples and palace gates can be translated into letterforms while preserving a strong cultural identity through a contemporary visual language. Developed as a personal exploration and research-driven project, the typography was later used in Naadam greeting visuals, social media posts, and branded content for companies I collaborated with at the time. Rather than directly replicating traditional elements, the project reinterprets them into a modern graphic system that balances cultural heritage with contemporary design aesthetics.",
    descriptionMn:
      "Наадам бол Монголын үндэсний баяр, Богд хааны зуны ордон музейн уламжлалт архитектур хэлбэрээс санаа авсан typography судалгааны төсөл юм. Энэхүү төслийн хүрээнд Монгол сүм, ордны хаалганы бүтэц, дээврийн хэлбэр, геометрийг үсгийн хэлбэртэй нэгтгэн орчин үеийн атлаа соёлын өнгө аяс хадгалсан typography бүтээхийг зорьсон. Төслийг өөрийн сонирхол, судалгааны хүрээнд хөгжүүлсэн бөгөөд тухайн үед хамтран ажиллаж байсан компаниудын баяр наадмын мэндчилгээ, сошиал пост болон визуал контентод ашиглагдаж байсан. Соёлын элементүүдийг шууд хуулбарлах бус, график хэл рүү хөрвүүлэн орчин үеийн дизайны мэдрэмжтэй уялдуулсан нь энэхүү төслийн гол онцлог болсон.",
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
      "The product line was developed around two ingredients deeply connected to Mongolian ritual and traditional healing culture. Since each product had its own ingredients, purpose, and emotional tone, the packaging system was built using an endorsed branding structure — creating distinct visual identities under one unified brand. The packaging identity combines botanical illustrations, refined typography, and a natural color palette to express the calm and meditative qualities of the products. While each variation carries its own atmosphere and visual character, all of them were designed to work cohesively within a unified visual system. The result is a packaging system that respects the cultural value of traditional incense while positioning the products as modern, premium wellness objects.",
    descriptionMn:
      "Монголын зан үйл, уламжлалт эмчилгээний соёлтой гүн холбоотой хоёр төрлийн бүтээгдэхүүн. Бүтээгдэхүүн бүр өөр өөр орц, зориулалт, мэдрэмжтэй байсан тул endorsed branding structure дээр тулгуурлан, нэг брэндийн дор ялгаатай визуал шинжтэйгээр хөгжүүлсэн. Сав баглаа боодлын айдентити нь ургамлын дүрслэл, нарийн typography, байгалийн өнгөний палитрыг хослуулан бүтээгдэхүүний тайван, бясалгалын шинж чанарыг илэрхийлэхэд төвлөрсөн. Бүтээгдэхүүн тус бүр өөрийн гэсэн өнгө аяс, дүрслэлтэй боловч нийтдээ нэгдмэл visual system дотор ажиллахаар шийдэгдсэн. Үр дүнд нь уламжлалт утлагын соёлын үнэ цэнийг хадгалсан атлаа орчин үеийн, premium wellness бүтээгдэхүүн мэт мэдрэмж төрүүлэх сав баглаа боодлын цогц систем бий болсон.",
    cover: "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__0ee3f537-da0c-4c75-bb9c-fadfa4444266.webp",
    images: [
      "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__0ee3f537-da0c-4c75-bb9c-fadfa4444266.webp",
      "/projects/ganga and khomool/Corrugated_Box_Mockup_41.webp",
      "/projects/ganga and khomool/Corrugated_Box_Mockup_51.webp",
      "/projects/ganga and khomool/Instagram post - 101.webp",
      "/projects/ganga and khomool/Instagram post - 102.webp",
      "/projects/ganga and khomool/mockup1.webp",
      "/projects/ganga and khomool/mockup2.webp",
      "/projects/ganga and khomool/Instagram post - 103.webp",
      "/projects/ganga and khomool/Instagram post - 104.webp",
      "/projects/ganga and khomool/mockup3.webp",
      "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__d37788ed-113d-49a9-8c1c-270e8e4d5e03.webp",
      "/projects/ganga and khomool/u8229143814_httpss.mj.runpOSIYnnL8l4_top_view_high_angle_shot.__2d2bf6a5-d292-46d5-af84-4c82802e32c5.webp",
    ],
    galleryLayout: [
      { type: "pair",         images: ["/projects/ganga and khomool/Corrugated_Box_Mockup_41.webp", "/projects/ganga and khomool/Corrugated_Box_Mockup_51.webp"] },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 101.webp" },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 102.webp" },
      { type: "pair-natural", images: ["/projects/ganga and khomool/mockup1.webp", "/projects/ganga and khomool/mockup2.webp"] },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 103.webp" },
      { type: "full",         image:  "/projects/ganga and khomool/Instagram post - 104.webp" },
      { type: "pair-natural", images: ["/projects/ganga and khomool/mockup3.webp", "/projects/ganga and khomool/u8229143814_httpss.mj.runI0tF0NXXOAQ_top_view_high_angle_shot.__d37788ed-113d-49a9-8c1c-270e8e4d5e03.webp"] },
      { type: "full",         image:  "/projects/ganga and khomool/u8229143814_httpss.mj.runpOSIYnnL8l4_top_view_high_angle_shot.__2d2bf6a5-d292-46d5-af84-4c82802e32c5.webp" },
    ],
    featured: true,
  },
]

export const getFeaturedProjects = () => projects.filter((p) => p.featured)
export const getAllProjects = () => projects
export const getProjectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
