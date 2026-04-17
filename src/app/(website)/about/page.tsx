'use client';

import React from 'react';
import { ArrowRight, CheckCircle, Users, Zap, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Customer First',
      description: 'We prioritize customer satisfaction and experience above all else'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously improving our services with modern technology'
    },
    {
      icon: Headphones,
      title: 'Support',
      description: '24/7 customer support to assist you anytime, anywhere'
    }
  ];

  const achievements = [
    { number: '500+', label: 'Happy Customers' },
    { number: '50+', label: 'Premium Vehicles' },
    { number: '2000+', label: 'Bookings Completed' },
    { number: '4.9/5', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">About DriveEase</h1>
          <p className="text-xl text-gray-300">
            Your trusted partner for premium car rental services
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl h-96 flex items-center justify-center"
          >
            <div className="text-white text-center">
              <div className="text-7xl mb-4">🚗</div>
              <p className="text-xl font-semibold">Premium Car Rentals</p>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At DriveEase, we believe everyone deserves access to reliable, affordable, and high-quality car rental services. Our mission is to make car rental simple, transparent, and enjoyable for every customer in Rawalpindi and Islamabad.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To become the most trusted car rental provider in Pakistan, known for excellent service, competitive pricing, and customer satisfaction. We envision a future where renting a car is as easy as booking a ride.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-8 shadow-lg text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">Our Achievements</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-center text-white"
              >
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-sm">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose DriveEase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">Why Choose DriveEase?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              'Wide selection of premium vehicles',
              'Competitive pricing and flexible packages',
              'Professional and friendly staff',
              '24/7 customer support',
              'Simple and secure booking process',
              'Well-maintained vehicles',
              'Transparent pricing with no hidden charges',
              'Fast and reliable service'
            ].map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience DriveEase?</h2>
          <p className="text-xl mb-8 text-white/90">
            Book your perfect car today and discover why customers trust us
          </p>
          <a
            href="/cars"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors duration-200"
          >
            Browse Our Fleet <ArrowRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}
