import { NextRequest, NextResponse } from 'next/server'
import { saveAsset } from '@/lib/resources/db'
import { ResourceAsset } from '@/lib/resources/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Файл олдсонгүй' }, { status: 400 })
    }

    // Max 30MB check
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Файлын хэмжээ 30MB-аас хэтрэхгүй байх ёстой' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    const assetId = `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const asset: ResourceAsset = {
      id: assetId,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
      dataBase64: base64,
      createdAt: new Date().toISOString(),
    }

    await saveAsset(asset)

    const url = `/api/resources/assets/${assetId}`

    return NextResponse.json({
      success: true,
      assetId,
      url,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      mimeType: file.type,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
