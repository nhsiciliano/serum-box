import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Serum Box',
  description:
    'Secure login for Serum Box. Access laboratory sample traceability, reagent inventory control, and operational dashboards.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
