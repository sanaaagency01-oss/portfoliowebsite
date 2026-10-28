/**
 * Official Invoice / Payment Document (Нэхэмжлэх / Баримт) Export Engine
 * Faithful reproduction of the 3-page editorial invoice template.
 */

import { Project, InvoiceInfo, InvoiceItem } from './types/studio'
import { formatCurrency } from './studio-utils'

/**
 * Creates default InvoiceInfo based on project details
 */
export function getDefaultInvoiceFromProject(project: Project): InvoiceInfo {
  const existing = project.invoice
  const total = project.contract?.total || 3500000
  const advance = Math.round(total / 2)
  const balance = total - advance

  const deliverables = project.contract?.deliverables || []
  const items: InvoiceItem[] =
    deliverables.length > 0
      ? deliverables.map((d, i) => {
          const itemPrice = Math.round(total / deliverables.length)
          return {
            id: d.id || `item_${i + 1}`,
            name: d.name,
            description: d.description || '',
            quantity: 1,
            unitPrice: itemPrice,
            amount: itemPrice,
          }
        })
      : [
          {
            id: 'item_1',
            name: 'Брэндийн үндсэн дизайн & Лого систем',
            description: 'Лого систем, өнгө, фонт хослол, эх файлууд',
            quantity: 1,
            unitPrice: advance,
            amount: advance,
          },
          {
            id: 'item_2',
            name: 'Брэндбүүк & Хүлээлгэн өгөх эх файлууд',
            description: 'Брэндийн хэрэглээний заавар, 24 хуудас PDF',
            quantity: 1,
            unitPrice: balance,
            amount: balance,
          },
        ]

  return {
    enabled: true,
    invoiceNumber:
      existing?.invoiceNumber ||
      `INV-${new Date().getFullYear()}-${project.contract?.number ? project.contract.number.replace(/\D/g, '').slice(-3) : '001'}`,
    date: existing?.date || new Date().toISOString().split('T')[0],
    dueDateDays: existing?.dueDateDays || 3,
    contractor: {
      name: existing?.contractor?.name || 'Т. Өсөхбаяр',
      company: existing?.contractor?.company || 'baysaass',
      email: existing?.contractor?.email || 'usukhbayar@baysaass.space',
      phone: existing?.contractor?.phone || '+976 99112233',
    },
    client: {
      name: existing?.client?.name || project.contactName || 'Захиалагч',
      company: existing?.client?.company || project.company || 'Захиалагч байгууллага',
      email: existing?.client?.email || project.email || '',
      phone: existing?.client?.phone || project.phone || '',
      registerNumber: existing?.client?.registerNumber || project.vat?.registerNumber || '',
    },
    items: existing?.items && existing.items.length > 0 ? existing.items : items,
    totalAmount: existing?.totalAmount || total,
    advancePaid: existing?.advancePaid !== undefined ? existing.advancePaid : advance,
    balanceDue: existing?.balanceDue !== undefined ? existing.balanceDue : balance,
    bank: {
      bankName: existing?.bank?.bankName || 'Хаан банк',
      accountName: existing?.bank?.accountName || 'Т. Өсөхбаяр',
      accountNumber: existing?.bank?.accountNumber || '5608120471',
      transactionValue:
        existing?.bank?.transactionValue ||
        `_INV-${new Date().getFullYear()}-${project.token}`,
    },
    status: existing?.status || 'sent',
    issuedAt: existing?.issuedAt || new Date().toISOString(),
  }
}

/**
 * Generates an isolated 3-page printable HTML window matching the exact PDF template
 */
export function openInvoicePrintWindow(project: Project, invoiceData?: InvoiceInfo): void {
  const inv = invoiceData || getDefaultInvoiceFromProject(project)
  const printWindow = window.open('', '_blank', 'width=900,height=1000')
  if (!printWindow) {
    window.print()
    return
  }

  const itemsRowsHtml = inv.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #c2410c; font-weight: 700; width: 40px;">${idx + 1}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; color: #c2410c; font-weight: 600;">${item.name}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; color: #555;">${item.description || '—'}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #111; font-weight: 600; width: 60px;">${item.quantity}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #c2410c; font-weight: 700; width: 110px;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #c2410c; font-weight: 700; width: 110px;">${formatCurrency(item.amount || item.unitPrice * item.quantity)}</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <title>Нэхэмжлэх_${inv.invoiceNumber}_${inv.client.company}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #000;
      background: #fff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      max-height: 297mm;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }
    .no-print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #000;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    @media print {
      .no-print-bar { display: none !important; }
      .page {
        margin: 0;
        border: none;
        box-shadow: none;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Floating Print Helper Bar -->
  <div class="no-print-bar">
    <div style="font-size: 13px; font-weight: 600;">
      📄 <strong>Нэхэмжлэх баримт (3 хуудас)</strong> · ${inv.invoiceNumber} · ${inv.client.company}
    </div>
    <div>
      <button onclick="window.print()" style="background: #fff; color: #000; border: none; padding: 8px 20px; border-radius: 999px; font-size: 12px; font-weight: bold; cursor: pointer;">
        🖨️ PDF татах / Хэвлэх
      </button>
      <button onclick="window.close()" style="background: transparent; color: #bbb; border: 1px solid #555; padding: 8px 14px; border-radius: 999px; font-size: 12px; margin-left: 8px; cursor: pointer;">
        Хаах
      </button>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 1: COVER PAGE (Dark Editorial Aesthetic) -->
  <!-- ========================================== -->
  <div class="page" style="background: #1e1e1e; color: #fff; padding: 48mm 25mm 30mm 25mm; justify-content: space-between;">
    <div>
      <!-- Big bold white title -->
      <h1 style="font-size: 58px; font-weight: 800; letter-spacing: -0.04em; margin: 0; color: #ffffff;">
        Нэхэмжлэх
      </h1>
    </div>

    <!-- Bottom Metadata Columns -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; line-height: 1.6; color: #e5e5e5;">
      <!-- Left: Created by -->
      <div>
        <div style="color: #999; font-size: 11px; margin-bottom: 2px;">Created by:</div>
        <div>Contractor: <strong style="color: #fff;">${inv.contractor.name}</strong></div>
        <div>Company: <strong style="color: #fff;">${inv.contractor.company}</strong></div>
        <div style="margin-top: 6px;">Нэхэмжлэхийн дугаар: <strong style="color: #fff;">${inv.invoiceNumber}</strong></div>
        <div>Нэхэмжлэх үүссэн огноо: <strong style="color: #fff;">${inv.date}</strong></div>
      </div>

      <!-- Right: Created for -->
      <div style="text-align: left; min-width: 200px;">
        <div style="color: #999; font-size: 11px; margin-bottom: 2px;">Created for:</div>
        <div>Client: <strong style="color: #fff;">${inv.client.name}</strong></div>
        <div>Company: <strong style="color: #fff;">${inv.client.company}</strong></div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 2: INVOICE DETAILS & LINE ITEMS       -->
  <!-- ========================================== -->
  <div class="page" style="background: #ffffff; color: #000; padding: 25mm 22mm 20mm 22mm; justify-content: space-between;">
    <div>
      <!-- Page Header: Logo on top right -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 25px;">
        <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: #000;">
          baysaass<span style="color: #888;">.</span>
        </span>
      </div>

      <!-- Sections 1 & 3: Two Column Layout -->
      <div style="display: flex; justify-content: space-between; gap: 40px; margin-bottom: 30px;">
        <!-- 1. Contractor -->
        <div style="flex: 1;">
          <h2 style="font-size: 16px; font-weight: 800; margin: 0 0 10px 0; color: #000;">
            1. Үйлчилгээ<br />үзүүлэгч<br />(Дизайнер)
          </h2>
          <div style="font-size: 11px; line-height: 1.8; color: #333;">
            <div>Нэр: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 140px; color: #b45309; font-weight: 600;">${inv.contractor.name}</span></div>
            <div>Байгууллага / Freelancer: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 120px; color: #b45309; font-weight: 600;">${inv.contractor.company}</span></div>
            <div>Имэйл: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 150px; color: #b45309; font-weight: 600;">${inv.contractor.email}</span></div>
            <div>Утас: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 120px; color: #b45309; font-weight: 600;">${inv.contractor.phone}</span></div>
          </div>
        </div>

        <!-- 3. Client -->
        <div style="flex: 1;">
          <h2 style="font-size: 16px; font-weight: 800; margin: 0 0 10px 0; color: #000;">
            3. Захиалагч<br />(Client)
          </h2>
          <div style="font-size: 11px; line-height: 1.8; color: #333;">
            <div>• Нэр / Байгууллага: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 130px; color: #b45309; font-weight: 600;">${inv.client.company} (${inv.client.name})</span></div>
            <div>• Имэйл: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 150px; color: #b45309; font-weight: 600;">${inv.client.email || '—'}</span></div>
            <div>• Утас: <span style="border-bottom: 1px solid #d4a373; padding: 0 4px; display: inline-block; min-width: 130px; color: #b45309; font-weight: 600;">${inv.client.phone || '—'}</span></div>
          </div>
        </div>
      </div>

      <!-- Section 4: Service Details Table -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: 800; margin: 0 0 12px 0; color: #000;">
          4. Үйлчилгээний<br />дэлгэрэнгүй
        </h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #e2e8f0; color: #1e293b; font-weight: 700; text-align: left;">
              <th style="padding: 10px 14px; width: 40px; text-align: center;">№</th>
              <th style="padding: 10px 14px;">Үйлчилгээ</th>
              <th style="padding: 10px 14px;">Тайлбар</th>
              <th style="padding: 10px 14px; text-align: center; width: 60px;">Тоо</th>
              <th style="padding: 10px 14px; text-align: right; width: 110px;">Нэгж үнэ</th>
              <th style="padding: 10px 14px; text-align: right; width: 110px;">Дүн</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <!-- Summary Totals Block -->
        <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
          <div style="min-width: 250px; font-size: 12px; line-height: 2;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 700; color: #000;">Нийт дүн:</span>
              <strong style="color: #c2410c;">${formatCurrency(inv.totalAmount)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">Урьдчилгаа төлсөн:</span>
              <strong style="color: #c2410c;">${formatCurrency(inv.advancePaid)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 4px; margin-top: 4px;">
              <span style="font-weight: 800; color: #000;">Төлөх үлдэгдэл:</span>
              <strong style="color: #c2410c; font-size: 14px;">${formatCurrency(inv.balanceDue)}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 5: Payment Terms -->
      <div style="margin-top: 20px;">
        <h2 style="font-size: 15px; font-weight: 800; margin: 0 0 8px 0; color: #000;">
          5. Төлбөрийн нөхцөл
        </h2>
        <ul style="margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.8; color: #333;">
          <li>Төлбөрийг <strong>[${inv.dueDateDays}]</strong> хоногийн дотор шилжүүлнэ</li>
          <li>Төлбөр хийгдсэний дараа файлууд бүрэн хүлээлгэн өгөгдөнө</li>
          <li>Төлбөрийн саатал гарвал гэрээнд заасан нөхцөл үйлчилнэ</li>
        </ul>
      </div>
    </div>

    <!-- Page 2 Footer -->
    <div style="display: flex; justify-content: space-between; font-size: 9px; color: #888; border-top: 1px solid #eee; padding-top: 8px;">
      <span>Шаардлагын шинжилгээ баримт бичиг</span>
      <span>2</span>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 3: BANK DETAILS & SIGNATURE           -->
  <!-- ========================================== -->
  <div class="page" style="background: #ffffff; color: #000; padding: 25mm 22mm 20mm 22mm; justify-content: space-between;">
    <div>
      <!-- Page Header: Logo on top right -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 25px;">
        <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: #000;">
          baysaass<span style="color: #888;">.</span>
        </span>
      </div>

      <!-- Section 6: Payment Bank Details -->
      <div style="margin-bottom: 45px;">
        <h2 style="font-size: 16px; font-weight: 800; margin: 0 0 16px 0; color: #000;">
          6. Төлбөр хийх<br />мэдээлэл
        </h2>

        <div style="font-size: 12px; line-height: 2.2; color: #333; max-width: 480px;">
          <div>Банк: <span style="border-bottom: 1px solid #d4a373; padding: 0 6px; display: inline-block; min-width: 220px; color: #b45309; font-weight: 700;">${inv.bank.bankName}</span></div>
          <div>Дансны нэр: <span style="border-bottom: 1px solid #d4a373; padding: 0 6px; display: inline-block; min-width: 220px; color: #b45309; font-weight: 700;">${inv.bank.accountName}</span></div>
          <div>Дансны дугаар: <span style="border-bottom: 1px solid #d4a373; padding: 0 6px; display: inline-block; min-width: 220px; color: #b45309; font-weight: 700; font-family: monospace; font-size: 13px;">${inv.bank.accountNumber}</span></div>
          <div>Гүйлгээний утга: <span style="border-bottom: 1px solid #d4a373; padding: 0 6px; display: inline-block; min-width: 220px; color: #dc2626; font-weight: 700;">${inv.bank.transactionValue || inv.invoiceNumber}</span></div>
        </div>
      </div>

      <!-- Section 10: Signatures -->
      <div>
        <h2 style="font-size: 16px; font-weight: 800; margin: 0 0 10px 0; color: #000;">
          10. Гарын үсэг
        </h2>
        <p style="font-size: 11px; color: #555; max-width: 500px; line-height: 1.6; margin-bottom: 30px;">
          Энэхүү нэхэмжлэх нь гүйцэтгэсэн үйлчилгээний төлбөрийг албан ёсоор нэхэмжилж буй баримт болно.
        </p>

        <div style="display: flex; justify-content: flex-end; margin-top: 40px;">
          <div style="width: 240px; text-align: center;">
            <div style="font-size: 11px; color: #666; margin-bottom: 15px;">Дизайнерын гарын үсэг:</div>
            
            <!-- Calligraphic digital signature -->
            <div style="border-bottom: 1px solid #999; padding-bottom: 10px; min-height: 50px; display: flex; align-items: flex-end; justify-content: center;">
              <span style="font-family: 'Brush Script MT', 'Great Vibes', cursive, sans-serif; font-size: 26px; color: #000; letter-spacing: 1px;">
                T. Usukhbayar
              </span>
            </div>

            <div style="margin-top: 10px; font-size: 11px; color: #555;">
              Огноо: <span style="color: #dc2626; font-weight: 600;">[${inv.date}]</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page 3 Footer -->
    <div style="display: flex; justify-content: space-between; font-size: 9px; color: #888; border-top: 1px solid #eee; padding-top: 8px;">
      <span>Шаардлагын шинжилгээ баримт бичиг</span>
      <span>3</span>
    </div>
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

/**
 * Downloads invoice document as text (.txt)
 */
export function downloadInvoiceText(project: Project, invoiceData?: InvoiceInfo): void {
  const inv = invoiceData || getDefaultInvoiceFromProject(project)
  const sep = '='.repeat(65)
  const line = '-'.repeat(65)

  let txt = `${sep}\n`
  txt += `                   НЭХЭМЖЛЭХ БАРИМТ\n`
  txt += `               Дугаар: ${inv.invoiceNumber}\n`
  txt += `${sep}\n\n`
  txt += `Огноо: ${inv.date}\n`
  txt += `Төсөл: ${project.name}\n\n`

  txt += `[1. ҮЙЛЧИЛГЭЭ ҮЗҮҮЛЭГЧ]\n`
  txt += `Нэр: ${inv.contractor.name}\n`
  txt += `Байгууллага: ${inv.contractor.company}\n`
  txt += `Имэйл: ${inv.contractor.email}\n`
  txt += `Утас: ${inv.contractor.phone}\n\n`

  txt += `[2. ЗАХИАЛАГЧ (CLIENT)]\n`
  txt += `Байгууллага / Нэр: ${inv.client.company} (${inv.client.name})\n`
  txt += `Имэйл: ${inv.client.email}\n`
  txt += `Утас: ${inv.client.phone}\n\n`

  txt += `${line}\n`
  txt += `[3. ҮЙЛЧИЛГЭЭНИЙ ДЭЛГЭРЭНГҮЙ]\n`
  txt += `${line}\n`
  inv.items.forEach((item, idx) => {
    txt += `${idx + 1}. ${item.name} | Тоо: ${item.quantity} | Үнэ: ${formatCurrency(item.unitPrice)} | Дүн: ${formatCurrency(item.amount)}\n`
    if (item.description) txt += `   Тайлбар: ${item.description}\n`
  })
  txt += `\n`

  txt += `Нийт дүн: ${formatCurrency(inv.totalAmount)}\n`
  txt += `Урьдчилгаа төлсөн: ${formatCurrency(inv.advancePaid)}\n`
  txt += `Төлөх үлдэгдэл: ${formatCurrency(inv.balanceDue)}\n\n`

  txt += `${line}\n`
  txt += `[4. ТӨЛБӨРИЙН НӨХЦӨЛ]\n`
  txt += `• Төлбөрийг [${inv.dueDateDays}] хоногийн дотор шилжүүлнэ.\n`
  txt += `• Төлбөр хийгдсэний дараа файлууд бүрэн хүлээлгэн өгөгдөнө.\n`
  txt += `• Төлбөрийн саатал гарвал гэрээнд заасан нөхцөл үйлчилнэ.\n\n`

  txt += `${line}\n`
  txt += `[5. ТӨЛБӨР ХИЙХ МЭДЭЭЛЭЛ]\n`
  txt += `Банк: ${inv.bank.bankName}\n`
  txt += `Дансны нэр: ${inv.bank.accountName}\n`
  txt += `Дансны дугаар: ${inv.bank.accountNumber}\n`
  txt += `Гүйлгээний утга: ${inv.bank.transactionValue}\n\n`

  txt += `${sep}\n`
  txt += `Энэхүү нэхэмжлэх нь гүйцэтгэсэн үйлчилгээний төлбөрийг албан ёсоор нэхэмжилж буй баримт болно.\n`
  txt += `Дизайнерын гарын үсэг: Т. Өсөхбаяр (baysaass)\n`

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Нэхэмжлэх_${inv.invoiceNumber}_${inv.client.company.replace(/[^\w-]/g, '_')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
