export type ProjectStatus =
  | 'lead'
  | 'brief_pending'
  | 'brief_submitted'
  | 'proposal_sent'
  | 'contract_pending'
  | 'active'
  | 'review_needed'
  | 'completed'

export type ProjectTask = {
  id: string
  name: string
  description: string
  due?: string
  completed: boolean
  completedAt?: string
}

export type DeliverableItem = {
  id: string
  name: string
  description: string
  quantity: string
  due: string
  status?: 'pending' | 'in_progress' | 'approved'
  completed?: boolean
  completedAt?: string
}

export type StageItem = {
  id: string
  name: string
  result: string
  payment: string
  completed?: boolean
}

export type CustomContractSection = {
  title: string
  content: string
}

export type ContractProposal = {
  id: string
  authorRole: 'CLIENT' | 'DESIGNER'
  authorName: string
  note: string
  deliverables?: DeliverableItem[]
  proposedTotal?: number
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

export type ProjectContract = {
  number: string
  date: string
  start: string
  end: string
  total: number
  revisions: number
  status: 'draft' | 'sent' | 'signed'
  isPublishedToClient?: boolean
  proposalNote?: string
  proposalSentAt?: string
  proposalAcceptedAt?: string
  tasks?: ProjectTask[]
  deliverables: DeliverableItem[]
  stages: StageItem[]
  customSections: CustomContractSection[]
  proposals?: ContractProposal[]
  clientNote?: string
  signedAt?: string
  clientName?: string
  clientEmail?: string
  signatureDataUrl?: string
}

export type ProjectMessage = {
  id: string
  projectToken: string
  authorRole: 'CLIENT' | 'DESIGNER'
  authorName: string
  content: string
  createdAt: string
}

export type VisualComment = {
  id: string
  projectToken: string
  assetId: string
  xPercent: number // 0 to 100
  yPercent: number // 0 to 100
  authorRole: 'CLIENT' | 'DESIGNER'
  authorName: string
  content: string
  status: 'open' | 'resolved'
  createdAt: string
  replies?: {
    id: string
    authorRole: 'CLIENT' | 'DESIGNER'
    authorName: string
    content: string
    createdAt: string
  }[]
}

export type DesignAsset = {
  id: string
  title: string
  description?: string
  imageUrl: string
  version: string
  type: 'concept' | 'revision' | 'final'
  uploadedAt: string
}

export type InvoiceItem = {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  amount: number
}

export type InvoiceInfo = {
  enabled: boolean
  invoiceNumber: string
  date: string
  dueDateDays: number
  contractor: {
    name: string
    company: string
    email: string
    phone: string
  }
  client: {
    name: string
    company: string
    email: string
    phone: string
    registerNumber?: string
  }
  items: InvoiceItem[]
  totalAmount: number
  advancePaid: number
  balanceDue: number
  bank: {
    bankName: string
    accountName: string
    accountNumber: string
    transactionValue: string
  }
  status?: 'draft' | 'sent' | 'paid'
  issuedAt?: string
}

export type VatInfo = {
  enabled: boolean
  type?: 'company' | 'individual'
  registerNumber?: string
  companyName?: string
  email?: string
  vatAmount?: number
  totalWithVat?: number
  receiptNumber?: string
  status?: 'pending' | 'issued'
  issuedAt?: string
}

export type BriefNoulItem = {
  result: boolean
  prob: number
  note: string
}

export type BriefAnalysis = {
  readinessScore: number // TypeSafe Score (0 to 100)
  readinessTier: 'High Viability' | 'Moderate' | 'Exploratory' // TypeSafe Choice
  leadQualityTier: 'VIP' | 'GROWTH' | 'STANDARD' // TypeSafe Choice
  brandArchetype: string // TypeSafe Choice
  primaryDiscipline: string // TypeSafe Choice
  recommendedNextStep: string // TypeSafe Choice
  brandIdeals: {
    visionClarity: number // 0 to 100
    audienceResonance: number // 0 to 100
    differentiation: number // 0 to 100
    coherence: number // 0 to 100
  }
  verifications: {
    hasClearVision: BriefNoulItem // TypeSafe Noul
    hasDefinedAudience: BriefNoulItem // TypeSafe Noul
    hasDifferentiation: BriefNoulItem // TypeSafe Noul
    hasScopeAlignment: BriefNoulItem // TypeSafe Noul
    isTimeSensitive: BriefNoulItem // TypeSafe Noul
    needsStrategyDiscovery: BriefNoulItem // TypeSafe Noul
  }
  keyInsights: string[]
  analyzedAt: string
}

export type BriefAnswerState = {
  answers: Record<string, string>
  messages: {
    role: 'AI' | 'CLIENT'
    content: string
    timestamp?: string
  }[]
  progress: number
  complete: boolean
  classifiedType?: string
  aestheticScore?: number
  summary?: string
  analysis?: BriefAnalysis
}

export type AIScopeSuggestion = {
  summary: string
  scopeTitle: string
  recommendedTimeline: string
  recommendedDurationDays: number
  recommendedBudget: number
  budgetRationale: string
  proposalNote: string
  suggestedDeliverables: {
    name: string
    description: string
    quantity: string
  }[]
  suggestedTasks: {
    name: string
    description: string
    stage?: string
  }[]
  suggestedStages: {
    name: string
    result: string
    payment: string
  }[]
}

export type Project = {
  id: string
  token: string
  name: string
  company: string
  contactName: string
  email: string
  phone?: string
  type: string
  status: ProjectStatus
  progress: number
  due: string
  createdAt: string
  contract: ProjectContract
  brief: BriefAnswerState
  assets: DesignAsset[]
  vat?: VatInfo
  invoice?: InvoiceInfo
}
