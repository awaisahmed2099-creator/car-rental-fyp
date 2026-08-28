"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import AdminHeader from "@/components/admin/AdminHeader";
import { Users, Mail, Clock, Calendar, Phone } from "lucide-react";

interface RegisteredUser {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  createdAt: any;
  lastActive: any;
  lastLogin?: any;
  role?: string;
}

const getInitials = (name?: string | null, email?: string | null) => {
  const targetString = (name && name.toLowerCase() !== 'unknown user') ? name : (email || 'U');
  const words = targetString.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function UsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: RegisteredUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.role?.toLowerCase() !== 'admin' && data?.email !== 'admin@test.com') {
          usersData.push({ id: doc.id, ...data } as RegisteredUser);
        }
      });
      
      // Local safe sorting
      usersData.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.log("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isOnline = (lastActive: any) => {
    if (!lastActive) return false;
    const lastActiveTime = lastActive?.toDate?.() || new Date(lastActive);
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    return lastActiveTime > tenMinsAgo;
  };

  const renderLastActiveTime = (timestamp: any) => {
    if (!timestamp) return 'Never';
    
    try {
      // Handle Firestore Timestamp, object with seconds, or standard Date string/number
      let activeDate: Date;
      if (timestamp?.toDate) {
        activeDate = timestamp.toDate();
      } else if (timestamp?.seconds) {
        activeDate = new Date(timestamp.seconds * 1000);
      } else {
        activeDate = new Date(timestamp);
      }

      if (isNaN(activeDate.getTime())) return 'Never';

      const today = new Date();
      
      // Check if the date is exactly today
      const isToday = 
        activeDate.getDate() === today.getDate() &&
        activeDate.getMonth() === today.getMonth() &&
        activeDate.getFullYear() === today.getFullYear();

      // Return formatted time if today, otherwise 'Never'
      return isToday ? format(activeDate, "h:mm a") : 'Never';
    } catch (e) {
      return 'Never';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Registered Users" />
      <div className="p-8">
        <div className="bg-white dark:bg-[#1a1a24] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a3a] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-[#2a2a3a] flex justify-between items-center bg-gray-50/50 dark:bg-[#0a0a0f]/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-500" />
              User Accounts
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Users: <span className="font-bold text-gray-900 dark:text-white">{users.length}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-[#0a0b0f] text-gray-600 dark:text-gray-400 uppercase font-semibold text-xs border-b border-gray-200 dark:border-[#2a2a3a]">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">JOINED (DATE / TIME)</th>
                  <th className="px-6 py-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a3a]">
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-[#2a2a3a] animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-[#2a2a3a] rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-[#2a2a3a] rounded w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-[#2a2a3a] rounded w-32"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 dark:bg-[#2a2a3a] rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-[#2a2a3a] rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-[#2a2a3a] rounded w-24"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const online = isOnline(user.lastActive);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold tracking-wider">
                              {getInitials(user.name || user.displayName, user.email)}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                                {user.name || user.displayName || 'Unknown User'}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                <Mail size={12} className="text-orange-500" />
                                <span>{user.email || 'No email'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                <Phone size={12} className="text-orange-500" />
                                <span>{user.phone || user.phoneNumber || 'No phone'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${online ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                            {online && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                            {online ? 'Online Now' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{user.createdAt ? format(user.createdAt?.toDate?.() || new Date(user.createdAt), "MMM d, yyyy") : "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{user.createdAt ? format(user.createdAt?.toDate?.() || new Date(user.createdAt), "hh:mm a") : "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-orange-500" />
                            <span>{renderLastActiveTime(user.lastActive || user.lastLogin)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
