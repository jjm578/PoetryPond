import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true

  const formData = new FormData()
  formData.append('secret', secret)
  formData.append('response', token)
  formData.append('remoteip', ip)

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  return data.success === true
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const body = await request.json()
    const { text, author_name, is_anonymous, turnstile_token } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Poem text is required' }, { status: 400 })
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'Poem text must be 2000 characters or fewer' }, { status: 400 })
    }

    const ip =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for') ??
      '0.0.0.0'

    if (turnstile_token) {
      const valid = await verifyTurnstile(turnstile_token, ip)
      if (!valid) {
        return NextResponse.json({ error: 'Captcha verification failed' }, { status: 403 })
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      return NextResponse.json({ error: 'Captcha token required' }, { status: 403 })
    }

    const slug = nanoid(10)

    const { data, error } = await supabase
      .from('poems')
      .insert({
        slug,
        text: text.trim(),
        author_name: is_anonymous ? null : (author_name?.trim() || null),
        is_anonymous: Boolean(is_anonymous),
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save poem' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 })
  } catch (err) {
    console.error('Submit poem error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
