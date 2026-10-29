import { NextRequest, NextResponse } from 'next/server'
import { getAssetById } from '@/lib/resources/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const asset = await getAssetById(id)

    if (!asset) {
      return new NextResponse('Asset not found', { status: 404 })
    }

    const buffer = Buffer.from(asset.dataBase64, 'base64')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': asset.mimeType || 'application/octet-stream',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${encodeURIComponent(asset.fileName)}"`,
      },
    })
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 })
  }
}
