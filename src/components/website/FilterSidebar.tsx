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
    <div className="space-y-6">
      {/* Header with close button (mobile) */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h3 className="text-lg font-bold">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
            aria-label="Close filters"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                filters.category === cat.value ||
                (cat.value === 'all' && !filters.category)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission Filter */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3">Transmission</h4>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((trans) => (
            <button
              key={trans.value}
              onClick={() => handleTransmissionChange(trans.value)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                filters.transmission === trans.value ||
                (trans.value === 'all' && !filters.transmission)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {trans.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3">Price Range (PKR/day)</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Min: PKR {priceRange.min.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Max: PKR {priceRange.max.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Seats Filter */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3">Seats</h4>
        <div className="flex flex-wrap gap-2">
          {SEATS_OPTIONS.map((seat) => (
            <button
              key={seat.value}
              onClick={() => handleSeatsChange(seat.value)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                filters.minSeats === seat.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {seat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );

  // Mobile drawer
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block bg-white p-6 rounded-lg shadow-lg h-fit sticky top-24">
        {content}
      </div>

      {/* Mobile Drawer Overlay */}
      <div className="md:hidden fixed inset-0 z-40">
        <button
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
          aria-label="Close filter drawer"
        />
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-lg overflow-y-auto z-50 p-6">
          {content}
        </div>
      </div>
    </>
  );
}
