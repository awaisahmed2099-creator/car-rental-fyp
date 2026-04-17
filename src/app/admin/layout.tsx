'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, adminUser } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const isLoginOrSetup = pathname.includes('/admin/login') || pathname.includes('/admin/setup');

  // Only run effects after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    // Only redirect if not on login/setup page AND not authenticated
    // Allow users to stay on login/setup pages if they want to
    if (!adminUser && !isLoginOrSetup) {
      router.push('/admin/login');
    }
  }, [isMounted, isLoading, adminUser, isLoginOrSetup, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Protected pages - only show if authenticated
  if (adminUser) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          {children}
        </div>
      </div>
    );
  }

  // Not authenticated on protected page - show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
