import { NextResponse } from 'next/server'
import { getProjectByToken, updateProject } from '@/lib/db'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const project = await getProjectByToken(token)

  if (!project) {
    return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    const updated = await updateProject(token, body)
    if (!updated) {
      return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
    }

    // If invoice or VAT was updated, send telegram notification
    if (body.invoice) {
      await sendTelegramNotification({
        title: '🧾 Нэхэмжлэх / Төлбөрийн баримтын мэдээлэл шинэчлэгдлээ!',
        message: `<b>Төсөл:</b> ${updated.name}\n<b>Нэхэмжлэх №:</b> ${body.invoice.invoiceNumber || 'INV'}\n<b>Байгууллага:</b> ${body.invoice.client?.company || updated.company}\n<b>Нийт дүн:</b> ${(body.invoice.totalAmount || updated.contract.total).toLocaleString()} ₮\n<b>Төлөх үлдэгдэл:</b> ${(body.invoice.balanceDue || 0).toLocaleString()} ₮`,
        projectToken: token,
      })
    } else if (body.vat) {
      await sendTelegramNotification({
        title: '🧾 Харилцагч НӨАТ-ын баримтын хүсэлт шинэчиллээ!',
        message: `<b>Төсөл:</b> ${updated.name}\n<b>Төрөл:</b> ${body.vat.type === 'company' ? 'Байгууллага' : 'Иргэн'}\n<b>Регистр:</b> ${body.vat.registerNumber || 'Оруулаагүй'}\n<b>НӨАТ-тай дүн:</b> ${(body.vat.totalWithVat || updated.contract.total * 1.1).toLocaleString()} ₮`,
        projectToken: token,
      })
    }

    return NextResponse.json({ project: updated })
  } catch (error) {
    console.error('Failed updating project', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
