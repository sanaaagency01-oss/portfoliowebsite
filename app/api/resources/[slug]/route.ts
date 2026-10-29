import { NextRequest, NextResponse } from 'next/server'
import { getResourceBySlug, getAllResources, incrementResourceViews } from '@/lib/resources/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const resource = await getResourceBySlug(slug)

    if (!resource || resource.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Resource олдсонгүй эсвэл нийтлэгдээгүй байна' },
        { status: 404 }
      )
    }

    // Increment view count in background
    incrementResourceViews(resource.id).catch(() => {})

    // Fetch related resources in same category
    const all = await getAllResources({ status: 'published', category: resource.category })
    const related = all.filter((r) => r.id !== resource.id).slice(0, 3)

    return NextResponse.json({
      success: true,
      resource,
      related,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
