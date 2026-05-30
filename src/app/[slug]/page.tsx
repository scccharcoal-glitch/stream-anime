import { getPostBySlug, getFeaturedImage, getPostCategories, formatDate } from '@/lib/wordpress'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const image = getFeaturedImage(post)
  return {
    title: post.title.rendered.replace(/<[^>]+>/g, ''),
    description: post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: {
      title: post.title.rendered.replace(/<[^>]+>/g, ''),
      images: image ? [image.url] : [],
      publishedTime: post.date,
      type: 'article',
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const image = getFeaturedImage(post)
  const categories = getPostCategories(post)

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1
        className="text-3xl font-bold text-gray-900 mb-4 leading-snug"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />

      {/* Date */}
      <p className="text-sm text-gray-400 mb-6">{formatDate(post.date)}</p>

      {/* Featured image */}
      {image && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-lg">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />

      {/* Back link */}
      <div className="mt-12 pt-6 border-t">
        <Link href="/" className="text-red-600 hover:underline text-sm">
          ← กลับหน้าแรก
        </Link>
      </div>
    </article>
  )
}
