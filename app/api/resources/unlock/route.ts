import { NextRequest, NextResponse } from 'next/server'
import { getResourceById, saveResourceLead, incrementResourceDownloads } from '@/lib/resources/db'
import { createProject } from '@/lib/db'
import { sendTelegramNotification } from '@/lib/telegram'
import { ResourceLead } from '@/lib/resources/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resourceId, resourceTitle, name, email } = body

    if (!resourceId) {
      return NextResponse.json({ success: false, error: 'Материалын ID байхгүй байна' }, { status: 400 })
    }

    const cleanName = (name || '').trim()
    const cleanEmail = (email || '').trim().toLowerCase()

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Өөрийн нэрээ бүрэн оруулна уу (доод тал нь 2 үсэг)' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Зөв Gmail эсвэл и-мэйл хаяг оруулна уу (жишээ: нэр@gmail.com)' },
        { status: 400 }
      )
    }

    const resource = await getResourceById(resourceId)
    const title = resource?.title || resourceTitle || 'Татах файл'

    // 1. Record lead in resource_leads table
    const lead: ResourceLead = {
      id: `rlead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      resourceId,
      resourceTitle: title,
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    }
    await saveResourceLead(lead)

    // 2. Increment download count in background
    incrementResourceDownloads(resourceId).catch(() => {})

    // 3. Register lead in Studio CRM
    try {
      await createProject({
        name: `${cleanName} — [Таталт] ${title}`,
        company: cleanName,
        contactName: cleanName,
        email: cleanEmail,
        type: 'Lead Magnet Download',
        status: 'lead',
      })
    } catch (crmErr) {
      console.warn('[CRM lead creation error]', crmErr)
    }

    // 4. Send Instant Telegram Alert to Designer
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baysaass.space'
      const resourceUrl = resource?.slug ? `${siteUrl}/resources/${resource.slug}` : siteUrl
      await sendTelegramNotification({
        title: '📥 Дизайны сангаас файл татах хүсэлт ирлээ!',
        message: `<b>Нэр:</b> ${cleanName}\n<b>Gmail:</b> ${cleanEmail}\n<b>Материал:</b> ${title}\n<b>Холбоос:</b> ${resourceUrl}`,
      })
    } catch (tgErr) {
      console.warn('[Telegram lead notification error]', tgErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Файл татах эрх амжилттай нээгдлээ',
      downloadFiles: resource?.downloadFiles || [],
    })
  } catch (e: any) {
    console.error('[Resource Unlock Error]', e)
    return NextResponse.json({ success: false, error: e.message || 'Алдаа гарлаа' }, { status: 500 })
  }
}

