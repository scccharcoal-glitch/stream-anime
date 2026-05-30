import {
  getMangaBySlug,
  getChapters,
  getChapterBySlug,
  decodeHtml,
} from '@/lib/wordpress'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string; chapter: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter: chapterSlug } = await params
  const [manga, chapter] = await Promise.all([
    getMangaBySlug(slug),
    getChapterBySlug(chapterSlug),
  ])
  if (!manga || !chapter) return {}
  return {
    title: `${decodeHtml(chapter.title)} - ${decodeHtml(manga.title.rendered)}`,
    robots: { index: false }, // ไม่ให้ Google index หน้าอ่านแต่ละตอน
  }
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapter: chapterSlug } = await params

  const manga = await getMangaBySlug(slug)
  if (!manga) notFound()

  const [chapter, allChapters] = await Promise.all([
    getChapterBySlug(chapterSlug),
    getChapters(manga.id),
  ])
  if (!chapter) notFound()

  const mangaTitle = decodeHtml(manga.title.rendered)
  const chapterTitle = decodeHtml(chapter.title)

  // หา index ของ chapter ปัจจุบัน (เรียงเก่า→ใหม่)
  const currentIndex = allChapters.findIndex((c) => c.slug === chapterSlug)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  // ภาพในตอนนี้
  const images: Array<{ chapter_img: string }> = chapter.chapter_images ?? []

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/manga/${slug}`}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="กลับ"
            >
              ← กลับ
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{mangaTitle}</p>
              <p className="text-sm font-bold truncate">{chapterTitle}</p>
            </div>
          </div>

          {/* Chapter navigation */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {prevChapter ? (
              <Link
                href={`/manga/${slug}/${prevChapter.slug}`}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                ‹ ก่อน
              </Link>
            ) : (
              <span className="bg-gray-800 text-gray-600 px-3 py-1.5 rounded-lg text-sm cursor-not-allowed">
                ‹ ก่อน
              </span>
            )}

            {nextChapter ? (
              <Link
                href={`/manga/${slug}/${nextChapter.slug}`}
                className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-sm transition-colors font-medium"
              >
                ถัดไป ›
              </Link>
            ) : (
              <span className="bg-gray-800 text-gray-600 px-3 py-1.5 rounded-lg text-sm cursor-not-allowed">
                ถัดไป ›
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="max-w-3xl mx-auto py-4 px-2">
        {images.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {images.map((img, i) => {
              // สร้าง URL รูปภาพ — Madara เก็บเป็น relative path หรือ full URL
              const src = img.chapter_img.startsWith('http')
                ? img.chapter_img.replace(/([^\x00-\x7F]+)/g, (m) => encodeURIComponent(m))
                : `https://www.stream-anime.org/wp-content/uploads/${img.chapter_img}`.replace(
                    /([^\x00-\x7F]+)/g,
                    (m) => encodeURIComponent(m)
                  )

              return (
                <div key={i} className="relative w-full">
                  <Image
                    src={src}
                    alt={`${chapterTitle} หน้า ${i + 1}`}
                    width={800}
                    height={1200}
                    className="w-full h-auto"
                    priority={i < 3}
                    unoptimized // รูปมังงะมักใหญ่มาก ไม่ต้อง optimize
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg">ยังไม่มีภาพในตอนนี้</p>
            <p className="text-sm mt-2">อัปโหลดที่ WordPress Admin → Manga → {mangaTitle}</p>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link
              href={`/manga/${slug}/${prevChapter.slug}`}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl text-center transition-colors"
            >
              ‹ {decodeHtml(prevChapter.title)}
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <Link
            href={`/manga/${slug}`}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl text-sm transition-colors text-center"
          >
            📋 รายการตอน
          </Link>

          {nextChapter ? (
            <Link
              href={`/manga/${slug}/${nextChapter.slug}`}
              className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-3 rounded-xl text-center transition-colors font-medium"
            >
              {decodeHtml(nextChapter.title)} ›
            </Link>
          ) : (
            <div className="flex-1 text-center text-gray-600 text-sm py-3">
              จบ
            </div>
          )}
        </div>

        {/* Chapter list dropdown */}
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <details className="bg-gray-800 rounded-xl overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors select-none">
              เลือกตอน ({allChapters.length} ตอน)
            </summary>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-700">
              {[...allChapters].reverse().map((ch) => (
                <Link
                  key={ch.id}
                  href={`/manga/${slug}/${ch.slug}`}
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors ${
                    ch.slug === chapterSlug ? 'text-red-400 font-bold bg-gray-700' : 'text-gray-300'
                  }`}
                >
                  {decodeHtml(ch.title)}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
