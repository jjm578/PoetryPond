import Link from 'next/link'
import { Poem } from '@/lib/supabase'

interface PoemCardProps {
  poem: Poem
  showAppreciation?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PoemCard({ poem, showAppreciation }: PoemCardProps) {
  const displayAuthor = poem.is_anonymous ? 'Anonymous' : (poem.author_name || 'Anonymous')
  const preview = poem.text.length > 200 ? poem.text.slice(0, 200) + '…' : poem.text

  return (
    <Link href={`/p/${poem.slug}`}
      className="block rounded-xl p-6 transition-all duration-300 group"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--accent)'
        el.style.boxShadow = '0 0 30px var(--accent-glow)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
      }}
    >
      <p className="poem-text mb-4" style={{ fontSize: '0.95rem' }}>{preview}</p>
      <div className="flex items-center justify-between mt-3"
        style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          — {displayAuthor}
        </span>
        <div className="flex items-center gap-3">
          {showAppreciation && poem.appreciation_count !== undefined && (
            <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
              ✦ {poem.appreciation_count}
            </span>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {formatDate(poem.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}
