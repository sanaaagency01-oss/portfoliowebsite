import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from './lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // 1. Check if the route is an admin page or admin API
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  // 2. Allow auth API routes without authentication
  if (pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const isValid = await verifyAdminSessionToken(sessionToken)

  // 3. Special handling for /admin/login page
  if (pathname === '/admin/login') {
    if (isValid) {
      // Already logged in, redirect to admin home
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // 4. For any other /admin or /api/admin route, require valid session
  if (!isValid) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: 'Unauthorized: Админ эрх шаардлагатай' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/admin/login', request.url)
    const nextPath = pathname + search
    if (nextPath && nextPath !== '/admin') {
      loginUrl.searchParams.set('next', nextPath)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
