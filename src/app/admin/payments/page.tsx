'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';
import toast from 'react-hot-toast';
import { Download, Eye, Check, AlertCircle, Search, Filter } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import BookingDetailModal from '@/components/admin/BookingDetailModal';
import { format, parseISO, isWithinInterval } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  date: string;
  revenue: number;
}

const ITEMS_PER_PAGE = 15;

export default function PaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterMethod, setFilterMethod] = useState('All'); // All, JazzCash, Cash
  const [filterStatus, setFilterStatus] = useState('All'); // All, Paid, Pending, Failed
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingToMark, setBookingToMark] = useState<Booking | null>(null);

  // Fetch bookings with real-time updates
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      setBookings(bookingsData);
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
          b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.carName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Payment method filter
    if (filterMethod !== 'All') {
      filtered = filtered.filter(
        (b) => b.paymentMethod.toLowerCase() === filterMethod.toLowerCase()
      );
    }

    // Payment status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(
        (b) => b.paymentStatus.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((b) =>
        isWithinInterval(new Date(b.createdAt), { start, end })
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [bookings, filterMethod, filterStatus, searchQuery, startDate, endDate]);

  // Calculate stats
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const thisMonthRevenue = bookings
    .filter((b) => {
      const bookingDate = new Date(b.createdAt);
      const today = new Date();
      return (
        b.paymentStatus === 'paid' &&
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingCount = bookings.filter((b) => b.paymentStatus === 'pending').length;
  const jazzcashCount = bookings.filter((b) => b.paymentMethod === 'jazzcash').length;
  const cashCount = bookings.filter((b) => b.paymentMethod === 'cash').length;

  // Generate chart data (last 30 days)
  const generateChartData = (): ChartData[] => {
    const data: { [key: string]: number } = {};
    const today = new Date();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'MMM dd');
      data[dateStr] = 0;
    }

    // Add revenues
    bookings
      .filter((b) => b.paymentStatus === 'paid')
      .forEach((b) => {
        const dateStr = format(new Date(b.createdAt), 'MMM dd');
        if (dateStr in data) {
          data[dateStr] += b.totalAmount;
        }
      });

    return Object.entries(data).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  };

  const chartData = generateChartData();

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (!bookingToMark) return;

    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingToMark.bookingId);
      await updateDoc(bookingRef, { paymentStatus: 'paid' });
      toast.success('Payment marked as paid');
      setShowConfirmDialog(false);
      setBookingToMark(null);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to mark payment as paid');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const csv = [
        ['Booking ID', 'Customer', 'Car', 'Amount', 'Method', 'Status', 'TxnRef', 'Date'],
        ...filteredBookings.map((b) => [
          b.bookingId,
          b.customerName,
          b.carName,
          b.totalAmount,
          b.paymentMethod === 'jazzcash' ? 'JazzCash' : 'Cash',
          b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1),
          b.txnRefNo || '',
          format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm'),
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPaymentMethodBadge = (method: string) => {
    if (method === 'jazzcash') {
      return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">JazzCash</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Cash</span>;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Paid</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Pending</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Failed</span>;
      case 'refunded':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Refunded</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Payment Management" />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">PKR {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* This Month Revenue */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">PKR {thisMonthRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{pendingCount}</p>
              </div>
            </div>
          </div>

          {/* JazzCash Payments */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">JazzCash Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{jazzcashCount}</p>
              </div>
            </div>
          </div>

          {/* Cash Payments */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cash Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{cashCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or car"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Payment Method Filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="All">All Methods</option>
              <option value="JazzCash">JazzCash Only</option>
              <option value="Cash">Cash Only</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExportCSV}
              disabled={loading || filteredBookings.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Car/Package</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        DR-{booking.bookingId.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.customerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.carName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        PKR {booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{getPaymentMethodBadge(booking.paymentMethod)}</td>
                      <td className="px-6 py-4 text-sm">{getPaymentStatusBadge(booking.paymentStatus)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.paymentMethod === 'jazzcash' ? (
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {booking.txnRefNo || 'N/A'}
                          </code>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {booking.paymentMethod === 'cash' && booking.paymentStatus === 'pending' && (
                          <button
                            onClick={() => {
                              setBookingToMark(booking);
                              setShowConfirmDialog(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)} of{' '}
                {filteredBookings.length} payments
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 py-2">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </main>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Mark Payment as Paid"
        message={`Mark payment for booking DR-${bookingToMark?.bookingId.substring(0, 6).toUpperCase()} as paid?`}
        onConfirm={handleMarkAsPaid}
        onCancel={() => {
          setShowConfirmDialog(false);
          setBookingToMark(null);
        }}
        confirmText="Mark as Paid"
        cancelText="Cancel"
      />
    </div>
  );
}
