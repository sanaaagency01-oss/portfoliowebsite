import { NextRequest, NextResponse } from 'next/server'
import { getResourceById, saveResource, deleteResource } from '@/lib/resources/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const resource = await getResourceById(id)
    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource олдсонгүй' }, { status: 404 })
    }
    return NextResponse.json({ success: true, resource })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const resource = await getResourceById(id)
    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource олдсонгүй' }, { status: 404 })
    }

    const updates = await req.json()

    // Merge updates
    const updated: typeof resource = {
      ...resource,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    if (updates.status === 'published' && !resource.publishedAt) {
      updated.publishedAt = new Date().toISOString()
    }

    await saveResource(updated)

    return NextResponse.json({ success: true, resource: updated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const success = await deleteResource(id)
    return NextResponse.json({ success })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
