import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PoetryPond — where words drift freely',
  description: 'Anonymously submit and discover poems from a shared pool of human expression.',
  openGraph: {
    title: 'PoetryPond',
    description: 'Anonymous poems, freely shared.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
