'use client'
import { useEffect, useState, useCallback } from 'react'
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

export default function DiscoverPage() {
  const [poem, setPoem] = useState<Poem | null>(null)
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)
  const [appreciated, setAppreciated] = useState(false)
  const [appreciationCount, setAppreciationCount] = useState(0)
  const [appreciating, setAppreciating] = useState(false)
  const [movedAnim, setMovedAnim] = useState(false)
  const [visible, setVisible] = useState(true)

  const fetchPoem = useCallback(async () => {
    setLoading(true)
    setVisible(false)
    try {
      const res = await fetch('/api/poems/random')
      const data = await res.json()
      if (!data.poem) {
        setEmpty(true)
        setPoem(null)
      } else {
        setPoem(data.poem)
        setAppreciationCount(data.poem.appreciation_count ?? 0)
        const key = `poetrypond_appreciated_${data.poem.slug}`
        setAppreciated(!!localStorage.getItem(key))
        setEmpty(false)
      }
    } catch {
      setEmpty(true)
    }
    setLoading(false)
    setTimeout(() => setVisible(true), 50)
  }, [])

  useEffect(() => { fetchPoem() }, [fetchPoem])

  const handleMoveMe = async () => {
    if (appreciated || appreciating || !poem) return
    setAppreciating(true)
    const sid = getOrCreateSession()
    try {
      const res = await fetch(`/api/poems/${poem.slug}/appreciate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      })
      const data = await res.json()
      if (res.ok) {
        setAppreciated(true)
        setAppreciationCount(data.appreciation_count)
        localStorage.setItem(`poetrypond_appreciated_${poem.slug}`, '1')
        setMovedAnim(true)
        setTimeout(() => setMovedAnim(false), 600)
      }
    } finally {
      setAppreciating(false)
    }
  }

  const displayAuthor = poem
    ? (poem.is_anonymous ? 'Anonymous' : (poem.author_name || 'Anonymous'))
    : ''

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-10">
          <h1 className="text-3xl mb-2" style={{ color: 'var(--gold)' }}>Discover</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            A random poem, found just for you.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            fishing from the pond...
          </div>
        )}

        {!loading && empty && (
          <div className="text-center py-20">
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>The pond is quiet. Be the first to drop a poem.</p>
            <Link href="/submit" className="text-sm" style={{ color: 'var(--accent)' }}>
              Submit a poem →
            </Link>
          </div>
        )}

        {!loading && poem && (
          <div className={visible ? 'fade-in' : ''} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
            {/* Poem card */}
            <article className="rounded-2xl p-8 mb-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="poem-text mb-8">{poem.text}</p>
              <div className="flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  — {displayAuthor}
                </span>
                <Link href={`/p/${poem.slug}`}
                  className="text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {formatDate(poem.created_at)} ↗
                </Link>
              </div>
            </article>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
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

              <button
                onClick={fetchPoem}
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
                ◎ Another poem
              </button>

              <Link href={`/p/${poem.slug}`}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                ↗ View poem
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
