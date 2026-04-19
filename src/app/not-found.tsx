'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden font-sans">
      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#f9731626,_transparent_60%)]" />

      {/* Large Background 404 */}
      <h1 className="absolute text-[180px] md:text-[250px] font-black text-[#1a1a24] font-sans select-none leading-none z-0">
        404
      </h1>

      {/* Foreground Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center flex flex-col items-center px-4"
      >
        <Car size={64} className="text-orange-500 mb-6 animate-bounce" />
        
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Lost on the Road?
        </h2>
        
        <p className="text-[#9ca3af] text-lg mt-4 max-w-[400px] leading-relaxed">
          Looks like this page took a wrong turn. Let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <ArrowLeft size={18} />
            Go Back Home
          </Link>
          <Link 
            href="/cars"
            className="flex items-center justify-center bg-transparent border border-[#2a2a3a] hover:bg-[#1a1a24] hover:border-orange-500/50 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95"
          >
            Browse Cars
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
