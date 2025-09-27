import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface CookieStore {
  getAll?: () => Array<{ name: string; value: string }>;
  get?: (name: string) => { value: string } | undefined;
}

interface CookieHelpers {
  getAll(): Record<string, string>;
  setAll(cookies: Record<string, string>): void;
  get(name: string): string | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void;
  remove(name: string, options?: Record<string, unknown>): void;
}

export const supabase = async () => {
  // cookies() may be async in some Next runtimes; await to get the store
  // and then provide the cookie helpers required by @supabase/ssr.
  const cookieStore: CookieStore = await cookies()

  const cookieHelpers: CookieHelpers = {
    // read all cookies into a plain object
    getAll() {
      const all: Record<string, string> = {}
      try {
        const entries = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : []
        for (const c of entries) {
          if (c?.name) all[c.name] = c.value
        }
      } catch {
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
      } catch {
        return undefined
      }
    },
    set(_name: string, _value: string, _options?: Record<string, unknown>) {
      // no-op - unused params prefixed with _ to avoid ESLint warnings
      void _name; void _value; void _options;
      return
    },
    remove(_name: string, _options?: Record<string, unknown>) {
      // no-op - unused params prefixed with _ to avoid ESLint warnings
      void _name; void _options;
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