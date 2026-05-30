import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  )

  return (
    <nav className="flex justify-center gap-1 mt-10">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
        >
          ← ก่อนหน้า
        </Link>
      )}

      {visible.map((page, idx) => {
        const prev = visible[idx - 1]
        return (
          <span key={page} className="flex items-center gap-1">
            {prev && page - prev > 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <Link
              href={`${basePath}?page=${page}`}
              className={`px-3 py-2 rounded-lg text-sm ${
                page === currentPage
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          </span>
        )
      })}

      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm"
        >
          ถัดไป →
        </Link>
      )}
    </nav>
  )
}
