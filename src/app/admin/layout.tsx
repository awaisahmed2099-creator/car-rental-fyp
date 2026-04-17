'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, adminUser } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginOrSetup = pathname.includes('/admin/login') || pathname.includes('/admin/setup');

  useEffect(() => {
    // If authenticated and on login/setup page, redirect to dashboard
    if (!isLoading && adminUser && isLoginOrSetup) {
      router.push('/admin/dashboard');
    }
    // If not authenticated and on protected page, redirect to login
    else if (!isLoading && !adminUser && !isLoginOrSetup) {
      router.push('/admin/login');
    }
  }, [isLoading, adminUser, isLoginOrSetup, router]);

  // Login/Setup pages - always render, never show loading screen to avoid hydration mismatch
  if (isLoginOrSetup) {
    return children;
  }

  // For protected pages, show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // After loading completes, check if on protected page without auth
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
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

  // Fallback - shouldn't reach here
  return null;
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
