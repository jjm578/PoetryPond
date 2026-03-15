'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'

interface EntryCard {
  href: string
  emoji: string
  label: string
  desc: string
  color: string
  glow: string
}

const cards: EntryCard[] = [
  {
    href: '/submit',
    emoji: '✍️',
    label: 'Submit a Poem',
    desc: 'Drop your words into the pond',
    color: 'var(--accent)',
    glow: 'var(--accent-glow)',
  },
  {
    href: '/discover',
    emoji: '🎲',
    label: 'Discover',
    desc: 'Find a random poem waiting for you',
    color: 'var(--gold)',
    glow: 'var(--gold-glow)',
  },
  {
    href: '/moved',
    emoji: '✦',
    label: 'Poems That Moved People',
    desc: 'Words that left a mark',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.15)',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="fade-in max-w-2xl mx-auto w-full">
          <h1
            className="text-5xl sm:text-6xl mb-6 tracking-wide"
            style={{ color: 'var(--accent)', textShadow: '0 0 60px rgba(155,140,255,0.4)' }}
          >
            PoetryPond
          </h1>
          <p className="text-lg mb-3" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            where words drift freely
          </p>
          <p
            className="mb-16 max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}
          >
            A quiet place for anonymous human expression. No accounts. No algorithms.
            Just poems, floating in a shared pool.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {cards.map((card) => (
              <EntryLink key={card.href} card={card} />
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center pb-8 text-xs" style={{ color: 'var(--text-muted)' }}>
        ◈ no accounts &nbsp;·&nbsp; no algorithms &nbsp;·&nbsp; just poems
      </footer>
    </main>
  )
}

function EntryLink({ card }: { card: EntryCard }) {
  return (
    <Link
      href={card.href}
      className="flex flex-col items-center gap-4 rounded-2xl p-8 transition-all duration-300"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = card.color
        el.style.boxShadow = `0 0 40px ${card.glow}`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
      }}
    >
      <span className="text-4xl">{card.emoji}</span>
      <div>
        <div className="text-lg mb-1" style={{ color: card.color }}>
          {card.label}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {card.desc}
        </div>
      </div>
    </Link>
  )
}
