'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function PaymentsPage() {
  return (
    <div>
      <AdminHeader title="Payments" />
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Transactions</h2>
          <p className="text-gray-500">Payment management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}
