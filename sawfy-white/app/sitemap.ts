import { MetadataRoute } from 'next';
import { FALLBACK_PRODUCTS } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const locales = ['en', 'yo', 'ha', 'ig', 'fr'];

  const routes: MetadataRoute.Sitemap = [];

  // Core pages per locale
  for (const locale of locales) {
    routes.push(
      {
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/${locale}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${locale}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/${locale}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/${locale}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/${locale}/faq`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }
    );

    // Products per locale
    for (const prod of FALLBACK_PRODUCTS) {
      routes.push({
        url: `${baseUrl}/${locale}/products/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return routes;
}
