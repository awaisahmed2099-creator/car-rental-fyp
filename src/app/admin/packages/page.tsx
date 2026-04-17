'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function PackagesPage() {
  return (
    <div>
      <AdminHeader title="Packages" />
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Rental Packages</h2>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Create Package
            </button>
          </div>
          <p className="text-gray-500">Package management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}
