import { NextRequest, NextResponse } from 'next/server'
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/resources/db'
import { ResourceCategory } from '@/lib/resources/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json({ success: true, categories })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.nameMn?.trim()) {
      return NextResponse.json({ success: false, error: 'Ангиллын нэр шаардлагатай' }, { status: 400 })
    }

    const id = body.id?.trim() || body.slug?.trim() || `cat_${Date.now()}`
    const category: ResourceCategory = {
      id,
      name: body.name || body.nameMn,
      nameMn: body.nameMn,
      slug: body.slug || id,
      description: body.description || '',
      sortOrder: Number(body.sortOrder) || 0,
    }

    await saveCategory(category)
    return NextResponse.json({ success: true, category })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID шаардлагатай' }, { status: 400 })
    }

    const success = await deleteCategory(id)
    return NextResponse.json({ success })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
