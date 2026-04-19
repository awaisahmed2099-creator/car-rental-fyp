'use client';

import React, { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface BookingSidebarProps {
  carId?: string;
  carName?: string;
  carPrice?: number;
  packageId?: string;
  packageName?: string;
  packagePrice?: number;
}

export default function BookingSidebar({ carId, carName, carPrice, packageId, packageName, packagePrice }: BookingSidebarProps) {
  const router = useRouter();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const price = carPrice || packagePrice || 0;
  const name = carName || packageName || '';

  // Calculate total whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end >= start) {
        // Calculate days (add 1 because same day return counts as 1 day)
        const days = differenceInDays(end, start) + 1;
        setTotalDays(days);
        setTotalPrice(days * price);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    }
  }, [startDate, endDate, price]);

  const handleBooking = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }

    // Redirect to booking page with parameters
    const params = new URLSearchParams({
      startDate,
      endDate,
      amount: totalPrice.toString()
    });
    if (carId) params.append('carId', carId);
    if (packageId) params.append('packageId', packageId);

    router.push(`/booking?${params.toString()}`);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const inputClasses = "w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all text-sm";

  return (
    <div className="card-dark p-6 sticky top-28">
      <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-[#2a2a3a]">
        Book This {packageId ? 'Package' : 'Car'}
      </h3>

      <div className="space-y-5">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Pickup Date
          </label>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Return Date
          </label>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Price Breakdown */}
        {totalDays > 0 ? (
          <div className="pt-4 border-t border-[#2a2a3a]">
            <div className="flex justify-between text-sm mb-2 text-gray-400">
              <span>PKR {price.toLocaleString()} x {totalDays} days</span>
              <span>PKR {totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg mt-4 text-white">
              <span>Total Price</span>
              <span className="text-orange-500">PKR {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-[#2a2a3a] text-center text-sm text-gray-500">
            Select dates to calculate price
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleBooking}
          disabled={totalDays === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#2a2a3a] disabled:text-gray-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 mt-4 hover:shadow-lg hover:shadow-orange-500/20"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
