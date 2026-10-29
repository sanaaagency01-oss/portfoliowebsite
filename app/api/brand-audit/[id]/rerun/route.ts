import { NextRequest, NextResponse } from 'next/server'
import { getBrandAuditById, saveBrandAudit } from '@/lib/brand-audit/db'
import { runBrandAuditAnalysis } from '@/lib/brand-audit/engine'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(
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

    // Check admin authorization
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
    const isAdmin = await verifyAdminSessionToken(token)

    let isUserTriggered = false
    try {
      const body = await req.json()
      if (body && body.isUserTriggered) {
        isUserTriggered = true
      }
    } catch {}

    // Enforce 1-time rerun limit for non-admin clients
    if (!isAdmin && isUserTriggered && (audit.clientRerunCount || 0) >= 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Дахин шалгах боломжийг зөвхөн 1 удаа ашиглах эрхтэй байдаг тул хязгаарлагдсан байна.',
          clientRerunCount: audit.clientRerunCount,
        },
        { status: 400 }
      )
    }

    audit.status = 'queued'
    audit.progressPct = 5
    audit.currentStageMn = 'Аудитыг дахин эхлүүлж байна...'
    if (isUserTriggered && !isAdmin) {
      audit.clientRerunCount = (audit.clientRerunCount || 0) + 1
    }
    await saveBrandAudit(audit)

    // Reconstruct pdf content from document info, ensuring no binary junk
    let text = (audit.documentInfo?.textSnippet || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim()
    const weirdBinaryChars = (text.match(/[^\x20-\x7E\u0400-\u04FF\s.,:;!?/#%()'"–—«»""'']/g) || []).length
    if (weirdBinaryChars > 15 || text.length < 30) {
      text = `${audit.company} брэндийн логоны дүрэм, хамгаалалтын зай, өнгөний код, үсгийн фонт болон брэндбүүк хэрэглээний стандарт.`
    }

    const pdfContent = {
      totalPages: audit.documentInfo?.totalPages || 12,
      textByPage: [],
      fullText: text,
    }

    try {
      audit = await runBrandAuditAnalysis(audit, pdfContent)
    } catch (err: any) {
      console.error('[Re-run Audit Analysis Error]', err)
      audit.status = 'failed'
      audit.errorMessage = err.message
      await saveBrandAudit(audit)
    }

    return NextResponse.json({ success: true, audit })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
