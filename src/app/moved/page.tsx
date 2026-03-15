'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import PoemCard from '@/components/PoemCard'
import { Poem } from '@/lib/supabase'
import Link from 'next/link'

export default function MovedPage() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/poems/moved')
      .then((r) => r.json())
      .then((data) => {
        setPoems(data.poems ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="fade-in mb-10">
          <h1 className="text-3xl mb-2" style={{ color: '#c084fc' }}>Poems That Moved People</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Words that left a gentle mark on someone.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            gathering the moved...
          </div>
        )}

        {!loading && poems.length === 0 && (
          <div className="text-center py-20">
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              No poems have moved anyone yet. Discover one and let it move you.
            </p>
            <Link href="/discover" className="text-sm" style={{ color: 'var(--accent)' }}>
              Discover a poem →
            </Link>
          </div>
        )}

        {!loading && poems.length > 0 && (
          <div className="fade-in flex flex-col gap-5">
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} showAppreciation />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
