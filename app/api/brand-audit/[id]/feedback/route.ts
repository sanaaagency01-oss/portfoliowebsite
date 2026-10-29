import { NextRequest, NextResponse } from 'next/server'
import { saveUserReportFeedback, getUserReportFeedback } from '@/lib/brand-audit/quality-db'
import { UserReportFeedback } from '@/lib/brand-audit/quality-types'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const feedback = await getUserReportFeedback(id)
    return NextResponse.json({ success: true, feedback })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const clarityScore = Number(body.clarityScore)
    if (!clarityScore || clarityScore < 1 || clarityScore > 5) {
      return NextResponse.json(
        { success: false, error: 'Ойлгомжтой байдлын үнэлгээ (1-5) шаардлагатай.' },
        { status: 400 }
      )
    }

    const feedback: UserReportFeedback = {
      auditId: id,
      clarityScore: clarityScore as any,
      discoveredNewIssues: body.discoveredNewIssues || 'unknown',
      inaccurateFindingsNote: (body.inaccurateFindingsNote || '').trim(),
      createdAt: new Date().toISOString(),
    }

    await saveUserReportFeedback(feedback)
    return NextResponse.json({ success: true, feedback })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
