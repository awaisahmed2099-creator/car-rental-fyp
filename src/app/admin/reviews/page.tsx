'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, CheckCircle, Trash2, Loader2, MessageSquare, Clock, XCircle, Search, X, Filter, Calendar, ChevronDown, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { format } from 'date-fns';

const getInitials = (name?: string | null, email?: string | null) => {
  const targetString = (name && name.toLowerCase() !== 'unknown user') ? name : (email || 'U');
  const words = targetString.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);



  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch booking data
      const bookingIds = [...new Set(data.map((r: any) => r.bookingId).filter(Boolean))];
      const bookingMap: Record<string, any> = {};

      console.log("Raw Reviews:", data);
      console.log("Review Booking IDs:", bookingIds);

      if (bookingIds.length > 0) {
        // Fetch in batches of 10
        for (let i = 0; i < bookingIds.length; i += 10) {
          const batch = bookingIds.slice(i, i + 10);
          const bookingsQuery = query(collection(db, 'bookings'), where(documentId(), 'in', batch as string[]));
          const bookingSnap = await getDocs(bookingsQuery);
          bookingSnap.forEach(bookingDoc => {
            bookingMap[bookingDoc.id] = bookingDoc.data();
          });
        }
      }

      console.log("Fetched Booking Docs:", bookingMap);

      // Merge booking data into reviews
      const mergedData = data.map((review: any) => {
        const bid = review.bookingId;
        const booking = bid ? bookingMap[bid] : null;
        return {
          ...review,
          userEmail: review.email || review.userEmail || booking?.email || booking?.customerEmail || booking?.userEmail || null,
          userPhone: review.phone || review.phoneNumber || review.userPhone || review.customerPhone || booking?.phone || booking?.phoneNumber || booking?.customerPhone || booking?.contact || null,
          userName: review.name || review.userName || booking?.customerName || booking?.userName || booking?.name || 'Unknown User'
        };
      });

      setReviews(mergedData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingAction({ id, action: status === 'approved' ? 'approve' : 'reject' });
    try {
      await updateDoc(doc(db, 'testimonials', id), { status });
      toast.success(`Review ${status} successfully!`);
      fetchReviews();
    } catch (error) {
      console.error(`Error updating review to ${status}:`, error);
      toast.error(`Failed to update review status.`);
    } finally {
      setProcessingAction(null);
    }
  };



  // KPIs
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.status === 'approved').length;
  const pendingReviews = reviews.filter(r => r.status === 'pending' || !r.status).length;
  const rejectedReviews = reviews.filter(r => r.status === 'rejected').length;

  // Derived filtering
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = review.name?.toLowerCase().includes(searchLower) || false;
      const phoneStr = (review.phone || review.phoneNumber || review.userPhone || review.customerPhone || review.user?.phone || review.user?.phoneNumber || '');
      const phoneMatch = phoneStr.toLowerCase().includes(searchLower);
      const matchesSearch = nameMatch || phoneMatch;

      // Status
      const normalizedStatus = review.status || 'pending';
      const matchesStatus = statusFilter === 'All' || normalizedStatus === statusFilter.toLowerCase();

      // Date
      let matchesDate = true;
      if (startDate || endDate) {
        if (review.createdAt) {
          const reviewDate = new Date(review.createdAt.toDate());
          // Strip time for proper date comparison
          reviewDate.setHours(0, 0, 0, 0);

          if (startDate) {
            const sDate = new Date(startDate);
            sDate.setHours(0, 0, 0, 0);
            if (reviewDate < sDate) matchesDate = false;
          }
          if (endDate) {
            const eDate = new Date(endDate);
            eDate.setHours(0, 0, 0, 0);
            if (reviewDate > eDate) matchesDate = false;
          }
        } else {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reviews, searchTerm, startDate, endDate, statusFilter]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown Date';
    const date = new Date(timestamp.toDate());
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Unknown Time';
    const date = new Date(timestamp.toDate());
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-[120vh] bg-gray-50 dark:bg-[#0a0a0f] pb-[500px]">
      <AdminHeader title="Reviews Management" />

      <div className="p-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-orange-500" />
            User Reviews
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage pending, approved, and rejected user reviews.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 group cursor-default">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalReviews}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
              <MessageSquare size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-500 dark:hover:border-green-500 group cursor-default">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{approvedReviews}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors border border-green-500/20">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-yellow-500 dark:hover:border-yellow-500 group cursor-default">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingReviews}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors border border-yellow-500/20">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-500 dark:hover:border-red-500 group cursor-default">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{rejectedReviews}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors border border-red-500/20">
              <XCircle size={24} />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-gray-800 p-6 rounded-xl mb-8 shadow-sm dark:shadow-none relative z-50">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search (Name/Phone)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 px-4 py-2 bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 dark:text-white text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <div className="relative group cursor-pointer">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 dark:text-white text-sm transition-colors [color-scheme:light] dark:[color-scheme:dark] cursor-pointer appearance-none group-hover:border-orange-500/50 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <div className="relative group cursor-pointer">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 dark:text-white text-sm transition-colors [color-scheme:light] dark:[color-scheme:dark] cursor-pointer appearance-none group-hover:border-orange-500/50 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="relative group cursor-pointer">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 dark:text-white text-sm transition-colors cursor-pointer appearance-none group-hover:border-orange-500/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>No reviews found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-[#111118] border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">DATE / TIME</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50/50 dark:hover:bg-[#111118]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold tracking-wider">
                            {getInitials(review.name || review.userName, review.email || review.userEmail)}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                              {review.name || review.userName || 'Unknown User'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              <Mail size={12} className="text-orange-500" />
                              <span>{review.email || review.userEmail || 'No email in booking'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              <Phone size={12} className="text-orange-500" />
                              <span>{review.phone || review.phoneNumber || review.userPhone || 'No phone in booking'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= (review.rating || 5) ? 'fill-orange-500 text-orange-500' : 'fill-gray-300 dark:fill-gray-700 text-gray-300 dark:text-gray-700'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={review.comment}>
                          {review.comment ? `"${review.comment}"` : 'No comment provided'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-gray-200 font-medium">
                            <Calendar size={14} className="text-orange-500" />
                            <span>{review.createdAt ? format(review.createdAt?.toDate?.() || new Date(review.createdAt), "dd MMM yyyy") : "Unknown Date"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-gray-200 font-medium">
                            <Clock size={14} className="text-orange-500" />
                            <span>{review.createdAt ? format(review.createdAt?.toDate?.() || new Date(review.createdAt), "hh:mm a") : "Unknown Time"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${review.status === 'approved'
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : review.status === 'rejected'
                              ? 'bg-red-500/10 border-red-500/20 text-red-500'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                          }`}>
                          {review.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                            disabled={processingAction?.id === review.id}
                            title="Approve Review"
                            className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer hover:opacity-80 hover:scale-110 ${review.status === 'approved'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                              }`}
                          >
                            {processingAction?.id === review.id && processingAction?.action === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(review.id, 'rejected')}
                            disabled={processingAction?.id === review.id}
                            title="Reject Review"
                            className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer hover:opacity-80 hover:scale-110 ${review.status === 'rejected'
                                ? 'bg-orange-500 text-white'
                                : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white'
                              }`}
                          >
                            {processingAction?.id === review.id && processingAction?.action === 'reject' ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                          </button>


                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
