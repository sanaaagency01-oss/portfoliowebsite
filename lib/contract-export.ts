/**
 * Official Contract Export & Print Utilities
 * Generates printable A4 HTML, Plain Text, and Markdown documents
 * based on the official 10-article standard contract template.
 */

import { Project } from './types/studio'
import { formatCurrency } from './studio-utils'
import {
  CONTRACT_PROCESS_STAGES,
  CONTRACT_OFFICIAL_DELIVERABLES,
  getOfficialContractArticles,
} from './contract-template'

/**
 * Builds clean plain text/markdown contract document for download or copy
 */
export function buildContractDocumentText(project: Project): string {
  const c = project.contract
  const sep = '='.repeat(70)
  const line = '-'.repeat(70)

  const upfront50 = Math.round(c.total * 0.5)
  const milestone30 = Math.round(c.total * 0.3)
  const final20 = c.total - upfront50 - milestone30

  let txt = `${sep}\n`
  txt += `                 АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ\n`
  txt += `       Огноо: ${c.date || new Date().toISOString().split('T')[0]}       №: ${c.number}       Байршил: Улаанбаатар хот\n`
  txt += `${sep}\n\n`

  txt += `Энэхүү АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ (цаашид “Гэрээ” гэх)-г нэг талаас ${project.company || 'Захиалагч байгууллага'} (төлөөлөгч: ${project.contactName}, цаашид “Захиалагч” гэх), нөгөө талаас иргэн Т. Өсөхбаяр (РД: КЮ03252818, цаашид “Ажил гүйцэтгэгч” гэх) (хамтад нь “Талууд” гэх) нар Монгол Улсын хууль тогтоомж, холбогдох дүрэм журмыг удирдлага болгон дараах нөхцлийг харилцан тохиролцон байгуулав.\n\n`

  txt += `${line}\n`
  txt += `[ҮЙЛЧИЛГЭЭНИЙ ТӨСӨВ БА ХУГАЦААНЫ ХУВААРЬ]\n`
  txt += `${line}\n`
  txt += `Нийт төсөв: ${formatCurrency(c.total)} (НӨАТ орсон)\n`
  txt += `1. Урьдчилгаа (50%): ${formatCurrency(upfront50)} — Гэрээ хүчин төгөлдөр болсноор\n`
  txt += `2. Завсрын төлбөр (30%): ${formatCurrency(milestone30)} — Дизайн боловсруулалт үе шат батлагдсаны дараа\n`
  txt += `3. Үлдэгдэл төлбөр (20%): ${formatCurrency(final20)} — Нийт ажил үйлчилгээг бүрэн хүлээлгэн өгснөөр\n`
  txt += `Хугацаа: ${c.start} — ${c.end}\n`
  txt += `Засварын үе шат: ${c.revisions} удаагийн албан ёсны итераци багтсан\n\n`

  txt += `${line}\n`
  txt += `[ДИЗАЙНЫ ПРОЦЕСС — 5 ҮЕ ШАТ]\n`
  txt += `${line}\n`
  CONTRACT_PROCESS_STAGES.forEach((s) => {
    txt += `${s.no}. ${s.name}\n`
    txt += `   Агуулга: ${s.content}\n`
    txt += `   Хүлээгдэх үр дүн: ${s.expectedResult}\n\n`
  })

  if (c.deliverables && c.deliverables.length > 0) {
    txt += `${line}\n`
    txt += `[ХҮЛЭЭЛГЭН ӨГӨХ МАТЕРИАЛУУДЫН ЖАГСААЛТ (DELIVERABLES)]\n`
    txt += `${line}\n`
    c.deliverables.forEach((d, i) => {
      txt += `${i + 1}. ${d.name} (${d.quantity})\n`
      if (d.description) txt += `   Тайлбар: ${d.description}\n`
      if (d.due) txt += `   Хугацаа: ${d.due}\n`
    })
    txt += `\n`
  }

  txt += `${line}\n`
  txt += `[ГЭРЭЭНИЙ АЛБАН ЁСНЫ 10 ЗААЛТ]\n`
  txt += `${line}\n`
  const articles = getOfficialContractArticles({
    projectName: project.name,
    company: project.company,
    contactName: project.contactName,
    totalAmount: c.total,
    startDate: c.start,
    endDate: c.end,
  })

  articles.forEach((art) => {
    txt += `${art.title}\n`
    art.paragraphs.forEach((p) => {
      txt += `${p}\n`
    })
    txt += `\n`
  })

  if (c.customSections && c.customSections.length > 0) {
    txt += `${line}\n`
    txt += `[ТУСГАЙ ЗОХИЦУУЛАЛТ & НЭМЭЛТ ЗААЛТ]\n`
    txt += `${line}\n`
    c.customSections.forEach((cs) => {
      txt += `${cs.title}\n${cs.content}\n\n`
    })
  }

  txt += `${sep}\n`
  txt += `[ГЭРЭЭ БАЙГУУЛСАН ТАЛУУД]\n`
  txt += `${sep}\n`
  txt += `ЗАХИАЛАГЧ:\n`
  txt += `Байгууллага: ${project.company}\n`
  txt += `Төлөөлөгч: ${c.clientName || project.contactName}\n`
  txt += `Утас: ${project.phone || '—'}  Имэйл: ${c.clientEmail || project.email || '—'}\n`
  txt += `Гарын үсэг: ${c.status === 'signed' ? `[ЦАХИМААР БАТАЛГААЖСАН - ${c.signedAt || c.date}]` : '[ХҮЛЭЭГДЭЖ БУЙ]'}\n\n`

  txt += `АЖИЛ ГҮЙЦЭТГЭГЧ:\n`
  txt += `Нэр: Т. Өсөхбаяр (baysaass студи)\n`
  txt += `Регистрийн дугаар: КЮ03252818\n`
  txt += `Банк: Хаан банк · Данс: 5608120471 (Хүлээн авагч: Т. Өсөхбаяр)\n`
  txt += `Вэбсайт: https://baysaass.space\n`
  txt += `Гарын үсэг: [ЦАХИМ ГАРЫН ҮСГЭЭР БАТАЛГААЖСАН]\n`

  return txt
}

/**
 * Triggers clean browser file download (.txt or .md)
 */
export function downloadContractDocument(
  project: Project,
  format: 'txt' | 'md' = 'txt'
): void {
  const content = buildContractDocumentText(project)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const cleanNumber = (project.contract.number || 'BT-2026').replace(/[^\w-]/g, '_')
  const cleanCompany = (project.company || 'Client').replace(/[^\w-]/g, '_')
  a.href = url
  a.download = `Гэрээ_${cleanNumber}_${cleanCompany}.${format}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Generates an isolated, print-ready HTML page and triggers browser print-to-PDF
 */
export function openContractPrintWindow(project: Project): void {
  const c = project.contract
  const printWindow = window.open('', '_blank', 'width=900,height=1000')
  if (!printWindow) {
    window.print()
    return
  }

  const upfront50 = Math.round(c.total * 0.5)
  const milestone30 = Math.round(c.total * 0.3)
  const final20 = c.total - upfront50 - milestone30

  const processStagesHtml = CONTRACT_PROCESS_STAGES.map(
    (s) => `
    <tr>
      <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; width: 30px;">${s.no}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">${s.name}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #eee; color: #444; font-size: 10.5px;">${s.content}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #eee; font-weight: 500; font-size: 10.5px; width: 190px;">${s.expectedResult}</td>
    </tr>`
  ).join('')

  const deliverablesHtml = (c.deliverables || [])
    .map(
      (d, i) => `
      <tr>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; width: 30px; text-align: center;">${i + 1}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee;">
          <strong>${d.name}</strong>
          ${d.description ? `<div style="font-size: 10px; color: #666;">${d.description}</div>` : ''}
        </td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; text-align: center; width: 100px;">${d.quantity}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; text-align: right; width: 100px;">${d.due || '—'}</td>
      </tr>`
    )
    .join('')

  const articles = getOfficialContractArticles({
    projectName: project.name,
    company: project.company,
    contactName: project.contactName,
    totalAmount: c.total,
    startDate: c.start,
    endDate: c.end,
  })

  const articlesHtml = articles
    .map(
      (art) => `
      <div style="margin-bottom: 14px; page-break-inside: avoid;">
        <h4 style="font-size: 11px; font-weight: bold; margin: 0 0 4px 0; color: #000; text-transform: uppercase;">${art.title}</h4>
        ${art.paragraphs.map((p) => `<p style="font-size: 10.5px; line-height: 1.6; margin: 0 0 3px 0; color: #333;">${p}</p>`).join('')}
        ${
          art.hasTable
            ? `
            <table class="data-table" style="margin-top: 8px;">
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center;">№</th>
                  <th style="width: 140px;">Үе шат</th>
                  <th>Агуулга</th>
                  <th style="width: 190px;">Хүлээгдэх үр дүн</th>
                </tr>
              </thead>
              <tbody>${processStagesHtml}</tbody>
            </table>`
            : ''
        }
      </div>`
    )
    .join('')

  const customSectionsHtml = (c.customSections || [])
    .map(
      (cs) => `
      <div style="margin-bottom: 12px; page-break-inside: avoid;">
        <h4 style="font-size: 11px; font-weight: bold; margin: 0 0 4px 0; color: #000;">${cs.title}</h4>
        <p style="font-size: 10.5px; line-height: 1.6; margin: 0; color: #333;">${cs.content}</p>
      </div>`
    )
    .join('')

  const signatureImgHtml = c.signatureDataUrl
    ? `<img src="${c.signatureDataUrl}" alt="Захиалагчийн гарын үсэг" style="max-height: 55px; max-width: 180px; display: block; margin-top: 6px;" />`
    : `<div style="font-size: 11px; color: #999; font-style: italic; margin-top: 20px;">[Цахимаар гарын үсэг зурагдаагүй байна]</div>`

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <title>Гэрээ_${c.number}_${project.company}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #000;
      background: #fff;
      font-size: 10.5px;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 10.5px;
    }
    table.data-table th {
      background: #f5f5f5;
      padding: 6px 10px;
      border-bottom: 1px solid #ccc;
      text-align: left;
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    .signatures-box {
      margin-top: 24px;
      border-top: 2px solid #000;
      padding-top: 14px;
      page-break-inside: avoid;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #000; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center;">
    <div><strong>Албан ёсны Ажил гүйцэтгэх гэрээ</strong> · ${c.number}</div>
    <div>
      <button onclick="window.print()" style="background: #fff; color: #000; border: none; padding: 6px 16px; border-radius: 20px; font-weight: bold; cursor: pointer;">Хэвлэх / Save as PDF</button>
      <button onclick="window.close()" style="background: transparent; color: #ccc; border: 1px solid #666; padding: 6px 12px; border-radius: 20px; margin-left: 8px; cursor: pointer;">Хаах</button>
    </div>
  </div>

  <table class="header-table">
    <tr>
      <td style="vertical-align: top;">
        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #666;">АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ</div>
        <h1 style="font-size: 18px; font-weight: 900; margin: 3px 0; letter-spacing: -0.5px;">${project.name}</h1>
        <div style="font-size: 10px; color: #555;">Гэрээний №: <strong>${c.number}</strong> · Огноо: ${c.date} · Улаанбаатар хот</div>
      </td>
      <td style="vertical-align: top; text-align: right; width: 220px;">
        <div style="font-size: 16px; font-weight: 900;">baysaass<span style="color: #999;">.</span></div>
        <div style="font-size: 9.5px; color: #555; margin-top: 2px;">Brand Designer Studio</div>
        <div style="display: inline-block; margin-top: 5px; padding: 3px 8px; font-size: 9px; font-weight: bold; border-radius: 4px; ${
          c.status === 'signed' ? 'background: #e6f4ea; color: #137333;' : 'background: #fef7e0; color: #b06000;'
        }">
          ${c.status === 'signed' ? '✅ ГЭРЭЭ БАТАЛГААЖСАН' : '⏳ ГАРЫН ҮСЭГ ХҮЛЭЭГДЭЖ БУЙ'}
        </div>
      </td>
    </tr>
  </table>

  <!-- Preamble -->
  <p style="font-size: 10px; line-height: 1.55; color: #444; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
    Энэхүү АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ (цаашид “Гэрээ” гэх)-г нэг талаас <strong>${project.company}</strong> (төлөөлөгч: <strong>${project.contactName}</strong>, цаашид “Захиалагч” гэх), нөгөө талаас иргэн <strong>Т. Өсөхбаяр</strong> (РД: <strong>КЮ03252818</strong>, цаашид “Ажил гүйцэтгэгч” гэх) (хамтад нь “Талууд” гэх) нар Монгол Улсын хууль тогтоомж, холбогдох дүрэм журмыг удирдлага болгон дараах нөхцлийг харилцан тохиролцон байгуулав.
  </p>

  <!-- 3-Tier Payment & Schedule Bar -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; background: #fafafa; border: 1px solid #e0e0e0; font-size: 10.5px;">
    <tr>
      <td style="padding: 8px 12px; width: 25%; border-right: 1px solid #e0e0e0;">
        <div style="font-size: 8.5px; color: #777; text-transform: uppercase; font-weight: bold;">1. Урьдчилгаа (50%)</div>
        <strong style="font-size: 13px; display: block; margin-top: 2px;">${formatCurrency(upfront50)}</strong>
        <div style="color: #666; font-size: 9px;">Гэрээ байгуулснаар</div>
      </td>
      <td style="padding: 8px 12px; width: 25%; border-right: 1px solid #e0e0e0;">
        <div style="font-size: 8.5px; color: #777; text-transform: uppercase; font-weight: bold;">2. Завсрын төлбөр (30%)</div>
        <strong style="font-size: 13px; display: block; margin-top: 2px;">${formatCurrency(milestone30)}</strong>
        <div style="color: #666; font-size: 9px;">Дизайн батлагдсаны дараа</div>
      </td>
      <td style="padding: 8px 12px; width: 25%; border-right: 1px solid #e0e0e0;">
        <div style="font-size: 8.5px; color: #777; text-transform: uppercase; font-weight: bold;">3. Үлдэгдэл төлбөр (20%)</div>
        <strong style="font-size: 13px; display: block; margin-top: 2px;">${formatCurrency(final20)}</strong>
        <div style="color: #666; font-size: 9px;">Бүрэн хүлээлгэн өгснөөр</div>
      </td>
      <td style="padding: 8px 12px; width: 25%;">
        <div style="font-size: 8.5px; color: #777; text-transform: uppercase; font-weight: bold;">Гүйцэтгэх хугацаа</div>
        <strong style="font-size: 11px; display: block; margin-top: 2px;">${c.start} — ${c.end}</strong>
        <div style="color: #666; font-size: 9px;">${c.revisions} удаагийн засвар багтсан</div>
      </td>
    </tr>
  </table>

  ${
    deliverablesHtml
      ? `
    <div class="section-title">Хүлээлгэн өгөх материалууд (Deliverables)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Материалын нэр & Тайлбар</th>
          <th style="text-align: center;">Тоо хэмжээ</th>
          <th style="text-align: right;">Эцсийн хугацаа</th>
        </tr>
      </thead>
      <tbody>${deliverablesHtml}</tbody>
    </table>`
      : ''
  }

  <div class="section-title">Гэрээний албан ёсны заалтууд</div>
  <div>${articlesHtml}</div>

  ${
    customSectionsHtml
      ? `
    <div class="section-title">Тусгай зохицуулалт & Нэмэлт заалтууд</div>
    <div>${customSectionsHtml}</div>`
      : ''
  }

  <!-- Signatures Block -->
  <div class="signatures-box">
    <table style="width: 100%;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding-right: 20px;">
          <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #666;">ЗАХИАЛАГЧ ТАЛ:</div>
          <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">${project.company}</div>
          <div style="font-size: 10.5px; color: #444;">Төлөөлөгч: ${c.clientName || project.contactName}</div>
          <div style="font-size: 10px; color: #777;">Утас: ${project.phone || '—'} · Имэйл: ${c.clientEmail || project.email || '—'}</div>
          ${signatureImgHtml}
          ${
            c.signedAt
              ? `<div style="font-size: 9px; color: #137333; font-weight: bold; margin-top: 4px;">Цахимаар баталгаажсан: ${new Date(
                  c.signedAt
                ).toLocaleString('mn-MN')}</div>`
              : ''
          }
        </td>

        <td style="width: 50%; vertical-align: top; padding-left: 20px; border-left: 1px solid #e0e0e0;">
          <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #666;">АЖИЛ ГҮЙЦЭТГЭГЧ ТАЛ:</div>
          <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">Т. Өсөхбаяр (baysaass)</div>
          <div style="font-size: 10.5px; color: #444;">Мэргэжил: Brand Designer</div>
          <div style="font-size: 10px; color: #777;">Регистрийн дугаар: КЮ03252818</div>
          <div style="font-size: 10px; color: #777;">Банк: Хаан банк · Данс: 5608120471</div>
          <div style="font-size: 10px; color: #777;">Вэб: https://baysaass.space</div>
          <div style="margin-top: 10px; font-size: 11px; font-family: cursive; font-weight: bold; letter-spacing: 1px;">
            T. Usukhbayar
          </div>
          <div style="font-size: 9px; color: #137333; font-weight: bold; margin-top: 4px;">Дижитал баталгаажуулалт хүчинтэй</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; font-size: 8.5px; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 8px;">
    Энэхүү гэрээ нь Монгол Улсын Иргэний хууль болон Цахим гарын үсгийн тухай хуулийн дагуу цахим хэлбэрээр байгуулагдсан хүчин төгөлдөр баримт бичиг болно.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
