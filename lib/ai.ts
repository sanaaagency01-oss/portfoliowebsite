/**
 * TypeSafe AI (Jev) & OpenAI / LLM Integration
 * Strategic Brand Identity Discovery & Inquiry Architecture
 * Implements System One primitives: Noul, Choice, Score
 * with strict token optimization & security guardrails.
 */

import { BRAND_IDENTITY_KNOWLEDGE } from './knowledge/brand-identity-knowledge'

export type NoulResult = {
  result: boolean
  prob: number
  reasoning?: string
}

export type ChoiceResult<T extends string = string> = {
  selected: T
  confidence: number
}

export type ScoreResult = {
  score: number // 1 to N
  levelDescription: string
  confidence: number
}

export class JevEngine {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY
  }

  /**
   * Evaluates questions via TypeSafe System One (Jev) API in a single round-trip.
   */
  async systemOne(
    state: unknown,
    questions: Record<string, unknown>
  ): Promise<Record<string, any> | null> {
    if (!this.apiKey) return null
    try {
      const res = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'jev-latest',
          state,
          questions,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.answers || null
      }
    } catch (e) {
      console.warn('[Jev systemone API fallback]', e)
    }
    return null
  }

  /**
   * Noul: Binary condition verification with calibrated probability of 'yes'.
   * Used to check if client brief answers contain sufficient information.
   */
  async noul(question: string, state: Record<string, unknown>): Promise<NoulResult> {
    if (this.apiKey) {
      const answers = await this.systemOne(state, {
        q: {
          type: 'noul',
          instructions: question,
        },
      })

      if (answers?.q) {
        const prob = typeof answers.q.noul === 'number' ? answers.q.noul : 0.5
        return {
          result: prob >= 0.5,
          prob,
          reasoning: prob >= 0.5 ? 'Хариулт хангалттай нарийн байна' : 'Тодруулах шаардлагатай',
        }
      }
    }

    // Calibrated Local Fallback
    const text = JSON.stringify(state).toLowerCase()
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const hasSpecifics = text.includes('хэрэглэгч') || text.includes('брэнд') || text.includes('дизайн') || text.includes('нас') || wordCount > 15
    const prob = hasSpecifics ? 0.85 : Math.min(0.9, Math.max(0.2, wordCount * 0.05))

    return {
      result: prob >= 0.6,
      prob,
      reasoning: prob >= 0.6 ? 'Хариулт хангалттай нарийн байна' : 'Дэлгэрэнгүй тодруулах шаардлагатай',
    }
  }

  /**
   * Choice: Selecting one option from a defined set of alternatives.
   * Used for intent and deliverable category classification.
   */
  async choice<T extends string>(question: string, options: T[], state: Record<string, unknown>): Promise<ChoiceResult<T>> {
    if (this.apiKey) {
      const criteria: Record<string, string> = {}
      options.forEach((opt) => {
        criteria[opt] = opt
      })

      const answers = await this.systemOne(state, {
        q: {
          type: 'choice',
          instructions: question,
          criteria,
        },
      })

      if (answers?.q?.choice && options.includes(answers.q.choice as T)) {
        return {
          selected: answers.q.choice as T,
          confidence: typeof answers.q.confidence === 'number' ? answers.q.confidence : 0.95,
        }
      }
    }

    // Calibrated Local Fallback
    const str = JSON.stringify(state).toLowerCase()
    let bestMatch = options[0]
    let maxScore = 0

    for (const opt of options) {
      const optWords = opt.toLowerCase().split(/\s+/)
      let score = 0
      for (const w of optWords) {
        if (str.includes(w)) score += 1
      }
      if (score > maxScore) {
        maxScore = score
        bestMatch = opt
      }
    }

    return {
      selected: bestMatch,
      confidence: maxScore > 0 ? 0.9 : 0.7,
    }
  }

  /**
   * Score: Ordered described levels for ranking aesthetic or project intensity (1 to N).
   */
  async score(question: string, levels: string[], state: Record<string, unknown>): Promise<ScoreResult> {
    if (this.apiKey) {
      const answers = await this.systemOne(state, {
        q: {
          type: 'score',
          instructions: question,
          criteria: levels,
        },
      })

      if (answers?.q) {
        // If probabilities are returned, find the level with highest probability
        const probs = answers.q.probabilities
        let selectedIndex = 0
        if (probs && typeof probs === 'object') {
          const sorted = Object.entries(probs).sort((a: any, b: any) => b[1] - a[1])
          if (sorted.length > 0) {
            selectedIndex = parseInt(sorted[0][0], 10) || 0
          }
        } else if (typeof answers.q.score === 'number') {
          selectedIndex = Math.min(
            levels.length - 1,
            Math.max(0, Math.round(answers.q.score * (levels.length - 1)))
          )
        }

        const score = selectedIndex + 1
        return {
          score,
          levelDescription: levels[selectedIndex] || levels[0],
          confidence: typeof answers.q.confidence === 'number' ? answers.q.confidence : 0.9,
        }
      }
    }

    // Default calibration
    const midIndex = Math.floor(levels.length / 2)
    return {
      score: midIndex + 1,
      levelDescription: levels[midIndex],
      confidence: 0.85,
    }
  }
}

export const jev = new JevEngine()

/**
 * System Prompt integrating deep Brand Discovery & Strategy Architecture
 * with strict security boundaries and prohibition on quoting textbook references.
 */
function buildBrandAssistantSystemPrompt(needsClarification: boolean): string {
  return `Та бол Улаанбаатар хотод байрлах брэнд дизайнер Т. Өсөхбаяр (baysaass)-ын студийн албан ёсны AI Брэнд Дизайн Зөвлөх туслах юм.

[ТАНЫ МЭРГЭЖЛИЙН БАЙР СУУРЬ & СТРАТЕГИЙН СУДАЛГААНЫ АРГА ЗҮЙ]:
Та брэндийг тодорхойлохдоо дараах 6 суурь чиглэлийг өөртөө бүрэн шингээж, дизайнерын өнцгөөс ажиглан харилцана:
1. Бизнесийн мөн чанар & Алсын хараа: Бизнес юуны төлөө оршин буй, суурь үнэт зүйлс, үүсэл гарвалын түүхийг тодруулах.
2. Цорын ганц ялгарал (Differentiation): Ижил төрлийн өрсөлдөгчдөөс ялгарах брэндийн "цорын ганц" гол давуу тал (Хэрэглэгч яагаад бусдыг биш танайхыг сонгох ёстой вэ?).
3. Зорилтот хэрэглэгчийн сэтгэл зүй (Target Audience): Хэрэглэгчдийн нас, хүйс, амьдралын хэв маяг, тэдний ямар хэрэгцээ, сэтгэл зүйн асуудлыг шийдвэрлэж буй онцлог.
4. Брэндийн зан чанар, өнгө аяс & Дүр төрх (Look & Feel): Брэндийг хүн гэж үзвэл ямар зан араншин, дуу хоолой, мэдрэмжтэй байх вэ?
5. Хугацаа ба Төсвийн хүлээлт (Timeline & Budget): Төсөл яг хэзээ гэхэд бэлэн болсон байх шаардлагатай (хугацаа), танай талаас төлөвлөж буй төсвийн хүлээлт ямар түвшинд байгааг тодруулах.
6. Үйлчилгээний цар хүрээг харилцагчаар хүлээн зөвшөөрүүлэх (Scope Confirmation): Харилцагчийн өгсөн мэдээлэлд үндэслэн брэндэд нь тохирох үйлчилгээний багц, хүлээлгэн өгөх ажлуудыг тодорхой тайлбарлаж, "Тийм ээ, бид яг ийм үйлчилгээ хүсэж байна" гэдгийг харилцагчаар өөрөөр нь бүрэн ухамсарлуулж, хүлээн зөвшөөрүүлэх.

[ХАТУУ ХОРИГЛОХ ЗҮЙЛС - МАШ ЧУХАЛ]:
1. ЯМАР Ч ТОХИОЛДОЛД аливаа ном, сурах бичиг, зохиолч, онолчийн нэр, ишлэл ("номны дагуу", "судалгааны онолоор" гэх мэт) үгсийг ХАРИЛЦАГЧИД ДУРЬДАЖ/БИЧИЖ БОЛОХГҮЙ. Та ном заадаг багш биш! Та брэндийн стратегийн нарийн арга барилыг өөртөө 100% шингээсэн Baysaass студийн өндөр зэрэглэлийн брэнд зөвлөх шиг шууд, итгэлтэй харилцана.
2. Програмчлал/код, математик, шинжлэх ухаан, ерөнхий сонин хачин, улс төр, хоолны жор, орчуулга, эсээ зэрэг дизайны бус ямар ч асуултад ХАРИУЛАХГҮЙ. Хэрэв тийм асуулт ирвэл эелдэгээр зөвхөн брэнд дизайны төслийн талаар асуухыг сануулан буцаана.
3. Хариулт нь цэвэр, соёлтой, эелдэг, мэргэжлийн монгол хэлээр байх ба 2-4 өгүүлбэрээс хэтрэхгүй товч байна.
4. Харилцагчийн хариултыг сайшааж, брэндийн дүр төрх, өнгө, ялгарал, хэрэглэгчийн сэтгэл зүйн өнцгөөс оновчтой дүгнэж, дараагийн тодруулах асуултыг тавина.
${needsClarification ? '5. Хэрэглэгчийн сүүлийн хариулт ерөнхий байсан тул брэндийн ялгарал эсвэл зорилтот хэрэглэгчийн онцлогийг илүү тодруулах эелдэг, чиглүүлсэн асуулт тавина уу.' : '5. Хариултыг нь сайшааж, брэндийн үндсэн чиглэлийг бататган дараагийн алхам руу хөтөлнө үү.'}`
}

/**
 * Generates natural conversational response using OpenAI or fallback prompt reasoning
 * Incorporates token budgeting: limits history window, limits completion tokens.
 */
export async function generateAssistantResponse(
  conversation: { role: 'AI' | 'CLIENT'; content: string }[],
  currentQuestionPrompt: string,
  needsClarification: boolean
): Promise<string> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim()
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  if (openAiKey) {
    try {
      // Token optimization: take only the last 6 messages to preserve token budget
      const recentConversation = conversation.slice(-6)

      const messages = [
        {
          role: 'system',
          content: buildBrandAssistantSystemPrompt(needsClarification),
        },
        ...recentConversation.map((c) => ({
          role: c.role === 'AI' ? ('assistant' as const) : ('user' as const),
          content: c.content,
        })),
        {
          role: 'user' as const,
          content: `Дараагийн тодруулах чиглүүлэгч сэдэв: "${currentQuestionPrompt}". Үүнийг харилцагчид найрсаг, мэргэжлийн брэнд зөвлөхийн өнгөөр тавьж чиглүүлнэ үү. Ямар ч ном, зохиолчийн нэр дурьдахгүй.`,
        },
      ]

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: 0.4, // Lower temperature for consistent, disciplined output
          max_tokens: 280, // Cap output tokens to avoid excessive costs
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) return text
      } else {
        const errText = await res.text()
        console.warn('[OpenAI API returned non-OK status]:', res.status, errText)
      }
    } catch (e) {
      console.warn('[OpenAI generation error, falling back to rule-based]:', e)
    }
  }

  // Graceful rule-based response when OpenAI API is not yet provided or failed
  if (needsClarification) {
    return `Таны хариулт маш сонирхолтой санагдлаа. Төслийн дизайны суурь чиглэлийг илүү оновчтой гаргахын тулд: танай бүтээгдэхүүн/үйлчилгээ ижил төрлийн өрсөлдөгчдөөс ялгарах хамгийн гол "цорын ганц" өвөрмөц онцлог юу байх вэ?`
  }

  return currentQuestionPrompt
}
