'use client';

import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { adminUser } = useAdminAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {adminUser?.fullName}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{adminUser?.fullName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
