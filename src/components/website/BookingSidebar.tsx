'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingSidebarProps {
  carId?: string;
  packageId?: string;
  carName?: string;
  carPrice?: number;
  packageName?: string;
  packagePrice?: number;
}

export default function BookingSidebar({
  carId,
  packageId,
  carName,
  carPrice,
  packageName,
  packagePrice,
}: BookingSidebarProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const price = carPrice || packagePrice || 0;
  
  // Calculate total days and amount
  const totalDays = startDate && endDate
    ? Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;

  const totalAmount = totalDays > 0 ? totalDays * price : 0;

  const handleProceedToBook = () => {
    if (!startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Format dates for URL
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('amount', totalAmount.toString());
    if (carId) {
      params.append('carId', carId);
    }
    if (packageId) {
      params.append('packageId', packageId);
    }

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 h-fit">
      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Book This {carId ? 'Car' : 'Package'}
      </h3>

      <div className="space-y-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-900"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-900"
          />
        </div>

        {/* Days and Amount */}
        {totalDays > 0 && (
          <div className="bg-orange-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Total Days:</span>
              <span className="font-semibold">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Rate/Day:</span>
              <span className="font-semibold">PKR {price.toLocaleString()}</span>
            </div>
            <div className="border-t border-orange-200 pt-2 flex justify-between text-lg font-bold text-orange-600">
              <span>Total Amount:</span>
              <span>PKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Availability Note */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Vehicle is available for booking
          </p>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToBook}
          disabled={!startDate || !endDate}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Proceed to Book
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-600 text-center">
          * Required fields
        </p>
      </div>
    </div>
  );
}
