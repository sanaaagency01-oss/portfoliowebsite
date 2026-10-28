/**
 * TypeSafe AI Brief Analyzer
 * Powered by System One Primitives (Choice, Noul, Score)
 * Strategic Brand Identity Architecture & 4 Core Pillars.
 */

import { Project, BriefAnalysis, BriefNoulItem } from './types/studio'
import { jev } from './ai'

export interface BriefRawData {
  answers: Record<string, string>
  messages?: { role: 'AI' | 'CLIENT'; content: string; timestamp?: string }[]
  companyName?: string
  projectName?: string
}

const BRAND_ARCHETYPES = [
  'The Creator (Шинэлэг бүтээгч)',
  'The Ruler (Тансаг манлайлагч)',
  'The Sage (Мэргэн ухаарагч)',
  'The Hero (Зоримог манлайлагч)',
  'The Innocent (Цэвэрхэн & Найдвартай)',
  'The Explorer (Шинэ ертөнцийг нээгч)',
  'The Everyman (Нийтлэг & Ойр дотно)',
  'The Caregiver (Халамжлагч & Органик)',
  'The Outlaw (Уламжлалыг эвдэгч)',
  'The Magician (Хувирган өөрчлөгч)',
] as const

const LEAD_TIERS = ['VIP', 'GROWTH', 'STANDARD'] as const

const DESIGN_DISCIPLINES = [
  'Brand Identity System',
  'Logo & Visual Identity',
  'Packaging Design',
  'Digital & Web UI',
  'Rebranding & Overhaul',
] as const

const NEXT_ACTIONS = [
  'Гэрээ боловсруулж илгээх',
  'Стратеги судалгааны воркшоп хийх',
  'Зорилтот хэрэглэгчийн тодорхойлолтыг гүнзгийрүүлэх',
  'Хүлээлгэн өгөх материалуудын цар хүрээг нарийвчлах',
] as const

/**
 * Deterministic helper to score text depth and signal words
 */
function evaluateTextSignal(text: string, signals: string[]): { score: number; count: number } {
  if (!text) return { score: 0, count: 0 }
  const lower = text.toLowerCase()
  let count = 0
  for (const sig of signals) {
    if (lower.includes(sig.toLowerCase())) count++
  }
  const lengthScore = Math.min(60, text.trim().split(/\s+/).length * 4)
  const signalScore = Math.min(40, count * 15)
  return { score: Math.min(100, lengthScore + signalScore), count }
}

/**
 * Analyzes a brief using TypeSafe System One primitives
 */
export async function analyzeBriefWithTypeSafe(
  projectOrBrief: BriefRawData
): Promise<BriefAnalysis> {
  const answers = projectOrBrief.answers || {}
  const messages = projectOrBrief.messages || []
  const company = projectOrBrief.companyName || answers.business || 'Төсөл'

  const businessText = answers.business || ''
  const goalText = answers.goal || ''
  const audienceText = answers.audience || ''
  const styleText = answers.style || ''
  const deliverablesText = answers.deliverables || ''
  const referencesText = answers.references || ''
  const projectTypeText = answers.projectType || ''

  // Full unified state payload for TypeSafe System One evaluations
  const structuredState: Record<string, unknown> = {
    company,
    answers: {
      projectType: projectTypeText,
      business: businessText,
      goal: goalText,
      audience: audienceText,
      style: styleText,
      deliverables: deliverablesText,
      references: referencesText,
      timeline: answers.timeline || '',
      budget: answers.budget || '',
      serviceScope: answers.serviceScope || '',
    },
    clientInteractionCount: messages.filter((m) => m.role === 'CLIENT').length,
    timestamp: new Date().toISOString(),
  }

  // -------------------------------------------------------------
  // 1. EVALUATE STRATEGIC BRAND PILLARS (Vision, Audience, Differentiation, Coherence)
  // -------------------------------------------------------------
  const visionSignal = evaluateTextSignal(businessText + ' ' + goalText, [
    'компани', 'бизнес', 'зорилго', 'үнэ цэнэ', 'хөгжүүлэх', 'брэнд', 'бүтээгдэхүүн', 'үйлчилгээ', 'салбар', 'хэтийн'
  ])
  const audienceSignal = evaluateTextSignal(audienceText, [
    'нас', 'хэрэглэгч', 'залуус', 'эмэгтэй', 'эрэгтэй', 'хүүхэд', 'байгууллага', 'орлого', 'сонирхол', 'мэргэжилтэн', 'b2b'
  ])
  const diffSignal = evaluateTextSignal(goalText + ' ' + styleText, [
    'ялгарах', 'давуу', 'шинэ', 'онцлог', 'өрсөлдөгч', 'хямд', 'дээд зэрэглэл', 'анхны', 'өвөрмөц', 'хэв маяг'
  ])
  const coherenceSignal = evaluateTextSignal(deliverablesText + ' ' + styleText, [
    'лого', 'брэндбүүк', 'өнгө', 'фонт', 'сав баглаа', 'уут', 'хайрцаг', 'нэрийн хуудас', 'вектор', 'гарын авлага'
  ])

  const visionClarity = Math.max(15, visionSignal.score)
  const audienceResonance = Math.max(15, audienceSignal.score)
  const differentiation = Math.max(15, diffSignal.score)
  const coherence = Math.max(15, coherenceSignal.score)

  // -------------------------------------------------------------
  // 2. TYPESAFE SYSTEM ONE PRIMITIVES (Evaluated in parallel)
  // -------------------------------------------------------------
  const [
    archetypeChoice,
    disciplineChoice,
    leadTierChoice,
    nextActionChoice,
    hasClearVisionEval,
    hasDefinedAudienceEval,
    hasDifferentiationEval,
    hasScopeAlignmentEval,
    isTimeSensitiveEval,
    needsStrategyDiscoveryEval,
  ] = await Promise.all([
    // A. Choice 1: Brand Archetype
    jev.choice<string>(
      'Which classic brand archetype best fits this client’s tone, mission, and style expectations?',
      [...BRAND_ARCHETYPES],
      structuredState
    ),

    // B. Choice 2: Primary Design Discipline
    jev.choice<string>(
      'What is the primary core design discipline required for this scope of work?',
      [...DESIGN_DISCIPLINES],
      structuredState
    ),

    // C. Choice 3: Lead Quality & Priority Tier
    jev.choice<'VIP' | 'GROWTH' | 'STANDARD'>(
      'What is the estimated priority and value tier for this client lead?',
      [...LEAD_TIERS],
      structuredState
    ),

    // D. Choice 4: Recommended Next Action for the Designer
    jev.choice<string>(
      'What is the most effective immediate next step for the brand designer to advance this project?',
      [...NEXT_ACTIONS],
      structuredState
    ),

    // E. Noul Evaluations: Binary condition verification with calibrated probability
    jev.noul(
      'Has the client provided a clear, articulated core identity and business direction?',
      { key: 'business_and_goal', content: `${businessText} | ${goalText}` }
    ),

    jev.noul(
      'Is the target customer segment or audience persona clearly defined with specific traits?',
      { key: 'audience', content: audienceText }
    ),

    jev.noul(
      'Does the brief communicate a distinct market position or competitive differentiation?',
      { key: 'differentiation', content: `${goalText} | ${styleText}` }
    ),

    jev.noul(
      'Are the requested deliverables and scope realistic and aligned with the project intent?',
      { key: 'scope_alignment', content: `${deliverablesText} | ${answers.serviceScope || ''}` }
    ),

    jev.noul(
      'Does the client indicate urgent timeline pressure, upcoming product launch, or near-term deadline?',
      { key: 'time_sensitive', content: `${answers.timeline || ''} | ${goalText} ${messages.map((m) => m.content).join(' ')}` }
    ),

    jev.noul(
      'Does this project require an in-depth brand strategy discovery workshop prior to visual identity creation?',
      {
        answersCount: Object.keys(answers).length,
        visionClarity,
        differentiation,
      }
    ),
  ])

  // F. Score: Overall Readiness Score (0 to 100)
  const answersCount = Object.keys(answers).length
  const answersBonus = Math.min(30, answersCount * 5)
  const brandIdealsAvg = Math.round((visionClarity + audienceResonance + differentiation + coherence) / 4)
  const noulWeighted = Math.round(
    (hasClearVisionEval.prob * 0.3 +
      hasDefinedAudienceEval.prob * 0.25 +
      hasDifferentiationEval.prob * 0.25 +
      hasScopeAlignmentEval.prob * 0.2) *
      40
  )

  const readinessScore = Math.min(100, Math.max(10, Math.round(answersBonus * 0.3 + brandIdealsAvg * 0.4 + noulWeighted)))

  let readinessTier: 'High Viability' | 'Moderate' | 'Exploratory' = 'Exploratory'
  if (readinessScore >= 75) {
    readinessTier = 'High Viability'
  } else if (readinessScore >= 45) {
    readinessTier = 'Moderate'
  }

  // -------------------------------------------------------------
  // 3. SYNTHESIZE KEY INSIGHTS (Strategic methodology)
  // -------------------------------------------------------------
  const keyInsights: string[] = []
  if (hasClearVisionEval.result) {
    keyInsights.push('Бизнесийн үндсэн чиглэл болон эрхэм зорилго харьцангуй тодорхой томьёологдсон.')
  } else {
    keyInsights.push('Бизнесийн ялгарал, эрхэм зорилгыг стратегийн ярилцлагаар илүү тодруулах шаардлагатай.')
  }

  if (hasDefinedAudienceEval.result) {
    keyInsights.push(`Зорилтот бүлэг: ${audienceText ? audienceText.slice(0, 60) : 'Тодорхойлсон'}`)
  } else {
    keyInsights.push('Зорилтот хэрэглэгчийн сегментчлэл ерөнхий тул нэмэлт тодруулга зөвлөмжтэй.')
  }

  if (styleText) {
    keyInsights.push(`Хүсэж буй өнгө аяс & хэв маяг: "${styleText.slice(0, 50)}"`)
  }

  if (hasScopeAlignmentEval.result && deliverablesText) {
    keyInsights.push(`Тодорхойлогдсон тачпойнтууд: ${deliverablesText.slice(0, 60)}`)
  }

  const verifications: Record<string, BriefNoulItem> = {
    hasClearVision: {
      result: hasClearVisionEval.result,
      prob: Math.round(hasClearVisionEval.prob * 100) / 100,
      note: hasClearVisionEval.result ? 'Зорилго & мөн чанар тодорхой' : 'Тодруулах шаардлагатай',
    },
    hasDefinedAudience: {
      result: hasDefinedAudienceEval.result,
      prob: Math.round(hasDefinedAudienceEval.prob * 100) / 100,
      note: hasDefinedAudienceEval.result ? 'Хэрэглэгчийн сегмент тодорхой' : 'Сегментчлэл шаардлагатай',
    },
    hasDifferentiation: {
      result: hasDifferentiationEval.result,
      prob: Math.round(hasDifferentiationEval.prob * 100) / 100,
      note: hasDifferentiationEval.result ? 'Өрсөлдөгчдөөс ялгарах онцлогтой' : 'Ялгарал сул / тодорхойгүй',
    },
    hasScopeAlignment: {
      result: hasScopeAlignmentEval.result,
      prob: Math.round(hasScopeAlignmentEval.prob * 100) / 100,
      note: hasScopeAlignmentEval.result ? 'Материалын цар хүрээ зохистой' : 'Хүлээлгэн өгөх цар хүрээг тодруулах',
    },
    isTimeSensitive: {
      result: isTimeSensitiveEval.result,
      prob: Math.round(isTimeSensitiveEval.prob * 100) / 100,
      note: isTimeSensitiveEval.result ? 'Хугацаа шахуу / Нэн даруй' : 'Хэвийн хуваарьтай',
    },
    needsStrategyDiscovery: {
      result: needsStrategyDiscoveryEval.result,
      prob: Math.round(needsStrategyDiscoveryEval.prob * 100) / 100,
      note: needsStrategyDiscoveryEval.result ? 'Phase 1 Стратеги воркшоп санал болгох' : 'Шууд дизайн концепц руу орох боломжтой',
    },
  }

  return {
    readinessScore,
    readinessTier,
    leadQualityTier: leadTierChoice.selected,
    brandArchetype: archetypeChoice.selected,
    primaryDiscipline: disciplineChoice.selected,
    recommendedNextStep: nextActionChoice.selected,
    brandIdeals: {
      visionClarity,
      audienceResonance,
      differentiation,
      coherence,
    },
    verifications: verifications as BriefAnalysis['verifications'],
    keyInsights,
    analyzedAt: new Date().toISOString(),
  }
}
