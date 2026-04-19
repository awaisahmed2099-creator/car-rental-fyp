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

  const handleSelectCash = () => setSelectedMethod('cash');
  const handleSelectJazzCash = () => setSelectedMethod('jazzcash');

  const handleConfirmCash = () => {
    if (selectedMethod === 'cash') onCashSelect();
  };

  const handleConfirmJazzCash = () => {
    if (selectedMethod === 'jazzcash' && onJazzCashSelect) onJazzCashSelect();
  };

  return (
    <div className="space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-6 border-b border-[#2a2a3a]">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Payment Details</h2>
          <p className="text-sm text-gray-500">Select how you want to pay for this booking.</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a24] hover:bg-[#2a2a3a] text-gray-300 font-medium rounded-lg text-sm transition-colors border border-[#2a2a3a]"
        >
          <ChevronLeft size={16} />
          Go Back
        </button>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        {/* Cash Payment Card */}
        <button
          onClick={handleSelectCash}
          disabled={loading}
          type="button"
          className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedMethod === 'cash'
              ? 'border-orange-500 bg-orange-500/5'
              : 'border-[#2a2a3a] bg-[#1a1a24] hover:border-[#3a3a4a] hover:bg-[#2a2a3a]'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-colors ${
              selectedMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'
            }`}>
              <Banknote size={24} />
            </div>
            <div className="flex-1">
              <h3 className={`text-base font-semibold mb-1 transition-colors ${
                selectedMethod === 'cash' ? 'text-white' : 'text-gray-300'
              }`}>Cash on Delivery</h3>
              <p className="text-xs text-gray-500">Pay directly when you receive the vehicle</p>
            </div>
            {/* Radio indicator */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
              selectedMethod === 'cash' ? 'border-orange-500 bg-orange-500' : 'border-gray-500 bg-transparent'
            }`}>
              {selectedMethod === 'cash' && (
                <div className="w-2 h-2 rounded-full bg-[#111118]" />
              )}
            </div>
          </div>
        </button>

        {/* JazzCash Payment Card */}
        {jazzcashEnabled && (
          <button
            onClick={handleSelectJazzCash}
            disabled={loading}
            type="button"
            className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedMethod === 'jazzcash'
                ? 'border-orange-500 bg-orange-500/5'
                : 'border-[#2a2a3a] bg-[#1a1a24] hover:border-[#3a3a4a] hover:bg-[#2a2a3a]'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${
                selectedMethod === 'jazzcash' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'
              }`}>
                <Smartphone size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-semibold mb-1 transition-colors ${
                  selectedMethod === 'jazzcash' ? 'text-white' : 'text-gray-300'
                }`}>JazzCash</h3>
                <p className="text-xs text-gray-500">Pay securely via digital wallet</p>
              </div>
              {/* Radio indicator */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                selectedMethod === 'jazzcash' ? 'border-orange-500 bg-orange-500' : 'border-gray-500 bg-transparent'
              }`}>
                {selectedMethod === 'jazzcash' && (
                  <div className="w-2 h-2 rounded-full bg-[#111118]" />
                )}
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Action Area */}
      <div className="pt-6 mt-6 border-t border-[#2a2a3a]">
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Total to Pay</p>
          <p className="text-4xl font-bold text-orange-500">PKR {amount.toLocaleString()}</p>
        </div>

        {selectedMethod === 'cash' && (
          <button
            onClick={handleConfirmCash}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#2a2a3a] disabled:text-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
          >
            {loading ? 'Confirming...' : 'Confirm Cash Booking'}
          </button>
        )}

        {selectedMethod === 'jazzcash' && jazzcashEnabled && (
          <button
            onClick={handleConfirmJazzCash}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#2a2a3a] disabled:text-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
          >
            {loading ? 'Processing...' : `Pay PKR ${amount.toLocaleString()}`}
          </button>
        )}

        {!selectedMethod && (
          <button
            disabled
            className="w-full bg-[#2a2a3a] text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed"
          >
            Choose a Payment Method
          </button>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0110 0v4"></path>
        </svg>
        <span>Your payment information is thoroughly encrypted and secure.</span>
      </div>
    </div>
  );
}
