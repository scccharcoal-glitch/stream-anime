import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: {
    default: 'Stream Anime | ข่าวอนิเมะ มังงะ รีวิว',
    template: '%s | Stream Anime',
  },
  description: 'ข่าวอนิเมะ มังงะ มังฮวา รีวิว และแนะนำอนิเมะน่าดูประจำปี 2026',
  metadataBase: new URL('https://www.stream-anime.org'),
  openGraph: {
    siteName: 'Stream Anime',
    locale: 'th_TH',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className="min-h-screen bg-gray-50 flex flex-col font-[var(--font-sarabun)]">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm mt-10">
          <p>© 2026 Stream Anime · ข่าวอนิเมะ มังงะ มังฮวา</p>
        </footer>
      </body>
    </html>
  )
}
