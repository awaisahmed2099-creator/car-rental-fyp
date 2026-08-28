'use client';

import React, { useState, useMemo } from 'react';
import { usePackages } from '@/hooks/usePackages';
import PackageCard from '@/components/website/PackageCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { ChevronDown } from 'lucide-react';

export default function PackagesPage() {
  const { packages, loading } = usePackages();
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [packages, sortBy]);

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-12 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1200&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/80 to-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">Special Packages</h1>
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-400 hover:text-orange-500 transition-colors">Home</a>
            <span className="text-gray-600">/</span>
            <span className="text-orange-500 font-medium">Packages</span>
          </nav>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="pt-8 pb-12 bg-[#0a0a0f] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14 -mt-8 px-4">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Exclusive Deals</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Exclusive Packages
            </h2>
            <div className="flex justify-center mb-5">
              <div className="w-12 h-1 bg-orange-500 rounded-full" />
            </div>
            <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              Choose from our specially curated rental packages designed to give
              you the best value and convenience for your journey.
            </p>
          </div>

          {/* Header with Sort and Count */}
          <div className="card-dark p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-gray-400 text-sm font-medium">
              Showing <span className="text-white font-semibold">{loading ? '...' : sortedPackages.length}</span>{' '}
              {sortedPackages.length === 1 ? 'package' : 'packages'}
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
                <SkeletonCard key={i} variant="package" />
              ))}
            </div>
          ) : sortedPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPackages.map((pkg, idx) => (
                <PackageCard key={pkg.packageId} pkg={pkg} priority={idx < 4} />
              ))}
            </div>
          ) : (
            <div className="card-dark p-12 text-center">
              <p className="text-gray-500 text-lg">No packages available at the moment</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
