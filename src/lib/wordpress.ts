const WP_API = 'https://www.stream-anime.org/wp-json/wp/v2'

export interface WPPost {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  categories: number[]
  tags: number[]
  link: string
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text: string
      media_details?: { width: number; height: number }
    }>
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>
  }
}

export interface WPCategory {
  id: number
  name: string
  slug: string
  count: number
  description: string
}

export async function getPosts(params?: {
  per_page?: number
  page?: number
  categories?: number
  search?: string
}): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const query = new URLSearchParams({
    _embed: 'wp:featuredmedia,wp:term',
    per_page: String(params?.per_page ?? 12),
    page: String(params?.page ?? 1),
    ...(params?.categories ? { categories: String(params.categories) } : {}),
    ...(params?.search ? { search: params.search } : {}),
  })

  const res = await fetch(`${WP_API}/posts?${query}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) return { posts: [], total: 0, totalPages: 0 }

  const posts: WPPost[] = await res.json()
  const total = Number(res.headers.get('X-WP-Total') ?? 0)
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 0)

  return { posts, total, totalPages }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const posts: WPPost[] = await res.json()
  return posts[0] ?? null
}

export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=50`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const res = await fetch(`${WP_API}/categories?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return null
  const cats: WPCategory[] = await res.json()
  return cats[0] ?? null
}

export function getFeaturedImage(post: WPPost) {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  if (!media) return null
  // URL-encode Thai/non-ASCII characters in the image path
  const url = media.source_url.replace(
    /([^\x00-\x7F]+)/g,
    (match) => encodeURIComponent(match)
  )
  return { url, alt: media.alt_text || post.title.rendered.replace(/<[^>]+>/g, '') }
}

export function getPostCategories(post: WPPost) {
  return post._embedded?.['wp:term']?.[0] ?? []
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').trim()
}

// ─── Manga ───────────────────────────────────────────────────────────────────

export interface WPManga {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  content: { rendered: string }
  link: string
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text: string
    }>
  }
}

export async function getMangas(params?: {
  per_page?: number
  page?: number
  search?: string
}): Promise<{ mangas: WPManga[]; total: number; totalPages: number }> {
  const query = new URLSearchParams({
    _embed: 'wp:featuredmedia',
    per_page: String(params?.per_page ?? 12),
    page: String(params?.page ?? 1),
    ...(params?.search ? { search: params.search } : {}),
  })
  const res = await fetch(
    `https://www.stream-anime.org/wp-json/wp/v2/manga?${query}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return { mangas: [], total: 0, totalPages: 0 }
  const mangas: WPManga[] = await res.json()
  const total = Number(res.headers.get('X-WP-Total') ?? 0)
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 0)
  return { mangas, total, totalPages }
}

export async function getMangaBySlug(slug: string): Promise<WPManga | null> {
  const res = await fetch(
    `https://www.stream-anime.org/wp-json/wp/v2/manga?slug=${slug}&_embed=wp:featuredmedia`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return null
  const items: WPManga[] = await res.json()
  return items[0] ?? null
}

export function getMangaCover(manga: WPManga) {
  const media = manga._embedded?.['wp:featuredmedia']?.[0]
  if (!media) return null
  const url = media.source_url.replace(
    /([^\x00-\x7F]+)/g,
    (m) => encodeURIComponent(m)
  )
  return { url, alt: media.alt_text || manga.title.rendered }
}

// ─── Manga Chapters ──────────────────────────────────────────────────────────
// ใช้ custom endpoint /wp-json/manga/v1/ (สร้างผ่าน WPCode snippet)

export interface WPChapter {
  id: number
  slug: string
  date: string
  title: string          // plain string (ไม่ใช่ { rendered })
  parent: number
  chapter_images: Array<{ chapter_img: string }>
  storage: string
}

/** ดึง chapters ทั้งหมดของ manga (เรียง ASC ตาม menu_order) */
export async function getChapters(mangaId: number): Promise<WPChapter[]> {
  const res = await fetch(
    `https://www.stream-anime.org/wp-json/manga/v1/chapters/${mangaId}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** ดึง chapter เดียวจาก slug */
export async function getChapterBySlug(slug: string): Promise<WPChapter | null> {
  const res = await fetch(
    `https://www.stream-anime.org/wp-json/manga/v1/chapter/${encodeURIComponent(slug)}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return null
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────

export function decodeHtml(html: string) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
