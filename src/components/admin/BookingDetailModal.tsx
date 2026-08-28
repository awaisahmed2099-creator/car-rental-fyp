'use client';

import React, { useState, useEffect } from 'react';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';
import toast from 'react-hot-toast';
import { X, MapPin, Calendar, CreditCard, FileText, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.bookingStatus);
  const [features, setFeatures] = useState<string[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        if (booking.packageId) {
          const pkgDoc = await getDoc(doc(db, COLLECTIONS.PACKAGES, booking.packageId));
          if (pkgDoc.exists()) {
            setFeatures(pkgDoc.data().features || []);
          }
        } else if (booking.carId) {
          const carDoc = await getDoc(doc(db, COLLECTIONS.CARS, booking.carId));
          if (carDoc.exists()) {
            setFeatures(carDoc.data().features || []);
          }
        }
      } catch (err) {
        console.error("Error fetching features:", err);
      } finally {
        setLoadingFeatures(false);
      }
    };
    fetchFeatures();
  }, [booking.carId, booking.packageId]);

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
        return 'bg-blue-100 text-blue-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-orange-500/10 dark:text-orange-500 dark:border dark:border-orange-500/20 border border-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a1a24] rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#2a2a3a] sticky top-0 bg-white dark:bg-[#1a1a24]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">DR-{booking.bookingId.substring(0, 6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-orange-500/20 cursor-pointer group transition-colors" disabled={loading}>
            <X size={24} className="text-gray-600 dark:text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
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
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="text-gray-900 dark:text-white font-medium">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="text-gray-900 dark:text-white font-medium">{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="text-gray-900 dark:text-white font-medium">{booking.customerEmail || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle/Package Info Card */}
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Vehicle & Package</h3>
            <div className="flex gap-4">
              {booking.carImage && (
                <img src={booking.carImage} alt={booking.carName} className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1 space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Vehicle</p>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.carName}</p>
                </div>
                {booking.packageName && (
                  <div>
                    <p className="text-gray-600">Package</p>
                    <p className="text-gray-900 dark:text-white font-medium">{booking.packageName}</p>
                  </div>
                )}
                {features.length > 0 && (
                  <div>
                    <p className="text-gray-600 mb-1">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {features.map((feature, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Dates Card */}
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar size={18} />
              Booking Dates
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="text-gray-900 dark:text-white font-medium">{format(new Date(booking.startDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-600">End Date</p>
                <p className="text-gray-900 dark:text-white font-medium">{format(new Date(booking.endDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="text-gray-900 dark:text-white font-medium">{booking.totalDays} days</p>
              </div>
            </div>
          </div>

          {/* Pickup & Dropoff */}
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Locations
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Pickup Location</p>
                <p className="text-gray-900 dark:text-white font-medium">{typeof booking.pickupLocation === 'string' ? booking.pickupLocation : booking.pickupLocation?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Dropoff Location</p>
                <p className="text-gray-900 dark:text-white font-medium">{typeof booking.dropoffLocation === 'string' ? booking.dropoffLocation : booking.dropoffLocation?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="text-gray-900 dark:text-white font-medium text-lg">Rs. {booking.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {booking.paymentMethod === "cash"
                    ? "Cash Payment"
                    : booking.paymentMethod === "paddle"
                      ? "Card (Paddle)"
                      : "JazzCash"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </span>
              </div>
              {(booking.paddleTransactionId || booking.txnRefNo) && (
                <div>
                  <p className="text-gray-600">
                    {booking.paymentMethod === "paddle"
                      ? "Paddle Transaction"
                      : "Transaction ID"}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium font-mono text-xs break-all">
                    {booking.paddleTransactionId || booking.txnRefNo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText size={18} />
                Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{booking.notes}</p>
            </div>
          )}

          {/* Status Update Section */}
          <div className="border border-gray-200 dark:border-[#2a2a3a] rounded-lg p-4 bg-gray-50 dark:bg-[#0a0a0f]">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Update Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Status</label>
                <div className="relative group cursor-pointer">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'confirmed' | 'active' | 'completed' | 'cancelled')}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none transition-colors dark:bg-[#0a0a0f] dark:border-[#2a2a3a] dark:text-white appearance-none cursor-pointer group-hover:border-orange-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-orange-500 transition-colors pointer-events-none" size={18} />
                </div>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={loading || newStatus === booking.bookingStatus}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#111118] rounded-lg border border-gray-200 dark:border-[#2a2a3a] flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Created (Date/Time)
            </span>
            <div className="flex flex-col text-right">
              <span className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                {format(new Date(booking.createdAt), "dd MMM yyyy")}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {format(new Date(booking.createdAt), "hh:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-[#2a2a3a] p-6 bg-gray-50 dark:bg-[#0a0a0f] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-gray-100 text-gray-700 hover:text-orange-500 hover:border-orange-500 dark:bg-transparent dark:text-gray-300 dark:hover:text-orange-500 dark:border dark:border-[#2a2a3a] dark:hover:border-orange-500 border border-transparent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
