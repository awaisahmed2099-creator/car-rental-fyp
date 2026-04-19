import React, { useState } from 'react';
import Image from 'next/image';
import { Users, Zap, Fuel, ChevronLeft, ChevronRight } from 'lucide-react';
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
      className="group card-dark overflow-hidden hover-lift flex flex-col h-full w-full"
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
        <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
          {car.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Car Name */}
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
          {car.brand} {car.name}
        </h3>

        {/* Model and Year */}
        <p className="text-xs text-gray-500 mb-4">
          {car.model} • {car.year}
        </p>

        {/* Specs Row */}
        <div className="flex gap-3 mb-4 py-3 border-y border-[#2a2a3a]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users size={14} className="text-orange-500/80" />
            <span className="text-xs">{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Zap size={14} className="text-orange-500/80" />
            <span className="text-xs capitalize">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Fuel size={14} className="text-orange-500/80" />
            <span className="text-xs capitalize">{car.fuel}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4 mt-auto">
          <span className="text-xl font-bold text-white">
            PKR {car.price?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">/day</span>
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
