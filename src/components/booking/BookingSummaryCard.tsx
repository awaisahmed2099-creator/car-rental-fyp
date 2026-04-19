'use client';

import { Car, Package } from '@/types';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { Users, Zap, Fuel, MapPin, Calendar, Clock } from 'lucide-react';

// Helper function to validate and clean image URLs
function getValidImageUrl(url: any): string {
  const defaultImage = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';
  
  if (!url || typeof url !== 'string') return defaultImage;
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return defaultImage;

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      new URL(trimmedUrl);
      return trimmedUrl;
    } catch {
      return defaultImage;
    }
  }
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
      <div className="card-dark p-4">
        <h3 className="font-bold text-white mb-4 pb-3 border-b border-[#2a2a3a]">Booking Summary</h3>
        
        {car && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Vehicle</p>
            <p className="font-semibold text-white">{car.brand} {car.name}</p>
          </div>
        )}

        {pkg && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Package</p>
            <p className="font-semibold text-white">{pkg.name}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Dates</p>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-orange-500" />
            <p className="text-sm text-gray-300">
              {format(startDate, 'MMM dd')} — {format(endDate, 'MMM dd')} 
              <span className="text-orange-500 ml-1">({totalDays} days)</span>
            </p>
          </div>
        </div>

        {pickupLocation && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Pickup</p>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-orange-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-300">{pickupLocation}</p>
            </div>
          </div>
        )}

        {dropoffLocation && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Drop-off</p>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-orange-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-300">{dropoffLocation}</p>
            </div>
          </div>
        )}

        <div className="border-t border-[#2a2a3a] pt-4 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Total Amount</span>
            <span className="font-bold text-xl text-white">PKR {totalAmount.toLocaleString()}</span>
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
    if (url !== defaultImage) carImage = url;
  } else if (pkg?.image) {
    const url = getValidImageUrl(pkg.image);
    if (url !== defaultImage) carImage = url;
  }

  return (
    <div className="card-dark overflow-hidden sticky top-28">
      {/* Decorative Top Accent */}
      <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
      
      {/* Image */}
      <div className="relative aspect-video bg-[#1a1a24] overflow-hidden">
        <Image
          src={carImage}
          alt={car ? car.name : pkg ? pkg.name : 'Booking'}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        {car && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">{car.brand} {car.name}</h3>
            <p className="text-sm text-gray-500 font-medium">{car.model} • {car.year}</p>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#2a2a3a]">
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Seats</p>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-orange-500" />
                  <span className="text-sm font-medium text-white">{car.seats}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Trans.</p>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-orange-500" />
                  <span className="text-sm font-medium text-white capitalize">{car.transmission}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Fuel</p>
                <div className="flex items-center gap-1.5">
                  <Fuel size={14} className="text-orange-500" />
                  <span className="text-sm font-medium text-white capitalize">{car.fuel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {pkg && (
          <div className="mb-6 border-b border-[#2a2a3a] pb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">Package</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{pkg.description}</p>
          </div>
        )}

        {/* Dates */}
        <div className="mb-6 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Booking Period</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Start Date</p>
                <p className="text-sm font-medium text-white">{format(startDate, 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#22222e] border border-[#2a2a3a] flex items-center justify-center flex-shrink-0">
                <Clock size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">End Date</p>
                <p className="text-sm font-medium text-white">{format(endDate, 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#2a2a3a] flex justify-between items-center">
            <span className="text-xs text-gray-500">Duration</span>
            <span className="text-sm font-bold text-orange-500">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>

        {/* Locations */}
        {(pickupLocation || dropoffLocation) && (
          <div className="mb-6 space-y-3">
            {pickupLocation && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#2a2a3a] flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pickup Location</p>
                  <p className="text-sm font-medium text-white">{pickupLocation}</p>
                </div>
              </div>
            )}
            {dropoffLocation && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#2a2a3a] flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Drop-off Location</p>
                  <p className="text-sm font-medium text-white">{dropoffLocation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-[#2a2a3a] space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Base Price (<span className="text-gray-500">{totalDays} days</span>)</span>
            <span className="font-medium text-white">PKR {basePrice.toLocaleString()}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-orange-500 flex items-center gap-1">
                Discount <span className="bg-orange-500/20 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{discount}% OFF</span>
              </span>
              <span className="font-medium text-orange-500">-PKR {discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between items-end pt-3 mt-3 border-t border-[#2a2a3a]">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
              <p className="text-[10px] text-gray-600">Includes all taxes</p>
            </div>
            <span className="text-2xl font-bold text-white">PKR {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
