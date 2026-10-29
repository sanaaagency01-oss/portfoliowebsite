import { NextRequest, NextResponse } from 'next/server'
import { getBrandAuditById, saveBrandAudit } from '@/lib/brand-audit/db'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const audit = await getBrandAuditById(id)
    if (!audit) {
      return NextResponse.json(
        { success: false, error: 'Брэнд аудит олдсонгүй' },
        { status: 404 }
      )
    }

    // Check admin authorization
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
    const isAdmin = await verifyAdminSessionToken(token)

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Энэ үйлдлийг хийхэд админ эрх шаардлагатай' },
        { status: 401 }
      )
    }

    let days = 3
    try {
      const body = await req.json()
      if (typeof body.days === 'number') {
        days = body.days
      }
    } catch {}

    const now = Date.now()
    const currentExpiry = audit.expiresAt ? new Date(audit.expiresAt).getTime() : now

    let newExpiresAt: string
    if (days === -1 || days >= 365) {
      // 1 year permanent/extended
      newExpiresAt = new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString()
    } else if (days <= 0) {
      // Expire immediately
      newExpiresAt = new Date(now - 1000).toISOString()
    } else {
      // If current expiry is in the future, extend from current expiry, otherwise extend from now
      const baseTime = currentExpiry > now ? currentExpiry : now
      newExpiresAt = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString()
    }

    audit.expiresAt = newExpiresAt
    await saveBrandAudit(audit)

    return NextResponse.json({
      success: true,
      audit,
      expiresAt: newExpiresAt,
      message: `Хүчинтэй хугацааг ${days > 0 ? `${days} хоногоор` : ''} амжилттай шинэчиллээ.`,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
