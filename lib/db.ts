import fs from 'fs'
import path from 'path'
import { Project, VisualComment, ProjectMessage } from './types/studio'
import { calculateProjectProgress } from './studio-utils'
import {
  syncProjectToCloudflareD1,
  syncStoreToCloudflareD1,
  fetchProjectsFromCloudflareD1,
  deleteProjectFromCloudflareD1,
  executeD1Query,
  isCloudflareConfigured,
  fetchMetaFromCloudflareD1,
} from './cloudflare'

interface StudioStore {
  projects: Record<string, Project>
  comments: Record<string, VisualComment[]>
  messages?: Record<string, ProjectMessage[]>
}

// In-memory cache across serverless warm requests
let inMemoryStore: StudioStore | null = null

// Serverless detection (Vercel / AWS Lambda have read-only root filesystems)
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
)

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_STORE_FILE = path.join(LOCAL_DATA_DIR, 'studio-store.json')
const TMP_STORE_FILE = path.join('/tmp', 'studio-store.json')

function getStoreFilePath(): string {
  return IS_SERVERLESS ? TMP_STORE_FILE : LOCAL_STORE_FILE
}

function ensureStoreExists(): StudioStore {
  if (inMemoryStore) {
    return inMemoryStore
  }

  const initialData: StudioStore = {
    projects: {},
    comments: {},
    messages: {},
  }

  // 1. Try reading from /tmp if in serverless environment
  if (IS_SERVERLESS && fs.existsSync(TMP_STORE_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_STORE_FILE, 'utf-8')
      const parsed = JSON.parse(raw) as StudioStore
      inMemoryStore = {
        projects: parsed.projects || {},
        comments: parsed.comments || {},
        messages: parsed.messages || {},
      }
      return inMemoryStore
    } catch (e) {
      console.warn('Failed reading from /tmp/studio-store.json', e)
    }
  }

  // 2. Try reading from bundled data/studio-store.json
  if (fs.existsSync(LOCAL_STORE_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8')
      const parsed = JSON.parse(raw) as StudioStore
      inMemoryStore = {
        projects: parsed.projects || {},
        comments: parsed.comments || {},
        messages: parsed.messages || {},
      }
      return inMemoryStore
    } catch (e) {
      console.warn('Failed reading from bundled studio-store.json', e)
    }
  }

  inMemoryStore = initialData
  return inMemoryStore
}

function saveStore(store: StudioStore): void {
  inMemoryStore = store

  // Safe file write that NEVER throws or crashes the serverless process
  try {
    const targetFile = getStoreFilePath()
    const targetDir = path.dirname(targetFile)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    fs.writeFileSync(targetFile, JSON.stringify(store, null, 2), 'utf-8')
  } catch (fsErr) {
    // If writing to process.cwd() failed with EROFS (read-only filesystem), fallback to /tmp
    try {
      if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp', { recursive: true })
      }
      fs.writeFileSync(TMP_STORE_FILE, JSON.stringify(store, null, 2), 'utf-8')
    } catch (tmpErr) {
      // In-memory cache handles current runtime
      console.warn('Filesystem is read-only, maintained in-memory cache:', tmpErr)
    }
  }

  // If Cloudflare D1 is configured, sync in background without throwing
  if (isCloudflareConfigured()) {
    syncStoreToCloudflareD1('studio_store', store).catch((e) =>
      console.warn('Background sync to Cloudflare D1 error:', e)
    )
  }
}

// ------------------- Project CRUD -------------------
export function normalizeProject(data: any): Project {
  if (!data) {
    throw new Error('Project data is empty')
  }

  return {
    id: data.id || `proj_${Date.now()}`,
    token: data.token || Math.random().toString(36).substring(2, 9),
    name: data.name || 'Шинэ төсөл',
    company: data.company || 'Захиалагч байгууллага',
    contactName: data.contactName || 'Захиалагч',
    email: data.email || '',
    phone: data.phone || '',
    type: data.type || 'Brand Identity',
    status: data.status || 'lead',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    due: data.due || 'Товлоогүй',
    createdAt: data.createdAt || new Date().toISOString(),
    contract: data.contract ? {
      number: data.contract.number || `BT-${new Date().getFullYear()}-000`,
      date: data.contract.date || new Date().toISOString().split('T')[0],
      start: data.contract.start || new Date().toISOString().split('T')[0],
      end: data.contract.end || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      total: data.contract.total || 0,
      revisions: data.contract.revisions || 2,
      status: data.contract.status || 'draft',
      isPublishedToClient: Boolean(data.contract.isPublishedToClient),
      tasks: data.contract.tasks || [],
      deliverables: data.contract.deliverables || [],
      stages: data.contract.stages || [],
      customSections: data.contract.customSections || [],
      proposalNote: data.contract.proposalNote || '',
      clientNote: data.contract.clientNote || '',
      proposals: data.contract.proposals || [],
    } : {
      number: `BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      total: 0,
      revisions: 2,
      status: 'draft',
      isPublishedToClient: false,
      tasks: [],
      deliverables: [],
      stages: [],
      customSections: [],
      proposalNote: '',
      clientNote: '',
      proposals: [],
    },
    brief: data.brief || {
      answers: {},
      messages: [],
      progress: 0,
      complete: false,
    },
    assets: data.assets || [],
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (isCloudflareConfigured()) {
    try {
      const d1Projects = await fetchProjectsFromCloudflareD1()
      if (d1Projects !== null) {
        const store = ensureStoreExists()
        const normalizedMap: Record<string, Project> = {}
        for (const [t, p] of Object.entries(d1Projects)) {
          normalizedMap[t] = normalizeProject(p)
        }
        store.projects = { ...store.projects, ...normalizedMap }
        return Object.values(normalizedMap).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }
    } catch (e) {
      console.warn('Failed fetching from Cloudflare D1, falling back to local store', e)
    }
  }

  const store = ensureStoreExists()
  return Object.values(store.projects).map(normalizeProject).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getProjectByToken(token: string): Promise<Project | null> {
  if (isCloudflareConfigured()) {
    try {
      const sql = `SELECT data FROM studio_projects WHERE token = ? LIMIT 1;`
      const res = await executeD1Query<{ data: string }>(sql, [token])
      if (res.success && res.results && res.results.length > 0) {
        const row = res.results[0]
        const proj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        if (proj && proj.token) {
          const normalized = normalizeProject(proj)
          const store = ensureStoreExists()
          store.projects[token] = normalized
          return normalized
        }
      }
    } catch (e) {
      console.warn('Failed reading project from D1, falling back to local', e)
    }
  }

  const store = ensureStoreExists()
  const local = store.projects[token]
  return local ? normalizeProject(local) : null
}

export async function deleteProject(token: string): Promise<boolean> {
  const store = ensureStoreExists()
  if (store.projects[token]) {
    delete store.projects[token]
    saveStore(store)
  }

  if (isCloudflareConfigured()) {
    try {
      await deleteProjectFromCloudflareD1(token)
    } catch (e) {
      console.warn('Failed deleting project from Cloudflare D1', e)
    }
  }

  return true
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const store = ensureStoreExists()
  const token = data.token || Math.random().toString(36).substring(2, 9)
  const id = data.id || `proj_${Date.now()}`

  const newProject: Project = {
    id,
    token,
    name: data.name || 'Шинэ төсөл',
    company: data.company || 'Захиалагч байгууллага',
    contactName: data.contactName || 'Захиалагч',
    email: data.email || '',
    phone: data.phone || '',
    type: data.type || 'Brand Identity',
    status: data.status || 'lead',
    progress: data.progress || 0,
    due: data.due || 'Товлоогүй',
    createdAt: new Date().toISOString(),
    contract: data.contract || {
      number: `BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      total: 0,
      revisions: 2,
      status: 'draft',
      isPublishedToClient: false,
      tasks: [],
      deliverables: [],
      stages: [],
      customSections: [],
    },
    brief: data.brief || {
      answers: {},
      messages: [{ role: 'AI', content: 'Сайн байна уу! Би Baysaass студийн AI зөвлөх байна. Танд ямар чиглэлийн дизайн шаардлагатай вэ?' }],
      progress: 0,
      complete: false,
    },
    assets: data.assets || [],
  }

  store.projects[token] = newProject
  saveStore(store)

  if (isCloudflareConfigured()) {
    try {
      await syncProjectToCloudflareD1(newProject)
    } catch (e) {
      console.warn('Sync project to Cloudflare D1 error:', e)
    }
  }

  return newProject
}

export async function updateProject(token: string, updates: Partial<Project>): Promise<Project | null> {
  // Ensure we have current project state
  let existing = await getProjectByToken(token)
  const store = ensureStoreExists()
  if (!existing) {
    existing = store.projects[token]
  }
  if (!existing) return null

  let updatedContract = existing.contract
  if (updates.contract) {
    updatedContract = {
      ...existing.contract,
      ...updates.contract,
    }
  }

  // Calculate progress dynamically: prioritize contract.tasks if present, else deliverables
  let calculatedProgress = updates.progress !== undefined ? updates.progress : existing.progress
  if (updatedContract.tasks?.length || updatedContract.deliverables?.length) {
    calculatedProgress = calculateProjectProgress(updatedContract)
  }

  // Activate project status once contract is signed
  let updatedStatus = updates.status || existing.status
  if (updatedContract.status === 'signed' && (updatedStatus === 'lead' || updatedStatus === 'contract_pending')) {
    updatedStatus = 'active'
  }

  const updatedProject: Project = {
    ...existing,
    ...updates,
    status: updatedStatus,
    progress: calculatedProgress,
    contract: updatedContract,
  }

  store.projects[token] = updatedProject
  saveStore(store)

  if (isCloudflareConfigured()) {
    try {
      await syncProjectToCloudflareD1(updatedProject)
    } catch (e) {
      console.warn('Sync updated project to Cloudflare D1 error:', e)
    }
  }

  return updatedProject
}

// ------------------- Visual Comments CRUD -------------------
export async function getCommentsByAsset(assetId: string): Promise<VisualComment[]> {
  const store = ensureStoreExists()
  if (!store.comments[assetId] && isCloudflareConfigured()) {
    try {
      const meta = await fetchMetaFromCloudflareD1<StudioStore>('studio_store')
      if (meta?.comments) {
        store.comments = { ...store.comments, ...meta.comments }
      }
    } catch (e) {
      // ignore
    }
  }
  return store.comments[assetId] || []
}

export async function createComment(commentData: Omit<VisualComment, 'id' | 'createdAt' | 'status' | 'replies'>): Promise<VisualComment> {
  const store = ensureStoreExists()
  const id = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const newComment: VisualComment = {
    ...commentData,
    id,
    status: 'open',
    createdAt: new Date().toISOString(),
    replies: [],
  }

  if (!store.comments[commentData.assetId]) {
    store.comments[commentData.assetId] = []
  }

  store.comments[commentData.assetId].push(newComment)
  saveStore(store)
  return newComment
}

export async function resolveComment(assetId: string, commentId: string): Promise<boolean> {
  const store = ensureStoreExists()
  const list = store.comments[assetId]
  if (!list) return false

  const comment = list.find((c) => c.id === commentId)
  if (!comment) return false

  comment.status = comment.status === 'resolved' ? 'open' : 'resolved'
  saveStore(store)
  return true
}

export async function addCommentReply(
  assetId: string,
  commentId: string,
  reply: { authorRole: 'CLIENT' | 'DESIGNER'; authorName: string; content: string }
): Promise<VisualComment | null> {
  const store = ensureStoreExists()
  const list = store.comments[assetId]
  if (!list) return null

  const comment = list.find((c) => c.id === commentId)
  if (!comment) return null

  if (!comment.replies) comment.replies = []
  comment.replies.push({
    id: `rep_${Date.now()}`,
    ...reply,
    createdAt: new Date().toISOString(),
  })

  saveStore(store)
  return comment
}

// ------------------- Project Messages (Conversation / Харилцан яриа) -------------------
export async function getProjectMessages(projectToken: string): Promise<ProjectMessage[]> {
  const store = ensureStoreExists()
  if ((!store.messages || !store.messages[projectToken]) && isCloudflareConfigured()) {
    try {
      const meta = await fetchMetaFromCloudflareD1<StudioStore>('studio_store')
      if (meta?.messages) {
        store.messages = { ...store.messages, ...meta.messages }
      }
    } catch (e) {
      // ignore
    }
  }
  return store.messages?.[projectToken] || []
}

export async function addProjectMessage(
  data: Omit<ProjectMessage, 'id' | 'createdAt'>
): Promise<ProjectMessage> {
  const store = ensureStoreExists()
  if (!store.messages) store.messages = {}
  if (!store.messages[data.projectToken]) {
    store.messages[data.projectToken] = []
  }

  const newMessage: ProjectMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    createdAt: new Date().toISOString(),
  }

  store.messages[data.projectToken].push(newMessage)
  saveStore(store)
  return newMessage
}
