import { ResourceCategory, ResourceItem } from './types'

export const DEFAULT_CATEGORIES: ResourceCategory[] = [
  {
    id: 'guides',
    name: 'Guides & Articles',
    nameMn: 'Удирдамж & Зөвлөмж',
    slug: 'guides',
    description: 'Брэндийн стратеги, визуал систем, лого дизайны практик удирдамжууд',
    sortOrder: 1,
  },
  {
    id: 'templates',
    name: 'Templates & Downloads',
    nameMn: 'Загвар & Татах файлууд',
    slug: 'templates',
    description: 'Дизайнерууд болон брэнд менежерүүдэд зориулсан бэлэн файлууд, checklist',
    sortOrder: 2,
  },
  {
    id: 'tools',
    name: 'Tools & Applications',
    nameMn: 'Дизайн & AI Хэрэгслүүд',
    slug: 'tools',
    description: 'Брэндбүүк аудит, AI бриф зөвлөх зэрэг интерактив хэрэгслүүд',
    sortOrder: 3,
  },
  {
    id: 'packaging',
    name: 'Packaging & Print',
    nameMn: 'Сав баглаа боодол',
    slug: 'packaging',
    description: 'Хэвлэлийн эх бэлтгэл, цаас, өнгөлгөө, дардсын стандарт',
    sortOrder: 4,
  },
  {
    id: 'typography',
    name: 'Typography',
    nameMn: 'Үсгийн соёл',
    slug: 'typography',
    description: 'Фонтын сонголт, кирилл бичгийн дүрэм, мэдээллийн шатлал',
    sortOrder: 5,
  },
]

export const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: 'res_brandbook_auditor',
    type: 'tool',
    title: 'Brandbook Quality Auditor',
    slug: 'brandbook-quality-auditor',
    summary:
      'Брэндбүүкийн логоны дүрэм, хамгаалалтын зай, CMYK өнгөний код, үсгийн шатлалыг 30 нарийвчилсан шалгуураар үнэлэх интерактив хэрэгсэл.',
    coverImage: '/work/one-more-night/01.jpg',
    category: 'tools',
    tags: ['Brandbook', 'Audit', 'AI Tool', 'Quality'],
    content: `
## Брэндбүүк чанарын автомат аудит

Энэхүү хэрэгсэл нь байгууллагын брэндбүүк PDF файлыг хүлээн авч, олон улсын брэнд айдентитийн 9 үндсэн модуль, 30 шалгуурын дагуу үнэлж оноо гаргана.

### Шалгах үндсэн чиглэлүүд:
- **Логоны систем:** Хамгаалалтын зай (X-нэгж), хамгийн бага хэмжээ (мм/px), хориглох хэрэглээ.
- **Өнгөний систем:** CMYK, RGB, HEX, Pantone техникийн кодууд болон дэвсгэрийн тодрол.
- **Typography:** Үндсэн ба туслах фонт, кирилл дэмжлэг, мэдээллийн шатлал (H1, H2, Body).
- **Бодит хэрэглээ:** Хэвлэлийн эх бэлтгэлийн стандарт, зүсэлтийн зай (bleed), дижитал дүрэм.
    `,
    downloadFiles: [],
    destinationUrl: '/brand-audit',
    ctaLabel: 'Аудит эхлүүлэх',
    featured: true,
    sortOrder: 1,
    readTimeMinutes: 3,
    author: {
      name: 'Т. Өсөхбаяр (baysaass)',
      role: 'Brand Designer',
    },
    seo: {
      title: 'Brandbook Quality Auditor | Baysaass Tools',
      description: 'Брэндбүүкийн чанарыг 30 шалгуураар үнэлэх Baysaass студийн автомат хэрэгсэл.',
      keywords: ['brandbook', 'audit', 'logo guidelines', 'baysaass'],
    },
    status: 'published',
    viewsCount: 142,
    downloadsCount: 0,
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z',
    publishedAt: '2026-10-28T10:00:00.000Z',
  },
  {
    id: 'res_logo_checklist',
    type: 'download',
    title: 'Logo Design & Identity Pre-flight Checklist',
    slug: 'logo-design-checklist',
    summary:
      'Лого болон брэндийн үндсэн айдентити боловсруулах үед үйлдвэрлэлд орохоос өмнө шалгах 20 чухал шалгуурын PDF хуудас.',
    coverImage: '/work/cae-logo/01.jpg',
    category: 'templates',
    tags: ['Logo Design', 'Checklist', 'PDF Download', 'Vector'],
    content: `
## Лого дизайны үйлдвэрлэлийн өмнөх шалгуур

Шинэ лого зохиож дууссаны дараа харилцагчид хүлээлгэн өгөх, эсвэл хэвлэлийн үйлдвэрт илгээхийн өмнө шалгах 20 алхамт шалгах хуудас.

### Checklist-д багтсан гол зүйлс:
1. **Вектор цэвэрлэгээ:** Илүүдэл anchor point, нээлттэй path үлдсэн эсэх.
2. **Өнгөний орон зай:** Дэлгэцийн sRGB болон хэвлэлийн CMYK өнгийн хазайлтыг шалгасан эсэх.
3. **Хамгийн бага хэмжээ:** Жижиг хэмжээсээр (15мм) хэвлэхэд бичвэр, нарийн зурааснууд уусч арилахгүй байх.
4. **Хар цагаан туршилт:** Өнгөгүй, дан хар фон дээр лого танигдаж байгаа эсэх.
5. **Файлын багц:** AI, EPS, SVG, PNG (ил тод дэвсгэртэй) тус бүрийг эрэмбэлсэн хавтас.
    `,
    downloadFiles: [
      {
        id: 'dl_01',
        name: 'Baysaass_Logo_Design_Checklist_v1.pdf',
        fileUrl: '/work/cae-logo/01.jpg',
        fileSize: '1.2 MB',
        format: 'PDF',
        description: 'Хэвлэх боломжтой A4 форматын бэлэн хуудас',
      },
    ],
    destinationUrl: undefined,
    ctaLabel: 'Checklist татах (PDF)',
    featured: true,
    sortOrder: 2,
    readTimeMinutes: 5,
    author: {
      name: 'Т. Өсөхбаяр (baysaass)',
      role: 'Brand Designer',
    },
    seo: {
      title: 'Logo Design & Identity Checklist | Free Download',
      description: 'Лого дизайн боловсруулах үед шалгах шаардлагатай 20 үндсэн шалгуурын PDF хуудас.',
      keywords: ['logo checklist', 'brand design', 'free template', 'baysaass'],
    },
    status: 'published',
    viewsCount: 289,
    downloadsCount: 114,
    createdAt: '2026-10-27T12:00:00.000Z',
    updatedAt: '2026-10-27T12:00:00.000Z',
    publishedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'res_logo_vs_brand_identity',
    type: 'article',
    title: 'Лого ба Брэндийн төрх (Brand Identity)-ийн ялгаа',
    slug: 'logo-vs-brand-identity',
    summary:
      'Лого бол брэндийн таних тэмдгийн зөвхөн нэг хэсэг юм. Байгууллагын үнэт зүйлсийг бүрэн дүүрэн визуал систем болгон хөгжүүлэх практик гарын авлага.',
    coverImage: '/work/tsuiwan-package/01.jpg',
    category: 'guides',
    tags: ['Branding', 'Strategy', 'Identity', 'Visual System'],
    content: `
## Лого бол хаалганы бариул, Харин брэндинг бол бүхэл бүтэн байшин

Олон хүмүүс "Манай компанид шинэ брэндинг хэрэгтэй байна, бидэнд гоё лого зохиогоод өгөөч" гэж ханддаг. Гэвч лого болон брэндийн таних тэмдэг (Brand Identity) нь зарчмын хувьд тэс өөр цар хүрээтэй ойлголтууд юм.

### 1. Лого гэж юу вэ?
Лого бол тухайн брэндийг зах зээл дээрх бусад өрсөлдөгчдөөс ялгаж харуулах **"тэмдэглэгээ" (Identifier)** юм. Лого нь бүх зүйлийг тайлбарлах албагүй. 

> *Nike-ийн "Swoosh" нь гутал үйлдвэрлэдэг тухай огт өгүүлдэггүй, харин хөдөлгөөн, эрч хүчийг илэрхийлдэг шиг логоны гол үүрэг бол танигдах чадвар юм.*

### 2. Брэндийн таних тэмдэг (Visual Identity) гэж юу вэ?
Брэндийн төрх гэдэг нь хэрэглэгчийн нүдэнд өртөх бүх визуал хүрэлцэх цэгүүдийн нэгдсэн систем:
- **Өнгөний орон зай (Palette):** Тухайн брэндийг илтгэх үндсэн, туслах ба завсрын өнгөнүүдийн харьцаа.
- **Үсгийн соёл (Typography):** Гарчиг, үндсэн текстийн уншигдах хэмнэл, өнгө аяс.
- **Зохиомжийн дүрэм (Grid & Layout):** Постер, сошиал медиа, веб сайт дээр мэдээллийг хэрхэн цэгцтэй байрлуулах дүрэм.
- **Гэрэл зургийн хэв маяг:** Ямар өнгө аястай бодит зураг ашиглах тухай удирдамж.

### 3. Дүгнэлт
Хэрэв та зөвхөн лого хийлгэвэл танд ганцхан файл ирнэ. Харин системтэй брэндийн төрх боловсруулбал таны баг, маркетингийн менежерүүд, гадны хэвлэлийн газрууд олон жилийн турш нэгэн жигд өндөр чанартай визуал харилцааг бүтээх чадвартай болно.
    `,
    downloadFiles: [],
    destinationUrl: undefined,
    ctaLabel: 'Нийтлэл унших',
    featured: true,
    sortOrder: 3,
    readTimeMinutes: 6,
    author: {
      name: 'Т. Өсөхбаяр (baysaass)',
      role: 'Brand Designer',
    },
    seo: {
      title: 'Лого ба Брэндийн төрх (Brand Identity)-ийн ялгаа | Baysaass Articles',
      description: 'Лого болон брэндийн таних тэмдгийн ялгаа, визуал систем хэрхэн бүрддэг тухай практик гарын авлага.',
      keywords: ['logo vs branding', 'brand identity', 'mongolia design', 'baysaass'],
    },
    status: 'published',
    viewsCount: 412,
    downloadsCount: 0,
    createdAt: '2026-10-25T14:00:00.000Z',
    updatedAt: '2026-10-25T14:00:00.000Z',
    publishedAt: '2026-10-25T14:00:00.000Z',
  },
]
