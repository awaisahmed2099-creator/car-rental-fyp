'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Car, Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
    type: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (formData.location) params.append('location', formData.location);
    if (formData.pickupDate) params.append('pickupDate', formData.pickupDate);
    if (formData.returnDate) params.append('returnDate', formData.returnDate);
    if (formData.type) params.append('type', formData.type);
    
    router.push(`/cars?${params.toString()}`);
  };

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors appearance-none";
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111118]/80 backdrop-blur-xl border border-[#2a2a3a] rounded-2xl p-6 shadow-2xl w-full max-w-6xl mx-auto z-20 relative"
    >
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
        {/* Location Dropdown */}
        <div className="flex-1 relative">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
          <select 
            name="location" 
            value={formData.location} 
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Any Location</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Benazir Airport">Benazir Airport</option>
          </select>
        </div>

        {/* Pickup Date Dropdown */}
        <div className="flex-1 relative">
          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
          <input 
            type="date" 
            name="pickupDate" 
            min={today}
            value={formData.pickupDate} 
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Return Date Dropdown */}
        <div className="flex-1 relative">
          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
          <input 
            type="date" 
            name="returnDate" 
            min={formData.pickupDate || today}
            value={formData.returnDate} 
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Car Type Dropdown */}
        <div className="flex-1 relative">
          <Car size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Any Type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="luxury">Luxury</option>
            <option value="van">Van</option>
            <option value="coaster">Coaster</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <Search size={18} />
          <span className="whitespace-nowrap">Search Cars</span>
        </button>
      </form>
    </motion.div>
  );
}
