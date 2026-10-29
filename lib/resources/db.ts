import fs from 'fs'
import path from 'path'
import { ResourceItem, ResourceCategory, ResourceAsset, ResourceStatus, ResourceType } from './types'
import { DEFAULT_CATEGORIES, DEFAULT_RESOURCES } from './defaults'
import { executeD1Query, isCloudflareConfigured } from '../cloudflare'

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
)

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_STORE_FILE = path.join(LOCAL_DATA_DIR, 'resources-store.json')
const TMP_STORE_FILE = path.join('/tmp', 'resources-store.json')

interface ResourcesStore {
  resources: Record<string, ResourceItem>
  categories: Record<string, ResourceCategory>
  assets: Record<string, ResourceAsset>
}

let inMemoryStore: ResourcesStore | null = null
let d1Initialized = false

function getStoreFilePath(): string {
  return IS_SERVERLESS ? TMP_STORE_FILE : LOCAL_STORE_FILE
}

function ensureInitialStore(): ResourcesStore {
  if (inMemoryStore) return inMemoryStore

  const initial: ResourcesStore = {
    resources: {},
    categories: {},
    assets: {},
  }

  // Pre-seed default categories
  for (const cat of DEFAULT_CATEGORIES) {
    initial.categories[cat.id] = cat
  }

  // Pre-seed default resources
  for (const res of DEFAULT_RESOURCES) {
    initial.resources[res.id] = res
  }

  const targetFile = getStoreFilePath()
  try {
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, 'utf-8')
      const parsed = JSON.parse(raw) as ResourcesStore
      if (parsed && typeof parsed === 'object') {
        initial.resources = { ...initial.resources, ...(parsed.resources || {}) }
        initial.categories = { ...initial.categories, ...(parsed.categories || {}) }
        initial.assets = { ...initial.assets, ...(parsed.assets || {}) }
      }
    }
  } catch (e) {
    console.warn('[Resources store file load error]', e)
  }

  inMemoryStore = initial
  return inMemoryStore
}

function saveStore(): void {
  if (!inMemoryStore) return
  try {
    const targetFile = getStoreFilePath()
    const targetDir = path.dirname(targetFile)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    fs.writeFileSync(targetFile, JSON.stringify(inMemoryStore, null, 2), 'utf-8')
  } catch (fsErr) {
    try {
      if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp', { recursive: true })
      }
      fs.writeFileSync(TMP_STORE_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8')
    } catch (tmpErr) {
      console.warn('[Resources file write failed]', tmpErr)
    }
  }
}

async function initD1ResourcesSchema(): Promise<boolean> {
  if (d1Initialized || !isCloudflareConfigured()) return d1Initialized
  const sql = `
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
    CREATE TABLE IF NOT EXISTS resource_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_mn TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS resource_assets (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      data_base64 TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `
  const res = await executeD1Query(sql)
  if (res.success) {
    d1Initialized = true
  }
  return res.success
}

export async function getAllResources(options?: {
  status?: ResourceStatus
  category?: string
  type?: ResourceType
  featured?: boolean
  search?: string
}): Promise<ResourceItem[]> {
  const store = ensureInitialStore()

  // Try Cloudflare D1 first
  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      let sql = `SELECT data FROM resources WHERE 1=1`
      const params: any[] = []

      if (options?.status) {
        sql += ` AND status = ?`
        params.push(options.status)
      }
      if (options?.category && options.category !== 'all') {
        sql += ` AND category = ?`
        params.push(options.category)
      }
      if (options?.type) {
        sql += ` AND type = ?`
        params.push(options.type)
      }
      if (options?.featured) {
        sql += ` AND featured = 1`
      }

      sql += ` ORDER BY updated_at DESC LIMIT 200;`
      const res = await executeD1Query<{ data: string }>(sql, params)
      if (res.success && res.results && res.results.length > 0) {
        const d1Items: ResourceItem[] = []
        for (const row of res.results) {
          try {
            const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
            if (parsed && parsed.id) {
              d1Items.push(parsed)
              store.resources[parsed.id] = parsed
            }
          } catch (err) {
            console.warn('Error parsing resource row from D1', err)
          }
        }
        if (d1Items.length > 0) {
          return applySearchAndSort(d1Items, options?.search)
        }
      }
    } catch (e) {
      console.warn('[D1 resources fetch error]', e)
    }
  }

  // Fallback to in-memory / local store
  let list = Object.values(store.resources)

  if (options?.status) {
    list = list.filter((r) => r.status === options.status)
  }
  if (options?.category && options.category !== 'all') {
    list = list.filter((r) => r.category === options.category)
  }
  if (options?.type) {
    list = list.filter((r) => r.type === options.type)
  }
  if (options?.featured) {
    list = list.filter((r) => r.featured)
  }

  return applySearchAndSort(list, options?.search)
}

function applySearchAndSort(items: ResourceItem[], search?: string): ResourceItem[] {
  let result = items
  if (search && search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  return result.sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export async function getResourceBySlug(slug: string): Promise<ResourceItem | null> {
  const store = ensureInitialStore()

  // Match local first
  const localMatch = Object.values(store.resources).find((r) => r.slug === slug)
  if (localMatch) return localMatch

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `SELECT data FROM resources WHERE slug = ? LIMIT 1;`
      const res = await executeD1Query<{ data: string }>(sql, [slug])
      if (res.success && res.results && res.results.length > 0) {
        const row = res.results[0]
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        if (parsed) {
          store.resources[parsed.id] = parsed
          return parsed
        }
      }
    } catch (e) {
      console.warn('[D1 getResourceBySlug error]', e)
    }
  }

  return null
}

export async function getResourceById(id: string): Promise<ResourceItem | null> {
  const store = ensureInitialStore()
  if (store.resources[id]) return store.resources[id]

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `SELECT data FROM resources WHERE id = ? LIMIT 1;`
      const res = await executeD1Query<{ data: string }>(sql, [id])
      if (res.success && res.results && res.results.length > 0) {
        const parsed = typeof res.results[0].data === 'string' ? JSON.parse(res.results[0].data) : res.results[0].data
        if (parsed) {
          store.resources[parsed.id] = parsed
          return parsed
        }
      }
    } catch (e) {
      console.warn('[D1 getResourceById error]', e)
    }
  }

  return null
}

export async function saveResource(item: ResourceItem): Promise<void> {
  const store = ensureInitialStore()
  item.updatedAt = new Date().toISOString()
  if (item.status === 'published' && !item.publishedAt) {
    item.publishedAt = new Date().toISOString()
  }

  store.resources[item.id] = item
  saveStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `
        INSERT INTO resources (id, slug, type, title, category, status, featured, data, created_at, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
        ON CONFLICT(id) DO UPDATE SET
          slug = excluded.slug,
          type = excluded.type,
          title = excluded.title,
          category = excluded.category,
          status = excluded.status,
          featured = excluded.featured,
          data = excluded.data,
          updated_at = datetime('now'),
          published_at = excluded.published_at;
      `
      await executeD1Query(sql, [
        item.id,
        item.slug,
        item.type,
        item.title,
        item.category,
        item.status,
        item.featured ? 1 : 0,
        JSON.stringify(item),
        item.createdAt,
        item.publishedAt || null,
      ])
    } catch (e) {
      console.warn('[D1 saveResource error, fallback to memory]', e)
    }
  }
}

export async function deleteResource(id: string): Promise<boolean> {
  const store = ensureInitialStore()
  delete store.resources[id]
  saveStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `DELETE FROM resources WHERE id = ?;`
      const res = await executeD1Query(sql, [id])
      return res.success
    } catch (e) {
      console.warn('[D1 deleteResource error]', e)
    }
  }

  return true
}

export async function getAllCategories(): Promise<ResourceCategory[]> {
  const store = ensureInitialStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `SELECT * FROM resource_categories ORDER BY sort_order ASC;`
      const res = await executeD1Query<any>(sql)
      if (res.success && res.results && res.results.length > 0) {
        const cats: ResourceCategory[] = res.results.map((r: any) => ({
          id: r.id,
          name: r.name,
          nameMn: r.name_mn,
          slug: r.slug,
          description: r.description,
          sortOrder: r.sort_order,
        }))
        for (const c of cats) {
          store.categories[c.id] = c
        }
        return cats
      }
    } catch (e) {
      console.warn('[D1 getAllCategories error]', e)
    }
  }

  return Object.values(store.categories).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
}

export async function saveCategory(category: ResourceCategory): Promise<void> {
  const store = ensureInitialStore()
  store.categories[category.id] = category
  saveStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `
        INSERT INTO resource_categories (id, name, name_mn, slug, description, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          name_mn = excluded.name_mn,
          slug = excluded.slug,
          description = excluded.description,
          sort_order = excluded.sort_order;
      `
      await executeD1Query(sql, [
        category.id,
        category.name,
        category.nameMn,
        category.slug,
        category.description || '',
        category.sortOrder || 0,
      ])
    } catch (e) {
      console.warn('[D1 saveCategory error]', e)
    }
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  const store = ensureInitialStore()
  delete store.categories[id]
  saveStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `DELETE FROM resource_categories WHERE id = ?;`
      const res = await executeD1Query(sql, [id])
      return res.success
    } catch (e) {
      console.warn('[D1 deleteCategory error]', e)
    }
  }

  return true
}

export async function saveAsset(asset: ResourceAsset): Promise<void> {
  const store = ensureInitialStore()
  store.assets[asset.id] = asset
  saveStore()

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `
        INSERT INTO resource_assets (id, file_name, mime_type, file_size, data_base64, created_at)
        VALUES (?, ?, ?, ?, ?, ?);
      `
      await executeD1Query(sql, [
        asset.id,
        asset.fileName,
        asset.mimeType,
        asset.fileSize,
        asset.dataBase64,
        asset.createdAt,
      ])
    } catch (e) {
      console.warn('[D1 saveAsset error]', e)
    }
  }
}

export async function getAssetById(id: string): Promise<ResourceAsset | null> {
  const store = ensureInitialStore()
  if (store.assets[id]) return store.assets[id]

  if (isCloudflareConfigured()) {
    try {
      await initD1ResourcesSchema()
      const sql = `SELECT * FROM resource_assets WHERE id = ? LIMIT 1;`
      const res = await executeD1Query<any>(sql, [id])
      if (res.success && res.results && res.results.length > 0) {
        const row = res.results[0]
        const asset: ResourceAsset = {
          id: row.id,
          fileName: row.file_name,
          mimeType: row.mime_type,
          fileSize: row.file_size,
          dataBase64: row.data_base64,
          createdAt: row.created_at,
        }
        store.assets[asset.id] = asset
        return asset
      }
    } catch (e) {
      console.warn('[D1 getAssetById error]', e)
    }
  }

  return null
}

export async function incrementResourceViews(id: string): Promise<void> {
  const item = await getResourceById(id)
  if (item) {
    item.viewsCount = (item.viewsCount || 0) + 1
    await saveResource(item)
  }
}

export async function incrementResourceDownloads(id: string): Promise<void> {
  const item = await getResourceById(id)
  if (item) {
    item.downloadsCount = (item.downloadsCount || 0) + 1
    await saveResource(item)
  }
}
