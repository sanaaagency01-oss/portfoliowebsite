import { NextRequest, NextResponse } from 'next/server'
import { getBrandAuditById, deleteBrandAudit } from '@/lib/brand-audit/db'
import { runBrandAuditAnalysis } from '@/lib/brand-audit/engine'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    let audit = await getBrandAuditById(id)
    if (!audit) {
      return NextResponse.json(
        { success: false, error: 'Брэнд аудит олдсонгүй' },
        { status: 404 }
      )
    }

    // Check admin session
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
    const isAdmin = await verifyAdminSessionToken(token)

    // Ensure expiresAt
    if (!audit.expiresAt) {
      const created = audit.createdAt ? new Date(audit.createdAt).getTime() : Date.now()
      audit.expiresAt = new Date(created + 3 * 24 * 60 * 60 * 1000).toISOString()
    }

    const isExpired = new Date(audit.expiresAt).getTime() < Date.now()

    // Self-healing: If an audit is stuck in queued or analyzing, run to completion
    if (audit.status === 'queued' || audit.status === 'analyzing') {
      const pdfContent = {
        totalPages: audit.documentInfo?.totalPages || 12,
        textByPage: [],
        fullText: audit.documentInfo?.textSnippet || `${audit.company} brand guidelines and standards.`,
      }
      try {
        audit = await runBrandAuditAnalysis(audit, pdfContent)
      } catch (err: any) {
        console.warn('[Self-healing audit completion error]', err)
      }
    }

    return NextResponse.json({
      success: true,
      audit,
      isExpired,
      isAdmin,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const success = await deleteBrandAudit(id)
    return NextResponse.json({ success })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
