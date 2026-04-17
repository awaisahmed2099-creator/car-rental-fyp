'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Package } from '@/types';

interface PackageCardProps {
  pkg: Package;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const [imageIndex, setImageIndex] = useState(0);

  const discountedPrice = pkg.discount 
    ? Math.round(pkg.pricePerDay * (1 - pkg.discount / 100))
    : pkg.pricePerDay;

  // Get current car image based on carousel index
  const currentCarImage = pkg.cars && pkg.cars.length > 0 
    ? pkg.cars[imageIndex]?.image 
    : pkg.image;

  // Validate package image - use first car image
  const packageImage = currentCarImage || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';

  // Generate composition summary (e.g., "8 Prados & 2 Civics")
  const getCompositionSummary = () => {
    if (!pkg.cars || pkg.cars.length === 0) return '';
    return pkg.cars
      .map((car) => `${car.quantity} ${car.carName}${car.quantity > 1 ? 's' : ''}`)
      .join(' & ');
  };

  // Calculate total vehicles
  const totalVehicles = pkg.cars?.reduce((sum, car) => sum + car.quantity, 0) || 0;

  const handlePrevImage = () => {
    if (!pkg.cars || pkg.cars.length === 0) return;
    setImageIndex((prev) => (prev === 0 ? pkg.cars.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!pkg.cars || pkg.cars.length === 0) return;
    setImageIndex((prev) => (prev === pkg.cars.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
      {/* Image Carousel */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        <img
          src={packageImage}
          alt={pkg.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';
          }}
        />

        {/* Popular Badge */}
        {pkg.popular && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Popular
          </div>
        )}

        {/* Navigation Buttons (only show if more than 1 car) */}
        {pkg.cars && pkg.cars.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Car Info and Counter at Bottom */}
        {pkg.cars && pkg.cars.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="font-semibold">{pkg.cars[imageIndex]?.carName}</p>
                <p className="text-sm text-gray-300">Quantity: {pkg.cars[imageIndex]?.quantity}</p>
              </div>
              {pkg.cars.length > 1 && (
                <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded text-xs font-medium">
                  {imageIndex + 1} / {pkg.cars.length}
                </div>
              )}
            </div>
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

        {/* Included Cars Composition */}
        {pkg.cars && pkg.cars.length > 0 ? (
          <div className="text-sm text-gray-700 mb-4 font-medium bg-orange-50 p-2 rounded">
            <span className="text-orange-600 font-semibold">{totalVehicles} Vehicle{totalVehicles !== 1 ? 's' : ''}:</span> {getCompositionSummary()}
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-4 font-medium">
            No cars included
          </p>
        )}

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
