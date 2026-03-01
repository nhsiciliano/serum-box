import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',
                '/api/',
                '/admin-cuenta'
            ]
        },
        sitemap: 'https://serum-box.com/sitemap.xml'
    }
}
