'use client';

import React from 'react';
import { ArrowRight, CheckCircle, Users, Zap, Headphones, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Customer First',
      description: 'We prioritize customer satisfaction and experience above all else',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously improving our services with modern technology',
    },
    {
      icon: Headphones,
      title: 'Support',
      description: '24/7 customer support to assist you anytime, anywhere',
    },
  ];

  const achievements = [
    { number: '500+', label: 'Happy Customers' },
    { number: '50+', label: 'Premium Vehicles' },
    { number: '2000+', label: 'Bookings Completed' },
    { number: '4.9/5', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/80 to-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">About Us</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">About DriveEase</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your trusted partner for premium car rental services
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden aspect-[4/3] group"
          >
            <Image
              src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&h=900&fit=crop"
              alt="Premium Car Rentals in Islamabad"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent opacity-90" />
            
            {/* Floating Badge */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-[#1a1a24]/80 backdrop-blur-md border border-[#2a2a3a] rounded-xl p-5 shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex flex-shrink-0 items-center justify-center border border-orange-500/20">
                  <Star size={24} className="text-orange-500 fill-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight">Premium Car Rentals</p>
                  <p className="text-sm text-gray-400 mt-0.5">Trusted Since 2020</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Our Mission</p>
              <h2 className="text-3xl font-bold text-white mb-4">Driving Excellence</h2>
              <p className="text-gray-400 leading-relaxed">
                At DriveEase, we believe everyone deserves access to reliable, affordable, and high-quality car rental services. Our mission is to make car rental simple, transparent, and enjoyable for every customer in Rawalpindi and Islamabad.
              </p>
            </div>

            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Our Vision</p>
              <h2 className="text-3xl font-bold text-white mb-4">The Road Ahead</h2>
              <p className="text-gray-400 leading-relaxed">
                To become the most trusted car rental provider in Pakistan, known for excellent service, competitive pricing, and customer satisfaction. We envision a future where renting a car is as easy as booking a ride.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-mesh">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Core Values</h2>
            <div className="flex justify-center mb-5">
              <div className="w-12 h-1 bg-orange-500 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="card-dark p-8 text-center group hover-lift"
                >
                  <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Icon className="w-7 h-7 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Our Statistics</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Numbers That Reflect Our Trust</h2>
            <div className="flex justify-center mb-5">
              <div className="w-12 h-1 bg-orange-500 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card-dark p-8 text-center group hover-lift"
              >
                <div className="text-4xl font-bold text-orange-500 mb-2">{achievement.number}</div>
                <div className="text-sm text-gray-500">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose DriveEase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-mesh">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Why Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose DriveEase?</h2>
            <div className="flex justify-center mb-5">
              <div className="w-12 h-1 bg-orange-500 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              'Wide selection of premium vehicles',
              'Competitive pricing and flexible packages',
              'Professional and friendly staff',
              '24/7 customer support',
              'Simple and secure booking process',
              'Well-maintained vehicles',
              'Transparent pricing with no hidden charges',
              'Fast and reliable service',
            ].map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white/[0.02] border border-[#2a2a3a] rounded-xl px-5 py-4"
              >
                <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-sm text-gray-300">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.12)_0%,_transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience DriveEase?</h2>
          <p className="text-lg text-gray-400 mb-10">
            Book your perfect car today and discover why customers trust us
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
          >
            Browse Our Fleet <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
