'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

interface StoredPoem {
  id: string
  slug: string
  preview: string
}

export default function YourPoemsPage() {
  const [poems, setPoems] = useState<StoredPoem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('poetrypond_poems') || '[]')
      setPoems(stored)
    } catch {
      setPoems([])
    }
    setLoaded(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="fade-in mb-10">
          <h1 className="text-3xl mb-2" style={{ color: 'var(--accent)' }}>Your Poems</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Poems you&apos;ve submitted from this device.
          </p>
        </div>

        {!loaded && (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            looking in the pond...
          </div>
        )}

        {loaded && poems.length === 0 && (
          <div className="text-center py-20">
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              You haven&apos;t submitted any poems from this device yet.
            </p>
            <Link href="/submit" className="text-sm" style={{ color: 'var(--accent)' }}>
              Submit your first poem →
            </Link>
          </div>
        )}

        {loaded && poems.length > 0 && (
          <div className="fade-in flex flex-col gap-4">
            {poems.map((poem) => (
              <Link
                key={poem.id}
                href={`/p/${poem.slug}`}
                className="block rounded-xl px-6 py-5 transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--accent)'
                  el.style.boxShadow = '0 0 20px var(--accent-glow)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border)'
                  el.style.boxShadow = 'none'
                }}
              >
                <p className="poem-text mb-3" style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                  {poem.preview}{poem.preview.length >= 80 ? '…' : ''}
                </p>
                <span className="text-xs" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                  View poem ↗
                </span>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-12 text-xs text-center" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          These poems are remembered on this device only.
        </p>
      </div>
    </main>
  )
}
