import { NextRequest, NextResponse } from 'next/server'
import { getBrandAuditById, saveBrandAudit } from '@/lib/brand-audit/db'
import { runBrandAuditAnalysis } from '@/lib/brand-audit/engine'

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

    audit.status = 'queued'
    audit.progressPct = 5
    audit.currentStageMn = 'Аудитыг дахин эхлүүлж байна...'
    await saveBrandAudit(audit)

    // Reconstruct dummy pdf content from document info
    const pdfContent = {
      totalPages: audit.documentInfo?.totalPages || 10,
      textByPage: [],
      fullText: `${audit.company} brand guidelines and identity standards.`,
    }

    runBrandAuditAnalysis(audit, pdfContent).catch((err) => {
      console.error('[Re-run Audit Analysis Error]', err)
      audit.status = 'failed'
      audit.errorMessage = err.message
      saveBrandAudit(audit)
    })

    return NextResponse.json({ success: true, audit })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
