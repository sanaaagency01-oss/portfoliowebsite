import { NextRequest, NextResponse } from 'next/server'
import { getAllResources, getAllCategories, saveResource } from '@/lib/resources/db'
import { ResourceItem, ResourceType, ResourceStatus } from '@/lib/resources/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = (searchParams.get('status') || undefined) as ResourceStatus | undefined
    const type = (searchParams.get('type') || undefined) as ResourceType | undefined
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const resources = await getAllResources({
      status,
      type,
      category,
      search,
    })

    const all = await getAllResources()
    const categories = await getAllCategories()

    const stats = {
      total: all.length,
      published: all.filter((r) => r.status === 'published').length,
      draft: all.filter((r) => r.status === 'draft').length,
      archived: all.filter((r) => r.status === 'archived').length,
    }

    return NextResponse.json({
      success: true,
      resources,
      categories,
      stats,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: 'Гарчиг заавал шаардлагатай' }, { status: 400 })
    }

    // Auto-generate slug if not provided
    const slugBase = body.slug?.trim() || body.title.toLowerCase().replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-').replace(/^-|-$/g, '')
    const slug = slugBase || `resource-${Date.now()}`

    const newId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const newResource: ResourceItem = {
      id: newId,
      type: (body.type || 'article') as ResourceType,
      title: body.title.trim(),
      slug,
      summary: body.summary || '',
      coverImage: body.coverImage || '/work/one-more-night/01.jpg',
      category: body.category || 'guides',
      tags: Array.isArray(body.tags) ? body.tags : [],
      content: body.content || '',
      downloadFiles: Array.isArray(body.downloadFiles) ? body.downloadFiles : [],
      destinationUrl: body.destinationUrl || undefined,
      ctaLabel: body.ctaLabel || (body.type === 'download' ? 'Download' : body.type === 'tool' ? 'Open Tool' : 'Read Guide'),
      featured: Boolean(body.featured),
      sortOrder: Number(body.sortOrder) || 0,
      readTimeMinutes: Number(body.readTimeMinutes) || 5,
      author: body.author || { name: 'Т. Өсөхбаяр (baysaass)', role: 'Brand Designer' },
      seo: body.seo || {
        title: body.title,
        description: body.summary,
      },
      status: (body.status || 'draft') as ResourceStatus,
      viewsCount: 0,
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: body.status === 'published' ? new Date().toISOString() : undefined,
    }

    await saveResource(newResource)

    return NextResponse.json({
      success: true,
      resource: newResource,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
