export type ResourceType = 'article' | 'download' | 'tool'
export type ResourceStatus = 'draft' | 'published' | 'archived'

export interface ResourceCategory {
  id: string
  name: string
  nameMn: string
  slug: string
  description?: string
  sortOrder?: number
}

export interface DownloadFileItem {
  id: string
  name: string
  fileUrl: string
  fileSize?: string
  format: string // 'PDF' | 'ZIP' | 'AI' | 'FIG' etc.
  description?: string
}

export interface ResourceItem {
  id: string
  type: ResourceType
  title: string
  slug: string
  summary: string
  coverImage: string
  category: string // Category ID
  tags: string[]
  content: string // Rich Text / Structured Markdown
  downloadFiles: DownloadFileItem[]
  destinationUrl?: string // For tool type
  ctaLabel: string // 'Read Guide', 'Download PDF', 'Open Tool'
  featured: boolean
  sortOrder: number
  readTimeMinutes?: number
  author?: {
    name: string
    role: string
    avatar?: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  status: ResourceStatus
  viewsCount: number
  downloadsCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface ResourceAsset {
  id: string
  fileName: string
  mimeType: string
  fileSize: number
  dataBase64: string
  createdAt: string
}
