import type { AuditRunVersionInfo } from './quality-types'

export type AuditScope = 'logo_only' | 'visual_identity' | 'full_brandbook'
export type AuditMedium = 'digital' | 'print' | 'both'
export type AuditStatus = 'queued' | 'analyzing' | 'completed' | 'failed'

export type CriterionId =
  | 'S01' | 'S02' | 'S03'
  | 'B01' | 'B02' | 'B03'
  | 'L01' | 'L02' | 'L03' | 'L04' | 'L05'
  | 'C01' | 'C02' | 'C03' | 'C04'
  | 'T01' | 'T02' | 'T03' | 'T04'
  | 'V01' | 'V02' | 'V03'
  | 'A01' | 'A02' | 'A03'
  | 'D01' | 'D02' | 'D03'
  | 'F01' | 'F02'

export type ModuleId =
  | 'strategy'
  | 'nomenclature'
  | 'logo'
  | 'color'
  | 'typography'
  | 'imagery'
  | 'application'
  | 'governance'
  | 'assets'

export interface RubricCriterion {
  id: CriterionId
  module: ModuleId
  name: string
  nameMn: string
  weight: number // 1 to 5
  applicableScopes: AuditScope[]
  applicableMediums?: AuditMedium[]
  descriptionMn: string
  whatToLookForMn: string
  scoringAnchorsMn: {
    0: string // Missing or contradictory
    1: string // Ambiguous / Guesswork required
    2: string // Partial / Incomplete
    3: string // Clear & Usable
    4: string // Exemplary with edge cases & production specs
  }
}

export type FindingSeverity = 'critical' | 'improvement' | 'pass' | 'not_applicable'

export interface AuditFinding {
  criterionId: CriterionId
  moduleId: ModuleId
  criterionNameMn: string
  score: number // 0, 1, 2, 3, 4
  severity: FindingSeverity
  weight: number
  clientPdfPages: number[] // Pages inside the client's uploaded PDF (1-indexed)
  extractedRuleSnippet?: string
  findingSummaryMn: string
  businessImpactMn: string
  remedyActionMn: string
  verifiedByJev?: boolean
  noulProbability?: number
}

export interface ModuleResult {
  moduleId: ModuleId
  moduleNameMn: string
  weightTotal: number
  evaluatedWeight: number
  scoreWeightedSum: number
  qualityScore: number // 0 to 100
  coveragePct: number // 0 to 100
  status: 'excellent' | 'good' | 'needs_work' | 'critical'
  criticalCount: number
  improvementCount: number
  passCount: number
}

export interface AuditDocumentInfo {
  fileName: string
  fileSizeBytes: number
  totalPages: number
  extractedTextLength: number
  fileUrl?: string
  textSnippet?: string
}

export interface BrandAuditRecord {
  id: string
  company: string
  email?: string
  scope: AuditScope
  medium: AuditMedium
  status: AuditStatus
  progressPct: number
  currentStageMn: string
  qualityScore: number // 0 to 100
  coveragePct: number // 0 to 100
  documentInfo: AuditDocumentInfo
  executiveSummaryMn: string
  modules: Record<ModuleId, ModuleResult>
  findings: AuditFinding[]
  criticalFindingsCount: number
  improvementFindingsCount: number
  passFindingsCount: number
  createdAt: string
  updatedAt: string
  errorMessage?: string
  versionInfo?: AuditRunVersionInfo
  expiresAt?: string // ISO timestamp when the shareable link expires (defaults to 3 days from creation)
}
