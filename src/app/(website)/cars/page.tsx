'use client';

import React, { useState, useMemo } from 'react';
import { useCars } from '@/hooks/useCars';
import CarCard from '@/components/website/CarCard';
import FilterSidebar from '@/components/website/FilterSidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { SlidersHorizontal, X } from 'lucide-react';

export default function CarsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

  const memoizedFilters = useMemo(() => ({ ...filters, sortBy }), [filters, sortBy]);
  const { cars, loading } = useCars(memoizedFilters);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSortBy('newest');
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-24 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/80 to-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">Our Fleet</h1>
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-400 hover:text-orange-500 transition-colors">Home</a>
            <span className="text-gray-600">/</span>
            <span className="text-orange-500 font-medium">Cars</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-[#0a0a0f] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl card-dark font-medium text-white text-sm hover:border-orange-500/50 transition-colors"
                >
                  <SlidersHorizontal size={18} className="text-orange-500" />
                  Filters
                </button>
              </div>

              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>

            {/* Grid Content */}
            <div className="md:col-span-3">
              {/* Header with Sort and Count */}
              <div className="card-dark p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-gray-400 text-sm font-medium">
                  Showing <span className="text-white font-semibold">{loading ? '...' : cars.length}</span>{' '}
                  {cars.length === 1 ? 'car' : 'cars'}
                </p>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-xs text-gray-500">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price Low to High</option>
                    <option value="price-desc">Price High to Low</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} variant="car" />
                  ))}
                </div>
              ) : cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car, idx) => (
                    <div key={car.carId} className="[&>div]:w-full">
                      <CarCard car={car} priority={idx < 4} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-dark p-12 text-center">
                  <p className="text-gray-500 text-lg mb-6">No cars found matching your filters</p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
