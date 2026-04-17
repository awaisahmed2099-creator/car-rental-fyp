'use client';

import React, { useState } from 'react';
import { Calendar, Car, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingQuickForm() {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    category: 'sedan'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    // Navigate to booking page with query params
    const params = new URLSearchParams({
      startDate: formData.startDate,
      endDate: formData.endDate,
      category: formData.category
    });

    window.location.href = `/booking?${params.toString()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Booking</h3>
      
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-orange-500" />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-orange-500" />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Car Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Car Category
          </label>
          <div className="relative">
            <Car size={18} className="absolute left-3 top-3 text-orange-500" />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
              <option value="van">Van</option>
              <option value="coaster">Coaster</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
        >
          <Search size={18} />
          Search Cars
        </button>
      </form>
    </div>
  );
}
