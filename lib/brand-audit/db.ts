import fs from 'fs'
import path from 'path'
import { BrandAuditRecord } from './types'
import { executeD1Query, isCloudflareConfigured } from '../cloudflare'

// Serverless detection
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
)

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_STORE_FILE = path.join(LOCAL_DATA_DIR, 'brand-audits.json')
const TMP_STORE_FILE = path.join('/tmp', 'brand-audits.json')

let inMemoryAudits: Record<string, BrandAuditRecord> = {}
let d1Initialized = false

function getStoreFilePath(): string {
  return IS_SERVERLESS ? TMP_STORE_FILE : LOCAL_STORE_FILE
}

function loadLocalStore(): void {
  try {
    const targetFile = getStoreFilePath()
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, 'utf-8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        inMemoryAudits = parsed
      }
    }
  } catch (e) {
    console.warn('[BrandAudit local store load error]', e)
  }
}

function saveLocalStore(): void {
  try {
    const targetFile = getStoreFilePath()
    const targetDir = path.dirname(targetFile)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    fs.writeFileSync(targetFile, JSON.stringify(inMemoryAudits, null, 2), 'utf-8')
  } catch (fsErr) {
    try {
      if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp', { recursive: true })
      }
      fs.writeFileSync(TMP_STORE_FILE, JSON.stringify(inMemoryAudits, null, 2), 'utf-8')
    } catch (tmpErr) {
      console.warn('[BrandAudit file write failed]', tmpErr)
    }
  }
}

async function initD1AuditTable(): Promise<boolean> {
  if (d1Initialized || !isCloudflareConfigured()) return d1Initialized
  const sql = `
    CREATE TABLE IF NOT EXISTS brand_audits (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      email TEXT,
      scope TEXT NOT NULL,
      medium TEXT NOT NULL,
      status TEXT NOT NULL,
      quality_score REAL NOT NULL,
      coverage_pct REAL NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `
  const res = await executeD1Query(sql)
  if (res.success) {
    d1Initialized = true
  }
  return res.success
}

export async function saveBrandAudit(record: BrandAuditRecord): Promise<void> {
  record.updatedAt = new Date().toISOString()
  if (!record.expiresAt) {
    const createdTime = record.createdAt ? new Date(record.createdAt).getTime() : Date.now()
    record.expiresAt = new Date(createdTime + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
  inMemoryAudits[record.id] = record
  saveLocalStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1AuditTable()
      const sql = `
        INSERT INTO brand_audits (id, company, email, scope, medium, status, quality_score, coverage_pct, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          company = excluded.company,
          email = excluded.email,
          scope = excluded.scope,
          medium = excluded.medium,
          status = excluded.status,
          quality_score = excluded.quality_score,
          coverage_pct = excluded.coverage_pct,
          data = excluded.data,
          updated_at = datetime('now');
      `
      await executeD1Query(sql, [
        record.id,
        record.company,
        record.email || '',
        record.scope,
        record.medium,
        record.status,
        record.qualityScore,
        record.coveragePct,
        JSON.stringify(record),
        record.createdAt,
      ])
    } catch (e) {
      console.warn('[BrandAudit D1 save fallback to memory]', e)
    }
  }
}

function ensureExpiresAt(record: BrandAuditRecord): BrandAuditRecord {
  if (!record.expiresAt) {
    const createdTime = record.createdAt ? new Date(record.createdAt).getTime() : Date.now()
    record.expiresAt = new Date(createdTime + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
  return record
}

export async function getBrandAuditById(id: string): Promise<BrandAuditRecord | null> {
  if (inMemoryAudits[id]) {
    return ensureExpiresAt(inMemoryAudits[id])
  }

  loadLocalStore()
  if (inMemoryAudits[id]) {
    return ensureExpiresAt(inMemoryAudits[id])
  }

  if (isCloudflareConfigured()) {
    try {
      await initD1AuditTable()
      const sql = `SELECT data FROM brand_audits WHERE id = ? LIMIT 1;`
      const res = await executeD1Query<{ data: string }>(sql, [id])
      if (res.success && res.results && res.results.length > 0) {
        const row = res.results[0]
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        if (parsed) {
          inMemoryAudits[id] = ensureExpiresAt(parsed)
          return inMemoryAudits[id]
        }
      }
    } catch (e) {
      console.warn('[BrandAudit D1 get error]', e)
    }
  }

  return null
}

export async function listBrandAudits(): Promise<BrandAuditRecord[]> {
  loadLocalStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1AuditTable()
      const sql = `SELECT data FROM brand_audits ORDER BY updated_at DESC LIMIT 100;`
      const res = await executeD1Query<{ data: string }>(sql)
      if (res.success && res.results) {
        for (const row of res.results) {
          try {
            const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
            if (parsed && parsed.id) {
              inMemoryAudits[parsed.id] = ensureExpiresAt(parsed)
            }
          } catch (err) {
            console.warn('[BrandAudit parse row error]', err)
          }
        }
      }
    } catch (e) {
      console.warn('[BrandAudit D1 list error]', e)
    }
  }

  return Object.values(inMemoryAudits)
    .map(ensureExpiresAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function deleteBrandAudit(id: string): Promise<boolean> {
  delete inMemoryAudits[id]
  saveLocalStore()

  if (isCloudflareConfigured()) {
    try {
      const sql = `DELETE FROM brand_audits WHERE id = ?;`
      const res = await executeD1Query(sql, [id])
      return res.success
    } catch (e) {
      console.warn('[BrandAudit D1 delete error]', e)
    }
  }
  return true
}
