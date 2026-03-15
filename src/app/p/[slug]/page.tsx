'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { Poem } from '@/lib/supabase'

function getOrCreateSession(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('poetrypond_session')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('poetrypond_session', sid)
  }
  return sid
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PoemPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const isNew = searchParams.get('new') === '1'

  const [poem, setPoem] = useState<Poem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [appreciated, setAppreciated] = useState(false)
  const [appreciationCount, setAppreciationCount] = useState(0)
  const [appreciating, setAppreciating] = useState(false)
  const [movedAnim, setMovedAnim] = useState(false)

  const fetchPoem = useCallback(async () => {
    try {
      const res = await fetch(`/api/poems/${slug}`)
      if (res.status === 404) { setNotFound(true); setLoading(false); return }
      const data = await res.json()
      setPoem(data.poem)
      setAppreciationCount(data.poem?.appreciation_count ?? 0)

      // Check if this session already appreciated
      const sid = getOrCreateSession()
      const key = `poetrypond_appreciated_${slug}`
      if (localStorage.getItem(key)) setAppreciated(true)
    } catch {
      setNotFound(true)
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchPoem() }, [fetchPoem])

  const handleMoveMe = async () => {
    if (appreciated || appreciating || !poem) return
    setAppreciating(true)
    const sid = getOrCreateSession()
    try {
      const res = await fetch(`/api/poems/${slug}/appreciate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      })
      const data = await res.json()
      if (res.ok) {
        setAppreciated(true)
        setAppreciationCount(data.appreciation_count)
        localStorage.setItem(`poetrypond_appreciated_${slug}`, '1')
        setMovedAnim(true)
        setTimeout(() => setMovedAnim(false), 600)
      }
    } finally {
      setAppreciating(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''

  const handleCopyLink = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Nav />
        <div style={{ color: 'var(--text-muted)' }} className="fade-in">drifting through the pond...</div>
      </main>
    )
  }

  if (notFound || !poem) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <Nav />
        <div className="text-center fade-in">
          <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>This poem has drifted away.</p>
          <Link href="/discover" className="text-sm" style={{ color: 'var(--accent)' }}>Discover another →</Link>
        </div>
      </main>
    )
  }

  const displayAuthor = poem.is_anonymous ? 'Anonymous' : (poem.author_name || 'Anonymous')

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="fade-in">
          {isNew && (
            <div className="rounded-xl px-5 py-4 mb-8 text-sm"
              style={{ background: 'rgba(155,140,255,0.08)', border: '1px solid rgba(155,140,255,0.2)', color: 'var(--accent)' }}>
              ✦ Your poem has entered the pond. It now floats freely.
            </div>
          )}

          {/* Poem */}
          <article className="rounded-2xl p-8 mb-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="poem-text mb-8">{poem.text}</p>
            <div className="flex items-center justify-between"
              style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                — {displayAuthor}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {formatDate(poem.created_at)}
              </span>
            </div>
          </article>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Moved Me button */}
            <button
              onClick={handleMoveMe}
              disabled={appreciated || appreciating}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm transition-all duration-300"
              style={{
                background: appreciated ? 'rgba(212,184,150,0.1)' : 'var(--surface)',
                border: `1px solid ${appreciated ? 'var(--gold)' : 'var(--border)'}`,
                color: appreciated ? 'var(--gold)' : 'var(--text-muted)',
                cursor: appreciated ? 'default' : 'pointer',
                boxShadow: movedAnim ? '0 0 40px var(--gold-glow)' : 'none',
              }}
            >
              <span>{appreciated ? '✦' : '✧'}</span>
              <span>{appreciated ? 'Moved' : 'This moved me'}</span>
              {appreciationCount > 0 && (
                <span className="ml-1 text-xs" style={{ opacity: 0.7 }}>{appreciationCount}</span>
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm transition-all duration-200"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ⬡ Copy link
            </button>

            {/* Discover another */}
            <button
              onClick={() => router.push('/discover')}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm transition-all duration-200"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ◎ Discover another
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
