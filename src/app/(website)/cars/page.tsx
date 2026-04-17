'use client';

import React, { useState, useMemo } from 'react';
import { useCars } from '@/hooks/useCars';
import CarCard from '@/components/website/CarCard';
import FilterSidebar from '@/components/website/FilterSidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Menu, X } from 'lucide-react';

export default function CarsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

  // Memoize the combined filters object to prevent infinite loops
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
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Fleet</h1>
          <nav className="flex items-center gap-2 text-gray-300">
            <a href="/" className="hover:text-orange-500 transition-colors">
              Home
            </a>
            <span>/</span>
            <span className="text-orange-500">Cars</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-200 font-semibold text-gray-900 hover:border-orange-500 transition-colors"
                >
                  <Menu size={20} />
                  Filters
                </button>
              </div>

              {/* Filter Component */}
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
              <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-gray-700 font-semibold">
                  Showing {loading ? '...' : cars.length}{' '}
                  {cars.length === 1 ? 'car' : 'cars'}
                </p>

                {/* Sort Dropdown */}
                <div>
                  <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
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
                /* Cars Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <CarCard key={car.carId} car={car} />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg mb-6">
                    No cars found matching your filters
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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
