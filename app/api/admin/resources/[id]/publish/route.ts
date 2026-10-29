import { NextRequest, NextResponse } from 'next/server'
import { getResourceById, saveResource } from '@/lib/resources/db'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const resource = await getResourceById(id)
    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource олдсонгүй' }, { status: 404 })
    }

    const nextStatus = resource.status === 'published' ? 'draft' : 'published'
    resource.status = nextStatus
    if (nextStatus === 'published' && !resource.publishedAt) {
      resource.publishedAt = new Date().toISOString()
    }
    resource.updatedAt = new Date().toISOString()

    await saveResource(resource)

    return NextResponse.json({ success: true, resource })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
