'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';
import toast from 'react-hot-toast';
import { Eye, Edit2, Download, Trash2, AlertCircle, Search } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import BookingDetailModal from '@/components/admin/BookingDetailModal';
import { generateInvoice } from '@/lib/pdfGenerator';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 20;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Fetch bookings with real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.BOOKINGS), (snapshot) => {
      const bookingsData: Booking[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bookingsData.push({
          bookingId: doc.id,
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || '',
          customerId: data.customerId || '',
          carId: data.carId || '',
          carName: data.carName || '',
          carImage: data.carImage || '',
          packageId: data.packageId || '',
          packageName: data.packageName || '',
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate?.toDate?.() || new Date(data.endDate),
          totalDays: data.totalDays || 0,
          totalAmount: data.totalAmount || 0,
          paymentMethod: data.paymentMethod || 'cash',
          paymentStatus: data.paymentStatus || 'pending',
          txnRefNo: data.txnRefNo || '',
          bookingStatus: data.bookingStatus || 'confirmed',
          pickupLocation: data.pickupLocation || '',
          dropoffLocation: data.dropoffLocation || '',
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        } as Booking);
      });
      setBookings(bookingsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.customerPhone.includes(searchQuery)
      );
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((b) => new Date(b.startDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((b) => new Date(b.endDate) <= end);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((b) => b.bookingStatus === statusFilter.toLowerCase());
    }

    // Payment filter
    if (paymentFilter !== 'All') {
      if (paymentFilter === 'Paid') {
        filtered = filtered.filter((b) => b.paymentStatus === 'paid');
      } else if (paymentFilter === 'Pending') {
        filtered = filtered.filter((b) => b.paymentStatus === 'pending');
      } else {
        filtered = filtered.filter((b) => b.paymentMethod === paymentFilter.toLowerCase());
      }
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, statusFilter, paymentFilter, bookings]);

  // Stats
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const activeCount = bookings.filter((b) => b.bookingStatus === 'active').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'cancelled').length;
  const thisMonthRevenue = bookings
    .filter((b) => {
      const bookingMonth = new Date(b.createdAt).getMonth();
      const bookingYear = new Date(b.createdAt).getFullYear();
      const today = new Date();
      return bookingMonth === today.getMonth() && bookingYear === today.getFullYear();
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleViewClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingToDelete.bookingId));
      toast.success('Booking deleted successfully');
      setShowDeleteDialog(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleDownloadInvoice = (booking: Booking) => {
    try {
      generateInvoice(booking);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader title="Bookings Management" />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Bookings Management" />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Manage Bookings</h2>
          <p className="text-gray-600 mt-2">View and manage all customer bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs font-medium">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{confirmedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs font-medium">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs font-medium">Completed</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs font-medium">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{cancelledCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs font-medium">Revenue (Month)</p>
            <p className="text-lg font-bold text-orange-600 mt-1">Rs. {(thisMonthRevenue / 100000).toFixed(1)}L</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search (Name/Phone)</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option>All</option>
                <option>Confirmed</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option>All</option>
                <option>Cash</option>
                <option>JazzCash</option>
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Booking ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Vehicle</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Dates (Start - End)</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Days</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Payment</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Created</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900 font-medium">DR-{booking.bookingId.substring(0, 6).toUpperCase()}</td>
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-gray-900 font-medium">{booking.customerName}</p>
                          <p className="text-gray-500 text-xs">{booking.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-gray-900">{booking.carName}</p>
                        {booking.packageName && <p className="text-gray-500 text-xs">{booking.packageName}</p>}
                      </td>
                      <td className="px-6 py-3 text-gray-900 whitespace-nowrap">
                        {format(new Date(booking.startDate), 'dd MMM')} - {format(new Date(booking.endDate), 'dd MMM')}
                      </td>
                      <td className="px-6 py-3 text-gray-900">{booking.totalDays}</td>
                      <td className="px-6 py-3 text-gray-900 font-semibold">Rs. {booking.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full flex w-fit ${getPaymentBadgeColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentMethod === 'cash' ? 'Cash' : 'JazzCash'} - {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full flex w-fit ${getStatusBadgeColor(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-900 whitespace-nowrap text-xs">
                        {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(booking)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Invoice"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(booking)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page ? 'bg-orange-500 text-white' : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setShowDetailModal(false)} />
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Booking"
        message={`Are you sure you want to delete this booking? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
}
