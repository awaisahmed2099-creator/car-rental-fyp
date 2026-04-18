'use client';

import { Car, Package, Booking } from '@/types';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { Users, Zap, Fuel, MapPin } from 'lucide-react';

// Helper function to validate and clean image URLs
function getValidImageUrl(url: any): string {
  const defaultImage = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';
  
  // Check if URL is a valid string
  if (!url || typeof url !== 'string') {
    return defaultImage;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check if URL is empty after trimming
  if (!trimmedUrl) {
    return defaultImage;
  }

  // Check if it's a valid HTTP(S) URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      new URL(trimmedUrl);
      return trimmedUrl;
    } catch {
      return defaultImage;
    }
  }

  // If it doesn't start with http, it's invalid
  return defaultImage;
}

interface BookingSummaryCardProps {
  car?: Car;
  package?: Package;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  discount?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
  compact?: boolean;
}

export default function BookingSummaryCard({
  car,
  package: pkg,
  startDate,
  endDate,
  totalAmount,
  discount = 0,
  pickupLocation,
  dropoffLocation,
  compact = false,
}: BookingSummaryCardProps) {
  const totalDays = differenceInDays(endDate, startDate) || 1;
  const basePrice = car ? car.price * totalDays : (pkg ? pkg.pricePerDay * totalDays : 0);
  const discountAmount = basePrice * (discount / 100);

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
        
        {car && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">Vehicle</p>
            <p className="font-semibold text-gray-900">{car.name}</p>
          </div>
        )}

        {pkg && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">Package</p>
            <p className="font-semibold text-gray-900">{pkg.name}</p>
          </div>
        )}

        <div className="mb-3">
          <p className="text-sm text-gray-600">Dates</p>
          <p className="font-semibold text-gray-900">
            {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')} ({totalDays} days)
          </p>
        </div>

        {pickupLocation && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">Pickup</p>
            <p className="font-semibold text-gray-900">{pickupLocation}</p>
          </div>
        )}

        {dropoffLocation && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">Drop-off</p>
            <p className="font-semibold text-gray-900">{dropoffLocation}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-bold text-xl text-orange-500">PKR {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full summary card
  const defaultImage = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';
  
  let carImage = defaultImage;
  
  if (car?.images && Array.isArray(car.images) && car.images.length > 0) {
    const url = getValidImageUrl(car.images[0]);
    if (url !== defaultImage) {
      carImage = url;
    }
  } else if (pkg?.image) {
    const url = getValidImageUrl(pkg.image);
    if (url !== defaultImage) {
      carImage = url;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
      {/* Image */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        <Image
          src={carImage}
          alt={car ? car.name : pkg ? pkg.name : 'Booking'}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        {car && (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{car.brand} {car.name}</h3>
            <p className="text-gray-600 mb-4">{car.model} • {car.year}</p>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Seats</p>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-orange-500" />
                  <span className="font-semibold text-gray-900">{car.seats}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Transmission</p>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-orange-500" />
                  <span className="font-semibold text-gray-900 capitalize">{car.transmission}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Fuel</p>
                <div className="flex items-center gap-2">
                  <Fuel size={18} className="text-orange-500" />
                  <span className="font-semibold text-gray-900 capitalize">{car.fuel}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {pkg && (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
          </>
        )}

        {/* Dates */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Booking Period</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-900">{format(startDate, 'EEEE, MMMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Date</p>
              <p className="font-semibold text-gray-900">{format(endDate, 'EEEE, MMMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Days</p>
              <p className="font-semibold text-gray-900">{totalDays} days</p>
            </div>
          </div>
        </div>

        {/* Locations */}
        {(pickupLocation || dropoffLocation) && (
          <div className="mb-4 space-y-2">
            {pickupLocation && (
              <div className="flex gap-2">
                <MapPin size={16} className="text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Pickup</p>
                  <p className="font-semibold text-gray-900">{pickupLocation}</p>
                </div>
              </div>
            )}
            {dropoffLocation && (
              <div className="flex gap-2">
                <MapPin size={16} className="text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Drop-off</p>
                  <p className="font-semibold text-gray-900">{dropoffLocation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price ({totalDays} days × PKR {car ? car.price : pkg?.pricePerDay})</span>
            <span className="font-semibold text-gray-900">PKR {basePrice.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discount}%)</span>
              <span>-PKR {discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="text-gray-700 font-semibold">Total Amount</span>
            <span className="text-3xl font-bold text-orange-500">PKR {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
