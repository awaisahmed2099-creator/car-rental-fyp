'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const validImages = (images || []).filter(img => img && typeof img === 'string' && img.trim().length > 0);
  
  if (!validImages || validImages.length === 0) {
    return (
      <div className="bg-[#1a1a24] border border-[#2a2a3a] aspect-video rounded-2xl flex items-center justify-center">
        <span className="text-gray-600">No image available</span>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video bg-[#1a1a24] rounded-2xl overflow-hidden border border-[#2a2a3a] group">
        <Image
          src={currentImage}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 700px"
          className="object-cover"
          priority
        />
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === index ? 'border-orange-500 ring-1 ring-orange-500/30' : 'border-[#2a2a3a] hover:border-[#3a3a4a]'
              }`}
              aria-label={`Select image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
