'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Package } from '@/types';
import BookingSidebar from '@/components/website/BookingSidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        
        // Fetch the package by document ID
        const pkgDocRef = doc(db, COLLECTIONS.PACKAGES, packageId);
        const pkgDocSnapshot = await getDoc(pkgDocRef);

        if (!pkgDocSnapshot.exists()) {
          setPkg(null);
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
          image: packageData.image || '',
          features: Array.isArray(packageData.features) ? packageData.features : [],
          popular: packageData.popular === true,
          available: packageData.available !== false,
          createdAt: packageData.createdAt?.toDate?.() || new Date(packageData.createdAt) || new Date(),
        };
        setPkg(pkg);
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

  const packageImage = pkg.cars && pkg.cars.length > 0
    ? pkg.cars[imageIndex]?.image
    : pkg.image || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop';

  const discountedPrice = pkg.discount
    ? Math.round(pkg.pricePerDay * (1 - pkg.discount / 100))
    : pkg.pricePerDay;

  const handlePrevImage = () => {
    if (!pkg.cars || pkg.cars.length === 0) return;
    setImageIndex((prev) => (prev === 0 ? pkg.cars.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!pkg.cars || pkg.cars.length === 0) return;
    setImageIndex((prev) => (prev === pkg.cars.length - 1 ? 0 : prev + 1));
  };

  // Generate composition summary (e.g., "8 Prados & 2 Civics")
  const getCompositionSummary = () => {
    if (!pkg.cars || pkg.cars.length === 0) return '';
    return pkg.cars
      .map((car) => `${car.quantity} ${car.carName}${car.quantity > 1 ? 's' : ''}`)
      .join(' & ');
  };

  // Calculate total vehicles
  const totalVehicles = pkg.cars?.reduce((sum, car) => sum + car.quantity, 0) || 0;

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
              {/* Package Image Carousel */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
                <img
                  src={packageImage}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop';
                  }}
                />

                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    Popular Package
                  </div>
                )}

                {/* Navigation Buttons (only show if more than 1 car) */}
                {pkg.cars && pkg.cars.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Car Info and Counter at Bottom */}
                {pkg.cars && pkg.cars.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <p className="font-semibold text-lg">{pkg.cars[imageIndex]?.carName}</p>
                        <p className="text-sm text-gray-300">Quantity: {pkg.cars[imageIndex]?.quantity}</p>
                      </div>
                      {pkg.cars.length > 1 && (
                        <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded text-sm font-medium">
                          {imageIndex + 1} / {pkg.cars.length}
                        </div>
                      )}
                    </div>
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
                  <div className="space-y-2">
                    <p className="text-lg text-gray-600">
                      Duration: <span className="font-semibold">{pkg.duration}</span>
                    </p>
                  </div>
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

                {/* Included Cars Info */}
                {pkg.cars && pkg.cars.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Included Vehicles ({totalVehicles} Vehicle{totalVehicles !== 1 ? 's' : ''})
                    </h3>
                    
                    {/* Car List with Quantities */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                      {pkg.cars.map((car, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">{car.carName}</span>
                          <span className="text-orange-600 font-semibold">{car.quantity} {car.quantity > 1 ? 'Units' : 'Unit'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <BookingSidebar
                packageId={pkg.packageId}
                packageName={pkg.name}
                packagePrice={discountedPrice}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
