import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Ride',
  description: 'Complete your luxury car rental booking securely with JazzCash or cash payment.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
