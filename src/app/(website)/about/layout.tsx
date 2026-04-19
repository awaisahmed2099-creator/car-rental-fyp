import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About DriveEase',
  description: "Learn about DriveEase — Rawalpindi and Islamabad's premier luxury car rental service.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
