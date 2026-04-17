'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function BookingFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get('bookingId');
  const code = searchParams.get('code');
  const reason = searchParams.get('reason') || 'payment_failed';

  const getErrorMessage = () => {
    switch (reason) {
      case 'invalid_hash':
        return 'Security verification failed. Please try again.';
      case 'update_error':
        return 'The payment was processed, but there was an issue updating your booking.';
      case 'callback_error':
        return 'There was an error processing your payment callback.';
      case 'payment_failed':
      default:
        return code ? `Payment failed with code ${code}. Please try again or use a different payment method.` : 'Your payment could not be processed. Please try again.';
    }
  };

  const getErrorTitle = () => {
    switch (reason) {
      case 'update_error':
        return 'Payment Processed, Partial Error';
      default:
        return 'Payment Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Error Animation */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="relative w-24 h-24">
              <XCircle size={96} className="text-red-500 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{getErrorTitle()}</h1>
          <p className="text-xl text-gray-600">We encountered an issue with your booking</p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 sm:px-8 py-8">
            <div className="flex items-center gap-3">
              <AlertTriangle size={28} className="text-white" />
              <h2 className="text-2xl font-bold text-white">{getErrorTitle()}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-8">
            {/* Error Message */}
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-900 font-semibold">{getErrorMessage()}</p>
            </div>

            {/* Booking Info if available */}
            {bookingId && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-mono font-semibold text-gray-900 text-lg">DR-{bookingId.substring(0, 6).toUpperCase()}</p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Your booking was created but the payment could not be processed. You can try to pay again with a different payment method.
                </p>
              </div>
            )}

            {/* Troubleshooting */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Tips</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Check your internet connection and try again</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Verify your payment method has sufficient balance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Try a different payment method if available</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Contact your bank if you see recurring payment declines</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>

              <Link
                href="/cars"
                className="inline-flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Book with Cash Instead
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-semibold mb-2">Contact our support team</p>
                <p className="text-blue-800">
                  Email: <a href="mailto:support@driveease.com" className="underline hover:text-blue-700">support@driveease.com</a>
                </p>
                <p className="text-blue-800">
                  WhatsApp: <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">+92 300 1234567</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Home Link */}
        <div className="text-center">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingFailedContent />
    </Suspense>
  );
}
