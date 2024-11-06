import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Serum Box - Laboratory Sample Management',
    template: '%s | Serum Box'
  },
  description: 'Professional system for serum and plasma sample management in clinical laboratories, research institutions, and pharmaceutical companies.',
  keywords: ['sample management', 'clinical laboratory', 'racks', 'test tubes', 'clinical research', 'pharmaceutical', 'laboratory management'],
  authors: [{ name: 'Serum Box' }],
  creator: 'Serum Box',
  publisher: 'Serum Box',
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://serumbox.com',
    siteName: 'Serum Box',
    title: 'Serum Box - Laboratory Sample Management System',
    description: 'Professional serum and plasma sample management for laboratories and clinical research institutions',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Serum Box Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serum Box - Laboratory Sample Management',
    description: 'Professional system for sample management in clinical laboratories and research',
    images: ['/images/twitter-image.jpg']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://serumbox.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
