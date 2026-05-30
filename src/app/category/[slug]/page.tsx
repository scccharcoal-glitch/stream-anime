import { getCategoryBySlug, getPosts } from '@/lib/wordpress'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: `หมวด: ${category.name}`,
    description: category.description || `บทความในหมวด ${category.name}`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page } = await searchParams
  const currentPage = Number(page ?? 1)

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const { posts, totalPages } = await getPosts({
    per_page: 12,
    page: currentPage,
    categories: category.id,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-sm text-red-500 font-medium mb-1">หมวดหมู่</p>
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-500 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">ทั้งหมด {category.count} บทความ</p>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/category/${slug}`}
          />
        </>
      ) : (
        <p className="text-center text-gray-400 py-20">ไม่พบบทความในหมวดนี้</p>
      )}
    </div>
  )
}
