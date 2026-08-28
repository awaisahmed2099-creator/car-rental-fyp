'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCars, CarFilters } from '@/hooks/useCars';
import CarCard from '@/components/website/CarCard';
import FilterSidebar from '@/components/website/FilterSidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

function CarsPageContent() {
  const searchParams = useSearchParams();
  const urlType = searchParams.get('type') || undefined;
  const urlLocation = searchParams.get('location');

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    category: urlType,
  });
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
      <section className="relative pt-32 pb-12 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/80 to-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">Our Fleet</h1>
          {urlLocation && (
            <p className="text-orange-500 font-medium mb-4 text-lg">
              Showing cars available for pickup in {urlLocation}
            </p>
          )}
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-400 hover:text-orange-500 transition-colors">Home</a>
            <span className="text-gray-600">/</span>
            <span className="text-orange-500 font-medium">Cars</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-8 pb-12 bg-[#0a0a0f] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 -mt-8 px-4">
            <span className="text-orange-500 font-semibold tracking-widest uppercase text-xs md:text-sm">
              Premium Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Find Your Perfect Ride
            </h2>
            <div className="w-12 h-1 bg-orange-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Browse our wide range of well-maintained vehicles. From economical sedans to luxury SUVs, find the perfect car for your next adventure.
            </p>
          </div>
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

                <div className="flex items-center gap-2 group cursor-pointer">
                  <label htmlFor="sort" className="text-xs text-gray-500 cursor-pointer">Sort by:</label>
                  <div className="relative">
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 pr-8 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors appearance-none cursor-pointer group-hover:border-orange-500/50"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-asc">Price Low to High</option>
                      <option value="price-desc">Price High to Low</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-orange-500 transition-colors pointer-events-none" />
                  </div>
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

export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] pt-32 pb-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CarsPageContent />
    </Suspense>
  );
}
