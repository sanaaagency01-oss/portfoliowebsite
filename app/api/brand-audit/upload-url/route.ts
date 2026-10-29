import { NextRequest, NextResponse } from 'next/server'
import { createR2PresignedUploadUrl, createR2PresignedDownloadUrl } from '@/lib/r2'

export const dynamic = 'force-dynamic'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fileName = body.fileName || 'brandbook.pdf'
    const contentType = body.contentType || body.fileType || 'application/pdf'
    const cleanName = sanitizeFilename(fileName)
    const key = `brand-audits/${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${cleanName}`

    const presigned = await createR2PresignedUploadUrl(key, contentType, 3600)
    if (!presigned) {
      return NextResponse.json(
        { success: false, error: 'Cloudflare R2 тохиргоо олдсонгүй эсвэл алдаа гарлаа' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      uploadUrl: presigned.uploadUrl,
      fileKey: presigned.key,
      fileName,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    if (!key) {
      return NextResponse.json({ success: false, error: 'File key шаардлагатай' }, { status: 400 })
    }

    const downloadUrl = await createR2PresignedDownloadUrl(key, 3600)
    if (!downloadUrl) {
      return NextResponse.json(
        { success: false, error: 'Татах холбоос үүсгэхэд алдаа гарлаа' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, downloadUrl })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
