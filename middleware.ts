import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabase as supabaseFactory } from './lib/supabase/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a server client with cookie helpers that read from the request
  // and write to the response so Supabase can set auth cookies.
  const cookieHelpers = {
    getAll() {
      const all: Record<string, string> = {}
      for (const c of request.cookies.getAll()) {
        if (c?.name) all[c.name] = c.value
      }
      return all
    },
    setAll(raw: Record<string, string>) {
      // Apply cookies to the response
      Object.entries(raw).forEach(([name, value]) => {
        response.cookies.set({ name, value })
      })
    },
    // deprecated helpers for compatibility
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string, options: any) {
      response.cookies.set({ name, value, ...options })
    },
    remove(name: string, options: any) {
      response.cookies.set({ name, value: '', maxAge: 0, ...options })
    },
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieHelpers,
    }
  )

  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)',
  ],
}