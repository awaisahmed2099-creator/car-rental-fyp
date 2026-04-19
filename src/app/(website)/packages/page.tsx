'use client';

import React from 'react';
import { usePackages } from '@/hooks/usePackages';
import PackageCard from '@/components/website/PackageCard';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function PackagesPage() {
  const { packages, loading } = usePackages();

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-24 overflow-hidden flex items-center">
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
      <section className="py-12 bg-[#0a0a0f] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
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

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} variant="package" />
              ))}
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, idx) => (
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
