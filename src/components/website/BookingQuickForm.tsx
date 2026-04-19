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

    const params = new URLSearchParams({
      startDate: formData.startDate,
      endDate: formData.endDate,
      category: formData.category
    });

    window.location.href = `/booking?${params.toString()}`;
  };

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all text-sm";

  return (
    <div className="glass rounded-2xl p-8 w-full max-w-sm">
      <div className="mb-6">
        <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-1">Quick Search</p>
        <h3 className="text-xl font-bold text-white">Book Your Ride</h3>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Start Date
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            End Date
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Car Category */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Category
          </label>
          <div className="relative">
            <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`${inputClasses} appearance-none`}
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
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 hover:shadow-lg hover:shadow-orange-500/20"
        >
          <Search size={16} />
          Search Cars
        </button>
      </form>
    </div>
  );
}
