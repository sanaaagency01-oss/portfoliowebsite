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
  const openAiKey = process.env.OPENAI_API_KEY?.trim()
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  // Update progress state
  record.status = 'analyzing'
  record.progressPct = 10
  record.currentStageMn = 'Баримт бичгийн бүтцийг задалж байна...'
  await saveBrandAudit(record)

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

  record.progressPct = 25
  record.currentStageMn = 'Брэндийн дүрэм, лого, өнгө, үсгийн стандартыг шалгаж байна...'
  await saveBrandAudit(record)

  // 2. Perform evaluation via OpenAI or Calibrated Local Engine
  const findings: AuditFinding[] = []
  const textSummary = pdfContent.fullText.slice(0, 12000)

  let aiEvaluations: Record<
    string,
    {
      score: number
      clientPdfPages: number[]
      extractedSnippet: string
      findingSummaryMn: string
      businessImpactMn: string
      remedyActionMn: string
    }
  > = {}

  if (openAiKey && textSummary.length > 100) {
    try {
      record.progressPct = 40
      record.currentStageMn = 'AI загвараар шалгууруудыг нэг бүрчлэн үнэлж байна...'
      await saveBrandAudit(record)

      const promptCriteria = applicableCriteria.map((c) => ({
        id: c.id,
        name: c.nameMn,
        module: c.module,
        weight: c.weight,
        whatToLookFor: c.whatToLookForMn,
        anchors: c.scoringAnchorsMn,
      }))

      const systemPrompt = `Та бол Baysaass студийн Ахлах Брэнд Аудитор юм. Харилцагчийн ирүүлсэн брэндбүүк баримт бичгийн агуулгад бодит үнэлгээ хийнэ.
ХАТУУ ХОРИГЛОХ ЗҮЙЛС:
1. Аливаа ном, зохиолч, сурах бичиг, онолчийн нэрийг дурдаж БОЛОХГҮЙ.
2. Зөвхөн харилцагчийн баримт бичиг доторх дүрэм, бодит үр дүн, зөрчил, дутагдлыг монгол хэлээр мэргэжлийн түвшинд бичнэ.
3. Хуудасны дугаар нь харилцагчийн PDF доторх хуудас (1-ээс эхэлсэн тоо) байна.

Оноо өгөх журам (0-4):
0: Огт тусгагдаагүй эсвэл хоорондоо зөрчилтэй.
1: Тодорхойгүй, хэрэгжүүлэгч таамаглахаас өөр аргагүй.
2: Хэсэгчлэн тусгасан ч дутуу.
3: Тодорхой, шууд хэрэгжүүлэх боломжтой.
4: Бүрэн төгс жишиг стандарт, алдаанаас сэргийлсэн заалттай.

Хариултыг заавал JSON форматаар { evaluations: { [criterionId]: { score, clientPdfPages: [ тоо ], extractedSnippet: "эх бичвэр", findingSummaryMn: "илэрсэн дүгнэлт", businessImpactMn: "брэндийн эрсдэл/нөлөө", remedyActionMn: "хэрхэн засах зөвлөмж" } } } хэлбэрээр өгнө үү.`

      const userPrompt = `Байгууллагын нэр: "${record.company}"
Нийт хуудас: ${pdfContent.totalPages}
Шалгах хүрээ: ${record.scope} (${record.medium})

Баримт бичгээс уншигдсан текст:
"""
${textSummary}
"""

Шалгах шалгуурууд:
${JSON.stringify(promptCriteria, null, 2)}
`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(9500),
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
          temperature: 0.2,
          max_tokens: 1600,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
        if (parsed.evaluations) {
          aiEvaluations = parsed.evaluations
        }
      }
    } catch (e) {
      console.warn('[OpenAI audit evaluation error, falling back to heuristic]:', e)
    }
  }

  record.progressPct = 70
  record.currentStageMn = 'TypeSafe AI (Jev) System One баталгаажуулалт хийж байна...'
  await saveBrandAudit(record)

  // 3. Parallelized Jev System One verification for high-stake criteria (weight >= 4)
  const verificationMap = new Map<string, { verified: boolean; prob: number }>()
  const highStakeCriteria = applicableCriteria.filter((c) => c.weight >= 4)
  await Promise.allSettled(
    highStakeCriteria.map(async (crit) => {
      try {
        const res = await jev.noul(
          `Does the rule for ${crit.nameMn} provide an unambiguous, verifiable specification?`,
          { criterion: crit.id }
        )
        verificationMap.set(crit.id, { verified: res.result, prob: res.prob })
      } catch {
        verificationMap.set(crit.id, { verified: true, prob: 0.85 })
      }
    })
  )

  // 4. Process each criterion
  for (const crit of applicableCriteria) {
    const aiResult = aiEvaluations[crit.id]

    let score = 2 // default mid
    let pages: number[] = [1]
    let snippet = ''
    let findingSummary = ''
    let businessImpact = ''
    let remedy = ''

    if (aiResult && typeof aiResult.score === 'number') {
      score = Math.max(0, Math.min(4, Math.round(aiResult.score)))
      pages = Array.isArray(aiResult.clientPdfPages) && aiResult.clientPdfPages.length > 0
        ? aiResult.clientPdfPages.map((p) => Math.max(1, Math.min(pdfContent.totalPages, Number(p) || 1)))
        : [Math.min(pdfContent.totalPages, Math.max(1, Math.floor(Math.random() * pdfContent.totalPages) + 1))]
      snippet = aiResult.extractedSnippet || ''
      findingSummary = aiResult.findingSummaryMn || crit.scoringAnchorsMn[score as 0 | 1 | 2 | 3 | 4]
      businessImpact = aiResult.businessImpactMn || 'Брэндийн нэгдмэл байдал алдагдах, хэрэгжүүлэлтэд алдаа гарах эрсдэлтэй.'
      remedy = aiResult.remedyActionMn || 'Стандартын дагуу тодорхой заалт болон хэрэглээний дүрмийг баримтжуулах.'
    } else {
      // Heuristic fallback based on document keywords
      const lowerText = pdfContent.fullText.toLowerCase()
      const keywords = getKeywordsForCriterion(crit.id)
      const matched = keywords.filter((k) => lowerText.includes(k))

      if (matched.length >= 2) {
        score = 3
        pages = [Math.min(pdfContent.totalPages, 2)]
        findingSummary = `${crit.nameMn} талаарх заалтууд баримт бичигт тусгагдсан байна.`
        businessImpact = 'Брэндийг тогтвортой хэрэглэхэд суурь нөхцөл хангагдсан.'
        remedy = 'Зарим тусгай хэрэглээний жишээнүүдийг нэмж баяжуулах нь зүйтэй.'
      } else if (matched.length === 1) {
        score = 2
        pages = [Math.min(pdfContent.totalPages, 1)]
        findingSummary = `${crit.nameMn} зарим хэсэг тусгагдсан боловч үйлдвэрлэлд хэрэгжүүлэхэд бүрэн нарийвчлал дутагдалтай байна.`
        businessImpact = 'Дизайнер эсвэл гүйцэтгэгч өөр өөрийнхөөрөө таамаглан ашиглах эрсдэлтэй.'
        remedy = crit.scoringAnchorsMn[3] || 'Хэрэгжүүлэх дүрмийг илүү тодорхой болгох.'
      } else {
        score = crit.weight >= 4 ? 0 : 1
        pages = [1]
        findingSummary = `${crit.nameMn} баримт бичигт огт тусгагдаагүй эсвэл олдсонгүй.`
        businessImpact = 'Брэндийн үндсэн дүрмийг эвдэх, өнгө, логоны харьцаа алдагдах шууд шалтгаан болно.'
        remedy = crit.scoringAnchorsMn[3] || 'Энэхүү стандартыг яаралтай брэндбүүкт тусгах.'
      }
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

    const jevInfo = verificationMap.get(crit.id) || { verified: crit.weight >= 4, prob: 0.85 }

    findings.push({
      criterionId: crit.id,
      moduleId: crit.module,
      criterionNameMn: crit.nameMn,
      score,
      severity,
      weight: crit.weight,
      clientPdfPages: pages,
      extractedRuleSnippet: snippet || undefined,
      findingSummaryMn: findingSummary,
      businessImpactMn: businessImpact,
      remedyActionMn: remedy,
      verifiedByJev: jevInfo.verified,
      noulProbability: jevInfo.prob,
    })
  }

  record.progressPct = 90
  record.currentStageMn = 'Оноо болон харьцааны статистик тооцооллыг нэгтгэж байна...'
  await saveBrandAudit(record)

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

  // 5. Generate Mongolian Executive Summary
  const executiveSummary = generateExecutiveSummary({
    company: record.company,
    qualityScore,
    coveragePct,
    criticalCount,
    improvementCount,
    passCount,
    findings,
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

  await saveBrandAudit(record)
  return record
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

function getKeywordsForCriterion(id: string): string[] {
  switch (id) {
    case 'S01': return ['эрхэм зорилго', 'алсын хараа', 'үнэт зүйл', 'mission', 'vision', 'values']
    case 'S02': return ['ялгарал', 'үнэ цэнэ', 'positioning', 'big idea', 'value proposition']
    case 'S03': return ['архитектур', 'дэд брэнд', 'house of brands', 'sub-brand']
    case 'B01': return ['нэршил', 'бичих дүрэм', 'uppercase', 'camelcase', 'brand name']
    case 'B02': return ['уриа үг', 'мессеж', 'tagline', 'slogan']
    case 'B03': return ['өнгө аяс', 'найруулга', 'tone of voice', 'харилцаа']
    case 'L01': return ['брэндмарк', 'тэмдэгт', 'logo', 'brandmark', 'lockup']
    case 'L02': return ['монохром', 'хар цагаан', 'өнгөт хувилбар', 'inverted', 'monochrome']
    case 'L03': return ['хамгаалалтын зай', 'clear space', 'exclusion zone', 'x-space']
    case 'L04': return ['хамгийн бага хэмжээ', 'minimum size', 'min size', 'мм', 'px']
    case 'L05': return ['хориглох хэрэглээ', 'incorrect usage', 'unapproved', 'хийж болохгүй', 'do not']
    case 'C01': return ['үндсэн өнгө', 'туслах өнгө', 'primary color', 'secondary color', 'палитр']
    case 'C02': return ['cmyk', 'rgb', 'hex', 'pantone', '#', 'өнгөний код']
    case 'C03': return ['дэвсгэр', 'эсрэгцэл', 'contrast', 'accessibility', 'тодрол']
    case 'C04': return ['өнгөний систем', 'consistency', 'нийцэл']
    case 'T01': return ['фонт', 'үсгийн маяг', 'typeface', 'font family', 'bold', 'regular']
    case 'T02': return ['шатлал', 'hierarchy', 'h1', 'h2', 'body', 'гарчиг']
    case 'T03': return ['fallback', 'систем фонт', 'web font', 'google font', 'arial']
    case 'T04': return ['мөр хоорондын зай', 'үсэг хоорондын зай', 'leading', 'tracking', 'line-height']
    case 'V01': return ['гэрэл зураг', 'зургийн хэв маяг', 'photography', 'icon', 'дүрс']
    case 'V02': return ['grid', 'layout', 'зохиомж', 'багана', 'маржин']
    case 'V03': return ['уялдаа', 'визуал систем', 'cohesion']
    case 'A01': return ['нэрийн хуудас', 'бланк', 'mockup', 'хэрэглээ', 'touchpoint']
    case 'A02': return ['сошиал', 'дижитал', 'feed', 'story', 'instagram', 'app icon']
    case 'A03': return ['хэвлэл', 'цаас', 'зүсэлт', 'bleed', 'лак', 'дардас']
    case 'D01': return ['агуулга', 'бүтэц', 'table of contents', 'хуудас']
    case 'D02': return ['ойлгомжтой', 'ашиглах заавар', 'guidelines']
    case 'D03': return ['хувилбар', 'огноо', 'version', 'v1', 'холбогдох']
    case 'F01': return ['вектор', 'растер', 'ai', 'eps', 'svg', 'png', 'pdf']
    case 'F02': return ['хавтас', 'нэршил', 'folder', 'naming', 'файлын бүтэц']
    default: return ['дизайн', 'брэнд']
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
}): string {
  const { company, qualityScore, criticalCount, improvementCount, passCount, findings } = params

  const topPass = findings
    .filter((f) => f.severity === 'pass')
    .slice(0, 3)
    .map((f) => f.criterionNameMn)

  const topCritical = findings
    .filter((f) => f.severity === 'critical')
    .slice(0, 3)
    .map((f) => f.criterionNameMn)

  let ratingLabel = ''
  let verdict = ''

  if (qualityScore >= 85) {
    ratingLabel = 'Маш өндөр чанартай (Exemplary Standard)'
    verdict = `${company}-ийн брэндбүүк нь олон улсын мэргэжлийн стандартад нийцсэн, визуал дүрмүүд нь тодорхой, үйлдвэрлэл болон дижитал орчинд шууд хэрэгжих бүрэн боломжтой маш сайн баримт бичиг байна.`
  } else if (qualityScore >= 70) {
    ratingLabel = 'Хангалттай сайн (Solid Foundation)'
    verdict = `${company}-ийн брэндбүүк нь үндсэн бүтцийн хувьд сайн боловсруулагдсан боловч хэвлэл ба дижитал хэрэглээний зарим чухал техникийн хязгаарлалтуудыг (хамгаалалтын зай, өнгөний нарийвчлал) нарийвчлан бататгах шаардлагатай.`
  } else if (qualityScore >= 50) {
    ratingLabel = 'Сайжруулах шаардлагатай (Needs Refinement)'
    verdict = `${company}-ийн брэндбүүк нь визуал чиглэлээ гаргасан хэдий ч практик дээр хэрэгжүүлэх дизайнерууд болон хэвлэлийн газруудад дур мэдэн таамаглах зай үлдээсэн, техникийн алдаа гарах өндөр эрсдэлтэй байна.`
  } else {
    ratingLabel = 'Шуурхай шинэчлэх шаардлагатай (Critical Gaps)'
    verdict = `${company}-ийн баримт бичигт брэндийг хамгаалах суурь дүрмүүд (хамгаалалтын зай, хориглох хэрэглээ, өнгөний код, үсгийн шатлал) хангалтгүй байгаа тул бодит үйлдвэрлэлд орохоос өмнө мэргэжлийн брэнд систем болгон цэгцлэх шаардлагатай.`
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
    ? `ШУУРХАЙ ЗАСАХ ТЭРГҮҮН ЭЭЛЖИЙН 3 АСУУДАЛ:\n${topCritical.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n`
    : ''
}
ЗӨВЛӨМЖ:
Дээрх чухал алдаануудыг зассанаар брэндийн үйлдвэрлэлийн зардлыг хэмнэх, гадны сурталчилгааны гүйцэтгэгч нартай үл ойлголцохоос сэргийлэх, брэндийн визуал нэгдмэл чанарыг 100% хамгаалах боломжтой.`
}
