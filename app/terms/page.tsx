import type { Metadata } from 'next'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import {
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  FileText,
  Lock,
  Sparkles,
  HelpCircle,
  Mail,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Үйлчилгээний нөхцөл & Буцаалт, Хүргэлтийн журам | baysaass',
  description:
    'baysaass студийн үйлчилгээний нөхцөл, дизайны үнэ тариф, дижитал хүргэлт болон төлбөр, буцаалтын албан ёсны журам.',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10">
          {/* Header */}
          <div className="max-w-[840px] mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] text-[11px] font-bold uppercase tracking-wider text-[#666666] mb-4">
              <FileText className="size-3.5 text-black" />
              <span>Албан ёсны журам & Нөхцөл</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-[1.15] mb-5">
              Үйлчилгээний нөхцөл, Хүргэлт & Буцаалтын журам
            </h1>
            <p className="text-base sm:text-lg text-[#666666] leading-relaxed">
              Энэхүү баримт бичиг нь <strong>baysaass</strong> (Брэнд дизайнер Т. Өсөхбаяр) цахим талбараар үйлчлүүлэх, бүтээлч дизайны үйлчилгээ захиалах, төлбөр төлөх, дижитал бүтээгдэхүүн хүлээн авах болон буцаалт хийхтэй холбоотой харилцааг бүрэн зохицуулна.
            </p>
            <p className="text-xs text-[#888888] mt-3">
              Сүүлд шинэчилсэн: 2026 оны 10-р сар · Хүчинтэй хувилбар v1.4
            </p>
          </div>

          {/* Quick Summary Highlights for Compliance Audits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600">
                  <CreditCard className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-black mb-1.5">Төлбөрийн нөхцөл</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  QPay, дансны шилжүүлэг, карт болон албан нэхэмжлэхээр урьдчилгаа 50%, хүлээлгэн өгөхөд 50% төлнө.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                  <Truck className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-black mb-1.5">Дижитал хүргэлт</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Биет бус бүтээгдэхүүн тул эх файлууд нь Client Portal болон имэйлээр цахим хэлбэрээр хүрнэ.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 text-amber-600">
                  <RotateCcw className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-black mb-1.5">Буцаалтын нөхцөл</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Ажил эхлэхээс өмнө 100% буцаалттай. Концепц эхэлснээс хойш бодит зардлыг хасаж үлдэгдлийг буцаана.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-6 flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4 text-purple-600">
                  <Lock className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-black mb-1.5">SSL & Нууцлал</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  256-bit SSL шифрлэлтээр хамгаалагдсан, харилцагчийн мэдээллийг гуравдагч этгээдэд задруулахгүй.
                </p>
              </div>
            </div>
          </div>

          {/* Full Detailed Articles */}
          <div className="max-w-[960px] space-y-12 text-[#222222]">
            {/* Article 1 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  01
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Нийтлэг үндэслэл & Үйлчилгээ үзүүлэгч
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-3 leading-relaxed">
                <p>
                  <strong>1.1.</strong> Энэхүү цахим хуудас (<a href="https://baysaass.space" className="text-blue-600 underline underline-offset-4">https://baysaass.space</a>) нь Брэнд дизайнер Т. Өсөхбаяр (цаашид &quot;Дизайнер&quot; эсвэл &quot;Үйлчилгээ үзүүлэгч&quot; гэх)-ийн албан ёсны портфолио, бүтээлч үйлчилгээний талбар юм.
                </p>
                <p>
                  <strong>1.2.</strong> Хэрэглэгч, захиалагч тал тус цахим хуудсаар дамжуулан үйлчилгээний хүсэлт илгээх, төслийн талбарт нэвтрэх, цахим гэрээ байгуулах, нэхэмжлэхээр төлбөр тооцоо гүйцэтгэхэд энэхүү нөхцөлийг бүрэн хүлээн зөвшөөрсөнд тооцно.
                </p>
                <p>
                  <strong>1.3.</strong> Тус цахим хуудас нь Монгол Улсын Иргэний хууль, Цахим гарын үсгийн тухай хууль, Хэрэглэгчийн эрхийг хамгаалах тухай хууль болон бусад холбогдох хууль тогтоомжийн хүрээнд үйл ажиллагаа явуулна.
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  02
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Борлуулж буй үйлчилгээний мэдээлэл & Үнэ тариф
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-4 leading-relaxed">
                <p>
                  <strong>2.1. Дизайн & Брэндинг үйлчилгээ (Үнэ тогтох зарчим):</strong>
                </p>
                <div className="pl-4 border-l-2 border-[#e0e0e0] space-y-2">
                  <p>
                    • Брэндийн айдентити (Brand Identity), Лого систем, Сав баглаа боодол (Packaging), Бичвэрийн соёл (Lettering), Сошиал медиа дизайн, Хэвлэлийн эх бэлтгэл зэрэг бүтээлч ажлуудын <strong>үнэ нь хэрэглэгчийн тавьсан ажлын шаардлага (Brief & Scope), төслийн цар хүрээ болон хугацааны хүлээлт дээр үндэслэн харилцан тохиролцож бодитоор тогтоно.</strong>
                  </p>
                  <p>
                    • Захиалагч AI бриф эсвэл шууд маягтаар төслийн дэлгэрэнгүй мэдээллээ илгээсний дараа дизайнер Т. Өсөхбаяр тухайн төсөлд зориулсан <strong>албан ёсны Үнийн санал (Proposal) болон ажлын хуваарийг</strong> харилцагчийн хувийн ажлын талбар (Client Portal)-аар илгээдэг. Харилцагч уг үнийн саналыг хянаж баталгаажуулснаар гэрээ хүчин төгөлдөр болно.
                  </p>
                  <p>
                    • Жишиг төсвийн ангилал: Төслийн хэмжээнээс хамааран $30 – $3,000+ (эсвэл түүнтэй тэнцэх төгрөг) байх бөгөөд нарийвчилсан төсвийг ажлын даалгаварт тусгана.
                  </p>
                </div>

                <p>
                  <strong>2.2. Брэндбүүк чанарын аудит (Brandbook Quality Auditor):</strong>
                </p>
                <div className="pl-4 border-l-2 border-[#e0e0e0] space-y-2">
                  <p>
                    • <strong>Туршилтын хугацаа (Beta):</strong> Одоогоор брэндүүдийн гарын авлагын 30 шалгуурт чанарын аудитыг зах зээлд <strong>үнэ төлбөргүйгээр туршилтын журмаар</strong> нэвтрүүлж байна.
                  </p>
                  <p>
                    • <strong>Цаашдын үнэ тариф:</strong> Цаашид гүнзгийрүүлсэн шинжилгээ, зөвлөх үйлчилгээ, хэвлэлийн өмнөх preflight болон албан ёсны баталгаажуулалтын тайлан гаргах үйлчилгээ нь багцаас хамаарсан үнэтэй тарифын горимд шилжинэ. Төлбөрт үйлчилгээ нэвтрэх үед тарифыг нийтэд нээлттэй урьдчилан зарлана.
                  </p>
                </div>

                <p>
                  <strong>2.3. Дизайны сан (Resources):</strong>
                </p>
                <div className="pl-4 border-l-2 border-[#e0e0e0] space-y-2">
                  <p>
                    • Дизайны санд нийтлэгдсэн нээлттэй файлууд, чек лист, удирдамжууд нь нийтэд үнэ төлбөргүй болон дээд зэрэглэлийн (premium) татах эрхтэй байна.
                  </p>
                </div>
              </div>
            </section>

            {/* Article 3 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  03
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Бүтээгдэхүүн, үйлчилгээний хүргэлтийн нөхцөл (Дижитал хүргэлт)
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-3 leading-relaxed">
                <p>
                  <strong>3.1. Биет бус дижитал бүтээгдэхүүн:</strong> Бид график дизайн, брэндбүүк боловсруулалт, бүтээлч зөвлөх үйлчилгээ үзүүлдэг тул <strong>бодит биет хүргэлт (уналга, шуудан) хийгдэхгүй.</strong>
                </p>
                <p>
                  <strong>3.2. Хүргэх суваг:</strong> Захиалсан дизайны бүх эх файлууд (Vector форматын .ai, .eps, .svg болон растер форматын .png, .jpg, дижитал ном .pdf, хэвлэлийн бэлэн эх) нь дараах хоёр сувгаар 100% цахим хэлбэрээр хүрнэ:
                </p>
                <ul className="list-disc pl-6 space-y-1.5">
                  <li>Харилцагчийн аюулгүй онлайн ажлын талбар (Client Portal: <code>/client/[token]</code>)</li>
                  <li>Харилцагчийн баталгаажуулсан албан ёсны цахим шуудан (Email)</li>
                </ul>
                <p>
                  <strong>3.3. Хүргэлтийн хугацаа:</strong> Хүлээлгэн өгөх товлосон хугацаа нь төслийн хэмжээнээс хамааран талуудын байгуулсан гэрээнд тохиролцсоноор (ихэвчлэн ажлын 5-аас 20 хоногт) байна. Төслийн явцын завсрын тайлан, эскизүүдийг тогтоосон хуваарийн дагуу үе шаттайгаар танилцуулна.
                </p>
                <p>
                  <strong>3.4. Хүлээн авсанд тооцох:</strong> Эцсийн эх файлуудыг татаж авах холбоосыг илгээж, захиалагч тал шалгаж хүлээн авснаар үйлчилгээг хүргэгдсэнд тооцно.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  04
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Төлбөр тооцооны нөхцөл
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-3 leading-relaxed">
                <p>
                  <strong>4.1. Зөвшөөрөгдсөн төлбөрийн хэрэгслүүд:</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                  <div className="p-3.5 rounded-xl border border-[#e0e0e0] bg-[#fafafa]">
                    <p className="font-bold text-black text-xs">QPay & Банк хоорондын шилжүүлэг</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">Хаан, Голомт, ТДБ, Хас банк зэрэг дотоодын бүх банкны апп-аар</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#e0e0e0] bg-[#fafafa]">
                    <p className="font-bold text-black text-xs">Онлайн карт & Нэхэмжлэх (Invoice)</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">Байгууллагын албан ёсны нэхэмжлэх, гэрээ, И-Баримт олголттой</p>
                  </div>
                </div>
                <p>
                  <strong>4.2. Төлбөрийн үе шат:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1.5">
                  <li><strong>Урьдчилгаа төлбөр (50%):</strong> Захиалагч ажлын даалгавар, үнийн саналыг баталгаажуулж, гэрээнд гарын үсэг зурсны дараа төслийг албан ёсоор эхлүүлэх баталгаа болгон төлнө.</li>
                  <li><strong>Эцсийн төлбөр (50%):</strong> Захиалагч эцсийн дизайны шийдлийг баталж, хэвлэлийн болон дижитал эх файлуудыг (Source files) татаж авахаас өмнө гүйцэтгэнэ.</li>
                </ul>
                <p>
                  <strong>4.3. Баримтжуулалт:</strong> Төлбөр бүрт хууль тогтоомжийн дагуу цахим төлбөрийн баримт (И-Баримт) эсвэл байгууллагын НӨАТ-ын баримтыг харилцагчийн хүсэлтээр үүсгэнэ.
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  05
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Захиалга цуцлах ба Төлбөр буцаах журам
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-3 leading-relaxed">
                <p>
                  <strong>5.1. Ажил эхлэхээс өмнө цуцлах:</strong> Захиалагч урьдчилгаа төлбөр төлсөн боловч дизайны судалгаа, эскиз эхлэхээс өмнө цуцлах хүсэлтээ албан ёсоор гаргасан бол банк хоорондын гүйлгээний шимтгэлийг хасаж, <strong>урьдчилгааг 100% буцаан олгоно.</strong>
                </p>
                <p>
                  <strong>5.2. Ажлын явцад цуцлах:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1.5">
                  <li>Хэрэв брэндийн чиглэл, эхний концепцууд гарч танилцуулагдсаны дараа захиалагч төслөөс татгалзвал тухайн үе шатанд зарцуулагдсан бодит хөдөлмөрийн зардал, цаг хугацааны нөхөн төлбөрийг тооцож, урьдчилгаа төлбөрийн тодорхой хувийг суутган үлдэгдлийг ажлын 3-5 хоногт буцаана.</li>
                  <li>Хоёр тал гэрээний үүргээ биелүүлээгүй, форс-мажор нөхцөл үүссэн тохиолдолд талууд харилцан тохиролцож шийдвэрлэнэ.</li>
                </ul>
                <p>
                  <strong>5.3. Буцаалт хийх боломжгүй нөхцөл:</strong> Төслийн бүх шатны эх файлууд (Vector, AI, PDF) харилцагчид бүрэн шилжиж, оюуны өмчийн ашиглах эрх шилжсэн тохиолдолд дижитал бүтээгдэхүүний өвөрмөц шинж чанараас шалтгаалан <strong>төлбөрийг буцаан олгох боломжгүй.</strong>
                </p>
                <p>
                  <strong>5.4. Буцаалт олгох хугацаа:</strong> Баталгаажсан буцаалтыг захиалагчийн анх төлбөр шилжүүлсэн банкны данс руу ажлын 3-5 хоногийн дотор шилжүүлнэ.
                </p>
              </div>
            </section>

            {/* Article 6 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  06
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Оюуны өмч, Зохиогчийн эрх & Нууцлал
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-3 leading-relaxed">
                <p>
                  <strong>6.1. Эрх шилжих:</strong> Төслийн төлбөр бүрэн төлөгдөж дууссанаар сонгогдон батлагдсан эцсийн лого болон визуал дүр төрхийг бизнес, арилжааны зориулалтаар ашиглах <strong>онцгой эрх захиалагч талд бүрэн шилжинэ.</strong>
                </p>
                <p>
                  <strong>6.2. Портфолио эрх:</strong> Үйлчилгээ үзүүлэгч нь гүйцэтгэсэн ажлаа өөрийн бүтээлч чадвар, туршлагыг илэрхийлэх зорилгоор вебсайт, портфолиод танилцуулга байдлаар нийтлэх эрхтэй (Захиалагч нууцлалын тусгай гэрээ (NDA) байгуулаагүй бол).
                </p>
                <p>
                  <strong>6.3. Мэдээллийн нууцлал:</strong> Харилцагчийн бизнесийн нууц, стратеги, бүтээгдэхүүний төлөвлөгөө болон хувийн мэдээллийг гуравдагч этгээдэд задруулахгүй байх үүргийг хугацаагүйгээр хүлээнэ.
                </p>
              </div>
            </section>

            {/* Article 7 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  07
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Аюулгүй байдал, SSL & Хориотой үйл ажиллагааны хориг
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-3 leading-relaxed">
                <p>
                  <strong>7.1. SSL Хамгаалалт:</strong> baysaass.space цахим хуудас нь салбарын стандарт бүхий 256-bit SSL (TLS 1.3 / HTTPS) шифрлэлтээр 100% хамгаалагдсан бөгөөд хэрэглэгчийн дамжуулж буй бүх өгөгдөл нууцлалтай, шифрлэгдэн дамжина.
                </p>
                <p>
                  <strong>7.2. Хориотой үйл ажиллагааны хориг:</strong> Тус цахим хуудас болон бүтээлч студи нь дараах төрлийн үйл ажиллагаанд эрс хатуу хориг тавьж, үйлчилгээ үзүүлэхээс эрс татгалзана:
                </p>
                <ul className="list-disc pl-6 space-y-1.5">
                  <li>Хууль бус, мөрийтэй тоглоом, залилан мэхлэх шинжтэй үйл ажиллагаа</li>
                  <li>Насанд хүрэгчдэд зориулсан садар самуун, ёс бус агуулга</li>
                  <li>Бусдын зохиогчийн эрх, барааны тэмдгийг хуулбарласан, хуурамчаар үйлдэх оролдлого</li>
                  <li>Нийгмийн аюулгүй байдал, хүний эрхэд харшилсан аливаа үйлдэл</li>
                </ul>
              </div>
            </section>

            {/* Article 8 */}
            <section className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black text-white">
                  08
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Үйлчилгээ үзүүлэгчийн албан ёсны холбоо барих мэдээлэл
                </h2>
              </div>
              <div className="text-sm text-[#444444] space-y-2 leading-relaxed">
                <p>Үйлчилгээний нөхцөл, захиалга, хүргэлт болон төлбөр тооцоотой холбоотой аливаа асуулт, санал хүсэлтийг дараах албан ёсны сувгаар хүлээн авна:</p>
                <div className="mt-4 pt-4 border-t border-[#e0e0e0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[#888888] block">Үйлчилгээ үзүүлэгч:</span>
                    <strong className="text-black text-sm">Т. Өсөхбаяр (Brand Designer · baysaass)</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#888888] block">Цахим шуудан (Имэйл):</span>
                    <a href="mailto:sanaaagency01@gmail.com" className="text-blue-600 font-semibold text-sm hover:underline">
                      sanaaagency01@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-[#888888] block">Байршил:</span>
                    <span className="text-black text-sm font-medium">Улаанбаатар хот, Монгол Улс</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#888888] block">Албан ёсны цахим хуудас:</span>
                    <a href="https://baysaass.space" className="text-black text-sm font-medium hover:underline">
                      https://baysaass.space
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
