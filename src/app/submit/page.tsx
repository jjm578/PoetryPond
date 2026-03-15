'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Script from 'next/script'

const MAX_CHARS = 2000

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
  }
}

export default function SubmitPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (siteKey && turnstileRef.current && window.turnstile) {
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: 'dark',
      })
    }
  }, [siteKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('Please write something.')
      return
    }
    if (text.length > MAX_CHARS) {
      setError(`Poem must be ${MAX_CHARS} characters or fewer.`)
      return
    }

    setSubmitting(true)
    setError('')

    let turnstile_token: string | undefined
    if (siteKey && window.turnstile && widgetIdRef.current) {
      turnstile_token = window.turnstile.getResponse(widgetIdRef.current)
    }

    try {
      const res = await fetch('/api/poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author_name: authorName, is_anonymous: isAnonymous, turnstile_token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        if (window.turnstile && widgetIdRef.current) window.turnstile.reset(widgetIdRef.current)
        setSubmitting(false)
        return
      }

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('poetrypond_poems') || '[]')
      existing.unshift({ id: data.id, slug: data.slug, preview: text.slice(0, 80) })
      localStorage.setItem('poetrypond_poems', JSON.stringify(existing.slice(0, 50)))

      router.push(`/p/${data.slug}?new=1`)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  const remaining = MAX_CHARS - text.length

  return (
    <main className="min-h-screen">
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (turnstileRef.current && window.turnstile) {
              widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                sitekey: siteKey,
                theme: 'dark',
              })
            }
          }}
        />
      )}
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
        <div className="fade-in">
          <h1 className="text-3xl mb-2" style={{ color: 'var(--accent)' }}>Submit a Poem</h1>
          <p className="mb-10 text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No account needed. Your words will drift into the pond.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Poem textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Your poem
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Begin here..."
                className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <div className="flex justify-end">
                <span className="char-counter" style={{ color: remaining < 100 ? '#f87171' : 'var(--text-muted)' }}>
                  {remaining} remaining
                </span>
              </div>
            </div>

            {/* Author name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Author name <span style={{ opacity: 0.5 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Leave blank to remain anonymous"
                disabled={isAnonymous}
                className="w-full rounded-xl px-5 py-3 text-base outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: isAnonymous ? 'var(--text-muted)' : 'var(--text)',
                  opacity: isAnonymous ? 0.5 : 1,
                }}
                onFocus={(e) => { if (!isAnonymous) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)' }}}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className="relative rounded-full transition-all duration-200"
                style={{
                  width: '44px',
                  height: '24px',
                  background: isAnonymous ? 'var(--accent)' : 'var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="absolute rounded-full transition-all duration-200"
                  style={{
                    width: '18px',
                    height: '18px',
                    background: 'white',
                    top: '3px',
                    left: isAnonymous ? '23px' : '3px',
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Submit anonymously
              </span>
            </label>

            {/* Turnstile */}
            {siteKey && (
              <div ref={turnstileRef} className="mt-2" />
            )}

            {/* Error */}
            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || text.length === 0 || text.length > MAX_CHARS}
              className="rounded-xl py-4 text-base font-normal tracking-wide transition-all duration-200"
              style={{
                background: submitting || text.length === 0 ? 'var(--surface)' : 'var(--accent)',
                color: submitting || text.length === 0 ? 'var(--text-muted)' : 'var(--bg)',
                border: `1px solid ${submitting || text.length === 0 ? 'var(--border)' : 'var(--accent)'}`,
                cursor: submitting || text.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: submitting || text.length === 0 ? 'none' : '0 0 30px var(--accent-glow)',
              }}
            >
              {submitting ? 'Sending your words...' : 'Release into the pond ◈'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
