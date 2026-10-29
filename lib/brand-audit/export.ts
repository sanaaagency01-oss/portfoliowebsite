/**
 * Brand Audit Report Export Utilities
 * Provides print-ready A4 PDF generation, Markdown, Text, and JSON file downloads.
 */

import { BrandAuditRecord, ModuleId } from './types'
import { MODULE_DEFINITIONS } from './rubric'

/**
 * Builds clean plain text / markdown audit report for download or clipboard
 */
export function buildAuditMarkdownText(audit: BrandAuditRecord): string {
  const sep = '='.repeat(72)
  const line = '-'.repeat(72)

  let txt = `${sep}\n`
  txt += `        БРЭНДБҮҮК ЧАНАРЫН АУДИТЫН АЛБАН ЁСНЫ ТАЙЛАН\n`
  txt += `                 baysaass. Brand Identity Studio\n`
  txt += `${sep}\n\n`

  txt += `Байгууллага / Брэнд:  ${audit.company}\n`
  if (audit.email) txt += `Холбогдох имэйл:      ${audit.email}\n`
  txt += `Шалгасан хүрээ:       ${audit.scope === 'full_brandbook' ? 'Бүрэн брэндбүүк (Full Brand Guidelines)' : audit.scope === 'visual_identity' ? 'Visual Identity' : 'Лого гарын авлага'}\n`
  txt += `Хэрэгжих орчин:       ${audit.medium === 'both' ? 'Print & Digital' : audit.medium === 'digital' ? 'Digital' : 'Print'}\n`
  txt += `Баримт бичиг:         ${audit.documentInfo.fileName} (${audit.documentInfo.totalPages} хуудас)\n`
  txt += `Аудит хийсэн огноо:   ${new Date(audit.createdAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
  txt += `Аудитор:              Т. Өсөхбаяр (Brand Designer, baysaass студи)\n\n`

  txt += `${line}\n`
  txt += `1. ЧАНАРЫН НЭГДСЭН ОНОО & ҮЗҮҮЛЭЛТҮҮД\n`
  txt += `${line}\n`
  txt += `• Чанарын ерөнхий оноо:       ${audit.qualityScore}/100\n`
  txt += `• Стандартын хамралт:         ${audit.coveragePct}%\n`
  txt += `• Шуурхай засах чухал алдаа:  ${audit.criticalFindingsCount} шалгуур\n`
  txt += `• Сайжруулах зөвлөмж:         ${audit.improvementFindingsCount} шалгуур\n`
  txt += `• Сайн хэрэгжсэн стандартууд: ${audit.passFindingsCount} шалгуур\n\n`

  txt += `${line}\n`
  txt += `2. МЭРГЭЖЛИЙН ДҮГНЭЛТ (EXECUTIVE SUMMARY)\n`
  txt += `${line}\n`
  txt += `${audit.executiveSummaryMn}\n\n`

  txt += `${line}\n`
  txt += `3. ЧИГЛЭЛ БҮРИЙН ҮНЭЛГЭЭ (9 МОДУЛЬ)\n`
  txt += `${line}\n`
  const moduleKeys = Object.keys(audit.modules) as ModuleId[]
  moduleKeys.forEach((key, idx) => {
    const mod = audit.modules[key]
    const def = MODULE_DEFINITIONS[key]
    const statusText =
      mod.status === 'excellent'
        ? 'Маш сайн (80+)'
        : mod.status === 'good'
        ? 'Хангалттай сайн (60+)'
        : mod.status === 'needs_work'
        ? 'Сайжруулах шаардлагатай'
        : 'Шуурхай засах алдаатай'
    txt += `${idx + 1}. ${def?.nameMn || mod.moduleNameMn}: ${mod.qualityScore}/100 [${statusText}]\n`
    txt += `   Хамралт: ${mod.coveragePct}% | Чухал алдаа: ${mod.criticalCount} | Зөвлөмж: ${mod.improvementCount} | Хангасан: ${mod.passCount}\n\n`
  })

  txt += `${line}\n`
  txt += `4. БҮХ 30 ШАЛГУУРЫН НЭГ БҮРЧИЛСЭН ДҮГНЭЛТ & ЗӨВЛӨМЖ\n`
  txt += `${line}\n`
  audit.findings.forEach((f, i) => {
    const severityLabel =
      f.severity === 'critical'
        ? 'ШУУРХАЙ ЗАСАХ (Critical)'
        : f.severity === 'improvement'
        ? 'САЙЖРУУЛАХ (Improvement)'
        : 'ХАНГАСАН (Pass)'
    txt += `[${i + 1}] ${f.criterionNameMn} (${f.criterionId}) — Оноо: ${f.score}/4 [${severityLabel}]\n`
    txt += `    Хамаарах хуудас: ${f.clientPdfPages.join(', ') || '1'}-р хуудас\n`
    txt += `    Илэрсэн нөхцөл:  ${f.findingSummaryMn}\n`
    txt += `    Бизнесийн эрсдэл: ${f.businessImpactMn}\n`
    txt += `    Засах арга зам:  ${f.remedyActionMn}\n\n`
  })

  txt += `${sep}\n`
  txt += `АУДИТ БАТАЛГААЖУУЛСАН:\n`
  txt += `baysaass. Brand Identity & Design Systems Studio\n`
  txt += `Брэнд дизайнер: Т. Өсөхбаяр\n`
  txt += `Вэбсайт: https://baysaass.space · Имэйл: contact@baysaass.space\n`
  txt += `${sep}\n`

  return txt
}

/**
 * Triggers browser file download for .md, .txt, or .json formats
 */
export function downloadAuditDocument(
  audit: BrandAuditRecord,
  format: 'md' | 'txt' | 'json' = 'md'
): void {
  const cleanCompany = (audit.company || 'Brand').replace(/[^\w\u0400-\u04FF-]/g, '_')
  const dateStr = new Date(audit.createdAt).toISOString().split('T')[0]

  let content = ''
  let mimeType = 'text/plain;charset=utf-8'

  if (format === 'json') {
    content = JSON.stringify(audit, null, 2)
    mimeType = 'application/json;charset=utf-8'
  } else if (format === 'md') {
    content = buildAuditMarkdownText(audit)
    mimeType = 'text/markdown;charset=utf-8'
  } else {
    content = buildAuditMarkdownText(audit)
    mimeType = 'text/plain;charset=utf-8'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${cleanCompany}_Брэнд_Аудит_${dateStr}.${format}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Generates an isolated, studio-grade print-ready A4 HTML document
 * and triggers the browser's native print-to-PDF dialog.
 */
export function openAuditPrintWindow(audit: BrandAuditRecord): void {
  const printWindow = window.open('', '_blank', 'width=950,height=1050')
  if (!printWindow) {
    window.print()
    return
  }

  const cleanCompany = audit.company || 'Brand'
  const dateStr = new Date(audit.createdAt).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Theme color based on quality score
  const score = audit.qualityScore
  let scoreBadgeBg = '#fef2f2'
  let scoreBadgeBorder = '#fecaca'
  let scoreBadgeText = '#dc2626'
  let scoreLabel = 'Шуурхай засах алдаатай (Critical Gaps)'

  if (score >= 80) {
    scoreBadgeBg = '#ecfdf5'
    scoreBadgeBorder = '#a7f3d0'
    scoreBadgeText = '#059669'
    scoreLabel = 'Маш өндөр чанартай (Exemplary Standard)'
  } else if (score >= 60) {
    scoreBadgeBg = '#eff6ff'
    scoreBadgeBorder = '#bfdbfe'
    scoreBadgeText = '#2563eb'
    scoreLabel = 'Хангалттай сайн (Solid Foundation)'
  } else if (score >= 40) {
    scoreBadgeBg = '#fffbeb'
    scoreBadgeBorder = '#fde68a'
    scoreBadgeText = '#d97706'
    scoreLabel = 'Сайжруулах шаардлагатай (Needs Refinement)'
  }

  // 9 Modules Table HTML
  const moduleKeys = Object.keys(audit.modules) as ModuleId[]
  const modulesHtml = moduleKeys
    .map((key, i) => {
      const mod = audit.modules[key]
      const def = MODULE_DEFINITIONS[key]
      const modScore = mod.qualityScore
      const pillClass =
        modScore >= 80
          ? 'color: #059669; font-weight: bold;'
          : modScore >= 60
          ? 'color: #2563eb; font-weight: bold;'
          : modScore >= 40
          ? 'color: #d97706; font-weight: bold;'
          : 'color: #dc2626; font-weight: bold;'

      return `
      <tr>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; width: 30px; font-weight: bold; color: #888;">${i + 1}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee;">
          <strong>${def?.nameMn || mod.moduleNameMn}</strong>
          <div style="font-size: 10px; color: #666; margin-top: 1px;">${def?.descriptionMn || ''}</div>
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; width: 75px; font-size: 12px; ${pillClass}">
          ${modScore}/100
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; width: 65px; font-size: 11px;">
          ${mod.coveragePct}%
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; width: 65px; color: #dc2626; font-weight: bold; font-size: 11px;">
          ${mod.criticalCount > 0 ? mod.criticalCount : '—'}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; width: 65px; color: #d97706; font-size: 11px;">
          ${mod.improvementCount > 0 ? mod.improvementCount : '—'}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #eee; text-align: center; width: 65px; color: #059669; font-size: 11px;">
          ${mod.passCount > 0 ? mod.passCount : '—'}
        </td>
      </tr>`
    })
    .join('')

  // Findings Table HTML
  const findingsHtml = audit.findings
    .map((f, i) => {
      const isCritical = f.severity === 'critical'
      const isImprovement = f.severity === 'improvement'
      const badgeStyle = isCritical
        ? 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;'
        : isImprovement
        ? 'background: #fffbeb; color: #d97706; border: 1px solid #fde68a;'
        : 'background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;'
      const badgeLabel = isCritical ? 'Чухал' : isImprovement ? 'Зөвлөмж' : 'Хангасан'

      return `
      <div style="margin-bottom: 12px; page-break-inside: avoid; border: 1px solid #e4e4e7; border-radius: 8px; padding: 10px 12px; background: #fafafa;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 10px; font-weight: bold; color: #888; font-family: monospace;">[${f.criterionId}]</span>
            <strong style="font-size: 12px; color: #000;">${i + 1}. ${f.criterionNameMn}</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 10px; padding: 2px 7px; border-radius: 9999px; font-weight: bold; ${badgeStyle}">${badgeLabel} (${f.score}/4)</span>
            <span style="font-size: 10px; color: #71717a;">${f.clientPdfPages.join(', ') || '1'}-р хуудас</span>
          </div>
        </div>

        <div style="font-size: 11px; color: #27272a; margin-bottom: 4px; line-height: 1.5;">
          <strong>Илэрсэн дүгнэлт:</strong> ${f.findingSummaryMn}
        </div>

        <div style="font-size: 10.5px; color: #b45309; margin-bottom: 4px; line-height: 1.5;">
          <strong>Эрсдэл:</strong> ${f.businessImpactMn}
        </div>

        <div style="font-size: 10.5px; color: #15803d; line-height: 1.5;">
          <strong>Зөвлөмж:</strong> ${f.remedyActionMn}
        </div>
      </div>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <title>${cleanCompany} — Брэндбүүк чанарын аудитын тайлан | baysaass</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #000;
      background: #fff;
      font-size: 11px;
      line-height: 1.5;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #000;
    }
    .brand-subtitle {
      font-size: 9.5px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 2px;
    }
    .meta-box {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .score-card {
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 18px;
      border: 1px solid ${scoreBadgeBorder};
      background: ${scoreBadgeBg};
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #000;
      border-bottom: 1.5px solid #000;
      padding-bottom: 5px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 16px;
    }
    .data-table th {
      background: #f4f4f5;
      padding: 7px 8px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.05em;
      border-bottom: 1.5px solid #000;
      text-align: left;
    }
    .footer-box {
      margin-top: 24px;
      border-top: 1px solid #e4e4e7;
      padding-top: 12px;
      font-size: 9px;
      color: #71717a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: top;">
        <div class="brand-logo">baysaass<span style="color: #3b82f6;">.</span></div>
        <div class="brand-subtitle">Brand Identity & Standards Studio</div>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <div style="font-size: 14px; font-weight: 900; color: #000; text-transform: uppercase;">
          Брэндбүүк Чанарын Аудитын Тайлан
        </div>
        <div style="font-size: 10px; color: #666; margin-top: 2px;">
          Огноо: <strong>${dateStr}</strong> · Реф: <strong>${audit.id}</strong>
        </div>
      </td>
    </tr>
  </table>

  <!-- Meta details -->
  <div class="meta-box">
    <table style="width: 100%; font-size: 10.5px;">
      <tr>
        <td style="width: 25%;"><strong>Брэнд / Компани:</strong><br><span style="font-size: 13px; font-weight: bold; color: #000;">${audit.company}</span></td>
        <td style="width: 25%;"><strong>Шалгасан хүрээ:</strong><br>${audit.scope === 'full_brandbook' ? 'Бүрэн брэндбүүк (Full)' : audit.scope === 'visual_identity' ? 'Visual Identity' : 'Лого гарын авлага'}</td>
        <td style="width: 25%;"><strong>Хэрэгжих орчин:</strong><br>${audit.medium === 'both' ? 'Print & Digital' : audit.medium === 'digital' ? 'Digital' : 'Print'}</td>
        <td style="width: 25%; text-align: right;"><strong>Файл:</strong><br>${audit.documentInfo.fileName} (${audit.documentInfo.totalPages} хуудас)</td>
      </tr>
    </table>
  </div>

  <!-- Score Summary Hero -->
  <div class="score-card">
    <table style="width: 100%;">
      <tr>
        <td style="vertical-align: middle; width: 45%;">
          <div style="font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">OVERALL QUALITY SCORE</div>
          <div style="font-size: 44px; font-weight: 900; line-height: 1; margin: 4px 0; color: ${scoreBadgeText};">
            ${audit.qualityScore}<span style="font-size: 20px; font-weight: 600; color: #71717a;">/100</span>
          </div>
          <div style="font-size: 11px; font-weight: bold; color: ${scoreBadgeText};">${scoreLabel}</div>
        </td>
        <td style="vertical-align: middle; width: 55%; border-left: 1px solid rgba(0,0,0,0.1); padding-left: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 6px;">
              <div style="font-size: 9px; color: #666; text-transform: uppercase; font-weight: bold;">Стандартын хамралт</div>
              <div style="font-size: 16px; font-weight: 900; color: #000;">${audit.coveragePct}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 6px;">
              <div style="font-size: 9px; color: #dc2626; text-transform: uppercase; font-weight: bold;">Шуурхай засах алдаа</div>
              <div style="font-size: 16px; font-weight: 900; color: #dc2626;">${audit.criticalFindingsCount}</div>
            </div>
            <div style="background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 6px;">
              <div style="font-size: 9px; color: #d97706; text-transform: uppercase; font-weight: bold;">Сайжруулах зөвлөмж</div>
              <div style="font-size: 16px; font-weight: 900; color: #d97706;">${audit.improvementFindingsCount}</div>
            </div>
            <div style="background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 6px;">
              <div style="font-size: 9px; color: #059669; text-transform: uppercase; font-weight: bold;">Хангасан стандарт</div>
              <div style="font-size: 16px; font-weight: 900; color: #059669;">${audit.passFindingsCount}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Executive Summary -->
  <div class="section-title">Ахлах Аудиторын Дүгнэлт</div>
  <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; margin-bottom: 18px; font-size: 11px; white-space: pre-line; line-height: 1.6;">
    ${audit.executiveSummaryMn}
  </div>

  <!-- 9 Modules Breakdown -->
  <div class="section-title">Брэндийн 9 Систем Модулийн Үнэлгээ</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">№</th>
        <th>Модуль / Чиглэл</th>
        <th style="text-align: center; width: 75px;">Оноо</th>
        <th style="text-align: center; width: 65px;">Хамралт</th>
        <th style="text-align: center; width: 65px;">Чухал</th>
        <th style="text-align: center; width: 65px;">Зөвлөмж</th>
        <th style="text-align: center; width: 65px;">Хангасан</th>
      </tr>
    </thead>
    <tbody>
      ${modulesHtml}
    </tbody>
  </table>

  <!-- Detailed 30 Criteria -->
  <div class="section-title" style="page-break-before: always;">Бүх 30 Шалгуурын Нарийвчилсан Үнэлгээ & Засах Зөвлөмжүүд</div>
  <div>
    ${findingsHtml}
  </div>

  <!-- Signoff / Verification Footer -->
  <div class="footer-box">
    <div>
      <strong>baysaass. Brand Identity & Standards Studio</strong> · Улаанбаатар хот<br>
      Вебсайт: <a href="https://baysaass.space" style="color: #000; text-decoration: none;">baysaass.space</a> · Имэйл: contact@baysaass.space
    </div>
    <div style="text-align: right;">
      Тайлан боловсруулсан: <strong>Т. Өсөхбаяр</strong> (Brand Designer)<br>
      Цахим баталгаажуулалтын код: <span style="font-family: monospace;">${audit.id}</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    }
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
