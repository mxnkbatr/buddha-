import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/profile/', '/api/'],
        },
        sitemap: 'https://gevabal.mn/sitemap.xml',
    };
}
