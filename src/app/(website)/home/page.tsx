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
  MessageSquare,
  Shield,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car as CarType, Package as PackageType } from '@/types';
import CarCard from '@/components/website/CarCard';
import PackageCard from '@/components/website/PackageCard';
import SearchBar from '@/components/website/SearchBar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import SectionTitle from '@/components/ui/SectionTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function HomePage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch cars
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
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now())
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 3) as CarType[];
        setCars(carsData);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoadingCars(false);
      }
    };

    fetchCars();
  }, []);

  // Fetch packages
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
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now())
          }))
          .filter((pkg: any) => pkg.popular === true)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 3) as PackageType[];
        setPackages(packagesData);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const stats = [
    { value: '500+', label: 'Happy Customers' },
    { value: '50+', label: 'Cars Available' },
    { value: '24/7', label: 'Support' },
  ];

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Choose Your Car',
      description: 'Browse our wide selection of premium vehicles and choose the one that fits your needs.',
    },
    {
      number: '02',
      icon: CalendarCheck,
      title: 'Make Booking',
      description: 'Select your dates, complete the form, and confirm your booking instantly.',
    },
    {
      number: '03',
      icon: Car,
      title: 'Enjoy Your Ride',
      description: "Pick up your car and drive with confidence. We're here 24/7 for support.",
    },
  ];

  const features = [
    {
      icon: Car,
      title: 'Wide Selection',
      description: 'Choose from 50+ premium vehicles for every occasion and budget.',
    },
    {
      icon: CreditCard,
      title: 'Best Prices',
      description: 'Competitive rates with special discounts for long-term rentals.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for peace of mind on the road.',
    },
    {
      icon: Shield,
      title: 'Easy Booking',
      description: 'Simple and secure online booking process with instant confirmation.',
    },
  ];

  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, 'testimonials'),
          where('status', '==', 'approved'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetchedReviews = snapshot.docs.map(doc => doc.data());
          setReviews(fetchedReviews);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  const dummyTestimonials = [
    {
      name: 'Ahmed Hassan',
      initials: 'AH',
      text: '"Excellent service! The car was clean, well-maintained, and the booking process was hassle-free. Highly recommended!"',
      rating: 5
    },
    {
      name: 'Samina Farooq',
      initials: 'SF',
      text: '"Best car rental experience I\'ve had. The staff was friendly, helpful, and the service was professional throughout."',
      rating: 5
    },
    {
      name: 'Muhammad Khan',
      initials: 'MK',
      text: '"Great prices, great cars, and great service. I will definitely book with DriveEase again for my next trip!"',
      rating: 5
    },
  ];

  const displayTestimonials = reviews.length > 0 ? reviews : dummyTestimonials;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ============ SECTION 1: HERO ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1605559424843-9e4c3ca4b7f1?w=1200&h=600&fit=crop"
        >
          <source src="https://videos.pexels.com/video-files/5309381/5309381-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/95 via-[#0a0a0f]/80 to-[#0a0a0f]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/30" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20 flex flex-col items-center text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-gray-300 text-sm font-medium">Premium Car Rental Service</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Drive Your{' '}
                <span className="text-gradient">Dream Car</span>
              </h1>

              <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
                Affordable luxury car rentals in Rawalpindi & Islamabad. Book your perfect ride today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
                <Link
                  href="/cars"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                >
                  Browse Cars <ArrowRight size={18} />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:bg-orange-500 hover:border-orange-500 hover:text-white text-white font-semibold rounded-full transition-colors cursor-pointer duration-300"
                >
                  View Packages <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Floating Search Bar */}
          <div className="absolute -bottom-12 w-full px-4 sm:px-6 lg:px-8 left-0 right-0 max-w-7xl mx-auto flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* spacer to accommodate the overlapping search bar */}
      <div className="h-20 bg-transparent"></div>

      {/* ============ SECTION 2: HOW IT WORKS ============ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 gradient-mesh">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            label="How It Works"
            title="Book in 3 Simple Steps"
            subtitle="Simple steps to book your perfect car in minutes"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="relative">
                  <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-8 h-full text-center group hover:-translate-y-2 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                    {/* Step number */}
                    <div className="text-6xl font-bold text-white/[0.03] absolute top-4 right-6">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6 mx-auto group-hover:bg-orange-500/20 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-orange-500" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Connector line */}
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-[#2a2a3a]" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 3: FEATURED CARS ============ */}
      <section id="cars" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <SectionTitle
              label="Our Fleet"
              title="Featured Cars"
              centered={false}
            />
            <Link
              href="/cars"
              className="hidden sm:inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium text-sm transition-colors"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingCars ? (
                <>
                  <div className="w-full flex items-stretch"><SkeletonCard variant="car" /></div>
                  <div className="w-full flex items-stretch hidden sm:block"><SkeletonCard variant="car" /></div>
                  <div className="w-full flex items-stretch hidden lg:block"><SkeletonCard variant="car" /></div>
                </>
              ) : cars.length > 0 ? (
                cars.map((car, idx) => (
                  <motion.div 
                    key={car.carId} 
                    variants={itemVariants} 
                    className="w-full flex items-stretch"
                  >
                    <CarCard car={car} priority={idx < 3} />
                  </motion.div>
                ))
              ) : (
                <div className="w-full col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No cars available at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile view all link */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium text-sm"
            >
              View All Cars <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SECTION 4: FEATURED PACKAGES ============ */}
      <section id="packages" className="py-24 px-4 sm:px-6 lg:px-8 gradient-mesh">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <SectionTitle
              label="Special Offers"
              title="Exclusive Packages"
              subtitle="Curated rental packages designed for your convenience"
              centered={false}
            />
            <Link
              href="/packages"
              className="hidden sm:inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium text-sm transition-colors"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPackages ? (
                <>
                  <div className="w-full flex items-stretch"><SkeletonCard variant="package" /></div>
                  <div className="w-full flex items-stretch hidden sm:block"><SkeletonCard variant="package" /></div>
                  <div className="w-full flex items-stretch hidden lg:block"><SkeletonCard variant="package" /></div>
                </>
              ) : packages.length > 0 ? (
                packages.map((pkg, idx) => (
                  <motion.div 
                    key={pkg.packageId} 
                    variants={itemVariants} 
                    className="w-full flex items-stretch"
                  >
                    <PackageCard pkg={pkg} priority={idx < 2} />
                  </motion.div>
                ))
              ) : (
                <div className="w-full col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No packages available at the moment</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile view all link */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium text-sm"
            >
              View All Packages <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SECTION 5: WHY CHOOSE US ============ */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            label="Why Choose Us"
            title="Experience the Difference"
            subtitle="What makes DriveEase the preferred choice"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 text-center group hover:-translate-y-2 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-5 mx-auto group-hover:bg-orange-500/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 6: TESTIMONIALS ============ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 gradient-mesh">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            label="Testimonials"
            title="What Our Customers Say"
            subtitle="Real feedback from real customers"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {displayTestimonials.map((t, idx) => {
              const customerName = t.name || t.customerName || 'Anonymous';
              const rating = t.rating || 5;
              const quote = t.comment || t.text;
              const initials = t.initials || customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

              return (
                <motion.div key={idx} variants={itemVariants} className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-8 hover:-translate-y-2 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < rating ? "fill-orange-500 text-orange-500" : "fill-gray-600 text-gray-600"} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed italic">
                    {quote}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#2a2a3a]">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{customerName}</p>
                      <p className="text-xs text-gray-600">Verified Customer</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 7: CTA BANNER ============ */}
      <section id="contact" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center min-h-[500px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.15)_0%,_transparent_60%)]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Book Your Ride?
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Get behind the wheel of your perfect car today. Book now and drive with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
            >
              Browse Cars <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors duration-300 cursor-pointer text-white font-semibold rounded-full"
            >
              <MessageSquare size={18} />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
