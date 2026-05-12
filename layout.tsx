import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://checkmypay.vercel.app'),
  title: 'Virginia Paycheck Calculator | CheckMyPay',
  description: 'Free Virginia paycheck calculator for hourly and salary workers. Estimate federal tax, Virginia tax, Social Security, Medicare, overtime, deductions, and take-home pay.',
  keywords: ['Virginia paycheck calculator','VA paycheck calculator','Virginia take home pay calculator','hourly paycheck calculator Virginia','salary calculator Virginia'],
  openGraph: { title: 'Free Virginia Paycheck Calculator | CheckMyPay', description: 'Estimate your Virginia take-home pay in seconds.', url: 'https://checkmypay.vercel.app', siteName: 'CheckMyPay', type: 'website' },
  alternates: { canonical: '/' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
