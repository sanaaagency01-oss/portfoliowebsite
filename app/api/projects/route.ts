import { NextResponse } from 'next/server'
import { getAllProjects, createProject } from '@/lib/db'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET() {
  const projects = await getAllProjects()
  return NextResponse.json({ projects })
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      return NextResponse.json({ error: 'Төслийн нэр шаардлагатай' }, { status: 400 })
    }

    const project = await createProject({
      name: body.name.trim(),
      company: body.company || body.name.trim(),
      contactName: body.contactName || 'Захиалагч',
      email: body.email || '',
      phone: body.phone || '',
      type: body.type || 'Brand Identity',
      status: body.status || (body.contract ? 'contract_pending' : 'lead'),
      progress: body.progress || 0,
      due: body.due || body.contract?.end || 'Товлоогүй',
      token: body.token,
      contract: body.contract,
    })

    // Telegram Alert for new project created
    const deliverablesCount = project.contract?.deliverables?.length || 0
    await sendTelegramNotification({
      title: '📁 Шинэ төсөл & гэрээний линк үүсгэгдлээ',
      message: `<b>Төслийн нэр:</b> ${project.name}\n<b>Компани:</b> ${project.company}\n<b>Захиалагч:</b> ${project.contactName} (${project.phone || project.email || 'Холбоосгүй'})\n<b>Хөлс:</b> ${project.contract.total.toLocaleString()} ₮\n<b>Хийгдэх ажлууд:</b> ${deliverablesCount} материал\n<b>Токен:</b> <code>${project.token}</code>`,
      projectToken: project.token,
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Failed creating project', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
