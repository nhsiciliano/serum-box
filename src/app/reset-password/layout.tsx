import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Serum Box',
  description:
    'Reset your Serum Box password securely and recover access to your laboratory workflows.',
  alternates: {
    canonical: '/reset-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
