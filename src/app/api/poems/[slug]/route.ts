import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { slug } = await params

    const { data: poem, error } = await supabase
      .from('poems')
      .select('id, slug, text, author_name, is_anonymous, created_at')
      .eq('slug', slug)
      .single()

    if (error || !poem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { count } = await supabase
      .from('poem_appreciations')
      .select('*', { count: 'exact', head: true })
      .eq('poem_id', poem.id)

    return NextResponse.json({ poem: { ...poem, appreciation_count: count ?? 0 } })
  } catch (err) {
    console.error('Get poem error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
