import { NextResponse } from 'next/server'
import { getProjectMessages, addProjectMessage, getProjectByToken } from '@/lib/db'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectToken = searchParams.get('projectToken')

  if (!projectToken) {
    return NextResponse.json({ error: 'projectToken is required' }, { status: 400 })
  }

  const messages = await getProjectMessages(projectToken)
  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectToken, authorRole, authorName, content } = body

    if (!projectToken || !content || !content.trim()) {
      return NextResponse.json({ error: 'projectToken and content are required' }, { status: 400 })
    }

    const message = await addProjectMessage({
      projectToken,
      authorRole: authorRole || 'CLIENT',
      authorName: authorName || 'Харилцагч',
      content: content.trim(),
    })

    // Fetch project details for informative Telegram notification
    const project = await getProjectByToken(projectToken)
    const projectName = project?.name || 'Дизайны төсөл'
    const roleEmoji = authorRole === 'DESIGNER' ? '🎨 Дизайнер' : '👤 Харилцагч'

    // Dispatch Telegram Alert
    await sendTelegramNotification({
      title: `💬 Төслийн харилцан ярианаас шинэ зурвас`,
      message: `<b>Төсөл:</b> ${projectName}\n<b>Илгээгч:</b> ${authorName} (${roleEmoji})\n<b>Зурвас:</b> "${content.trim()}"`,
      projectToken,
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Failed creating project message', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
