"use client";

import React, { useState, useEffect } from "react";
import { Bell, User, Settings, LogOut, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useTheme } from "@/context/ThemeContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { COLLECTIONS } from "@/lib/collections";

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { adminUser } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = "driveease_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    // Listener for unread notifications
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("read", "==", false),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (error) => {
        console.error("Notification listener error:", error);
        setUnreadCount(0);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <header className="bg-white dark:bg-[#111118] border-b border-gray-200 dark:border-[#2a2a3a] px-8 py-6 flex items-center justify-between">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Welcome back, {adminUser?.fullName}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-400 cursor-pointer transition-colors hover:text-orange-500 hover:bg-orange-500/10"
          title="Toggle Theme"
        >
          {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
        </button>

        {/* Notification Bell */}
        <Link
          href="/admin/notifications"
          className="relative p-2 text-gray-600 dark:text-gray-400 rounded-lg cursor-pointer transition-colors hover:text-orange-500 hover:bg-orange-500/10"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#111118]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile & Dropdown */}
        <div 
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/50">
              <User size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Super Admin</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full pt-2 w-48 z-50">
              <div className="bg-white dark:bg-[#111118] border border-gray-200 dark:border-[#2a2a3a] rounded-xl shadow-2xl py-2">
                <Link
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 dark:hover:text-orange-500 transition-colors cursor-pointer flex items-center gap-3"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                
                <div className="mt-1 border-t border-gray-200 dark:border-[#2a2a3a] pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
