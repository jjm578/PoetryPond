import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data, error } = await supabase
      .from('poem_appreciations')
      .select('poem_id')

    if (error) {
      console.error('Moved poems error:', error)
      return NextResponse.json({ error: 'Failed to fetch poems' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ poems: [] })
    }

    const counts: Record<string, number> = {}
    for (const row of data) {
      counts[row.poem_id] = (counts[row.poem_id] ?? 0) + 1
    }

    const poemIds = Object.keys(counts)

    const { data: poems, error: poemsError } = await supabase
      .from('poems')
      .select('id, slug, text, author_name, is_anonymous, created_at')
      .in('id', poemIds)

    if (poemsError || !poems) {
      return NextResponse.json({ error: 'Failed to fetch poems' }, { status: 500 })
    }

    const result = poems
      .map((p) => ({ ...p, appreciation_count: counts[p.id] ?? 0 }))
      .sort((a, b) => b.appreciation_count - a.appreciation_count)

    return NextResponse.json({ poems: result })
  } catch (err) {
    console.error('Moved poems error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
