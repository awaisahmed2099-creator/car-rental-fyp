'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WebsiteRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.push('/home');
  }, [router]);

  return null;
}


