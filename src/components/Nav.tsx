'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/submit', label: 'Submit' },
    { href: '/discover', label: 'Discover' },
    { href: '/moved', label: 'Moved People' },
    { href: '/your-poems', label: 'Your Poems' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, transparent 100%)' }}>
      <Link href="/" className="text-lg font-normal tracking-widest"
        style={{ color: 'var(--accent)', textShadow: '0 0 20px var(--accent)' }}>
        ◈ PoetryPond
      </Link>
      <div className="flex items-center gap-6 text-sm">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="transition-all duration-200"
            style={{
              color: pathname === href ? 'var(--accent)' : 'var(--text-muted)',
              textShadow: pathname === href ? '0 0 12px var(--accent)' : 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
