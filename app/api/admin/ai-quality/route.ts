import { NextRequest, NextResponse } from 'next/server'
import { getQualityMetricsSummary, saveFindingReview, getFindingReviewsForAudit } from '@/lib/brand-audit/quality-db'
import { listBrandAudits } from '@/lib/brand-audit/db'
import { ExpertFindingLabel, ErrorStage } from '@/lib/brand-audit/quality-types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const auditId = searchParams.get('auditId')

    const metrics = await getQualityMetricsSummary()
    const audits = await listBrandAudits()

    let activeAuditReviews: any = null
    if (auditId) {
      activeAuditReviews = await getFindingReviewsForAudit(auditId)
    }

    return NextResponse.json({
      success: true,
      metrics,
      audits: audits.map((a) => ({
        id: a.id,
        company: a.company,
        email: a.email,
        scope: a.scope,
        medium: a.medium,
        status: a.status,
        qualityScore: a.qualityScore,
        coveragePct: a.coveragePct,
        criticalFindingsCount: a.criticalFindingsCount,
        improvementFindingsCount: a.improvementFindingsCount,
        passFindingsCount: a.passFindingsCount,
        findingsCount: a.findings?.length || 0,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        versionInfo: a.versionInfo,
      })),
      activeAuditReviews,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { auditId, criterionId, expertLabel, errorStage, expertNote, correctEvidencePages } = body

    if (!auditId || !criterionId || !expertLabel) {
      return NextResponse.json(
        { success: false, error: 'AuditId, CriterionId болон ExpertLabel шаардлагатай.' },
        { status: 400 }
      )
    }

    await saveFindingReview({
      auditId,
      criterionId,
      expertLabel: expertLabel as ExpertFindingLabel,
      errorStage: errorStage as ErrorStage,
      expertNote: expertNote || '',
      correctEvidencePages: Array.isArray(correctEvidencePages) ? correctEvidencePages : undefined,
      reviewedBy: 'Senior Brand Reviewer (Admin)',
    })

    const updatedMetrics = await getQualityMetricsSummary()
    return NextResponse.json({ success: true, metrics: updatedMetrics })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
