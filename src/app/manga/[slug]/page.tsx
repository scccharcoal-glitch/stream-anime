import { getMangaBySlug, getMangaCover, getChapters, formatDate, decodeHtml } from '@/lib/wordpress'
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
    title: decodeHtml(manga.title.rendered),
    description: manga.content.rendered.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: { images: cover ? [cover.url] : [] },
  }
}

export default async function MangaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const manga = await getMangaBySlug(slug)
  if (!manga) notFound()
  const chapters = await getChapters(manga.id)

  const cover = getMangaCover(manga)
  const title = decodeHtml(manga.title.rendered)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex gap-2">
        <Link href="/" className="hover:text-red-500">หน้าแรก</Link>
        <span>/</span>
        <Link href="/manga" className="hover:text-red-500">มังงะ</Link>
        <span>/</span>
        <span className="text-gray-600">{title}</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
              Manga
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              chapters.length > 0
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {chapters.length > 0 ? `${chapters.length} ตอน` : 'กำลังอัปเดต'}
            </span>
          </div>

          {/* Summary */}
          <div
            className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-5"
            dangerouslySetInnerHTML={{ __html: manga.content.rendered }}
          />

          {/* Read buttons */}
          {chapters.length > 0 ? (
            <div className="flex gap-3">
              <Link
                href={`/manga/${slug}/${chapters[0].slug}`}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                📖 อ่านตั้งแต่ต้น
              </Link>
              <Link
                href={`/manga/${slug}/${chapters[chapters.length - 1].slug}`}
                className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
              >
                🔖 อ่านล่าสุด
              </Link>
            </div>
          ) : (
            <div className="flex gap-3">
              <button disabled className="bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-bold cursor-not-allowed">
                📖 ยังไม่มีตอน
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chapter list */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📋 รายการตอน
          {chapters.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({chapters.length} ตอน)</span>
          )}
        </h2>

        {chapters.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {/* เรียงใหม่→เก่า สำหรับแสดง */}
            {[...chapters].reverse().map((ch, index) => (
              <Link
                key={ch.id}
                href={`/manga/${slug}/${ch.slug}`}
                className="flex items-center justify-between py-3 px-2 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-500 font-bold text-sm w-6 text-center group-hover:scale-110 transition-transform">
                    📄
                  </span>
                  <span className="font-medium text-gray-800 group-hover:text-red-600 transition-colors">
                    {decodeHtml(ch.title)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(ch.date)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>ยังไม่มี Chapter</p>
            <p className="text-sm mt-1">เพิ่มได้ที่ WordPress → Manga → {title} → Upload Single Chapter</p>
          </div>
        )}
      </div>
    </div>
  )
}
