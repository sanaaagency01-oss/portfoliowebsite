import { NextRequest, NextResponse } from 'next/server'
import { saveFindingReview, getFindingReviewsForAudit } from '@/lib/brand-audit/quality-db'
import { UserFindingVote } from '@/lib/brand-audit/quality-types'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const reviews = await getFindingReviewsForAudit(id)
    return NextResponse.json({ success: true, reviews })
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

    const criterionId = String(body.criterionId || '').trim()
    const userVote = body.userVote as UserFindingVote

    if (!criterionId || !userVote) {
      return NextResponse.json(
        { success: false, error: 'Шалгуурын ID болон хэрэглэгчийн санал шаардлагатай.' },
        { status: 400 }
      )
    }

    await saveFindingReview({
      auditId: id,
      criterionId,
      userVote,
      userComment: body.userComment || '',
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
