'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function SettingsPage() {
  return (
    <div>
      <AdminHeader title="Settings" />
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Settings</h2>
          <p className="text-gray-500">Settings interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}
