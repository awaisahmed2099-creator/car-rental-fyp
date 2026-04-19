import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Packages',
  description: 'Exclusive car rental packages for weddings, corporate events, airport transfers and family trips in Pakistan.',
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
