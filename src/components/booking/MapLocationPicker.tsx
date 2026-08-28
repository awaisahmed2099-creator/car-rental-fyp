'use client';

import { X, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LocationData } from '@/types';

// We dynamically import the actual Leaflet implementation to avoid SSR 'window is not defined' errors
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#1a1a24]">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

interface MapLocationPickerProps {
  onSelect: (location: LocationData) => void;
  onClose: () => void;
  title: string;
}

export default function MapLocationPicker({ onSelect, onClose, title }: MapLocationPickerProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a1a24] w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2a2a3a] overflow-hidden flex flex-col h-[85vh] max-h-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2a2a3a]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="text-orange-500" size={20} />
            Select {title}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-orange-500 cursor-pointer transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative">
          <LeafletMap onSelect={onSelect} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
