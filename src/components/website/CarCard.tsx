import React, { useState } from 'react';
import Image from 'next/image';
import { Users, Zap, Fuel, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Car } from '@/types';
import { motion } from 'framer-motion';

interface CarCardProps {
  car: Car;
  priority?: boolean;
}

export default function CarCard({ car, priority = false }: CarCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Validate and get car images
  const carImages =
    car.images &&
    Array.isArray(car.images) &&
    car.images.length > 0
      ? car.images
      : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop'];

  const currentImage = carImages[currentImageIndex];
  const totalImages = carImages.length;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group card-dark overflow-hidden flex flex-col h-full w-full border border-transparent hover:-translate-y-2 hover:!border-orange-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Car Image with Carousel */}
      <div className="relative aspect-video bg-[#1a1a24] overflow-hidden">
        <Image
          src={currentImage}
          alt={car.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Previous Button */}
        {totalImages > 1 && (
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Next Button */}
        {totalImages > 1 && (
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Image Counter */}
        {totalImages > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
            {currentImageIndex + 1} / {totalImages}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
          {car.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Car Name */}
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
          {car.brand} {car.name}
        </h3>

        {/* Model Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1a1a24] text-orange-500 border border-orange-500/30 whitespace-nowrap shadow-sm">
            <Calendar size={12} className="text-orange-500" />
            {car.model}
          </span>
        </div>

        {/* Price */}
        <div className="mb-4 pb-4 border-b border-[#2a2a3a]">
          <p className="text-orange-500 font-bold text-2xl">
            PKR {car.price?.toLocaleString()}
            <span className="text-sm text-gray-500 font-normal">/day</span>
          </p>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mb-4 pb-4 border-b border-[#2a2a3a] relative group/desc">
            <p className="text-sm text-gray-400 line-clamp-3 cursor-help">
              {car.description}
            </p>
            {/* Custom Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover/desc:opacity-100 invisible group-hover/desc:visible transition-all duration-200 w-[110%] p-3 bg-gray-800 border border-gray-700 shadow-xl rounded-lg z-50 pointer-events-none">
              <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                {car.description}
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-2 left-4 w-4 h-4 bg-gray-800 border-b border-r border-gray-700 transform rotate-45"></div>
            </div>
          </div>
        )}

        {/* Features Chips */}
        {car.features && car.features.length > 0 && (
          <div className="mb-4 pb-4 border-b border-[#2a2a3a]">
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Features</p>
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

        {/* Specs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 mt-auto">
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

        {/* Book Button */}
        <Link
          href={`/cars/${car.carId}`}
          className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 bg-white/5 border border-[#2a2a3a] text-white hover:bg-orange-500 hover:border-orange-500"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
