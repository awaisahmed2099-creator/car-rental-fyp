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
      className="group card-dark overflow-hidden flex flex-col h-full w-full border border-transparent hover:-translate-y-2 hover:!border-orange-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
          unoptimized
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
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
          {pkg.name}
        </h3>

        {/* Cars Included (Details) */}
        <div className="mb-4 mt-2">
          <p className="text-gray-400 text-sm mb-2">Cars Included</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {pkg.cars.map((car, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-[#1a1a24] text-orange-500 border border-orange-500/30 whitespace-nowrap shadow-sm"
              >
                {car.quantity}x {car.carName}
              </span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-[#2a2a3a]">
          <p className="text-gray-400 text-xs font-medium mb-1">Price/Day</p>
          {pkg.discount > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-orange-500 font-bold text-2xl">
                PKR {discountedPrice.toLocaleString()}
              </span>
              <span className="text-sm line-through text-gray-600">
                PKR {pkg.pricePerDay.toLocaleString()}
              </span>
            </div>
          ) : (
            <p className="text-orange-500 font-bold text-2xl">
              PKR {pkg.pricePerDay.toLocaleString()}
            </p>
          )}
        </div>

        {/* Description */}
        {pkg.description && (
          <div className="mb-4 pb-4 border-b border-[#2a2a3a] relative group/desc">
            <p className="text-sm text-gray-400 line-clamp-3 cursor-help">
              {pkg.description}
            </p>
            {/* Custom Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/desc:opacity-100 invisible group-hover/desc:visible transition-all duration-200 w-[110%] p-3 bg-gray-800 border border-gray-700 shadow-xl rounded-lg z-50 pointer-events-none">
              <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                {pkg.description}
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-2 left-4 w-4 h-4 bg-gray-800 border-b border-r border-gray-700 transform rotate-45"></div>
            </div>
          </div>
        )}

        {/* Features Chips */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="mb-6 pb-6 border-b border-[#2a2a3a]">
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Features</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {pkg.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View Package Button */}
        <Link
          href={`/packages/${pkg.packageId}`}
          className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 bg-white/5 border border-[#2a2a3a] text-white hover:bg-orange-500 hover:border-orange-500 mt-auto"
        >
          View Package
        </Link>
      </div>
    </motion.div>
  );
}
