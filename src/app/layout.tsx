import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CMRIT Bites — Good Food, Instantly',
  description:
    'Order delicious bites from CMRIT Canteen in seconds. Skip the queue with our premium credit-based wallet system. Faster than Blinkit, better than Zomato.',
  keywords: ['CMRIT', 'Bites', 'food ordering', 'college canteen', 'skip queue'],
  openGraph: {
    title: 'CMRIT Bites — Good Food, Instantly',
    description: 'Order food from CMRIT Canteen in seconds. No app download needed.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#e23744',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
