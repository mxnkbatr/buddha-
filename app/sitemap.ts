import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://gevabal.mn',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}