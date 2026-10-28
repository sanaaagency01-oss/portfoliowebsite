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
} from './cloudflare'

const DATA_DIR = path.join(process.cwd(), 'data')
const STORE_FILE = path.join(DATA_DIR, 'studio-store.json')

interface StudioStore {
  projects: Record<string, Project>
  comments: Record<string, VisualComment[]>
  messages?: Record<string, ProjectMessage[]>
}

function ensureStoreExists(): StudioStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(STORE_FILE)) {
    const initialData: StudioStore = {
      projects: {},
      comments: {},
      messages: {},
    }

    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8')
    const store = JSON.parse(raw) as StudioStore
    if (!store.projects) store.projects = {}
    if (!store.comments) store.comments = {}
    if (!store.messages) store.messages = {}
    return store
  } catch (err) {
    console.error('Failed reading studio-store.json, creating fallback', err)
    return { projects: {}, comments: {}, messages: {} }
  }
}

function saveStore(store: StudioStore): void {
  ensureStoreExists()
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8')
  if (isCloudflareConfigured()) {
    syncStoreToCloudflareD1('studio_store', store).catch((e) =>
      console.warn('Background sync to Cloudflare D1 error:', e)
    )
  }
}

// ------------------- Project CRUD -------------------
export async function getAllProjects(): Promise<Project[]> {
  if (isCloudflareConfigured()) {
    try {
      const d1Projects = await fetchProjectsFromCloudflareD1()
      if (d1Projects !== null) {
        return Object.values(d1Projects).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }
    } catch (e) {
      console.warn('Failed fetching from Cloudflare D1, falling back to local store', e)
    }
  }

  const store = ensureStoreExists()
  return Object.values(store.projects).sort(
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
        if (proj && proj.token) return proj
      }
    } catch (e) {
      console.warn('Failed reading project from D1, falling back to local', e)
    }
  }

  const store = ensureStoreExists()
  return store.projects[token] || null
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
    syncProjectToCloudflareD1(newProject).catch((e) =>
      console.warn('Background sync project to Cloudflare D1 error:', e)
    )
  }

  return newProject
}

export async function updateProject(token: string, updates: Partial<Project>): Promise<Project | null> {
  const store = ensureStoreExists()
  const existing = store.projects[token]
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

  const updatedProject = {
    ...existing,
    ...updates,
    status: updatedStatus,
    progress: calculatedProgress,
    contract: updatedContract,
  }

  store.projects[token] = updatedProject
  saveStore(store)

  if (isCloudflareConfigured()) {
    syncProjectToCloudflareD1(updatedProject).catch((e) =>
      console.warn('Background sync updated project to Cloudflare D1 error:', e)
    )
  }

  return updatedProject
}

// ------------------- Visual Comments CRUD -------------------
export async function getCommentsByAsset(assetId: string): Promise<VisualComment[]> {
  const store = ensureStoreExists()
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

