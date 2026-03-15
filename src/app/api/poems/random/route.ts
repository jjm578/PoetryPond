import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { count, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })

    if (countError || !count || count === 0) {
      return NextResponse.json({ poem: null })
    }

    const offset = Math.floor(Math.random() * count)

    const { data, error } = await supabase
      .from('poems')
      .select('id, slug, text, author_name, is_anonymous, created_at')
      .range(offset, offset)
      .single()

    if (error || !data) {
      return NextResponse.json({ poem: null })
    }

    const { count: appreciationCount } = await supabase
      .from('poem_appreciations')
      .select('*', { count: 'exact', head: true })
      .eq('poem_id', data.id)

    return NextResponse.json({
      poem: { ...data, appreciation_count: appreciationCount ?? 0 },
    })
  } catch (err) {
    console.error('Random poem error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
