import { getMangas } from '@/lib/wordpress'
import MangaCard from '@/components/MangaCard'
import Pagination from '@/components/Pagination'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'อ่านมังงะออนไลน์',
  description: 'รวมมังงะ มังฮวา มังฮัว อ่านฟรีออนไลน์',
}

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function MangaPage({ searchParams }: PageProps) {
  const { page, search } = await searchParams
  const currentPage = Number(page ?? 1)

  const { mangas, total, totalPages } = await getMangas({
    per_page: 18,
    page: currentPage,
    search,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">อ่านมังงะออนไลน์</h1>
          <p className="text-gray-500 mt-1">ทั้งหมด {total} เรื่อง</p>
        </div>
        {/* Search */}
        <form method="GET" className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="ค้นหามังงะ..."
            className="border rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Grid */}
      {mangas.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/manga" />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-400">ไม่พบมังงะที่ค้นหา</p>
        </div>
      )}
    </div>
  )
}
