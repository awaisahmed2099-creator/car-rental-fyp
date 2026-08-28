'use client';

import { Car, Package, LocationData } from '@/types';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { Users, Zap, Fuel, MapPin, Calendar, Clock, MessageSquare } from 'lucide-react';

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
  startDate: Date | null;
  endDate: Date | null;
  totalAmount: number;
  discount?: number;
  pickupLocation?: string | LocationData;
  dropoffLocation?: string | LocationData;
  notes?: string;
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
  notes,
  compact = false,
}: BookingSummaryCardProps) {
  const totalDays = (startDate && endDate) ? differenceInDays(endDate, startDate) + 1 : 0;
  const basePricePerDay = pkg ? pkg.pricePerDay : (car ? car.price : 0);
  const basePrice = basePricePerDay * totalDays;
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

        {startDate && endDate && (
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
        )}

        {pickupLocation && (
          <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-[#22222e] rounded-lg border border-[#2a2a3a]">
            <MapPin size={14} className="text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase">Pickup</p>
              <p className="text-sm text-gray-300 truncate">{typeof pickupLocation === 'string' ? pickupLocation : pickupLocation.address}</p>
            </div>
          </div>
        )}

        {dropoffLocation && (
          <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-[#22222e] rounded-lg border border-[#2a2a3a]">
            <MapPin size={14} className="text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase">Drop-off</p>
              <p className="text-sm text-gray-300 truncate">{typeof dropoffLocation === 'string' ? dropoffLocation : dropoffLocation.address}</p>
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
    <div className="card-dark overflow-hidden sticky top-28 border-2 border-transparent hover:!border-orange-500 hover:-translate-y-1 transition-all duration-300">
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
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        {car && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{car.brand} {car.name}</h3>
            
            {/* Model Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1a1a24] text-orange-500 border border-orange-500/30 whitespace-nowrap shadow-sm">
                <Calendar size={12} className="text-orange-500" />
                {car.model}
              </span>
            </div>

            {/* Specs Row */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2a2a3a]">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <Users size={16} className="text-orange-500 mb-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{car.seats} Seats</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <Zap size={16} className="text-orange-500 mb-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider capitalize">{car.transmission}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <Fuel size={16} className="text-orange-500 mb-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider capitalize">{car.fuel}</span>
              </div>
            </div>

            {/* Features Row */}
            {car.features && car.features.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-semibold">Features</p>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature, idx) => (
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
                <p className="text-sm font-medium text-white">{startDate ? format(startDate, 'MMM dd, yyyy') : 'Not selected'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">End Date</p>
                <p className="text-sm font-medium text-white">{endDate ? format(endDate, 'MMM dd, yyyy') : 'Not selected'}</p>
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
                  <p className="text-sm font-medium text-white">{typeof pickupLocation === 'string' ? pickupLocation : pickupLocation.address}</p>
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
                  <p className="text-sm font-medium text-white">{typeof dropoffLocation === 'string' ? dropoffLocation : dropoffLocation.address}</p>
                </div>
              </div>
            )}
            {notes && notes.trim() !== '' && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-[#2a2a3a]/50">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#2a2a3a] flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Special Requests</p>
                  <p className="text-sm font-medium text-white mt-1">{notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-[#2a2a3a] space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Base Price (<span className="text-gray-500">for {totalDays} {totalDays === 1 ? 'day' : 'days'}</span>)</span>
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
