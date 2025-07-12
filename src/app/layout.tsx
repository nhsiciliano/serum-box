import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Serum Box - Laboratory Stock and Sample Management',
    template: '%s | Serum Box'
  },
  description: 'Professional system for stock and serum sample management in clinical laboratories, research institutions, and pharmaceutical companies.',
  keywords: ['sample management', 'stock management', 'clinical laboratory', 'racks', 'test tubes', 'clinical research', 'pharmaceutical', 'laboratory management'],
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
    url: 'https://serum-box.com',
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
    title: 'Serum Box - Laboratory Stock and Sample Management',
    description: 'Professional system for stock and serum sample management in clinical laboratories, research institutions, and pharmaceutical companies.',
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
        <link rel="canonical" href="https://serum-box.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Script id="metricool-tracker" strategy="afterInteractive">
          {`
            function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"28960ca2e51d80f2e3f34a842e352b17"})});
          `}
        </Script>
      </body>
    </html>
  );
}
