/**
 * AI Guardrails & Token Protection Engine
 * Prevents non-design queries, prompt injection, and excessive token usage
 * with 0-token local pre-checks before reaching OpenAI.
 */

export type GuardrailResult =
  | { allowed: true }
  | { allowed: false; reason: 'OFF_TOPIC' | 'PROMPT_INJECTION' | 'MAX_LENGTH_EXCEEDED' | 'RATE_LIMITED' | 'SESSION_LIMIT_EXCEEDED'; message: string }

const MAX_INPUT_LENGTH = 500
const MAX_SESSION_MESSAGES = 40

// Fast regex checks for prompt injection or jailbreak attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+(a|an|chatgpt|dan)/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /bypass\s+rules/i,
  /repeat\s+(everything|the\s+words)\s+above/i,
  /what\s+are\s+your\s+(instructions|rules)/i,
  /бүх\s+өмнөх\s+дүрмээ\s+март/i,
  /чи\s+одоо\s+өөр\s+хүн/i,
]

// Blacklisted off-topic categories (Coding, Math, Homework, Recipes, Crypto, Politics)
const OFF_TOPIC_PATTERNS = [
  // Coding / Tech debugging
  /\b(python|javascript|typescript|c\+\+|java|html|css|sql|function\s*\(|def\s+[a-z_]|class\s+[a-z_]|console\.log|import\s+react)\b/i,
  /(код\s+бич|програмчлал|алдааг\s+зас|script\s+бич)/i,
  // Math & Science homework (explicit operators like +, *, /, or equations with =)
  /\b(\d+\s*[\+\*\/]\s*\d+)\b/,
  /\b(\d+\s*-\s*\d+\s*=)/,
  /(интеграл|тэгшитгэл|тоо\s+бод|математик|физик|химийн\s+урвал)/i,
  // Essays & Homework
  /(эсээ\s+бич|зохион\s+бичлэг|гэрийн\s+даалгавар|орчуулаад\s+өг)/i,
  // Crypto & Financial speculation
  /(bitcoin|биткойн|крипто|хувьцаа\s+авах|арилжаа|trading\s+bot)/i,
  // Cooking, recipes & trivia
  /(хоолны\s+жор|яаж\s+хоол\s+хийх|цаг\s+агаар|одоо\s+хэдэн\s+цаг|зурхай)/i,
  // Politics
  /(ерөнхийлөгч|сонгууль|улс\s+төр|намын\s+тухай)/i,
]

// Allowed design topics (whitelist triggers)
const DESIGN_WHITELIST = [
  'дизайн', 'design', 'брэнд', 'brand', 'лого', 'logo', 'фонт', 'font',
  'өнгө', 'color', 'стиль', 'style', 'хэв маяг', 'сав баглаа', 'packaging',
  'вэб', 'web', 'сайт', 'site', 'нэр', 'naming', 'товчлол', 'брэндбүүк', 'brandbook',
  'материал', 'deliverable', 'гэрээ', 'үнэ', 'хугацаа', 'baysaass', 'өсөхбаяр',
  'зорилго', 'хэрэглэгч', 'зах зээл', 'бизнес', 'компани', 'төсөл', 'бриф', 'brief',
  'нас', 'залуус', 'мэргэжилтэн', 'хүүхэд', 'эмэгтэй', 'эрэгтэй', 'сая', 'төгрөг',
  'төсөв', 'хугацаа', 'хоног', 'долоо хоног', 'сар', 'тийм', 'зөвшөөрч', 'баталгаажуулж', 'үйлчилгээ'
]

// In-memory rate limiting map for token / IP (key -> lastTimestamp)
const requestTimestamps = new Map<string, number>()

export function evaluateGuardrails(
  userInput: string,
  totalMessagesInSession: number,
  sessionKey: string
): GuardrailResult {
  const text = userInput.trim()

  // 1. Check length
  if (text.length > MAX_INPUT_LENGTH) {
    return {
      allowed: false,
      reason: 'MAX_LENGTH_EXCEEDED',
      message: `Хариултын урт хэтэрсэн байна (дээд тал нь ${MAX_INPUT_LENGTH} тэмдэгт). Та товч бөгөөд тодорхой бичнэ үү.`,
    }
  }

  // 2. Check session message count
  if (totalMessagesInSession >= MAX_SESSION_MESSAGES) {
    return {
      allowed: false,
      reason: 'SESSION_LIMIT_EXCEEDED',
      message: `Таны энэ төслийн бриф ярилцлагын дээд хязгаар (${MAX_SESSION_MESSAGES} зурвас) дууссан байна. Одоогийн хариултуудаар бриф амжилттай хадгалагдсан бөгөөд дизайнер тантай тун удахгүй холбогдох болно.`,
    }
  }

  // 3. Rate limiting cooldown (min 0.3 seconds between messages)
  const now = Date.now()
  const lastTime = requestTimestamps.get(sessionKey) || 0
  if (now - lastTime < 300) {
    return {
      allowed: false,
      reason: 'RATE_LIMITED',
      message: 'Түр хүлээнэ үү... (Хэт хурдан зурвас илгээхээс сэргийлж байна)',
    }
  }
  requestTimestamps.set(sessionKey, now)

  // 4. Prompt injection check
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: 'PROMPT_INJECTION',
        message: 'Уучлаарай, системийн дүрэм болон даалгаврыг өөрчлөх хүсэлтийг хүлээн авах боломжгүй. Би зөвхөн брэнд дизайны бриф тодруулахад танд тусална.',
      }
    }
  }

  // 5. Off-topic check (Only check if text is long enough and not explicitly hitting whitelist)
  const lowerText = text.toLowerCase()
  const hasWhitelist = DESIGN_WHITELIST.some((kw) => lowerText.includes(kw))

  if (!hasWhitelist) {
    for (const pattern of OFF_TOPIC_PATTERNS) {
      if (pattern.test(text)) {
        return {
          allowed: false,
          reason: 'OFF_TOPIC',
          message: 'Уучлаарай, би baysaass студийн брэнд дизайн болон ажлын шаардлага (бриф) тодорхойлох туслах тул зөвхөн брэнд, лого, сав баглаа боодол, дизайны хүрээнд хариулах боломжтой. Танай шинэ төсөл эсвэл брэндийн дизайны талаар хэрхэн туслах вэ?',
        }
      }
    }
  }

  return { allowed: true }
}
