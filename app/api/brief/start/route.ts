import { NextResponse } from 'next/server'
import { createProject } from '@/lib/db'
import { sendTelegramNotification } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    let body: { name?: string; email?: string; company?: string; projectType?: string } = {}
    try {
      body = await req.json()
    } catch {
      // Body is optional
    }

    const clientName = body.name?.trim() || 'Шинэ захиалагч'
    const company = body.company?.trim() || clientName
    const email = body.email?.trim() || ''
    const projectType = body.projectType?.trim() || 'Brand Identity'

    // Create a new project lead
    const newProject = await createProject({
      name: `${company} — Төслийн Бриф`,
      company: company,
      contactName: clientName,
      email: email,
      type: projectType,
      status: 'brief_pending',
    })

    // Send Telegram Notification to Designer
    await sendTelegramNotification({
      title: '✨ Шинэ захиалагч Ажлын шаардлага (AI бриф) эхлүүллээ!',
      message: `<b>Захиалагч:</b> ${clientName}\n<b>Компани:</b> ${company}\n<b>Төрөл:</b> ${projectType}\n<b>Төлөв:</b> AI бриф туслахтай чатлаж байна.`,
      projectToken: newProject.token,
    })

    return NextResponse.json({
      success: true,
      token: newProject.token,
      briefUrl: `/client/brief/${newProject.token}`,
    })
  } catch (error) {
    console.error('Failed to start AI brief session', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
