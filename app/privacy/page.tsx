import type { Metadata } from 'next'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { ShieldCheck, Lock, Eye, Database, Mail, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Нууцлалын бодлого | baysaass',
  description:
    'baysaass цахим талбарын хэрэглэгчийн мэдээллийн нууцлал, хамгаалалт, аюулгүй байдлын бодлого.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-white text-black pt-[110px] md:pt-[130px] pb-24 md:pb-32">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10">
          {/* Header */}
          <div className="max-w-[840px] mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] text-[11px] font-bold uppercase tracking-wider text-[#666666] mb-4">
              <ShieldCheck className="size-3.5 text-black" />
              <span>Хувийн мэдээллийн хамгаалалт</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-[1.15] mb-5">
              Нууцлалын бодлого (Privacy Policy)
            </h1>
            <p className="text-base sm:text-lg text-[#666666] leading-relaxed">
              <strong>baysaass</strong> нь харилцагч, хэрэглэгчдийн хувийн болон бизнесийн мэдээллийн аюулгүй байдал, нууцлалыг чандлан хамгаалах үүрэг хүлээдэг.
            </p>
            <p className="text-xs text-[#888888] mt-3">
              Сүүлд шинэчилсэн: 2026 оны 10-р сар · Хүчинтэй хувилбар v1.2
            </p>
          </div>

          <div className="max-w-[960px] space-y-10 text-[#222222]">
            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm space-y-3 leading-relaxed text-sm text-[#444444]">
              <h2 className="text-xl font-bold text-black mb-3">1. Цуглуулах мэдээллийн төрөл</h2>
              <p>
                Бид дараах тохиолдолд таны өөрийн зөвшөөрлөөр өгсөн мэдээллийг цуглуулдаг:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Холбоо барих мэдээлэл:</strong> Нэр, цахим шуудан (имэйл), байгууллагын нэр, төслийн тайлбар.</li>
                <li><strong>Дизайн брифийн өгөгдөл:</strong> Брэндийн зорилго, зорилтот хэрэглэгч, дизайны хэв маяг, өнгө аясын сонголт.</li>
                <li><strong>Брэнд аудитын файл:</strong> Таны илгээсэн брэндбүүк, гарын авлагын PDF файл (зөвхөн чанарын оноо бодож, дүгнэлт тайлан бэлтгэхэд түр ашиглагдана).</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm space-y-3 leading-relaxed text-sm text-[#444444]">
              <h2 className="text-xl font-bold text-black mb-3">2. Мэдээллийг ашиглах зорилго</h2>
              <p>Цуглуулсан мэдээллийг зөвхөн дараах зориулалтаар ашиглана:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Дизайны ажлын захиалгыг боловсруулах, үнийн санал болон албан ёсны гэрээ бэлтгэх</li>
                <li>Төслийн явц, завсрын эскиз болон эцсийн эх файлуудыг харилцагчид найдвартай хүргэх</li>
                <li>Брэнд аудитын автомат оноо, тайлан гаргаж харилцагчид танилцуулах</li>
                <li>Хууль ёсны төлбөрийн баримт (И-Баримт), нэхэмжлэх үүсгэх</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8 md:p-10 shadow-sm space-y-3 leading-relaxed text-sm text-[#444444]">
              <h2 className="text-xl font-bold text-black mb-3">3. Аюулгүй байдал & Гуравдагч этгээд</h2>
              <p>
                <strong>3.1. SSL 256-bit Хамгаалалт:</strong> baysaass.space сайт дээр хийгдэх бүх өгөгдөл дамжуулалт орчин үеийн TLS 1.3 / SSL аюулгүй шифрлэгдсэн сувгаар дамжина.
              </p>
              <p>
                <strong>3.2. Худалдахгүй, задруулахгүй байх баталгаа:</strong> Бид таны хувийн болон бизнесийн мэдээлэл, байгууллагын файлыг аливаа гуравдагч этгээд, зар сурталчилгааны байгууллагад худалдахгүй, дамжуулахгүй, нийтэд задруулахгүй.
              </p>
            </section>

            <section className="rounded-3xl border border-[#e0e0e0] bg-[#fafafa] p-8 md:p-10 space-y-3 leading-relaxed text-sm text-[#444444]">
              <h2 className="text-xl font-bold text-black mb-3">4. Холбоо барих</h2>
              <p>
                Хувийн мэдээлэл болон нууцлалтай холбоотой асуудлаар <a href="mailto:sanaaagency01@gmail.com" className="text-blue-600 font-semibold underline">sanaaagency01@gmail.com</a> хаягаар холбогдоно уу.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
