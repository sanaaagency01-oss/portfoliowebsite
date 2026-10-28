import { NextResponse } from 'next/server'
import { getCommentsByAsset, createComment, resolveComment, addCommentReply, getProjectByToken } from '@/lib/db'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get('assetId')

  if (!assetId) {
    return NextResponse.json({ error: 'assetId is required' }, { status: 400 })
  }

  const comments = await getCommentsByAsset(assetId)
  return NextResponse.json({ comments })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectToken, assetId, xPercent, yPercent, authorRole, authorName, content } = body

    if (!projectToken || !assetId || xPercent === undefined || yPercent === undefined || !content) {
      return NextResponse.json({ error: 'Missing required comment fields' }, { status: 400 })
    }

    const comment = await createComment({
      projectToken,
      assetId,
      xPercent: Number(xPercent),
      yPercent: Number(yPercent),
      authorRole: authorRole || 'CLIENT',
      authorName: authorName || 'Харилцагч',
      content: content.trim(),
    })

    // Fetch project details for informative Telegram notification
    const project = await getProjectByToken(projectToken)
    const projectName = project?.name || 'Дизайны төсөл'
    const roleEmoji = authorRole === 'DESIGNER' ? '🎨' : '👤'

    // Dispatch Telegram Alert
    await sendTelegramNotification({
      title: `${roleEmoji} Дизайн дээр шинэ санал (Pinpoint) үлдээлээ`,
      message: `<b>Төсөл:</b> ${projectName}\n<b>Зохиогч:</b> ${authorName} (${authorRole})\n<b>Координат:</b> X:${Math.round(xPercent)}% Y:${Math.round(yPercent)}%\n<b>Санал:</b> "${content.trim()}"`,
      projectToken,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Failed creating comment', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { action, assetId, commentId, reply } = body

    if (!assetId || !commentId) {
      return NextResponse.json({ error: 'assetId and commentId are required' }, { status: 400 })
    }

    if (action === 'toggle_resolve') {
      const success = await resolveComment(assetId, commentId)
      return NextResponse.json({ success })
    }

    if (action === 'reply' && reply) {
      const updated = await addCommentReply(assetId, commentId, reply)
      return NextResponse.json({ comment: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed updating comment', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
