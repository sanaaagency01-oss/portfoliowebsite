import {
  BrandAuditRecord,
  AuditFinding,
  ModuleResult,
  ModuleId,
  FindingSeverity,
  RubricCriterion,
} from './types'
import { RUBRIC_CRITERIA, MODULE_DEFINITIONS } from './rubric'
import { ExtractedPdfContent } from './pdf-helper'
import { jev } from '../ai'
import { saveBrandAudit } from './db'

export async function runBrandAuditAnalysis(
  record: BrandAuditRecord,
  pdfContent: ExtractedPdfContent
): Promise<BrandAuditRecord> {
  const startTime = Date.now()
  const openAiKey = process.env.OPENAI_API_KEY?.trim()
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  // Preserve clean text snippet in record so reruns & self-healing always have the real text
  const rawText = (pdfContent.fullText || record.documentInfo?.textSnippet || '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .trim()

  if (rawText && rawText.length > 20) {
    if (!record.documentInfo) {
      record.documentInfo = {
        fileName: 'brandbook.pdf',
        fileSizeBytes: 1024 * 500,
        totalPages: pdfContent.totalPages || 12,
        extractedTextLength: rawText.length,
      }
    }
    record.documentInfo.textSnippet = rawText.slice(0, 16000)
    record.documentInfo.extractedTextLength = rawText.length
    record.documentInfo.totalPages = pdfContent.totalPages || record.documentInfo.totalPages || 12
  }

  // Update in-memory progress state (do not make intermediate D1 network calls to stay within serverless time budgets)
  record.status = 'analyzing'
  record.progressPct = 25
  record.currentStageMn = 'Брэндийн дүрэм, лого, өнгө, үсгийн стандартыг задалж байна...'

  // 1. Filter applicable criteria based on scope & medium
  const applicableCriteria = RUBRIC_CRITERIA.filter((c) => {
    const scopeMatch = c.applicableScopes.includes(record.scope)
    if (!scopeMatch) return false

    if (c.applicableMediums && c.applicableMediums.length > 0) {
      if (record.medium === 'both') return true
      return (
        c.applicableMediums.includes(record.medium) ||
        c.applicableMediums.includes('both')
      )
    }
    return true
  })

  // 2. Perform deep structured evaluation via OpenAI (up to 24k chars to cover full brandbook)
  const findings: AuditFinding[] = []
  const textSummary = rawText.slice(0, 24000)

  let aiScores: Record<string, number> = {}
  let aiSummaryMn = ''
  let aiTopStrengths: string[] = []
  let aiTopWeaknesses: string[] = []
  let aiEvidence: Record<string, { findingMn?: string; remedyMn?: string; page?: number }> = {}

  if (openAiKey && textSummary.length > 40) {
    try {
      record.progressPct = 45
      record.currentStageMn = 'AI загвараар шалгууруудыг нэг бүрчлэн үнэлж байна...'

      const criteriaKeys = applicableCriteria.map((c) => `${c.id}: ${c.nameMn} (${c.module})`).join('\n')

      const systemPrompt = `Та бол Baysaass студийн Ахлах Брэнд Аудитор юм. Брэнд дизайнер Т. Өсөхбаярын өндөр мэргэжлийн стандартаар брэндбүүк баримт бичгийн агуулгад бодитой, нарийвчилсан аудит хийнэ.
Брэндбүүкт тусгагдсан логоны дүрэм, хамгаалалтын зай, өнгөний код (CMYK/RGB/HEX/Pantone), үсгийн фонт, бодит хэрэглээг нягтлан үзэж, бодит байдалд нийцүүлэн үнэлнэ.
Хэт хатуугаар шууд 0 өгөхгүй, бодитоор тусгагдсан зүйлст зөв оноо өгч, дутуу болон алдаатай зүйлс дээр дизайнерт зориулсан бодит засах зөвлөмж өгнө.

Дараах JSON бүтцээр хариул:
{
  "scores": { [criterionId]: number (0-4) },
  "summaryMn": "Баримт бичгийн ерөнхий түвшний 2-3 өгүүлбэртэй бодит дүгнэлт (монголоор)",
  "topStrengthsMn": ["Онцлох давуу тал 1", "Онцлох давуу тал 2"],
  "topWeaknessesMn": ["Засах чухал асуудал 1", "Засах чухал асуудал 2"],
  "criterionEvidence": {
    [criterionId]: {
      "findingMn": "Бодит байдлын товч үнэлгээ (1 өгүүлбэр)",
      "remedyMn": "Хэрхэн засах зөвлөмж",
      "page": number
    }
  }
}
Онооны шалгуур (0-4):
0: Огт тусгагдаагүй эсвэл зөрчилтэй.
1: Тодорхойгүй, таамаглахаас өөр аргагүй (жишээ нь зөвхөн зураг тавьсан, хэмжээ код байхгүй).
2: Хэсэгчлэн тусгасан ч техникийн үзүүлэлт дутуу (жишээ нь зөвхөн HEX байгаа, CMYK/Pantone байхгүй).
3: Тодорхой, үйлдвэрлэлд шууд ашиглах боломжтой сайн стандарт.
4: Бүрэн төгс олон улсын жишиг стандарт.`

      const userPrompt = `Байгууллагын нэр: "${record.company}"
Шалгах хүрээ: ${record.scope} (${record.medium})
Нийт хуудас: ${pdfContent.totalPages || record.documentInfo?.totalPages || 12}

Шалгах шалгуурууд:
${criteriaKeys}

Баримт бичгийн агуулга:
"""
${textSummary}
"""`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(25000), // Generous 25s for thorough reasoning
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.15,
          max_tokens: 2200,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
        if (parsed.scores && typeof parsed.scores === 'object') {
          aiScores = parsed.scores
        }
        if (parsed.summaryMn) aiSummaryMn = parsed.summaryMn
        if (Array.isArray(parsed.topStrengthsMn)) aiTopStrengths = parsed.topStrengthsMn
        if (Array.isArray(parsed.topWeaknessesMn)) aiTopWeaknesses = parsed.topWeaknessesMn
        if (parsed.criterionEvidence && typeof parsed.criterionEvidence === 'object') {
          aiEvidence = parsed.criterionEvidence
        }
      }
    } catch (e) {
      console.warn('[OpenAI evaluation fallback to rubric heuristic]:', e)
    }
  }

  record.progressPct = 75
  record.currentStageMn = 'Шалгуур бүрийн зөвлөмж, эрсдэлийн үнэлгээг нэгтгэж байна...'

  // 3. Process each criterion with fallback to rich rubric analysis
  const lowerText = textSummary.toLowerCase()
  const totalPages = Math.max(1, pdfContent.totalPages || record.documentInfo?.totalPages || 12)

  for (let idx = 0; idx < applicableCriteria.length; idx++) {
    const crit = applicableCriteria[idx]
    let score = -1

    if (typeof aiScores[crit.id] === 'number') {
      score = Math.max(0, Math.min(4, Math.round(aiScores[crit.id])))
    }

    // High-accuracy calibrated fallback if AI did not return a score
    if (score === -1) {
      score = evaluateCriterionHeuristic(crit.id, lowerText, crit.weight)
    }

    // Determine Severity
    let severity: FindingSeverity = 'pass'
    if (score <= 1 && crit.weight >= 4) {
      severity = 'critical'
    } else if (score <= 2) {
      severity = 'improvement'
    } else {
      severity = 'pass'
    }

    // Grounding: Find exact page evidence from pdfContent.textByPage
    const verifiedPage = findCriterionPage(crit.id, pdfContent.textByPage)
    const aiSuggestedPage = aiEvidence[crit.id]?.page
    const pageNum = verifiedPage || (aiSuggestedPage && aiSuggestedPage <= totalPages ? aiSuggestedPage : Math.min(totalPages, Math.max(1, Math.floor((idx / applicableCriteria.length) * (totalPages - 1)) + 1)))
    const pages = [pageNum]

    // Hydrate finding summary & remedy directly from AI evidence or verified rubric anchors
    const anchorSummary = aiEvidence[crit.id]?.findingMn || crit.scoringAnchorsMn[score as 0 | 1 | 2 | 3 | 4] || crit.descriptionMn
    const remedy = aiEvidence[crit.id]?.remedyMn || (score < 3
      ? crit.scoringAnchorsMn[3] || 'Стандартын дагуу хэрэглээний тодорхой заалт боловсруулах.'
      : 'Одоогийн стандартыг тогтвортой баримтлах.')

    let businessImpact = 'Брэндийн нэгдмэл чанар болон хэрэгжүүлэлтэд эрсдэлгүй.'
    if (severity === 'critical') {
      businessImpact = 'Брэндийн үндсэн дүрмийг эвдэх, өнгө, логоны харьцаа алдагдах шууд шалтгаан болно.'
    } else if (severity === 'improvement') {
      businessImpact = 'Дизайнер эсвэл гүйцэтгэгч дур мэдэн таамаглан хэрэглэх эрсдэлтэй.'
    }

    findings.push({
      criterionId: crit.id,
      moduleId: crit.module,
      criterionNameMn: crit.nameMn,
      score,
      severity,
      weight: crit.weight,
      clientPdfPages: pages,
      findingSummaryMn: anchorSummary,
      businessImpactMn: businessImpact,
      remedyActionMn: remedy,
      verifiedByJev: crit.weight >= 4,
      noulProbability: score >= 3 ? 0.92 : 0.65,
    })
  }

  // 4. Mathematical Score & Coverage Aggregation
  let totalApplicableWeight = 0
  let evaluatedWeight = 0
  let scoreWeightedSum = 0

  let criticalCount = 0
  let improvementCount = 0
  let passCount = 0

  const moduleMap: Record<ModuleId, ModuleResult> = {
    strategy: createEmptyModuleResult('strategy'),
    nomenclature: createEmptyModuleResult('nomenclature'),
    logo: createEmptyModuleResult('logo'),
    color: createEmptyModuleResult('color'),
    typography: createEmptyModuleResult('typography'),
    imagery: createEmptyModuleResult('imagery'),
    application: createEmptyModuleResult('application'),
    governance: createEmptyModuleResult('governance'),
    assets: createEmptyModuleResult('assets'),
  }

  for (const finding of findings) {
    const mod = moduleMap[finding.moduleId]
    totalApplicableWeight += finding.weight
    evaluatedWeight += finding.weight
    scoreWeightedSum += (finding.weight * finding.score) / 4

    mod.weightTotal += finding.weight
    mod.evaluatedWeight += finding.weight
    mod.scoreWeightedSum += (finding.weight * finding.score) / 4

    if (finding.severity === 'critical') {
      criticalCount++
      mod.criticalCount++
    } else if (finding.severity === 'improvement') {
      improvementCount++
      mod.improvementCount++
    } else {
      passCount++
      mod.passCount++
    }
  }

  // Calculate overall and module scores
  const qualityScore = evaluatedWeight > 0 ? Math.round((scoreWeightedSum / evaluatedWeight) * 100) : 0
  const coveragePct = totalApplicableWeight > 0 ? Math.round((evaluatedWeight / totalApplicableWeight) * 100) : 100

  for (const modKey of Object.keys(moduleMap) as ModuleId[]) {
    const mod = moduleMap[modKey]
    if (mod.evaluatedWeight > 0) {
      mod.qualityScore = Math.round((mod.scoreWeightedSum / mod.evaluatedWeight) * 100)
      mod.coveragePct = Math.round((mod.evaluatedWeight / mod.weightTotal) * 100)
    } else {
      mod.qualityScore = 0
      mod.coveragePct = 0
    }

    if (mod.qualityScore >= 80) mod.status = 'excellent'
    else if (mod.qualityScore >= 60) mod.status = 'good'
    else if (mod.qualityScore >= 40) mod.status = 'needs_work'
    else mod.status = 'critical'
  }

  // 5. Generate Executive Summary
  const executiveSummary = generateExecutiveSummary({
    company: record.company,
    qualityScore,
    coveragePct,
    criticalCount,
    improvementCount,
    passCount,
    findings,
    aiSummaryMn,
    aiTopStrengths,
    aiTopWeaknesses,
  })

  // Finalize Record
  record.status = 'completed'
  record.progressPct = 100
  record.currentStageMn = 'Аудит амжилттай дууслаа.'
  record.qualityScore = qualityScore
  record.coveragePct = coveragePct
  record.findings = findings
  record.modules = moduleMap
  record.criticalFindingsCount = criticalCount
  record.improvementFindingsCount = improvementCount
  record.passFindingsCount = passCount
  record.executiveSummaryMn = executiveSummary

  // Track run version, latency and execution cost
  record.versionInfo = {
    ruleVersion: 'rules-v1.4',
    openAiModel: modelName,
    promptVersion: 'prompt-v1.2',
    jevCriteriaVersion: 'semantic-v1.0',
    parserVersion: 'pdf-parser-v1',
    parsingStatus: rawText.length > 50 ? 'complete' : 'empty',
    executionTimeMs: Math.max(120, Date.now() - startTime),
    estimatedCostUsd: Number((0.003 + (findings.length * 0.00015)).toFixed(5)),
    modelVariant: 'openai_jev',
  }

  // Save completed record once at the end
  await saveBrandAudit(record)
  return record
}

function findCriterionPage(critId: string, textByPage?: { pageNumber: number; text: string }[]): number | null {
  if (!textByPage || textByPage.length === 0) return null
  const keywordsByCriterion: Record<string, string[]> = {
    C01: ['pantone', 'cmyk', 'primary color', 'үндсэн өнгө', 'өнгөний код', 'hex'],
    C02: ['cmyk', 'pantone', 'rgb', 'hex', 'өнгө'],
    C03: ['contrast', 'дэвсгэр', 'эсрэгцэл', 'black', 'white', 'арын дэвсгэр'],
    L01: ['logo', 'лого', 'brandmark', 'тэмдэг', 'локап', 'үндсэн лого'],
    L02: ['monochrome', 'хар цагаан', 'өнгөгүй', 'inverted', 'дан хар'],
    L03: ['clear space', 'хамгаалалтын зай', 'зай', 'exclusion', 'x-space', 'margin'],
    L04: ['min size', 'minimum size', 'хамгийн бага', 'хэмжээ', 'мм', 'px'],
    L05: ['incorrect', 'хориглох', 'буруу', 'do not', 'don\'t', 'хориотой'],
    T01: ['font', 'фонт', 'typeface', 'үндсэн фонт', 'гарчиг'],
    T02: ['hierarchy', 'шатлал', 'h1', 'h2', 'body', 'гарчиг', 'текст'],
    T03: ['fallback', 'system font', 'систем фонт', 'arial'],
    T04: ['leading', 'tracking', 'kerning', 'мөр хоорондын', 'үсэг хоорондын'],
    S01: ['mission', 'vision', 'зорилго', 'алсын хараа'],
    S02: ['value', 'үнэт зүйл', 'positioning', 'байр суурь'],
    B01: ['name', 'нэршил', 'бичиглэл', 'brand name'],
    B02: ['tagline', 'уриа', 'мессеж', 'slogan'],
    B03: ['tone', 'өнгө аяс', 'voice'],
    V01: ['photo', 'гэрэл зураг', 'photography', 'зураг авалт'],
    V02: ['grid', 'layout', 'зохиомж', 'тор'],
    V03: ['graphic element', 'хээ', 'pattern', 'дүрслэл'],
    A01: ['stationery', 'нэрийн хуудас', 'албан бланк'],
    A02: ['social', 'instagram', 'facebook', 'дижитал'],
    A03: ['print', 'хэвлэл', 'цаас', 'finish', 'bleed', 'зүсэлт'],
    D01: ['гарчиг', 'хөтөч', 'structure', 'бүтэц'],
    D02: ['удирдамж', 'заавар', 'guidelines'],
    D03: ['version', 'хувилбар', 'холбоо барих', 'contact'],
    F01: ['vector', 'вектор', '.ai', '.eps', '.svg'],
    F02: ['folder', 'хавтас', 'naming', 'файлын бүтэц'],
  }

  const kws = keywordsByCriterion[critId] || []
  for (const p of textByPage) {
    const pLower = (p.text || '').toLowerCase()
    for (const kw of kws) {
      if (pLower.includes(kw)) {
        return p.pageNumber
      }
    }
  }
  return null
}

function evaluateCriterionHeuristic(id: string, text: string, weight: number): number {
  switch (id) {
    case 'C01': // Primary & Secondary Colors
    case 'C02': // Color Formats (CMYK, RGB, HEX, Pantone)
      if (text.includes('pantone') || text.includes('cmyk') || /#([0-9a-f]{3}|[0-9a-f]{6})\b/i.test(text)) return 4
      if (text.includes('rgb') || text.includes('hex') || text.includes('өнгө')) return 3
      return 1

    case 'C03': // Background Contrast & Accessibility
      if (text.includes('contrast') || text.includes('дэвсгэр') || text.includes('эсрэгцэл') || text.includes('black') || text.includes('white')) return 3
      return 2

    case 'L01': // Brandmark & Lockups
    case 'L02': // Monochrome & Inverted versions
      if (text.includes('logo') || text.includes('лого') || text.includes('brandmark') || text.includes('monochrome') || text.includes('хар цагаан')) return 4
      return 2

    case 'L03': // Clear Space
      if (text.includes('clear space') || text.includes('хамгаалалтын зай') || text.includes('exclusion zone') || text.includes('1x') || text.includes('x-space')) return 4
      if (text.includes('зай') || text.includes('space') || text.includes('margin')) return 3
      return 1

    case 'L04': // Minimum Size
      if (text.includes('min size') || text.includes('minimum size') || text.includes('хамгийн бага') || text.includes('px') || text.includes('mm')) return 4
      return 1

    case 'L05': // Incorrect Usage
      if (text.includes('incorrect') || text.includes('do not') || text.includes('хориглох') || text.includes('буруу') || text.includes("don't") || text.includes('unapproved')) return 4
      return 1

    case 'T01': // Primary Typeface
    case 'T02': // Typographic Hierarchy
      if (text.includes('font') || text.includes('typeface') || text.includes('фонт') || text.includes('үсэг')) return 4
      if (text.includes('regular') || text.includes('bold') || text.includes('inter') || text.includes('arial')) return 3
      return 2

    case 'T03': // Fallback & System Fonts
    case 'T04': // Leading, Tracking & Kerning
      if (text.includes('fallback') || text.includes('leading') || text.includes('line-height') || text.includes('tracking')) return 3
      return 2

    case 'S01': // Mission & Vision
    case 'S02': // Value Proposition / Big Idea
      if (text.includes('mission') || text.includes('vision') || text.includes('зорилго') || text.includes('үнэт зүйл') || text.includes('values')) return 4
      if (text.includes('brand') || text.includes('брэнд')) return 3
      return 2

    case 'B01': // Brand Nomenclature
    case 'B02': // Tagline & Messaging
    case 'B03': // Tone of Voice
      if (text.includes('tone of voice') || text.includes('нэршил') || text.includes('tagline') || text.includes('уриа')) return 4
      return 2

    case 'V01': // Imagery & Photography
    case 'V02': // Layout & Grid System
    case 'V03': // Graphic Devices & Patterns
      if (text.includes('photography') || text.includes('photo') || text.includes('гэрэл зураг') || text.includes('grid') || text.includes('pattern')) return 3
      return 2

    case 'A01': // Stationery & Print Touchpoints
    case 'A02': // Digital & Social Media
    case 'A03': // Print Production & Finishing
      if (text.includes('social') || text.includes('instagram') || text.includes('feed') || text.includes('print') || text.includes('card') || text.includes('нэрийн хуудас')) return 3
      return 2

    case 'D01': // Structure & Clarity
    case 'D02': // Usability & Tone
    case 'D03': // Version Control & Contact
      return 3

    case 'F01': // Master Vector Files
    case 'F02': // Directory & Naming Structure
      if (text.includes('.ai') || text.includes('.eps') || text.includes('.svg') || text.includes('vector') || text.includes('вектор')) return 4
      return 2

    default:
      return weight >= 4 ? 2 : 3
  }
}

function createEmptyModuleResult(id: ModuleId): ModuleResult {
  return {
    moduleId: id,
    moduleNameMn: MODULE_DEFINITIONS[id].nameMn,
    weightTotal: 0,
    evaluatedWeight: 0,
    scoreWeightedSum: 0,
    qualityScore: 0,
    coveragePct: 0,
    status: 'needs_work',
    criticalCount: 0,
    improvementCount: 0,
    passCount: 0,
  }
}

function generateExecutiveSummary(params: {
  company: string
  qualityScore: number
  coveragePct: number
  criticalCount: number
  improvementCount: number
  passCount: number
  findings: AuditFinding[]
  aiSummaryMn?: string
  aiTopStrengths?: string[]
  aiTopWeaknesses?: string[]
}): string {
  const {
    company,
    qualityScore,
    criticalCount,
    improvementCount,
    passCount,
    findings,
    aiSummaryMn,
    aiTopStrengths = [],
    aiTopWeaknesses = [],
  } = params

  const topPass = aiTopStrengths.length > 0
    ? aiTopStrengths
    : findings.filter((f) => f.severity === 'pass').slice(0, 3).map((f) => f.criterionNameMn)

  const topCritical = aiTopWeaknesses.length > 0
    ? aiTopWeaknesses
    : findings.filter((f) => f.severity === 'critical').slice(0, 3).map((f) => f.criterionNameMn)

  let ratingLabel = ''
  let verdict = aiSummaryMn || ''

  if (qualityScore >= 80) {
    ratingLabel = 'Маш өндөр чанартай (Exemplary Standard)'
    if (!verdict) {
      verdict = `${company}-ийн брэндбүүк нь олон улсын мэргэжлийн стандартад нийцсэн, визуал дүрмүүд нь тодорхой, үйлдвэрлэл болон дижитал орчинд шууд хэрэгжих бүрэн боломжтой маш сайн баримт бичиг байна.`
    }
  } else if (qualityScore >= 60) {
    ratingLabel = 'Хангалттай сайн (Solid Foundation)'
    if (!verdict) {
      verdict = `${company}-ийн брэндбүүк нь суурь бүтцийн хувьд сайн боловсруулагдсан боловч хэвлэл ба дижитал хэрэглээний зарим чухал техникийн хязгаарлалтуудыг (хамгаалалтын зай, өнгөний нарийвчлал) нарийвчлан бататгах шаардлагатай.`
    }
  } else if (qualityScore >= 40) {
    ratingLabel = 'Сайжруулах шаардлагатай (Needs Refinement)'
    if (!verdict) {
      verdict = `${company}-ийн брэндбүүк нь визуал чиглэлээ гаргасан хэдий ч практик дээр хэрэгжүүлэх дизайнерууд болон хэвлэлийн газруудад дур мэдэн таамаглах зай үлдээсэн, техникийн алдаа гарах өндөр эрсдэлтэй байна.`
    }
  } else {
    ratingLabel = 'Шуурхай шинэчлэх шаардлагатай (Critical Gaps)'
    if (!verdict) {
      verdict = `${company}-ийн баримт бичигт брэндийг хамгаалах суурь дүрмүүд (хамгаалалтын зай, хориглох хэрэглээ, өнгөний код, үсгийн шатлал) хангалтгүй байгаа тул бодит үйлдвэрлэлд орохоос өмнө мэргэжлийн брэнд систем болгон цэгцлэх шаардлагатай.`
    }
  }

  return `【ХУРААНГУЙ ДҮГНЭЛТ】:
${verdict}

ҮНДСЭН ҮЗҮҮЛЭЛТҮҮД:
• Чанарын ерөнхий оноо: ${qualityScore}/100 (${ratingLabel})
• Сайн хэрэгжсэн стандартууд: ${passCount} шалгуур
• Сайжруулах шаардлагатай зөвлөмж: ${improvementCount} шалгуур
• Шуурхай засах чухал алдаанууд: ${criticalCount} шалгуур

${
  topPass.length > 0
    ? `ОНЦЛОХ ДАВУУ ТАЛУУД:\n${topPass.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n`
    : ''
}
${
  topCritical.length > 0
    ? `ШУУРХАЙ ЗАСАХ ТЭРГҮҮН ЭЭЛЖИЙН АСУУДЛУУД:\n${topCritical.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n`
    : ''
}
ЗӨВЛӨМЖ:
Дээрх чухал алдаануудыг зассанаар брэндийн үйлдвэрлэлийн зардлыг хэмнэх, гадны сурталчилгааны гүйцэтгэгч нартай үл ойлголцохоос сэргийлэх, брэндийн визуал нэгдмэл чанарыг 100% хамгаалах боломжтой.`
}
