import { ModuleId, CriterionId, FindingSeverity } from './types'

export type UserClarityRating = 1 | 2 | 3 | 4 | 5
export type DiscoveredNewIssues =
  | 'all_new'
  | 'some_new'
  | 'already_known'
  | 'none'
  | 'yes_new'
  | 'partial'
  | 'no'
  | 'unknown'
  | string
export type UserFindingVote = 'correct' | 'false_positive' | 'unclear' | 'unknown'

export type ExpertFindingLabel =
  | 'correct'
  | 'false_positive'
  | 'missed_issue'
  | 'wrong_severity'
  | 'wrong_evidence'
  | 'not_applicable'

export type ErrorStage = 'parser' | 'extraction' | 'semantic' | 'scoring' | 'report'

export interface AuditRunVersionInfo {
  ruleVersion: string // e.g. 'rules-v1.4'
  openAiModel: string // e.g. 'gpt-4o-mini'
  promptVersion: string // e.g. 'prompt-v1.2'
  jevCriteriaVersion: string // e.g. 'semantic-v1.0'
  parserVersion: string // e.g. 'pdf-parser-v1'
  parsingStatus: 'complete' | 'truncated' | 'empty'
  executionTimeMs: number
  estimatedCostUsd: number
  modelVariant: 'openai_only' | 'openai_jev'
}

export interface UserReportFeedback {
  auditId: string
  clarityScore: UserClarityRating
  discoveredNewIssues: DiscoveredNewIssues
  inaccurateFindingsNote?: string
  createdAt: string
  clientIp?: string
}

export interface FindingReviewRecord {
  auditId: string
  criterionId: string
  userVote?: UserFindingVote
  userComment?: string
  expertLabel?: ExpertFindingLabel
  expertNote?: string
  correctEvidencePages?: number[]
  errorStage?: ErrorStage
  reviewedAt?: string
  reviewedBy?: string
}

export interface ModuleAccuracyMetric {
  moduleId: ModuleId
  moduleNameMn: string
  totalFindings: number
  reviewedFindings: number
  correctCount: number
  falsePositiveCount: number
  wrongEvidenceCount: number
  precisionPct: number
}

export interface QualityMetricsSummary {
  totalRuns: number
  humanReviewedRuns: number
  totalFindings: number
  reviewedFindingsCount: number
  correctFindingsCount: number
  falsePositiveCount: number
  wrongEvidenceCount: number
  wrongSeverityCount: number
  missedIssuesCount: number
  precisionPct: number
  evidenceAccuracyPct: number
  avgUserClarityScore: number
  totalFeedbackCount: number
  avgExecutionTimeMs: number
  avgCostUsd: number
  stageErrorBreakdown: Record<ErrorStage, number>
  moduleAccuracy: Record<string, ModuleAccuracyMetric>
}
