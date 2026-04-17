'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Package, Car } from '@/types';
import BookingSidebar from '@/components/website/BookingSidebar';
import CarCard from '@/components/website/CarCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Check } from 'lucide-react';

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [includedCars, setIncludedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        
        // Fetch the package by document ID
        const pkgDocRef = doc(db, COLLECTIONS.PACKAGES, packageId);
        const pkgDocSnapshot = await getDoc(pkgDocRef);

        if (!pkgDocSnapshot.exists()) {
          setPkg(null);
          setIncludedCars([]);
          return;
        }

        const packageData = pkgDocSnapshot.data();
        const pkg: Package = {
          packageId: pkgDocSnapshot.id,
          name: packageData.name || '',
          description: packageData.description || '',
          cars: Array.isArray(packageData.cars) ? packageData.cars : [],
          duration: packageData.duration || '',
          pricePerDay: packageData.pricePerDay || 0,
          discount: packageData.discount || 0,
          features: Array.isArray(packageData.features) ? packageData.features : [],
          image: packageData.image && typeof packageData.image === 'string' ? packageData.image : '',
          popular: packageData.popular === true,
          available: packageData.available !== false,
          createdAt: packageData.createdAt?.toDate?.() || new Date(packageData.createdAt) || new Date(),
        };
        setPkg(pkg);

        // Fetch included cars by document ID
        if (pkg.cars && pkg.cars.length > 0) {
          const cars: Car[] = [];
          for (const carId of pkg.cars) {
            try {
              const carDocRef = doc(db, COLLECTIONS.CARS, carId);
              const carDocSnapshot = await getDoc(carDocRef);
              if (carDocSnapshot.exists()) {
                const carData = carDocSnapshot.data();
                cars.push({
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
                });
              }
            } catch (err) {
              console.error('Error fetching car:', carId, err);
            }
          }
          setIncludedCars(cars);
        }
      } catch (err) {
        console.error('Error fetching package:', err);
        setPkg(null);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonCard variant="package" />
            </div>
            <SkeletonCard variant="package" />
          </div>
        </div>
      </section>
    );
  }

  if (!pkg) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">Package not found</p>
            <a
              href="/packages"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
            >
              Back to Packages
            </a>
          </div>
        </div>
      </section>
    );
  }

  const packageImage = (pkg.image && typeof pkg.image === 'string' && pkg.image.trim().length > 0)
    ? pkg.image
    : 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop';

  const discountedPrice = pkg.discount
    ? Math.round(pkg.pricePerDay * (1 - pkg.discount / 100))
    : pkg.pricePerDay;

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
            <a href="/packages" className="hover:text-orange-500 transition-colors">
              Packages
            </a>
            <span>/</span>
            <span className="text-orange-500">{pkg.name}</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Package Info */}
            <div className="lg:col-span-2">
              {/* Package Image */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
                <img
                  src={packageImage}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                {pkg.popular && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    Popular Package
                  </div>
                )}
              </div>

              {/* Package Info Section */}
              <div className="bg-white rounded-lg shadow p-8">
                {/* Title and Duration */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h1>
                  <p className="text-lg text-gray-600">
                    Duration: <span className="font-semibold">{pkg.duration}</span>
                  </p>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    About This Package
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Package Features
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Included Cars */}
                {includedCars.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Included Vehicles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {includedCars.map((car) => (
                        <CarCard key={car.carId} car={car} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 h-fit">
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Book This Package
                </h3>

                {/* Price Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  {pkg.discount > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-orange-500">
                          PKR {discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-sm line-through text-gray-500">
                          PKR {pkg.pricePerDay.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded inline-block text-sm font-semibold">
                        Save {pkg.discount}%
                      </div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-orange-500">
                      PKR {pkg.pricePerDay.toLocaleString()}/day
                    </span>
                  )}
                </div>

                {/* Package Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>Duration:</span>
                      <span className="font-semibold">{pkg.duration}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Cars Included:</span>
                      <span className="font-semibold">{pkg.cars.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Features:</span>
                      <span className="font-semibold">{pkg.features.length}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <select
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 appearance-none bg-white cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">Select a location</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                  </div>

                  {/* Proceed Button */}
                  <a
                    href={`/booking?packageId=${pkg.packageId}`}
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center mt-6"
                  >
                    Proceed to Book
                  </a>
                </div>

                {/* Info Text */}
                <p className="text-xs text-gray-600 text-center mt-4">
                  * Required fields
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
