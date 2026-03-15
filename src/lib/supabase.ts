import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Poem = {
  id: string
  slug: string
  text: string
  author_name: string | null
  is_anonymous: boolean
  created_at: string
  appreciation_count?: number
}
