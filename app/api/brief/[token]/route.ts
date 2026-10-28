import { NextResponse } from 'next/server'
import { getProjectByToken, updateProject } from '@/lib/db'
import { jev, generateAssistantResponse } from '@/lib/ai'
import { sendTelegramNotification } from '@/lib/telegram'
import { evaluateGuardrails } from '@/lib/ai-guardrails'
import { analyzeBriefWithTypeSafe } from '@/lib/typesafe-brief-analyzer'

const questions = [
  {
    key: 'projectType',
    text: 'Ямар төрлийн дизайн танд хэрэгтэй байна вэ?',
    chips: ['Лого систем', 'Брэнд иденти', 'Сав баглаа боодол', 'Вэб UI/UX', 'Ребрэндинг'],
    category: 'Төслийн төрөл',
  },
  {
    key: 'business',
    text: 'Танай брэнд/бизнесийн нэр болон үйл ажиллагааны үндсэн чиглэл, гол үнэ цэнийг товч танилцуулна уу.',
    chips: [],
    category: 'Бизнесийн мөн чанар',
  },
  {
    key: 'goal',
    text: 'Энэ төслийн хамгийн гол зорилго, өрсөлдөгчдөөс ялгарах онцлог юу вэ?',
    chips: ['Шинэ брэнд эхлүүлэх', 'Илүү premium харагдах', 'Одоогийн брэндийг шинэчлэх', 'Борлуулалтаа нэмэгдүүлэх'],
    category: 'Төслийн зорилго',
  },
  {
    key: 'audience',
    text: 'Танай гол зорилтот хэрэглэгчид хэн бэ? (Нас, хүйс, сонирхол, амьдралын хэв маяг)',
    chips: ['20–35 насны залуус', 'Залуу мэргэжилтнүүд', 'Дээд зэрэглэлийн хэрэглэгчид', 'Гэр бүл, эцэг эхчүүд'],
    category: 'Зорилтот хэрэглэгчид',
  },
  {
    key: 'style',
    text: 'Брэндээ хүн гэж төсөөлбөл ямар зан чанар, өнгө аяс, сэтгэгдэл төрүүлэх вэ?',
    chips: ['Минимал & Цэвэрхэн', 'Тансаг & Premium', 'Эрч хүчтэй & Зоримог', 'Дулаан & Органик'],
    category: 'Өнгө аяс & Хэв маяг',
  },
  {
    key: 'deliverables',
    text: 'Танд хүлээлгэн өгөх ямар хэрэгцээт материалууд (Touchpoints) шаардлагатай вэ?',
    chips: ['Логоны хувилбарууд', 'Өнгө & Фонт систем', 'Брэндбүүк (Гарын авлага)', 'Эх вектор файлууд', 'Нэрийн хуудас, бланк'],
    category: 'Хүлээлгэн өгөх материал',
  },
  {
    key: 'timeline',
    text: 'Энэхүү төсөл танай талд яг хэзээ гэхэд бэлэн болсон байх шаардлагатай вэ? (Төслийн товлосон хугацаа эсвэл нээлтийн өдөр)',
    chips: ['14 хоногийн дотор (Яаралтай)', '3-4 долоо хоногт', '1-2 сарын хугацаанд', 'Уян хатан (Хугацаа тохиролцох)'],
    category: 'Хугацааны хүлээлт',
  },
  {
    key: 'budget',
    text: 'Энэхүү дизайны ажилд танай байгууллагаас төлөвлөж буй төсвийн хүлээлт ямар түвшинд байгаа вэ?',
    chips: ['2.5 сая ₮ хүртэл', '3.5 - 5 сая ₮', '5 - 8 сая ₮', '8 сая ₮-с дээш (Бүрэн цогц)', 'Санал болгох үнийг харах'],
    category: 'Төсвийн төлөвлөгөө',
  },
  {
    key: 'references',
    text: 'Танд таалагддаг visual референс, өнгө төрх эсвэл холбоос байна уу? (Байхгүй бол алгасаж болно)',
    chips: ['Одоогоор байхгүй, дизайнерын саналыг харна', 'Минимал жишээнүүд', 'Орчин үеийн цэвэрхэн'],
    category: 'Visual референс',
  },
  {
    key: 'serviceScope',
    text: 'Таны өгсөн мэдээлэл дээр үндэслэн брэндийн үндсэн дүр төрх, лого систем, өнгө, брэндбүүк бүхий багцыг үйлчилгээний цар хүрээ болгон санал болгож байна. Та яг ийм үйлчилгээ авах хүсэлтэй байгаагаа хүлээн зөвшөөрч, дизайнерын бодит үнэ болон хугацааны санал авах хүсэлтээ илгээх үү?',
    chips: ['Тийм, энэ үйлчилгээний цар хүрээг хүлээн зөвшөөрч байна', 'Бүрэн цогц брэнд багцаар авахыг хүсэж байна', 'Эхний ээлжинд зөвхөн лого систем авахыг хүсэж байна'],
    category: 'Үйлчилгээ баталгаажуулалт',
  },
]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const project = await getProjectByToken(token)

  if (!project) {
    return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
  }

  const brief = project.brief
  const nextQuestion = questions.find((q) => !brief.answers[q.key])
  const answeredCount = Object.keys(brief.answers).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  return NextResponse.json({
    answers: brief.answers,
    messages: brief.messages,
    next: nextQuestion,
    progress,
    complete: brief.complete || !nextQuestion,
    classifiedType: brief.classifiedType,
    aestheticScore: brief.aestheticScore,
    summary: brief.summary,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = (await request.json()) as { answer?: string; key?: string }
    const project = await getProjectByToken(token)

    if (!project) {
      return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
    }

    const currentBrief = project.brief
    const answerTrimmed = body.answer?.trim() || ''

    if (!answerTrimmed) {
      return NextResponse.json({ error: 'Хариулт хоосон байна' }, { status: 400 })
    }

    // -------------------------------------------------------------
    // 1. TOKEN PROTECTION GUARDRAILS (0-Token Local Check)
    // -------------------------------------------------------------
    const guard = evaluateGuardrails(answerTrimmed, currentBrief.messages.length, token)
    if (!guard.allowed) {
      // Append user message & localized refusal message
      currentBrief.messages.push({
        role: 'CLIENT',
        content: answerTrimmed,
        timestamp: new Date().toISOString(),
      })
      currentBrief.messages.push({
        role: 'AI',
        content: guard.message,
        timestamp: new Date().toISOString(),
      })

      await updateProject(token, { brief: currentBrief })

      const nextQuestion = questions.find((q) => !currentBrief.answers[q.key])
      const answeredCount = Object.keys(currentBrief.answers).length
      const progress = Math.round((answeredCount / questions.length) * 100)

      return NextResponse.json({
        answers: currentBrief.answers,
        messages: currentBrief.messages,
        next: nextQuestion,
        progress,
        complete: currentBrief.complete,
        classifiedType: currentBrief.classifiedType,
        aestheticScore: currentBrief.aestheticScore,
        summary: currentBrief.summary,
      })
    }

    // -------------------------------------------------------------
    // 2. Identify Target Question Key
    // -------------------------------------------------------------
    let targetKey = body.key
    const pendingQuestion = questions.find((q) => !currentBrief.answers[q.key])

    if (!targetKey || targetKey === 'chat') {
      targetKey = pendingQuestion?.key || 'general'
    }

    // Check if the user is asking a question rather than answering
    const isUserAskingQuestion =
      answerTrimmed.includes('?') ||
      answerTrimmed.endsWith('уу') ||
      answerTrimmed.endsWith('үү') ||
      answerTrimmed.endsWith('вэ') ||
      answerTrimmed.endsWith('бэ')

    // Append client message
    currentBrief.messages.push({
      role: 'CLIENT',
      content: answerTrimmed,
      timestamp: new Date().toISOString(),
    })

    let aiResponseText = ''

    if (isUserAskingQuestion) {
      // User is asking a design/process question: answer it without marking the question as completed
      aiResponseText = await generateAssistantResponse(
        currentBrief.messages,
        pendingQuestion ? pendingQuestion.text : 'Төслийн нэмэлт асуулт',
        false
      )
    } else {
      // User is providing an answer for targetKey
      currentBrief.answers[targetKey] = answerTrimmed

      // Evaluate sufficiency with Jev Noul
      const sufficiencyEval = await jev.noul(
        `Does the client's answer provide clear, actionable details for a design brief regarding ${targetKey}?`,
        { key: targetKey, answer: answerTrimmed }
      )

      const nextQuestion = questions.find((q) => !currentBrief.answers[q.key])
      const isNowComplete = !nextQuestion

      if (isNowComplete) {
        // Finalize brief with Jev Choice & Score
        const classified = await jev.choice(
          'What is the primary design project category?',
          ['Brand Identity System', 'Logo Design', 'Packaging Design', 'Digital / Web UI', 'Rebranding'],
          currentBrief.answers
        )

        const aesthetic = await jev.score(
          'Rate the sophistication and premium level required for this project (1 to 5):',
          ['1: Basic/Standard', '2: Approachable Commercial', '3: Modern High-Street', '4: Premium Boutique', '5: Luxury Avant-Garde'],
          currentBrief.answers
        )

        currentBrief.complete = true
        currentBrief.classifiedType = classified.selected
        currentBrief.aestheticScore = aesthetic.score
        currentBrief.summary = `${project.company || project.name} төслийн бриф амжилттай бүрдлээ. Чиглэл: ${classified.selected}. Хугацаа: ${currentBrief.answers.timeline || 'Тодорхойгүй'}. Төсөв: ${currentBrief.answers.budget || 'Тодорхойгүй'}. Үйлчилгээ баталгаажуулалт: ${currentBrief.answers.serviceScope || 'Баталгаажсан'}.`

        aiResponseText = `Баярлалаа! Таны дизайны ажлын шаардлага болон үйлчилгээний цар хүрээ амжилттай баталгаажлаа. Таны хүссэн "${classified.selected}" чиглэл, хугацааны хүлээлт (${currentBrief.answers.timeline || 'уян хатан'}), төсвийн төлөвлөгөөтэй дизайнер Т. Өсөхбаяр нягтлан танилцаж байна. Дизайнер ажлын нарийвчилсан үнэ болон товлосон хугацааны саналаа (Proposal) бэлтгэн төслийн талбарт удахгүй илгээх бөгөөд та түүнийг хүлээн зөвшөөрснөөр гэрээний шат руу шилжинэ.`

        // Dispatch Telegram Notification
        await sendTelegramNotification({
          title: '✨ Харилцагч БРИФЭЭ бүрэн илгээлээ (Санал илгээхийг хүлээж буй)',
          message: `<b>Төсөл:</b> ${project.name}\n<b>Компани:</b> ${project.company}\n<b>Тодорхойлогдсон үйлчилгээ:</b> ${classified.selected}\n<b>Хүссэн хугацаа:</b> ${currentBrief.answers.timeline || 'Байхгүй'}\n<b>Төсвийн хүлээлт:</b> ${currentBrief.answers.budget || 'Байхгүй'}\n<b>Үйлчилгээ баталгаажуулалт:</b> ${currentBrief.answers.serviceScope || 'Зөвшөөрсөн'}\n<b>Зорилго:</b> "${currentBrief.answers.goal || 'Байхгүй'}"`,
          projectToken: token,
        })
      } else {
        // Not yet complete - generate next conversational guide prompt
        aiResponseText = await generateAssistantResponse(
          currentBrief.messages,
          nextQuestion.text,
          !sufficiencyEval.result && sufficiencyEval.prob < 0.45
        )
      }
    }

    // Append AI response
    currentBrief.messages.push({
      role: 'AI',
      content: aiResponseText,
      timestamp: new Date().toISOString(),
    })

    const nextQuestion = questions.find((q) => !currentBrief.answers[q.key])
    const answeredCount = Object.keys(currentBrief.answers).length
    currentBrief.progress = Math.round((answeredCount / questions.length) * 100)

    // Compute updated TypeSafe Brief Analysis
    try {
      currentBrief.analysis = await analyzeBriefWithTypeSafe({
        answers: currentBrief.answers,
        messages: currentBrief.messages,
        companyName: project.company || project.name,
        projectName: project.name,
      })
    } catch (e) {
      console.warn('Failed running brief analysis on submit', e)
    }

    // Save update to database
    await updateProject(token, {
      brief: currentBrief,
      status: currentBrief.complete
        ? 'brief_submitted'
        : project.status === 'lead'
        ? 'brief_pending'
        : project.status,
    })

    // If client just finished the brief, alert the designer immediately via Telegram
    if (currentBrief.complete && !project.brief.complete) {
      await sendTelegramNotification({
        title: '📋 БРИФИЙН СУДАЛГАА АМЖИЛТТАЙ ДҮҮРЛЭЭ!',
        message: `<b>Төсөл:</b> ${project.name}\n<b>Байгууллага:</b> ${project.company}\n<b>Төсөв:</b> ${currentBrief.answers.budget || 'Тодорхойлоогүй'}\n<b>Хугацаа:</b> ${currentBrief.answers.timeline || 'Тодорхойлоогүй'}\n<b>Үйлчилгээ:</b> ${currentBrief.answers.serviceScope || 'Брэнд дизайн'}\n\n👉 <i>Админ CRM дээрээс шалган үнийн санал илгээнэ үү.</i>`,
        projectToken: token,
      })
    }

    return NextResponse.json({
      answers: currentBrief.answers,
      messages: currentBrief.messages,
      next: nextQuestion,
      progress: currentBrief.progress,
      complete: currentBrief.complete,
      classifiedType: currentBrief.classifiedType,
      aestheticScore: currentBrief.aestheticScore,
      summary: currentBrief.summary,
    })
  } catch (error) {
    console.error('Failed submitting brief answer', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
