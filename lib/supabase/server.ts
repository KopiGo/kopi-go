// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const supabase = () => {
  return createServerComponentClient({
    cookies, // pakai cookie store Next.js
  })
}

//.