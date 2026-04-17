'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { LayoutDashboard, Car, Package, CalendarCheck, CreditCard, Settings, LogOut } from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/cars', icon: Car, label: 'Cars' },
  { href: '/admin/packages', icon: Package, label: 'Packages' },
  { href: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          Drive<span className="text-orange-500">Ease</span>
        </h1>
        <p className="text-orange-500 text-xs font-semibold">Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-700 text-orange-500 border-l-4 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-700 px-4 py-6 space-y-4">
        <div>
          <p className="text-gray-400 text-sm">Logged in as</p>
          <p className="text-white font-semibold truncate">{adminUser?.fullName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
