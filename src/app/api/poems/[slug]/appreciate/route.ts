import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { slug } = await params
    const body = await request.json()
    const { session_id } = body

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const { data: poem, error: poemError } = await supabase
      .from('poems')
      .select('id')
      .eq('slug', slug)
      .single()

    if (poemError || !poem) {
      return NextResponse.json({ error: 'Poem not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('poem_appreciations')
      .insert({ poem_id: poem.id, session_id })

    const alreadyAppreciated = error?.code === '23505'

    if (error && !alreadyAppreciated) {
      console.error('Appreciation insert error:', error)
      return NextResponse.json({ error: 'Failed to record appreciation' }, { status: 500 })
    }

    const { count } = await supabase
      .from('poem_appreciations')
      .select('*', { count: 'exact', head: true })
      .eq('poem_id', poem.id)

    return NextResponse.json({
      success: true,
      already_appreciated: alreadyAppreciated,
      appreciation_count: count ?? 0,
    })
  } catch (err) {
    console.error('Appreciate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
