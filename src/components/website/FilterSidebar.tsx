'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CarFilters } from '@/hooks/useCars';

interface FilterSidebarProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  onClearFilters: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'van', label: 'Van' },
  { value: 'coaster', label: 'Coaster' },
];

const TRANSMISSIONS = [
  { value: 'all', label: 'All' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

const SEATS_OPTIONS = [
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
  { value: 7, label: '7+' },
];

export default function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen = true,
  onClose,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 500000,
  });

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    });
  };

  const handleTransmissionChange = (transmission: string) => {
    onFilterChange({
      ...filters,
      transmission: transmission === 'all' ? undefined : transmission,
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    onFilterChange({
      ...filters,
      minPrice: newRange.min,
      maxPrice: newRange.max,
    });
  };

  const handleSeatsChange = (seats: number) => {
    onFilterChange({
      ...filters,
      minSeats: filters.minSeats === seats ? undefined : seats,
    });
  };

  const content = (
    <div className="space-y-8">
      {/* Header with close button (mobile) */}
      <div className="flex items-center justify-between mb-2 md:hidden pb-4 border-b border-[#2a2a3a]">
        <h3 className="text-xl font-bold text-white">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Category</h4>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat.value || (cat.value === 'all' && !filters.category);
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2a2a3a] hover:border-orange-500/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission Filter */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Transmission</h4>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((trans) => {
            const isActive = filters.transmission === trans.value || (trans.value === 'all' && !filters.transmission);
            return (
              <button
                key={trans.value}
                onClick={() => handleTransmissionChange(trans.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2a2a3a] hover:border-orange-500/50'
                }`}
              >
                {trans.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Price Range (PKR/day)</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Min</span>
              <span className="text-white font-medium">PKR {priceRange.min.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#2a2a3a] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Max</span>
              <span className="text-white font-medium">PKR {priceRange.max.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#2a2a3a] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Seats Filter */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Seats</h4>
        <div className="flex flex-wrap gap-2">
          {SEATS_OPTIONS.map((seat) => {
            const isActive = filters.minSeats === seat.value;
            return (
              <button
                key={seat.value}
                onClick={() => handleSeatsChange(seat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2a2a3a] hover:border-orange-500/50'
                }`}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="pt-4 border-t border-[#2a2a3a]">
        <button
          onClick={onClearFilters}
          className="w-full bg-[#1a1a24] hover:bg-[#2a2a3a] text-white border border-[#2a2a3a] font-semibold py-3 px-4 rounded-xl transition-colors duration-300 text-sm"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );

  // Mobile drawer
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Drawer */}
        <div
          className={`fixed inset-y-0 right-0 w-80 bg-[#111118] border-l border-[#2a2a3a] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden overflow-y-auto p-6`}
        >
          {content}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="card-dark p-6 sticky top-28 hidden md:block">
      {content}
    </div>
  );
}
