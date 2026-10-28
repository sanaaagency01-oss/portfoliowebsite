/**
 * Cloudflare D1 & R2 Integration
 * Enables serverless edge database persistence and object storage.
 */

import { Project } from './types/studio'

export interface CloudflareConfig {
  accountId: string
  databaseId: string
  apiToken: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  r2BucketName?: string
}

export function getCloudflareConfig(): CloudflareConfig | null {
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim()
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim()
  const accountId =
    process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim() ||
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim()

  if (!databaseId || !apiToken || !accountId) {
    return null
  }

  return {
    accountId,
    databaseId,
    apiToken,
    r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim(),
    r2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim(),
    r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim() || 'baysaass',
  }
}

export function isCloudflareConfigured(): boolean {
  return getCloudflareConfig() !== null
}

/**
 * Executes a SQL query against Cloudflare D1 database via Cloudflare REST API.
 */
export async function executeD1Query<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ success: boolean; results: T[]; meta?: any; error?: string }> {
  const config = getCloudflareConfig()
  if (!config) {
    return { success: false, results: [], error: 'Cloudflare D1 is not configured in environment variables' }
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`
    const body: { sql: string; params?: any[] } = { sql }
    if (params.length > 0) {
      body.params = params
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, results: [], error: `HTTP ${res.status}: ${errText}` }
    }

    const data = await res.json()
    if (!data.success) {
      return {
        success: false,
        results: [],
        error: data.errors?.[0]?.message || 'Query failed',
      }
    }

    const firstResult = data.result?.[0]
    return {
      success: true,
      results: firstResult?.results || [],
      meta: firstResult?.meta,
    }
  } catch (e: any) {
    console.error('[Cloudflare D1 Query Error]', e)
    return { success: false, results: [], error: e.message }
  }
}

/**
 * Initializes the D1 database tables if not already created.
 */
export async function initCloudflareD1Schema(): Promise<boolean> {
  const sql = `
    CREATE TABLE IF NOT EXISTS studio_projects (
      token TEXT PRIMARY KEY,
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studio_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `
  const res = await executeD1Query(sql)
  return res.success
}

/**
 * Upserts a single project into Cloudflare D1.
 */
export async function syncProjectToCloudflareD1(project: Project): Promise<boolean> {
  if (!isCloudflareConfigured()) return false

  const sql = `
    INSERT INTO studio_projects (token, id, name, company, status, data, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(token) DO UPDATE SET
      id = excluded.id,
      name = excluded.name,
      company = excluded.company,
      status = excluded.status,
      data = excluded.data,
      updated_at = datetime('now');
  `
  const res = await executeD1Query(sql, [
    project.token,
    project.id,
    project.name,
    project.company,
    project.status,
    JSON.stringify(project),
  ])
  return res.success
}

/**
 * Deletes a project from Cloudflare D1.
 */
export async function deleteProjectFromCloudflareD1(token: string): Promise<boolean> {
  if (!isCloudflareConfigured()) return false

  const sql = `DELETE FROM studio_projects WHERE token = ?;`
  const res = await executeD1Query(sql, [token])
  return res.success
}

/**
 * Fetches all projects from Cloudflare D1.
 */
export async function fetchProjectsFromCloudflareD1(): Promise<Record<string, Project> | null> {
  if (!isCloudflareConfigured()) return null

  const sql = `SELECT token, data FROM studio_projects;`
  const res = await executeD1Query<{ token: string; data: string }>(sql)

  if (!res.success || !res.results) return null

  const map: Record<string, Project> = {}
  for (const row of res.results) {
    try {
      const proj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      if (proj && proj.token) {
        map[proj.token] = proj
      }
    } catch (e) {
      console.warn('Failed parsing D1 project row', row.token, e)
    }
  }

  return map
}

/**
 * Syncs full Studio store or metadata to Cloudflare D1.
 */
export async function syncStoreToCloudflareD1(key: string, value: any): Promise<boolean> {
  if (!isCloudflareConfigured()) return false

  const sql = `
    INSERT INTO studio_meta (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now');
  `
  const res = await executeD1Query(sql, [key, JSON.stringify(value)])
  return res.success
}

/**
 * Fetches metadata from Cloudflare D1.
 */
export async function fetchMetaFromCloudflareD1<T = any>(key: string): Promise<T | null> {
  if (!isCloudflareConfigured()) return null

  const sql = `SELECT value FROM studio_meta WHERE key = ? LIMIT 1;`
  const res = await executeD1Query<{ value: string }>(sql, [key])

  if (!res.success || !res.results || res.results.length === 0) return null

  try {
    return JSON.parse(res.results[0].value) as T
  } catch (e) {
    return null
  }
}

/**
 * Checks Cloudflare connection health status.
 */
export async function checkCloudflareHealth(): Promise<{
  configured: boolean
  d1: { ok: boolean; latencyMs?: number; error?: string }
  r2: { ok: boolean; bucket?: string }
}> {
  const config = getCloudflareConfig()
  if (!config) {
    return {
      configured: false,
      d1: { ok: false, error: 'Not configured' },
      r2: { ok: false },
    }
  }

  const start = Date.now()
  const d1Res = await executeD1Query('SELECT 1 as test;')
  const latencyMs = Date.now() - start

  return {
    configured: true,
    d1: {
      ok: d1Res.success,
      latencyMs: d1Res.success ? latencyMs : undefined,
      error: d1Res.error,
    },
    r2: {
      ok: Boolean(config.r2AccessKeyId && config.r2SecretAccessKey),
      bucket: config.r2BucketName,
    },
  }
}
