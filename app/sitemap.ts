import type { MetadataRoute } from 'next'
import { LAST_REVIEWED } from '@/lib/services'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://free-stack-starter.vercel.app'
  const lastModified = new Date(`${LAST_REVIEWED}T00:00:00Z`)
  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/docs`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/test-keys`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
