'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { LayoutDashboard, Car, Package, CalendarCheck, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/cars', icon: Car, label: 'Cars' },
  { href: '/admin/packages', icon: Package, label: 'Packages' },
  { href: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <aside 
      className={`sticky top-0 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out z-50 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className={`px-6 py-8 border-b border-slate-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold whitespace-nowrap overflow-hidden">
              Drive<span className="text-orange-500">Ease</span>
            </h1>
            <p className="text-orange-500 text-xs font-semibold">Admin</p>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-24 bg-orange-500 text-white p-1 rounded-full shadow-lg hover:bg-orange-600 transition-colors cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ''}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-700 text-orange-500 border-l-4 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon size={20} className={isActive ? 'text-orange-500' : ''} />
              {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-700 px-3 py-6 space-y-4">
        {!isCollapsed && (
          <div className="px-2 overflow-hidden">
            <p className="text-gray-400 text-sm">Logged in as</p>
            <p className="text-white font-semibold truncate">{adminUser?.fullName}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center gap-2 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all ${
            isCollapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
