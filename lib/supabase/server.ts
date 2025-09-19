import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const supabase = async () => {
  // cookies() may be async in some Next runtimes; await to get the store
  // and then provide the cookie helpers required by @supabase/ssr.
  const cookieStore: any = await cookies()

  const cookieHelpers: any = {
    // read all cookies into a plain object
    getAll() {
      const all: Record<string, string> = {}
      try {
        const entries = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : []
        for (const c of entries) {
          if (c?.name) all[c.name] = c.value
        }
      } catch (e) {
        // swallow and return empty
      }
      return all
    },
    // setAll is a best-effort no-op in server component contexts where
    // modifying the response cookies isn't available. We expose it so
    // createServerClient won't throw; callers that need to set cookies
    // (middleware/route handlers) should use a different helper.
    setAll(_: Record<string, string>) {
      // no-op in server component context
      // If you need to set cookies from a server action or middleware,
      // use the middleware implementation which has access to the
      // NextResponse object and can set response.cookies.
      return
    },
    // Deprecated helpers kept for compatibility
    get(name: string) {
      try {
        return cookieStore.get?.(name)?.value ?? undefined
      } catch (e) {
        return undefined
      }
    },
    set(_name: string, _value: string, _options: any) {
      // no-op
      return
    },
    remove(_name: string, _options: any) {
      // no-op
      return
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieHelpers,
    }
  )
}