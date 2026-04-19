'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';
import { CheckCircle2, Download, MessageCircle, MapPin, Calendar, Clock, Car } from 'lucide-react';
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
    const message = `Hello, I have a booking (${booking?.bookingId.substring(0, 6).toUpperCase()}) and I'd like to know more.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/923001234567?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-3 border-[#2a2a3a] border-t-orange-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-500">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-6">Booking information not found</p>
          <Link href="/" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const bookingNumber = `DR-${booking.bookingId.substring(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.15)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Success Animation */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6 relative">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <div className="relative w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Booking Confirmed!</h1>
          <p className="text-gray-400 text-lg">Your car rental reservation has been successfully confirmed.</p>
        </div>

        {/* Booking Details Card */}
        <div className="card-dark overflow-hidden mb-8 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 sm:px-8 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
            <div className="relative z-10">
              <p className="text-white/80 text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Booking Reference</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-wider">{bookingNumber}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-8">
            {/* Customer Info */}
            <div className="mb-8 pb-8 border-b border-[#2a2a3a]">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-orange-500 rounded-full" /> Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#1a1a24] p-5 rounded-xl border border-[#2a2a3a]">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-medium text-white">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-white">{booking.customerPhone}</p>
                </div>
                {booking.customerEmail && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium text-white">{booking.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Details */}
            <div className="mb-8 pb-8 border-b border-[#2a2a3a]">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-orange-500 rounded-full" /> Rental Details
              </h3>
              
              <div className="space-y-6">
                {/* Vehicle */}
                <div className="flex items-center gap-4 bg-[#1a1a24] p-4 rounded-xl border border-[#2a2a3a]">
                  <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
                    <Car size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
                    <p className="font-bold text-white text-lg">{booking.carName}</p>
                    {booking.packageName && <p className="text-sm text-orange-500">{booking.packageName}</p>}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-[#1a1a24] p-4 rounded-xl border border-[#2a2a3a]">
                    <Calendar size={18} className="text-orange-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Check-in</p>
                      <p className="font-medium text-white">{format(booking.startDate, 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-[#1a1a24] p-4 rounded-xl border border-[#2a2a3a]">
                    <Clock size={18} className="text-orange-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Check-out</p>
                      <p className="font-medium text-white">{format(booking.endDate, 'PPP')}</p>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-[#1a1a24] p-4 rounded-xl border border-[#2a2a3a]">
                    <MapPin size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pickup Location</p>
                      <p className="font-medium text-white">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-[#1a1a24] p-4 rounded-xl border border-[#2a2a3a]">
                    <MapPin size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Drop-off Location</p>
                      <p className="font-medium text-white">{booking.dropoffLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-orange-500 rounded-full" /> Payment Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#1a1a24] p-5 rounded-xl border border-[#2a2a3a] mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Method</p>
                  <p className="font-medium text-white capitalize">
                    {booking.paymentMethod === 'cash' ? 'Cash on Delivery' : 'JazzCash'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-br from-[#1a1a24] to-[#111118] border border-[#2a2a3a] rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Total Amount</span>
                  <span className="text-3xl font-bold text-orange-500">PKR {booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Transaction ID */}
              {booking.txnRefNo && (
                <div className="mt-4 flex justify-between items-center bg-[#1a1a24] p-4 rounded-xl border border-[#2a2a3a]">
                  <p className="text-sm text-gray-500">Transaction Ref</p>
                  <p className="font-mono font-medium text-white border border-[#2a2a3a] px-2 py-1 rounded bg-[#111118]">{booking.txnRefNo}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#2a2a3a] pt-8">
              <button
                onClick={handleDownloadReceipt}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a24] hover:bg-[#2a2a3a] border border-[#2a2a3a] hover:border-[#3a3a4a] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                <Download size={18} />
                Download Receipt
              </button>

              <button
                onClick={handleWhatsAppContact}
                className="w-full inline-flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 text-green-500 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
              >
                <MessageCircle size={18} />
                WhatsApp Us
              </button>

              <Link
                href="/cars"
                className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
              >
                Browse Cars
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2">
          <p className="text-blue-400 text-sm font-medium">
            📧 A confirmation email has been sent to <span className="text-white">{booking.customerEmail || 'your registered email'}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Keep this reference number handy. You can contact our support team at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#2a2a3a] border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading booking success page...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
