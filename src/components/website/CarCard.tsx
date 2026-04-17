import React from 'react';
import Image from 'next/image';
import { Users, Zap, Fuel } from 'lucide-react';
import Link from 'next/link';
import { Car } from '@/types';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  // Validate and get car image
  const carImage = 
    car.images && 
    Array.isArray(car.images) && 
    car.images.length > 0 && 
    car.images[0]
      ? car.images[0]
      : 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex-shrink-0 w-80">
      {/* Car Image */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden rounded-t-xl">
        <Image
          src={carImage}
          alt={car.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
          {car.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Car Name */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {car.brand} {car.name}
        </h3>

        {/* Model and Year */}
        <p className="text-sm text-gray-600 mb-4">
          {car.model} • {car.year}
        </p>

        {/* Specs Row */}
        <div className="flex gap-4 mb-4 py-3 border-y border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <Users size={18} className="text-orange-500" />
            <span className="text-sm">{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Zap size={18} className="text-orange-500" />
            <span className="text-sm capitalize">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Fuel size={18} className="text-orange-500" />
            <span className="text-sm capitalize">{car.fuel}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-orange-500">
            PKR {car.price}
          </span>
          <span className="text-gray-600">/day</span>
        </div>

        {/* Book Button */}
        <Link
          href={`/cars/${car.carId}`}
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
