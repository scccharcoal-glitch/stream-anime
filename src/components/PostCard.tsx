import Link from 'next/link'
import Image from 'next/image'
import { WPPost, getFeaturedImage, getPostCategories, formatDate, stripHtml, decodeHtml } from '@/lib/wordpress'

interface PostCardProps {
  post: WPPost
}

export default function PostCard({ post }: PostCardProps) {
  const image = getFeaturedImage(post)
  const categories = getPostCategories(post)
  const excerpt = stripHtml(post.excerpt.rendered).slice(0, 120)

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={`/${post.slug}`} className="block relative aspect-video overflow-hidden bg-gray-200">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🎌</div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1 mb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full hover:bg-red-200 transition-colors"
            >
              {decodeHtml(cat.name)}
            </Link>
          ))}
        </div>

        <Link href={`/${post.slug}`}>
          <h2
            className="font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors line-clamp-2 leading-snug"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>

        {excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 flex-1">{excerpt}</p>
        )}

        <div className="mt-3 text-xs text-gray-400">{formatDate(post.date)}</div>
      </div>
    </article>
  )
}
