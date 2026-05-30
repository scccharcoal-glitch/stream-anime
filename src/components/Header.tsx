import Link from 'next/link'
import { getCategories, decodeHtml } from '@/lib/wordpress'

export default async function Header() {
  const categories = await getCategories()

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-red-400 hover:text-red-300 transition-colors">
            🎌 Stream Anime
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors">
              หน้าแรก
            </Link>
            <Link href="/manga" className="px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors text-red-400">
              📖 มังงะ
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                {decodeHtml(cat.name)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
