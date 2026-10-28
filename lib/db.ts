import fs from 'fs'
import path from 'path'
import { Project, VisualComment, ProjectMessage } from './types/studio'
import { calculateProjectProgress } from './studio-utils'
import {
  syncProjectToCloudflareD1,
  syncStoreToCloudflareD1,
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
      projects: {
        '7xK92m': {
          id: 'proj_lumen_house',
          token: '7xK92m',
          name: 'Signature Lounge — Брэндийн Дизайны Үйлчилгээ',
          company: 'BeautyTech LLC',
          contactName: 'Бат Болд',
          email: 'bat@beautytech.mn',
          phone: '+976 99112233',
          type: 'Brand Identity',
          status: 'review_needed',
          progress: 72,
          due: '2026-06-30',
          createdAt: new Date().toISOString(),
          contract: {
            number: 'BT-2026-001',
            date: '2026-04-22',
            start: '2026-04-22',
            end: '2026-06-30',
            total: 3500000,
            revisions: 2,
            status: 'draft',
            deliverables: [
              { id: 'del_1', name: 'Лого систем', description: 'Үндсэн болон туслах логоны хувилбарууд', quantity: '1', due: '2026-05-10', status: 'approved' },
              { id: 'del_2', name: 'Брэндбүүк', description: 'Брэндийн хэрэглээний заавар, 24 хуудас', quantity: '1', due: '2026-06-30', status: 'in_progress' },
              { id: 'del_3', name: 'Эх файлууд', description: 'AI, EPS, SVG, PNG, PDF форматууд', quantity: '1', due: '2026-06-30', status: 'pending' },
            ],
            stages: [
              { id: 'st_1', name: 'Судалгаа ба Нээлт', result: 'Шаардлагын баримт (brief), судалгааны тайлан, байршлын тодорхойлолт', payment: '50% урьдчилгаа', completed: true },
              { id: 'st_2', name: 'Стратеги', result: 'Брэндийн стратегийн баримт бичиг: байр суурь, зан чанар, утга санаа', payment: 'Суурь баримт батлагдсанаар', completed: true },
              { id: 'st_3', name: 'Дизайн боловсруулалт', result: 'Лого хувилбарууд, өнгөний систем, фонтын сонголт', payment: '30% төлбөр батлагдсаны дараа', completed: false },
              { id: 'st_4', name: 'Брендийн дүр төрх', result: 'Эцсийн лого систем, өнгөний систем, фонт, хэрэглээний жишээ', payment: 'Дүр төрх батлагдсанаар', completed: false },
              { id: 'st_5', name: 'Брэндбүүк & Хүлээлгэн өгөлт', result: 'Брэндбүүк (PDF), бүх эх файл (AI/EPS/SVG), экспорт файл', payment: '20% үлдэгдэл төлбөр', completed: false },
            ],
            customSections: [
              { title: 'Оюуны өмч ба нэмэлт ажил', content: 'Тохиролцоогүй нэмэлт ажил нь тусдаа үнийн санал болон бичгээр баталгаажилт шаардлагатай.' },
            ],
          },
          brief: {
            answers: {
              projectType: 'Brand identity',
              business: 'Сингапур, Солонгос стандартаар үйлчилдэг дээд зэрэглэлийн гоо сайхны лаунж & салон.',
              goal: 'Илүү premium харагдах, зах зээлд өөрийн байр суурийг өвөрмөцөөр тодорхойлох.',
              audience: '25-45 насны эмэгтэйчүүд, чанартай үйлчилгээ таашаадаг хэрэглэгчид.',
              style: 'Premium, Minimal, Elegant, Calming',
              deliverables: 'Лого систем, Өнгөний палитр, Сав баглаа боодол, Брэндбүүк',
            },
            messages: [
              { role: 'AI', content: 'Сайн байна уу! Би Baysaass студийн AI дизайн зөвлөх байна. Танд ямар чиглэлийн дизайн шаардлагатай вэ?' },
              { role: 'CLIENT', content: 'Бид шинэ дээд зэрэглэлийн lounge салон нээж байгаа, брэндинг цогцоор нь хийлгэмээр байна.' },
            ],
            progress: 85,
            complete: true,
            classifiedType: 'Brand Identity System',
            aestheticScore: 4.8,
            summary: 'Lumen Lounge - High-end premium beauty lounge brand identity.',
          },
          assets: [
            {
              id: 'asset_logo_v3',
              title: 'Logo Concept V3 — Modern Serif',
              description: 'Үндсэн тэмдэгт болон гар бичвэрийн тэнцвэртэй хослол бүхий хувилбар.',
              imageUrl: '/projects/beautytech llc logo/52730b202740915.668ba7ab75cda.webp',
              version: 'v3.0',
              type: 'concept',
              uploadedAt: new Date().toISOString(),
            },
            {
              id: 'asset_palette_v1',
              title: 'Color Palette & Typography System',
              description: 'Дулаан шороон өнгө, алтлаг саарал болон сонгодог фонтын найрлага.',
              imageUrl: '/projects/chandmani goyl/3bf4ea194423431.65fbbbf0bda70 6.webp',
              version: 'v1.0',
              type: 'concept',
              uploadedAt: new Date().toISOString(),
            },
          ],
        },
      },
      comments: {
        'asset_logo_v3': [
          {
            id: 'comm_1',
            projectToken: '7xK92m',
            assetId: 'asset_logo_v3',
            xPercent: 48.5,
            yPercent: 36.2,
            authorRole: 'CLIENT',
            authorName: 'Бат Болд',
            content: 'Тэмдэгтийн дээд нум хэсгийг жаахан нимгэлж, илүү хөнгөн харагдуулж болох уу?',
            status: 'open',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            replies: [
              {
                id: 'rep_1',
                authorRole: 'DESIGNER',
                authorName: 'Т. Өсөхбаяр',
                content: 'Санал ойлгомжтой, зураасын өргөнийг 20% танаад шинэчилсэн хувилбарыг оруулъя.',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
              },
            ],
          },
        ],
      },
    }

    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8')
    const store = JSON.parse(raw) as StudioStore
    if (!store.messages) {
      store.messages = {
        '7xK92m': [
          {
            id: 'msg_init_1',
            projectToken: '7xK92m',
            authorRole: 'DESIGNER',
            authorName: 'Т. Өсөхбаяр',
            content: 'Сайн байна уу, Бат! Төслийн явцын талаар ярилцах болон шинэчлэлтүүдийг хянах талбарт тавтай морил. Төслийн бүх явц энд нийтлэгдэх бөгөөд асуулт, санал байвал шууд бичиж үлдээнэ үү.',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'msg_init_2',
            projectToken: '7xK92m',
            authorRole: 'CLIENT',
            authorName: 'Бат Болд',
            content: 'Сайн байна уу, Өсөхөө. Логоны эхний хувилбаруудыг харлаа, ерөнхий өнгө аяс маш гоё болсон байна. V3 хувилбар дээр жижиг санал бичсэн байгаа шүү.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'msg_init_3',
            projectToken: '7xK92m',
            authorRole: 'DESIGNER',
            authorName: 'Т. Өсөхбаяр',
            content: 'Маш сайн байна! Саналыг хүлээн авлаа, үсгийн зураас болон тэмдэгтийн нумыг засварлаад шинэчилсэн хувилбарыг оруулах болно.',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8')
    }
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
  const store = ensureStoreExists()
  return Object.values(store.projects).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getProjectByToken(token: string): Promise<Project | null> {
  const store = ensureStoreExists()
  return store.projects[token] || null
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

