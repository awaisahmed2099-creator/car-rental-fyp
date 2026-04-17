'use client';

import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';
import toast from 'react-hot-toast';
import { X, MapPin, Calendar, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.bookingStatus);

  const statusOptions = ['confirmed', 'active', 'completed', 'cancelled'];

  const handleStatusUpdate = async () => {
    if (newStatus === booking.bookingStatus) {
      toast.success('Status updated');
      return;
    }

    try {
      setLoading(true);
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, booking.bookingId);
      await updateDoc(bookingRef, { bookingStatus: newStatus });
      toast.success('Booking status updated successfully');
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update booking status');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Booking Details</h2>
            <p className="text-sm text-gray-500 mt-1">DR-{booking.bookingId.substring(0, 6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Current Status</p>
            <div className="flex gap-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center ${getStatusColor(booking.bookingStatus)}`}>
                {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
              </span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center ${getPaymentStatusColor(booking.paymentStatus)}`}>
                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="text-gray-900 font-medium">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="text-gray-900 font-medium">{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{booking.customerEmail || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle/Package Info Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vehicle & Package</h3>
            <div className="flex gap-4">
              {booking.carImage && (
                <img src={booking.carImage} alt={booking.carName} className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1 space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Vehicle</p>
                  <p className="text-gray-900 font-medium">{booking.carName}</p>
                </div>
                {booking.packageName && (
                  <div>
                    <p className="text-gray-600">Package</p>
                    <p className="text-gray-900 font-medium">{booking.packageName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Dates Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={18} />
              Booking Dates
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="text-gray-900 font-medium">{format(new Date(booking.startDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-600">End Date</p>
                <p className="text-gray-900 font-medium">{format(new Date(booking.endDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="text-gray-900 font-medium">{booking.totalDays} days</p>
              </div>
            </div>
          </div>

          {/* Pickup & Dropoff */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Locations
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Pickup Location</p>
                <p className="text-gray-900 font-medium">{booking.pickupLocation}</p>
              </div>
              <div>
                <p className="text-gray-600">Dropoff Location</p>
                <p className="text-gray-900 font-medium">{booking.dropoffLocation}</p>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="text-gray-900 font-medium text-lg">Rs. {booking.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="text-gray-900 font-medium">{booking.paymentMethod === 'cash' ? 'Cash Payment' : 'JazzCash'}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </span>
              </div>
              {booking.txnRefNo && (
                <div>
                  <p className="text-gray-600">Transaction ID</p>
                  <p className="text-gray-900 font-medium">{booking.txnRefNo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText size={18} />
                Notes
              </h3>
              <p className="text-gray-700 text-sm">{booking.notes}</p>
            </div>
          )}

          {/* Status Update Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'confirmed' | 'active' | 'completed' | 'cancelled')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={loading || newStatus === booking.bookingStatus}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="border border-gray-200 rounded-lg p-4 text-xs">
            <p className="text-gray-600">Created: {format(new Date(booking.createdAt), 'dd MMM yyyy HH:mm')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
