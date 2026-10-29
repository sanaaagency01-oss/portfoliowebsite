import { NextRequest, NextResponse } from 'next/server'
import { getBrandAuditById, saveBrandAudit } from '@/lib/brand-audit/db'
import { runBrandAuditAnalysis } from '@/lib/brand-audit/engine'

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

    audit.status = 'queued'
    audit.progressPct = 5
    audit.currentStageMn = 'Аудитыг дахин эхлүүлж байна...'
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
