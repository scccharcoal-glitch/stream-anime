import Link from 'next/link'
import Image from 'next/image'
import { WPManga, getMangaCover } from '@/lib/wordpress'

export default function MangaCard({ manga }: { manga: WPManga }) {
  const cover = getMangaCover(manga)

  return (
    <Link href={`/manga/${manga.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 shadow-md group-hover:shadow-xl transition-shadow duration-300">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow">
            {manga.title.rendered}
          </h3>
        </div>
      </div>
    </Link>
  )
}
