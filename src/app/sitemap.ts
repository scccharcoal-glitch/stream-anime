import { MetadataRoute } from 'next'
import { getPosts, getMangas, getCategories } from '@/lib/wordpress'

const BASE_URL = 'https://www.stream-anime.org'

export const revalidate = 3600 // อัปเดตทุก 1 ชั่วโมง

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ดึงข้อมูลทั้งหมดพร้อมกัน
  const [{ posts }, { mangas }, categories] = await Promise.all([
    getPosts({ per_page: 100 }),
    getMangas({ per_page: 100 }),
    getCategories(),
  ])

  // หน้าหลัก
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/manga`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // หน้า Category
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // หน้าบทความ
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // หน้ามังงะ (อัปเดตบ่อยกว่าเพราะมี chapter ใหม่)
  const mangaPages: MetadataRoute.Sitemap = mangas.map((manga) => ({
    url: `${BASE_URL}/manga/${manga.slug}`,
    lastModified: new Date(manga.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...mangaPages, ...postPages]
}
