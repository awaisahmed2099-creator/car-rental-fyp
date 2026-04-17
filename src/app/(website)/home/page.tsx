'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Users,
  Car,
  Clock,
  Search,
  CalendarCheck,
  CreditCard,
  Headphones,
  Star,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car as CarType, Package as PackageType } from '@/types';
import CarCard from '@/components/website/CarCard';
import PackageCard from '@/components/website/PackageCard';
import BookingQuickForm from '@/components/website/BookingQuickForm';
import SkeletonCard from '@/components/ui/SkeletonCard';
import SectionTitle from '@/components/ui/SectionTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function HomePage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch cars - Simplified query to avoid requiring composite index
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const q = query(
          collection(db, COLLECTIONS.CARS),
          where('available', '==', true)
        );
        const snapshot = await getDocs(q);
        const carsData = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            carId: doc.id,
          }))
          .slice(0, 6) as CarType[];
        setCars(carsData);
      } catch (error) {
        console.error('Error fetching cars:', error);
        // Don't show error toast on index error, just load empty state
      } finally {
        setLoadingCars(false);
      }
    };

    fetchCars();
  }, []);

  // Fetch packages - Simplified query
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const q = query(
          collection(db, COLLECTIONS.PACKAGES),
          where('available', '==', true)
        );
        const snapshot = await getDocs(q);
        const packagesData = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            packageId: doc.id,
          }))
          .filter((pkg: any) => pkg.popular === true)
          .slice(0, 3) as PackageType[];
        setPackages(packagesData);
      } catch (error) {
        console.error('Error fetching packages:', error);
        // Don't show error toast on index error, just load empty state
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ============ SECTION 1: HERO ============ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url(https://images.unsplash.com/photo-1605559424843-9e4c3ca4b7f1?w=1200&h=600&fit=crop)',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-orange-500 rounded-full px-4 py-2 mb-6 backdrop-blur-sm w-fit">
                <span className="text-orange-500 font-semibold">✨</span>
                <span className="text-white font-semibold text-sm">Premium Car Rental Service</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                Drive Your <span className="text-orange-500">Dream Car</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
                Affordable luxury car rentals in Rawalpindi & Islamabad. Book your perfect ride today.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/cars"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors duration-200"
                >
                  Browse Cars <ArrowRight size={20} />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold rounded-lg transition-colors duration-200"
                >
                  View Packages <ArrowRight size={20} />
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold text-orange-500 mb-1">500+</div>
                  <div className="text-sm text-white/80">Happy Customers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold text-orange-500 mb-1">50+</div>
                  <div className="text-sm text-white/80">Cars Available</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold text-orange-500 mb-1">24/7</div>
                  <div className="text-sm text-white/80">Support</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Quick Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <BookingQuickForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 2: HOW IT WORKS ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="How It Works"
            subtitle="Simple steps to book your perfect car in minutes"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg h-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white mb-6 mx-auto font-bold text-2xl">
                  1
                </div>
                <Search className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">
                  Choose Your Car
                </h3>
                <p className="text-center text-gray-600">
                  Browse our wide selection of premium vehicles and choose the one that fits your needs.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/3 right-0 w-8 h-0.5 bg-orange-500 translate-x-full" />
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg h-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white mb-6 mx-auto font-bold text-2xl">
                  2
                </div>
                <CalendarCheck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">
                  Make Booking
                </h3>
                <p className="text-center text-gray-600">
                  Select your dates, complete the form, and confirm your booking instantly.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/3 right-0 w-8 h-0.5 bg-orange-500 translate-x-full" />
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl p-8 shadow-lg h-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white mb-6 mx-auto font-bold text-2xl">
                  3
                </div>
                <Car className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">
                  Enjoy Your Ride
                </h3>
                <p className="text-center text-gray-600">
                  Pick up your car and drive with confidence. We're here 24/7 for support.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 3: FEATURED CARS ============ */}
      <section id="cars" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <SectionTitle title="Our Fleet" centered={false} />
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-lg"
            >
              View All Cars <ArrowRight size={20} />
            </Link>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {loadingCars ? (
                <>
                  <SkeletonCard variant="car" />
                  <SkeletonCard variant="car" />
                  <SkeletonCard variant="car" />
                </>
              ) : cars.length > 0 ? (
                cars.map(car => (
                  <motion.div
                    key={car.carId}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <CarCard car={car} />
                  </motion.div>
                ))
              ) : (
                <div className="w-full text-center py-12">
                  <p className="text-gray-500 text-lg">No cars available at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 4: FEATURED PACKAGES ============ */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="Special Packages" light />

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {loadingPackages ? (
                <>
                  <SkeletonCard variant="package" />
                  <SkeletonCard variant="package" />
                  <SkeletonCard variant="package" />
                </>
              ) : packages.length > 0 ? (
                packages.map(pkg => (
                  <motion.div
                    key={pkg.packageId}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <PackageCard pkg={pkg} />
                  </motion.div>
                ))
              ) : (
                <div className="w-full text-center py-12">
                  <p className="text-gray-300 text-lg">No packages available at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 5: WHY CHOOSE US ============ */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Why Choose Us"
            subtitle="Experience the difference with DriveEase"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4 mx-auto">
                <Car className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Wide Selection</h3>
              <p className="text-gray-600">
                Choose from 50+ premium vehicles for every occasion and budget.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4 mx-auto">
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Best Prices</h3>
              <p className="text-gray-600">
                Competitive rates with special discounts for long-term rentals.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4 mx-auto">
                <Headphones className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Round-the-clock customer support for peace of mind on the road.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4 mx-auto">
                <CalendarCheck className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and secure online booking process with instant confirmation.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 6: TESTIMONIALS ============ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="What Our Customers Say"
            subtitle="Real feedback from real customers"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Excellent service! The car was clean, well-maintained, and the booking process was hassle-free. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  AH
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ahmed Hassan</p>
                  <p className="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Best car rental experience I've had. The staff was friendly, helpful, and the service was professional throughout."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  SF
                </div>
                <div>
                  <p className="font-bold text-slate-900">Samina Farooq</p>
                  <p className="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Great prices, great cars, and great service. I will definitely book with DriveEase again for my next trip!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  MK
                </div>
                <div>
                  <p className="font-bold text-slate-900">Muhammad Khan</p>
                  <p className="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 7: CTA BANNER ============ */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-orange-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23000000%27%20fill-opacity=%270.1%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Ready to Book Your Ride?
          </h2>
          <p className="text-xl text-slate-800 mb-8">
            Get behind the wheel of your perfect car today. Book now and drive with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors duration-200"
            >
              Browse Cars <ArrowRight size={20} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-orange-500 font-bold rounded-lg transition-colors duration-200"
            >
              <MessageSquare size={20} />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
