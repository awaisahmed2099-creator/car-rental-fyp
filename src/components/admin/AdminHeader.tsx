"use client";

import React, { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/collections";

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { adminUser } = useAdminAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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
    <header className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {adminUser?.fullName}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <Link
          href="/admin/notifications"
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {adminUser?.fullName}
            </p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
