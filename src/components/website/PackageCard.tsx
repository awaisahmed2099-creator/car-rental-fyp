'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Package } from '@/types';
import { motion } from 'framer-motion';

interface PackageCardProps {
  pkg: Package;
  priority?: boolean;
}

export default function PackageCard({ pkg, priority = false }: PackageCardProps) {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group card-dark overflow-hidden hover-lift flex flex-col h-full w-full"
    >
      {/* Image Carousel */}
      <div className="relative aspect-video bg-[#1a1a24] overflow-hidden">
        <Image
          src={packageImage}
          alt={pkg.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Popular Badge */}
        {pkg.popular && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={12} />
            Popular
          </div>
        )}

        {/* Discount Badge */}
        {pkg.discount > 0 && (
          <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
            {pkg.discount}% OFF
          </div>
        )}

        {/* Navigation Buttons (only show if more than 1 car) */}
        {pkg.cars && pkg.cars.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full transition-all backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full transition-all backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Car Info and Counter at Bottom */}
        {pkg.cars && pkg.cars.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="font-semibold text-sm">{pkg.cars[imageIndex]?.carName}</p>
                <p className="text-xs text-gray-300">Qty: {pkg.cars[imageIndex]?.quantity}</p>
              </div>
              {pkg.cars.length > 1 && (
                <div className="bg-black/50 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {imageIndex + 1} / {pkg.cars.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
          {pkg.name}
        </h3>

        {/* Duration */}
        {pkg.duration && (
          <p className="text-xs text-gray-500 mb-3">
            Duration: <span className="text-gray-400 font-medium">{pkg.duration}</span>
          </p>
        )}

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Features */}
        <div className="mb-4 space-y-1.5">
          {pkg.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
              <Check size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
          {pkg.features.length > 3 && (
            <p className="text-xs text-gray-600 font-medium">
              +{pkg.features.length - 3} more features
            </p>
          )}
        </div>

        {/* Included Cars Composition */}
        {pkg.cars && pkg.cars.length > 0 ? (
          <div className="text-xs text-gray-400 mb-4 font-medium bg-white/5 border border-[#2a2a3a] p-2.5 rounded-lg">
            <span className="text-orange-500 font-semibold">{totalVehicles} Vehicle{totalVehicles !== 1 ? 's' : ''}:</span>{' '}
            {getCompositionSummary()}
          </div>
        ) : (
          <p className="text-xs text-gray-600 mb-4 font-medium">No cars included</p>
        )}

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-[#2a2a3a] mt-auto">
          {pkg.discount > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                PKR {discountedPrice.toLocaleString()}
              </span>
              <span className="text-sm line-through text-gray-600">
                PKR {pkg.pricePerDay.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">
                PKR {pkg.pricePerDay.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">/day</span>
            </div>
          )}
        </div>

        {/* Book Button */}
        <Link
          href={`/packages/${pkg.packageId}`}
          className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 bg-white/5 border border-[#2a2a3a] text-white hover:bg-orange-500 hover:border-orange-500"
        >
          View Package
        </Link>
      </div>
    </motion.div>
  );
}
