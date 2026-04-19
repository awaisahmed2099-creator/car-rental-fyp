'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState('923001234567');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const infoDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'companyInfo'));
        if (infoDoc.exists() && infoDoc.data()?.whatsappNumber) {
          setWhatsappNumber(infoDoc.data().whatsappNumber.replace(/[^0-9]/g, ''));
        }
      } catch (error) {
        console.error('Failed to fetch whatsapp number', error);
      }
    };
    fetchSettings();
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Hi, I want to book a car from DriveEase`, '_blank');
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-16 bottom-1 whitespace-nowrap bg-[#111118] border border-[#2a2a3a] text-white text-sm px-3 py-2 rounded-lg shadow-xl"
          >
            Chat on WhatsApp
            {/* Tooltip arrow */}
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#111118]" />
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleWhatsAppClick}
        className="relative group focus:outline-none"
      >
        <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping opacity-75 group-hover:bg-green-500/40" />
        <div className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-110 active:scale-95">
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 text-white fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.031 2C6.486 2 2 6.485 2 12.031c0 1.765.46 3.486 1.332 5l-1.321 4.823 4.938-1.295A10.007 10.007 0 0012.031 22c5.546 0 10.031-4.485 10.031-10.031S17.577 2 12.031 2zm5.417 14.536c-.228.643-1.32.12-1.802 0-.482-.12-2.128-.853-4.103-2.825-1.975-1.973-2.705-3.621-2.826-4.103-.12-.482-.643-1.574 0-1.802.138-.05.292-.056.417-.008.125.048.232.121.312.219l1.465 2.125c.162.235.122.563-.092.753l-.865.786c-.039.035-.062.085-.063.137 0 .052.023.102.063.138 1.139 1.037 2.392 2.291 3.43 3.43.036.039.086.062.138.063.051 0 .101-.024.137-.063l.786-.865c.19-.214.518-.254.753-.092l2.125 1.465c.098.08.171.187.219.312.048.125.042.279-.008.417z"/>
          </svg>
        </div>
      </button>
    </div>
  );
}
