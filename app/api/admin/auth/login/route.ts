import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminPassword,
  computeSessionHash,
  getAdminPassword,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string }
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Нууц үг оруулна уу' },
        { status: 400 }
      )
    }

    const isValid = await verifyAdminPassword(password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Нууц үг буруу байна. Дахин оролдоно уу.' },
        { status: 401 }
      )
    }

    const token = await computeSessionHash(getAdminPassword())

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Failed in admin login API', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
