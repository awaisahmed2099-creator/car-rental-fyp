'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Package } from '@/types';

interface PackageCardProps {
  pkg: Package;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const discountedPrice = pkg.discount 
    ? Math.round(pkg.pricePerDay * (1 - pkg.discount / 100))
    : pkg.pricePerDay;

  // Validate package image
  const packageImage = (pkg.image && typeof pkg.image === 'string' && pkg.image.trim().length > 0)
    ? pkg.image
    : 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        <Image
          src={packageImage}
          alt={pkg.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        {pkg.popular && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Name and Duration */}
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {pkg.name}
          </h3>
          <p className="text-sm text-gray-600">
            Duration: <span className="font-semibold">{pkg.duration}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>

        {/* Features */}
        <div className="mb-4 space-y-1 flex-grow">
          {pkg.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
              <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
          {pkg.features.length > 3 && (
            <p className="text-sm text-gray-600 font-medium">
              +{pkg.features.length - 3} more features
            </p>
          )}
        </div>

        {/* Included Cars Count */}
        <p className="text-sm text-gray-600 mb-4 font-medium">
          {pkg.cars.length} car{pkg.cars.length !== 1 ? 's' : ''} included
        </p>

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          {pkg.discount > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-500">
                PKR {discountedPrice.toLocaleString()}
              </span>
              <span className="text-sm line-through text-gray-500">
                PKR {pkg.pricePerDay.toLocaleString()}
              </span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                Save {pkg.discount}%
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-orange-500">
              PKR {pkg.pricePerDay.toLocaleString()}/day
            </span>
          )}
        </div>

        {/* Book Button */}
        <Link
          href={`/packages/${pkg.packageId}`}
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors duration-200"
        >
          View Package
        </Link>
      </div>
    </div>
  );
}
