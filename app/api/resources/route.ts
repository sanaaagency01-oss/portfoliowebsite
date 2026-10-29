import { NextRequest, NextResponse } from 'next/server'
import { getAllResources, getAllCategories } from '@/lib/resources/db'
import { ResourceType } from '@/lib/resources/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || undefined) as ResourceType | undefined
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const featured = searchParams.get('featured') === 'true'

    // Public API strictly only serves 'published' resources
    const resources = await getAllResources({
      status: 'published',
      type,
      category,
      search,
      featured: featured ? true : undefined,
    })

    const categories = await getAllCategories()

    return NextResponse.json({
      success: true,
      resources,
      categories,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
