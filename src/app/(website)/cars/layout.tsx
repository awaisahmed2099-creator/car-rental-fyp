import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Fleet — Luxury Cars',
  description: 'Browse our premium fleet of sedans, SUVs, luxury vehicles and more available for rental in Rawalpindi and Islamabad.',
};

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
