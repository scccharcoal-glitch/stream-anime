import { getPosts, getCategories, decodeHtml } from '@/lib/wordpress'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import Link from 'next/link'

export const revalidate = 3600

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const { page } = await searchParams
  const currentPage = Number(page ?? 1)

  const [{ posts, totalPages }, categories] = await Promise.all([
    getPosts({ per_page: 12, page: currentPage }),
    getCategories(),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ข่าวอนิเมะ &amp; มังงะล่าสุด
        </h1>
        <p className="text-gray-500">รีวิว แนะนำ และข่าวสารวงการอนิเมะมังงะทุกวัน</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/"
          className="px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium"
        >
          ทั้งหมด
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="px-4 py-1.5 rounded-full bg-white border text-gray-700 text-sm hover:bg-gray-100 transition-colors"
          >
            {decodeHtml(cat.name)}
            <span className="ml-1 text-gray-400">({cat.count})</span>
          </Link>
        ))}
      </div>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
        </>
      ) : (
        <p className="text-center text-gray-400 py-20">ไม่พบบทความ</p>
      )}
    </div>
  )
}
