import React from 'react';
import Navbar from '@/components/website/Navbar';
import Footer from '@/components/website/Footer';
import WhatsAppButton from '@/components/website/WhatsAppButton';
import BackToTop from '@/components/website/BackToTop';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}
