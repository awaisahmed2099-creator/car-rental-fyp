'use client';

import { useState } from 'react';
import { Banknote, Smartphone, ChevronLeft } from 'lucide-react';

interface PaymentMethodSelectorProps {
  amount: number;
  onCashSelect: () => void;
  onJazzCashSelect?: () => void;
  onBack: () => void;
  loading?: boolean;
  jazzcashEnabled?: boolean;
}

export default function PaymentMethodSelector({
  amount,
  onCashSelect,
  onJazzCashSelect,
  onBack,
  loading = false,
  jazzcashEnabled = false,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'jazzcash' | null>(null);

  const handleSelectCash = () => {
    setSelectedMethod('cash');
  };

  const handleSelectJazzCash = () => {
    setSelectedMethod('jazzcash');
  };

  const handleConfirmCash = () => {
    if (selectedMethod === 'cash') {
      onCashSelect();
    }
  };

  const handleConfirmJazzCash = () => {
    if (selectedMethod === 'jazzcash' && onJazzCashSelect) {
      onJazzCashSelect();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Customer Details
      </button>

      {/* Payment Method Cards */}
      <div className="space-y-4">
        {/* Cash Payment Card */}
        <button
          onClick={handleSelectCash}
          disabled={loading}
          type="button"
          className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedMethod === 'cash'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50'
          } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              selectedMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              <Banknote size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Cash Payment</h3>
              <p className="text-gray-600">Pay when you receive the car</p>
            </div>
            {selectedMethod === 'cash' && (
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* JazzCash Payment Card - Only show if enabled */}
        {jazzcashEnabled && (
          <button
            onClick={handleSelectJazzCash}
            disabled={loading}
            type="button"
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedMethod === 'jazzcash'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50'
            } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedMethod === 'jazzcash' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Smartphone size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">JazzCash</h3>
                <p className="text-gray-600">Pay securely online now</p>
              </div>
              {selectedMethod === 'jazzcash' && (
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Amount Display */}
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <p className="text-gray-600 mb-2">Total Amount to Pay</p>
        <p className="text-4xl font-bold text-orange-500">PKR {amount.toLocaleString()}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {selectedMethod === 'cash' && (
          <button
            onClick={handleConfirmCash}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        )}

        {selectedMethod === 'jazzcash' && jazzcashEnabled && (
          <button
            onClick={handleConfirmJazzCash}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Processing...' : `Pay PKR ${amount.toLocaleString()} via JazzCash`}
          </button>
        )}

        {!selectedMethod && (
          <p className="text-center text-gray-600 py-4">
            Select a payment method to continue
          </p>
        )}
      </div>

      {/* Info Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        {jazzcashEnabled ? (
          <p className="text-sm text-blue-900">
            💡 <strong>Security:</strong> Both payment methods are secure. Choose what works best for you.
          </p>
        ) : (
          <p className="text-sm text-blue-900">
            💡 <strong>Note:</strong> Only cash payment is available at this time. You can pay when you receive the car.
          </p>
        )}
      </div>
    </div>
  );
}
