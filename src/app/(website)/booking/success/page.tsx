'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';
import { CheckCircle2, Download, MessageCircle } from 'lucide-react';
import { generateBookingReceipt } from '@/lib/pdfGenerator';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      toast.error('Booking ID not found');
      router.push('/');
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          const data = bookingSnap.data();
          setBooking({
            bookingId: bookingSnap.id,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail,
            carId: data.carId,
            carName: data.carName,
            carImage: data.carImage,
            packageId: data.packageId,
            packageName: data.packageName,
            startDate: data.startDate?.toDate?.() || new Date(data.startDate),
            endDate: data.endDate?.toDate?.() || new Date(data.endDate),
            totalDays: data.totalDays,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentStatus,
            bookingStatus: data.bookingStatus,
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            notes: data.notes,
            txnRefNo: data.txnRefNo,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          } as Booking);
        } else {
          toast.error('Booking not found');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams, router]);

  const handleDownloadReceipt = () => {
    if (booking) {
      generateBookingReceipt(booking);
      toast.success('Receipt downloaded successfully');
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hello, I have a booking (${booking?.bookingId.substr(0, 6)}) and I'd like to know more.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/923001234567?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Booking information not found</p>
          <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const bookingNumber = `DR-${booking.bookingId.substring(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="relative w-24 h-24">
              <CheckCircle2 size={96} className="text-green-500 animate-bounce" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your car rental reservation has been successfully booked.</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 sm:px-8 py-8">
            <p className="text-white text-sm uppercase tracking-wide mb-2">Booking Reference</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-mono">{bookingNumber}</h2>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-8">
            {/* Customer Info */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                </div>
                {booking.customerEmail && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{booking.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Details */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold text-gray-900">{booking.carName}</p>
                </div>
                {booking.packageName && (
                  <div>
                    <p className="text-sm text-gray-600">Package</p>
                    <p className="font-semibold text-gray-900">{booking.packageName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold text-gray-900">{format(booking.startDate, 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold text-gray-900">{format(booking.endDate, 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-semibold text-gray-900">{booking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Drop-off Location</p>
                  <p className="font-semibold text-gray-900">{booking.dropoffLocation}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {booking.paymentMethod === 'cash' ? 'Cash Payment' : 'JazzCash'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total Amount</span>
                  <span className="text-3xl font-bold text-orange-500">PKR {booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Transaction ID */}
            {booking.txnRefNo && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <p className="text-sm text-gray-600">Transaction Reference</p>
                <p className="font-mono font-semibold text-gray-900">{booking.txnRefNo}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleDownloadReceipt}
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <Download size={20} />
                Download Receipt
              </button>

              <Link
                href="/cars"
                className="inline-flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Book Another Car
              </Link>

              <button
                onClick={handleWhatsAppContact}
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <MessageCircle size={20} />
                Contact via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-900 font-semibold">
            📧 A confirmation email has been sent to {booking.customerEmail || 'your registered email'}
          </p>
          <p className="text-blue-800 text-sm mt-2">
            You can download your receipt, make changes, or contact us for any questions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
