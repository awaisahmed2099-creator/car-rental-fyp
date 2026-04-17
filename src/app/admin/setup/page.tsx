'use client';

import { Suspense } from 'react';
import AdminSetupContent from './setup-content';

export default function AdminSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSetupContent />
    </Suspense>
  );
}
