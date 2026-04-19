import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://driveease.vercel.app'),
  title: {
    default: 'DriveEase — Premium Car Rental in Rawalpindi & Islamabad',
    template: '%s | DriveEase'
  },
  description: 'Experience premium luxury car rentals in Rawalpindi and Islamabad. Wide selection of sedans, SUVs, vans and luxury vehicles. Instant online booking with JazzCash payment.',
  keywords: ['car rental rawalpindi', 'car rental islamabad', 'luxury car hire pakistan', 'wedding car rental rawalpindi', 'car booking islamabad', 'DriveEase'],
  authors: [{ name: 'DriveEase' }],
  creator: 'DriveEase',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://driveease.vercel.app',
    title: 'DriveEase — Premium Car Rental',
    description: 'Luxury car rentals in Rawalpindi & Islamabad',
    siteName: 'DriveEase',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'DriveEase Premium Car Rental' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DriveEase — Premium Car Rental',
    description: 'Luxury car rentals in Rawalpindi & Islamabad',
    images: ['/og-image.jpg']
  },
  robots: { index: true, follow: true }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a24',
              color: '#f0f0f5',
              border: '1px solid #2a2a3a',
            },
          }}
        />
      </body>
    </html>
  );
}
