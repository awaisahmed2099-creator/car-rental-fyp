'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import toast from 'react-hot-toast';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, adminUser, authUser } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', String(newState));
  };

  const isLoginOrSetup = pathname.includes('/admin/login') || pathname.includes('/admin/setup');

  // Only run effects after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (!isLoginOrSetup) {
      if (!authUser) {
        router.push('/admin/login');
      } else if (!adminUser) {
        toast.error('Access Denied. You do not have admin privileges.');
        router.push('/');
      }
    }
  }, [isMounted, isLoading, adminUser, authUser, isLoginOrSetup, router]);

  // Don't render anything until after hydration to avoid mismatch
  if (!isMounted) {
    return null;
  }

  // Login/Setup pages - always render children
  if (isLoginOrSetup) {
    return children;
  }

  // For protected pages, if still loading, show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Protected pages - only show if authenticated
  if (adminUser) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
        <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 transition-all duration-300 ease-in-out min-w-0">
          {children}
        </main>
      </div>
    );
  }

  // Not authenticated on protected page - show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

import { ThemeProvider } from '@/context/ThemeContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
