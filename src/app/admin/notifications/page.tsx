'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  deleteDoc, 
  writeBatch,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { AdminNotification } from '@/types/notification';
import AdminHeader from '@/components/admin/AdminHeader';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  CreditCard, 
  Info, 
  AlertTriangle,
  MailOpen,
  Mail,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: AdminNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        } as AdminNotification);
      });
      setNotifications(notificationData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return; // Already read
    try {
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) {
      toast.success('All notifications are already read');
      return;
    }

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, n.id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;

    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, n.id);
        batch.delete(docRef);
      });
      await batch.commit();
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader title="Notifications" />

      <main className="flex-1 p-8 w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recent Notifications</h2>
            <p className="text-gray-600 mt-1">Stay updated with the latest activities</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <CheckCircle2 size={18} />
              Mark All as Read
            </button>
            <button 
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === 'all' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Notifications
            {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>}
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filter === 'unread' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread
            {filter === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>}
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No notifications found</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => markAsRead(notification.id, notification.read)}
                className={`group flex items-start gap-4 p-5 bg-white rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  notification.read ? 'border-gray-100 opacity-75' : 'border-blue-100 bg-blue-50/10 shadow-sm ring-1 ring-blue-50'
                }`}
              >
                <div className={`p-3 rounded-lg shrink-0 ${
                  notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-base font-semibold truncate ${
                      notification.read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-3 ${
                    notification.read ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {!notification.read && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
                        <Mail className="w-3.5 h-3.5" />
                        New
                      </span>
                    )}
                    {notification.read && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <MailOpen className="w-3.5 h-3.5" />
                        Read
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
