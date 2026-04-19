'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative flex items-center justify-center p-4">
      {/* Red Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#dc26261a,_transparent_60%)]" />

      <div className="relative z-10 max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <AlertTriangle size={48} className="text-red-500 animate-pulse" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Something Went Wrong
          </h1>
          
          <p className="text-[#9ca3af] text-lg max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred. Our team has been notified and we are working to fix it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/20"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-transparent border border-[#2a2a3a] hover:bg-[#1a1a24] hover:border-orange-500/50 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95"
            >
              <Home size={18} />
              Go Home
            </Link>
          </div>

          {/* Error Details Toggle */}
          <div className="mt-12 w-full text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-[#6b7280] text-sm hover:text-white transition-colors mx-auto"
            >
              Show Technical Details
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 text-left w-full overflow-x-auto">
                    <p className="text-red-400 font-mono text-xs font-semibold mb-2">Error Message:</p>
                    <code className="text-[#9ca3af] font-mono text-xs whitespace-pre-wrap break-words">
                      {error.message || 'Unknown error occurred'}
                    </code>
                    {error.digest && (
                      <>
                        <p className="text-red-400 font-mono text-xs font-semibold mt-4 mb-2">Digest ID:</p>
                        <code className="text-[#9ca3af] font-mono text-xs">{error.digest}</code>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
