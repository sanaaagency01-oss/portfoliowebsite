import { NextRequest, NextResponse } from 'next/server'
import { executeD1Query, isCloudflareConfigured } from '@/lib/cloudflare'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const LOCAL_LOG_FILE = path.join(process.cwd(), 'data', 'audit-upload-errors.json')
const TMP_LOG_FILE = path.join('/tmp', 'audit-upload-errors.json')

interface UploadErrorRecord {
  id: string
  company: string
  fileName: string
  fileSizeBytes: number
  errorMessage: string
  statusCode: number
  createdAt: string
}

function getLogFile(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
  return isServerless ? TMP_LOG_FILE : LOCAL_LOG_FILE
}

async function initErrorTable(): Promise<void> {
  if (!isCloudflareConfigured()) return
  const sql = `
    CREATE TABLE IF NOT EXISTS audit_upload_errors (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      error_message TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `
  await executeD1Query(sql)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const record: UploadErrorRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      company: body.company || 'unknown',
      fileName: body.fileName || 'unknown.pdf',
      fileSizeBytes: Number(body.fileSizeBytes) || 0,
      errorMessage: body.errorMessage || 'Unknown upload error',
      statusCode: Number(body.statusCode) || 400,
      createdAt: new Date().toISOString(),
    }

    // Save to Cloudflare D1
    if (isCloudflareConfigured()) {
      try {
        await initErrorTable()
        const sql = `
          INSERT INTO audit_upload_errors (id, company, file_name, file_size, error_message, status_code, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?);
        `
        await executeD1Query(sql, [
          record.id,
          record.company,
          record.fileName,
          record.fileSizeBytes,
          record.errorMessage,
          record.statusCode,
          record.createdAt,
        ])
      } catch (d1Err) {
        console.warn('[D1 upload error logging failed]', d1Err)
      }
    }

    // Save to file fallback
    try {
      const filePath = getLogFile()
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      let existing: UploadErrorRecord[] = []
      if (fs.existsSync(filePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        } catch {}
      }
      existing.unshift(record)
      if (existing.length > 100) existing = existing.slice(0, 100)
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8')
    } catch (fsErr) {
      console.warn('[File upload error logging failed]', fsErr)
    }

    return NextResponse.json({ success: true, errorId: record.id })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (isCloudflareConfigured()) {
      try {
        await initErrorTable()
        const sql = `SELECT * FROM audit_upload_errors ORDER BY created_at DESC LIMIT 50;`
        const res = await executeD1Query<any>(sql)
        if (res.success && res.results) {
          const errors = res.results.map((r: any) => ({
            id: r.id,
            company: r.company,
            fileName: r.file_name,
            fileSizeBytes: r.file_size,
            errorMessage: r.error_message,
            statusCode: r.status_code,
            createdAt: r.created_at,
          }))
          return NextResponse.json({ success: true, errors })
        }
      } catch (e) {
        console.warn('[D1 get upload errors failed]', e)
      }
    }

    const filePath = getLogFile()
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return NextResponse.json({ success: true, errors: data })
    }

    return NextResponse.json({ success: true, errors: [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
