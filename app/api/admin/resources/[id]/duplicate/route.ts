import { NextRequest, NextResponse } from 'next/server'
import { getResourceById, saveResource } from '@/lib/resources/db'
import { ResourceItem } from '@/lib/resources/types'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const original = await getResourceById(id)
    if (!original) {
      return NextResponse.json({ success: false, error: 'Resource олдсонгүй' }, { status: 404 })
    }

    const newId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newSlug = `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`

    const cloned: ResourceItem = {
      ...original,
      id: newId,
      slug: newSlug,
      title: `${original.title} (Хуулбар)`,
      status: 'draft',
      viewsCount: 0,
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
    }

    await saveResource(cloned)

    return NextResponse.json({ success: true, resource: cloned })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
