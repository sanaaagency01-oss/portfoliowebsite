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

  return NextResponse.json({ contract: project.contract, project })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { clientName, clientEmail, signatureDataUrl } = body

    const project = await getProjectByToken(token)
    if (!project) {
      return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
    }

    if (!clientName || !signatureDataUrl) {
      return NextResponse.json({ error: 'Нэр болон гарын үсэг шаардлагатай' }, { status: 400 })
    }

    const updatedContract = {
      ...project.contract,
      status: 'signed' as const,
      clientName: clientName.trim(),
      clientEmail: clientEmail?.trim() || project.email,
      signatureDataUrl,
      signedAt: new Date().toISOString(),
    }

    const updatedProject = await updateProject(token, {
      contract: updatedContract,
      status: 'active',
      progress: Math.max(project.progress, 15),
    })

    // Send Telegram Notification
    await sendTelegramNotification({
      title: '✍️ ГЭРЭЭ БАТАЛГААЖИЖ, ГАРЫН ҮСЭГ ЗУРАГДЛАА',
      message: `<b>Төсөл:</b> ${project.name}\n<b>Захиалагч:</b> ${clientName}\n<b>Гэрээний №:</b> ${project.contract.number}\n<b>Нийт төсөв:</b> ${project.contract.total.toLocaleString()} ₮\n<b>Огноо:</b> ${new Date().toLocaleString('mn-MN')}`,
      projectToken: token,
    })

    return NextResponse.json({ success: true, contract: updatedContract, project: updatedProject })
  } catch (error) {
    console.error('Failed signing contract', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const project = await getProjectByToken(token)

    if (!project) {
      return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
    }

    let updatedProposals = project.contract.proposals || []
    if (body.proposal) {
      updatedProposals = [...updatedProposals, body.proposal]
    }

    const updatedContract = {
      ...project.contract,
      ...body,
      proposals: updatedProposals,
    }

    const updates: Partial<any> = {
      contract: updatedContract,
    }

    // 1. Client accepts designer's proposed price & timeline -> Moves to contract_pending
    if (body.action === 'accept_proposal' || body.clientAcceptedProposal) {
      updates.status = 'contract_pending'
      updatedContract.proposalAcceptedAt = new Date().toISOString()

      await sendTelegramNotification({
        title: '🎉 Харилцагч ҮНИЙН САНАЛЫГ хүлээн зөвшөөрлөө!',
        message: `<b>Төсөл:</b> ${project.name}\n<b>Компани:</b> ${project.company}\n<b>Харилцагч:</b> ${project.contactName}\n<b>Баталсан дүн:</b> ${Number(project.contract.total).toLocaleString()} ₮\n<b>Шат:</b> Албан ёсны гэрээний шат руу шилжлээ (Цахим гарын үсэг зурах)`,
        projectToken: token,
      })
    }
    // 2. Designer sends / publishes proposal to client -> Moves to proposal_sent
    else if (body.isPublishedToClient && body.status === 'sent') {
      if (project.status !== 'contract_pending' && project.status !== 'active' && project.contract.status !== 'signed') {
        updates.status = 'proposal_sent'
      }
      updatedContract.proposalSentAt = new Date().toISOString()
    }

    const updatedProject = await updateProject(token, updates)

    // If designer just published proposal to client, notify
    if (body.isPublishedToClient && body.total && body.status === 'sent') {
      await sendTelegramNotification({
        title: '📢 Харилцагчид үнийн санал & хугацаа илгээгдлээ',
        message: `<b>Төсөл:</b> ${project.name}\n<b>Компани:</b> ${project.company}\n<b>Нийт төсөв:</b> ${Number(body.total).toLocaleString()} ₮\n<b>Хугацаа:</b> ${body.start || project.contract.start} — ${body.end || project.contract.end}\n<b>Токен:</b> <code>${token}</code>\n<b>Шат:</b> Харилцагч үнийн саналыг батлахыг хүлээж буй`,
        projectToken: token,
      })
    }

    // If client sent a proposal or note, alert designer via Telegram
    if (body.proposal || body.clientNote) {
      const noteContent = body.proposal?.note || body.clientNote || 'Хийгдэх ажлуудад засвар/нэмэлт оруулах санал'
      await sendTelegramNotification({
        title: '📝 Харилцагч гэрээнд санал/өөрчлөлт илгээлээ!',
        message: `<b>Төсөл:</b> ${project.name}\n<b>Харилцагч:</b> ${project.contactName} (${project.company})\n<b>Санал:</b> ${noteContent}\n<b>Токен:</b> <code>${token}</code>`,
        projectToken: token,
      })
    }

    return NextResponse.json({ success: true, contract: updatedContract, project: updatedProject })
  } catch (error) {
    console.error('Failed updating contract', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
