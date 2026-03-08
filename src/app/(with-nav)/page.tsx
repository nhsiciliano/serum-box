import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import { faqCopy } from '@/lib/landingTranslations';
import HomeContent from '../../components/HomeContent';

const FeatureSlider = dynamic(() => import('../../components/FeatureSlider'));
const Testimonials = dynamic(() => import('../../components/Testimonials'));
const FAQSection = dynamic(() => import('../../components/FAQSection'));

export const metadata: Metadata = {
  title: 'Laboratory Sample & Reagent Management Platform',
  description:
    'Serum Box centralizes serum sample traceability, reagent inventory control, and laboratory analytics in one secure platform.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Serum Box | Laboratory Sample & Reagent Management',
    description:
      'Improve laboratory operations with full traceability, stock control, and actionable analytics in a single workflow.',
    url: 'https://serum-box.vercel.app',
    siteName: 'Serum Box',
    type: 'website',
  },
};

export default function Home() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqCopy.en.questions.map((question) => ({
      '@type': 'Question',
      name: question.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: question.a,
      },
    })),
  };

  return (
    <Box>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeContent />
      <FeatureSlider />
      <Testimonials />
      <FAQSection />
    </Box>
  );
}
