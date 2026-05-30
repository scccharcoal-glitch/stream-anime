import { getMangaBySlug, getMangaCover, formatDate } from '@/lib/wordpress'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const manga = await getMangaBySlug(slug)
  if (!manga) return {}
  const cover = getMangaCover(manga)
  return {
    title: manga.title.rendered,
    description: manga.content.rendered.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: { images: cover ? [cover.url] : [] },
  }
}

export default async function MangaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const manga = await getMangaBySlug(slug)
  if (!manga) notFound()

  const cover = getMangaCover(manga)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex gap-2">
        <Link href="/" className="hover:text-red-500">หน้าแรก</Link>
        <span>/</span>
        <Link href="/manga" className="hover:text-red-500">มังงะ</Link>
        <span>/</span>
        <span className="text-gray-700">{manga.title.rendered}</span>
      </nav>

      {/* Main info */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Cover */}
        <div className="flex-shrink-0">
          <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-xl mx-auto md:mx-0">
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-5xl">📖</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{manga.title.rendered}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
              Manga
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
              Completed
            </span>
          </div>

          {/* Summary */}
          <div
            className="text-gray-600 text-sm leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: manga.content.rendered }}
          />

          {/* Read buttons */}
          <div className="flex gap-3">
            <button className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
              📖 อ่านตั้งแต่ต้น
            </button>
            <button className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors">
              🔖 อ่านล่าสุด
            </button>
          </div>
        </div>
      </div>

      {/* Chapter list placeholder */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📋 รายการตอน
        </h2>
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>ยังไม่มี Chapter — เพิ่มได้ที่ WordPress Admin</p>
          <p className="text-sm mt-1">Manga → Dragon Ball → Upload Single Chapter</p>
        </div>
      </div>
    </div>
  )
}
