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
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Special Packages</h1>
          <nav className="flex items-center gap-2 text-gray-300">
            <a href="/" className="hover:text-orange-500 transition-colors">
              Home
            </a>
            <span>/</span>
            <span className="text-orange-500">Packages</span>
          </nav>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Exclusive Packages
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
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
            /* Packages Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.packageId} pkg={pkg} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">
                No packages available at the moment
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
