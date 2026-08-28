'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Car, Search, ChevronDown } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [carType, setCarType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (carType) {
      router.push(`/cars?type=${carType}`);
    } else {
      router.push('/cars');
    }
  };

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] text-white rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors appearance-none cursor-pointer";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111118]/80 backdrop-blur-xl border border-[#2a2a3a] rounded-2xl p-4 sm:p-6 shadow-2xl w-full max-w-2xl mx-auto z-20 relative"
    >
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Car Type Dropdown */}
        <div className="w-full sm:flex-1 relative group">
          <Car size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
          <select 
            value={carType} 
            onChange={(e) => setCarType(e.target.value)}
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
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search size={18} />
          <span className="whitespace-nowrap">Search Cars</span>
        </button>
      </form>
    </motion.div>
  );
}
