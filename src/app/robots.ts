import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard',
                '/dashboard/',
                '/api/',
                '/dashboard/admin-cuenta',
                '/reset-password'
            ]
        },
        sitemap: 'https://serum-box.vercel.app/sitemap.xml'
    }
}
