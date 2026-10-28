import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getProjectByToken } from '@/lib/db'
import { generateAIScopeAndTasks } from '@/lib/ai'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth'

async function isAuthorizedAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSessionToken(token)
}

export async function POST(request: Request) {
  try {
    const isAuthed = await isAuthorizedAdmin()
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized: Админ эрх шаардлагатай' }, { status: 401 })
    }

    const body = await request.json()
    const { token, answers: customAnswers, companyName, projectName } = body

    let answers = customAnswers || {}
    let company = companyName || 'Захиалагч'
    let name = projectName || 'Брэнд Дизайн'

    if (token) {
      const project = await getProjectByToken(token)
      if (!project) {
        return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
      }
      answers = {
        ...project.brief?.answers,
        ...(customAnswers || {}),
      }
      company = project.company || company
      name = project.name || name
    }

    const suggestion = await generateAIScopeAndTasks({
      projectName: name,
      company,
      answers,
    })

    return NextResponse.json({ success: true, suggestion })
  } catch (error) {
    console.error('Failed generating AI scope suggestion', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const isAuthed = await isAuthorizedAdmin()
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized: Админ эрх шаардлагатай' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'token parameter is required' }, { status: 400 })
    }

    const project = await getProjectByToken(token)
    if (!project) {
      return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
    }

    const suggestion = await generateAIScopeAndTasks({
      projectName: project.name,
      company: project.company,
      answers: project.brief?.answers || {},
    })

    return NextResponse.json({ success: true, suggestion })
  } catch (error) {
    console.error('Failed fetching AI scope suggestion', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
