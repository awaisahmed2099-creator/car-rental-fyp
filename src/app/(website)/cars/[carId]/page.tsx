'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, Zap, Fuel, Calendar, Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car } from '@/types';
import ImageGallery from '@/components/website/ImageGallery';
import BookingSidebar from '@/components/website/BookingSidebar';
import CarCard from '@/components/website/CarCard';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function CarDetailPage() {
  const params = useParams();
  const carId = params.carId as string;

  const [car, setCar] = useState<Car | null>(null);
  const [relatedCars, setRelatedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const carDocRef = doc(db, COLLECTIONS.CARS, carId);
        const carDocSnapshot = await getDoc(carDocRef);

        if (!carDocSnapshot.exists()) {
          setCar(null);
          setRelatedCars([]);
          return;
        }

        const carData = carDocSnapshot.data();
        const car: Car = {
          carId: carDocSnapshot.id,
          name: carData.name || '',
          brand: carData.brand || '',
          model: carData.model || '',
          year: carData.year || new Date().getFullYear(),
          price: carData.price || 0,
          images: (Array.isArray(carData.images) ? carData.images : []).filter((img: any) => img && typeof img === 'string'),
          category: carData.category || 'sedan',
          seats: carData.seats || 5,
          transmission: carData.transmission || 'automatic',
          fuel: carData.fuel || 'petrol',
          features: Array.isArray(carData.features) ? carData.features : [],
          available: carData.available !== false,
          description: carData.description || 'Premium vehicle rental',
          createdAt: carData.createdAt?.toDate?.() || new Date(carData.createdAt) || new Date(),
        };
        setCar(car);

        // Fetch related cars (same category)
        const relatedQuery = query(
          collection(db, COLLECTIONS.CARS),
          where('category', '==', car.category),
          where('available', '==', true)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        const related: Car[] = [];
        relatedSnapshot.forEach((doc) => {
          const data = doc.data();
          const relatedCar: Car = {
            carId: doc.id,
            name: data.name || '',
            brand: data.brand || '',
            model: data.model || '',
            year: data.year || new Date().getFullYear(),
            price: data.price || 0,
            images: (Array.isArray(data.images) ? data.images : []).filter((img: any) => img && typeof img === 'string'),
            category: data.category || 'sedan',
            seats: data.seats || 5,
            transmission: data.transmission || 'automatic',
            fuel: data.fuel || 'petrol',
            features: Array.isArray(data.features) ? data.features : [],
            available: data.available !== false,
            description: data.description || 'Premium vehicle rental',
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
          };
          if (relatedCar.carId !== carId) {
            related.push(relatedCar);
          }
        });
        setRelatedCars(related.slice(0, 3));
      } catch (err) {
        console.error('Error fetching car:', err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

  if (loading) {
    return (
      <section className="py-12 bg-[#0a0a0f] min-h-screen pt-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonCard variant="car" />
            </div>
            <SkeletonCard variant="car" />
          </div>
        </div>
      </section>
    );
  }

  if (!car) {
    return (
      <section className="py-12 bg-[#0a0a0f] min-h-screen pt-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-dark p-12 text-center">
            <p className="text-gray-500 text-lg mb-6">Car not found</p>
            <a
              href="/cars"
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors inline-block"
            >
              Back to Cars
            </a>
          </div>
        </div>
      </section>
    );
  }

  const carImages = (car.images && Array.isArray(car.images) && car.images.length > 0)
    ? car.images.filter(img => img && typeof img === 'string')
    : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'];

  const validImages = carImages.length > 0 ? carImages : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'];

  const specs = [
    { icon: Users, label: 'Seats', value: car.seats },
    { icon: Zap, label: 'Transmission', value: car.transmission },
    { icon: Fuel, label: 'Fuel', value: car.fuel },
    { icon: Calendar, label: 'Year', value: car.year },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-[#0a0a0f] pt-28 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.06)_0%,_transparent_60%)]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-500 hover:text-orange-500 transition-colors">Home</a>
            <span className="text-gray-700">/</span>
            <a href="/cars" className="text-gray-500 hover:text-orange-500 transition-colors">Cars</a>
            <span className="text-gray-700">/</span>
            <span className="text-orange-500">{car.brand} {car.name}</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 bg-[#0a0a0f] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Left Column - Images and Info */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <ImageGallery images={validImages} alt={`${car.brand} ${car.name}`} />

              {/* Car Info Section */}
              <div className="card-dark p-8 mt-8">
                {/* Title and Category */}
                <div className="mb-6 pb-6 border-b border-[#2a2a3a]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {car.brand} {car.name}
                      </h1>
                      <p className="text-gray-500">{car.model} • {car.year}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-1.5 rounded-full font-semibold capitalize text-sm">
                      {car.category}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Price per Day</p>
                  <p className="text-3xl font-bold text-white">
                    PKR {car.price.toLocaleString()}
                    <span className="text-base text-gray-500 font-normal">/day</span>
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-[#2a2a3a]">
                  {specs.map((spec, idx) => {
                    const Icon = spec.icon;
                    return (
                      <div key={idx} className="bg-[#1a1a24] border border-[#2a2a3a] p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="text-orange-500" size={18} />
                          <span className="text-xs text-gray-500">{spec.label}</span>
                        </div>
                        <p className="text-lg font-bold text-white capitalize">{spec.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Features & Facilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {car.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2">
                        <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-orange-500" />
                        </div>
                        <span className="text-gray-400 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">About This Vehicle</h3>
                  <p className="text-gray-500 leading-relaxed">{car.description}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <BookingSidebar
                carId={car.carId}
                carName={car.name}
                carPrice={car.price}
              />
            </div>
          </div>

          {/* Related Cars */}
          {relatedCars.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8">
                Related Cars in <span className="text-orange-500 capitalize">{car.category}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCars.map((relatedCar) => (
                  <div key={relatedCar.carId} className="[&>div]:w-full">
                    <CarCard car={relatedCar} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
