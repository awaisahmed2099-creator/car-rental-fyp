'use client';

import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { motion } from 'framer-motion';
import { Search, SearchX, CalendarCheck, ArrowRight, CreditCard, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function TrackPage() {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setSearched(true);
    setBooking(null);

    try {
      // Query by Booking ID
      let q = query(collection(db, COLLECTIONS.BOOKINGS), where('bookingId', '==', searchInput.trim()));
      let snapshot = await getDocs(q);

      // If not found, try querying by Phone Number
      if (snapshot.empty) {
        q = query(collection(db, COLLECTIONS.BOOKINGS), where('customerPhone', '==', searchInput.trim()));
        snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        setBooking({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    } catch (error) {
      console.error('Error searching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'active': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#f973161a,_transparent_70%)]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-[120px] pb-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs rounded-full px-3 py-1 mb-4 font-semibold uppercase tracking-wider">
            Booking Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Track Your Booking</h1>
          <p className="text-[#9ca3af] text-lg">
            Enter your booking ID or phone number to check your booking status
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-lg mx-auto mt-12 bg-[#111118] border border-[#2a2a3a] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Booking ID (e.g. DR-ABC123) or phone number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-[#1a1a24] border border-[#2a2a3a] text-white placeholder-[#6b7280] rounded-xl px-4 py-3 w-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 font-semibold mt-4 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  <span>Search Booking</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto mt-8"
          >
            {booking ? (
              <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6 shadow-xl">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2a2a3a]">
                  <div className="font-mono text-orange-400 text-sm font-semibold">
                    {booking.bookingId || 'ID_N/A'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                    {booking.status || 'Pending'}
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 mb-6">
                  {booking.carInfo?.image && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#2a2a3a]">
                      <Image src={booking.carInfo.image} alt="Vehicle" fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {booking.carInfo?.brand} {booking.carInfo?.name}
                    </h3>
                    {booking.packageInfo && (
                      <p className="text-orange-400 text-xs mt-1">{booking.packageInfo.name} Package</p>
                    )}
                  </div>
                </div>

                {/* Dates Row */}
                <div className="flex items-center justify-between bg-black/20 rounded-xl p-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={16} className="text-orange-500" />
                    <span className="text-gray-300 text-sm">{booking.pickupDate}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-600" />
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={16} className="text-orange-500" />
                    <span className="text-gray-300 text-sm">{booking.returnDate}</span>
                  </div>
                </div>

                {/* Amount Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">Total Amount</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">PKR {booking.totalAmount?.toLocaleString()}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${booking.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                      {booking.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4 pt-4 border-t border-[#2a2a3a]">
                  <div className="focus:outline-none flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="text-white text-sm">Booking Confirmed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className={booking.paymentStatus === 'paid' ? 'text-green-500' : 'text-gray-600'} />
                      <span className={booking.paymentStatus === 'paid' ? 'text-white text-sm' : 'text-gray-500 text-sm'}>Payment Processed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className={(booking.status === 'active' || booking.status === 'completed') ? 'text-orange-500' : 'text-gray-600'} />
                      <span className={(booking.status === 'active' || booking.status === 'completed') ? 'text-white text-sm' : 'text-gray-500 text-sm'}>Ride Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className={booking.status === 'completed' ? 'text-green-500' : 'text-gray-600'} />
                      <span className={booking.status === 'completed' ? 'text-white text-sm' : 'text-gray-500 text-sm'}>Ride Completed</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-[#2a2a3a] rounded-2xl bg-[#111118]">
                <SearchX size={48} className="text-gray-700 mb-4" />
                <p className="text-[#9ca3af] text-lg font-medium">No booking found</p>
                <p className="text-gray-600 text-sm mt-2">Double check your booking ID or phone number and try again.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
