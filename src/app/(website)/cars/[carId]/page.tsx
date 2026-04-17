'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, Zap, Fuel, Calendar } from 'lucide-react';
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
        // Fetch the car by document ID
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
      <section className="py-12 bg-gray-50 min-h-screen">
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
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">Car not found</p>
            <a
              href="/cars"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
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

  // Ensure we always have valid images
  const validImages = carImages.length > 0 ? carImages : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'];

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-gray-300">
            <a href="/" className="hover:text-orange-500 transition-colors">
              Home
            </a>
            <span>/</span>
            <a href="/cars" className="hover:text-orange-500 transition-colors">
              Cars
            </a>
            <span>/</span>
            <span className="text-orange-500">{car.brand} {car.name}</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Images and Info */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <ImageGallery images={validImages} alt={`${car.brand} ${car.name}`} />

              {/* Car Info Section */}
              <div className="bg-white rounded-lg shadow p-8 mt-8">
                {/* Title and Category */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {car.brand} {car.name}
                      </h1>
                      <p className="text-gray-600">{car.model} • {car.year}</p>
                    </div>
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold capitalize text-sm">
                      {car.category}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-1">Price per Day</p>
                  <p className="text-4xl font-bold text-orange-500">
                    PKR {car.price.toLocaleString()}
                    <span className="text-lg text-gray-600 font-normal">/day</span>
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-orange-500" size={20} />
                      <span className="text-sm text-gray-600">Seats</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {car.seats}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-orange-500" size={20} />
                      <span className="text-sm text-gray-600">Transmission</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {car.transmission}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="text-orange-500" size={20} />
                      <span className="text-sm text-gray-600">Fuel</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {car.fuel}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-orange-500" size={20} />
                      <span className="text-sm text-gray-600">Year</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {car.year}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Features & Facilities
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {car.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-green-500 text-xl">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    About This Vehicle
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {car.description}
                  </p>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Related Cars in {car.category.toUpperCase()}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCars.map((relatedCar) => (
                  <CarCard key={relatedCar.carId} car={relatedCar} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
