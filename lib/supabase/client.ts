import { createClient } from '@supabase/supabase-js'

// Client-side supabase instance using public environment variables
export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)