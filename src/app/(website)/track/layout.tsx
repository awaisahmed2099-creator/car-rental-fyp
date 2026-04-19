import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Booking',
  description: 'Track your DriveEase car rental booking status in real time.',
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
