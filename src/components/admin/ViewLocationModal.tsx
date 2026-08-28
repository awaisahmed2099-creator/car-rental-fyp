'use client';

import { X, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const ViewLeafletMap = dynamic(() => import('./ViewLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
  )
});

interface ViewLocationModalProps {
  location: { lat: number; lng: number; address: string };
  onClose: () => void;
}

export default function ViewLocationModal({ location, onClose }: ViewLocationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a1b23] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-orange-500 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Location Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{location.address}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map Container */}
        <div className="w-full h-[400px] p-2 bg-gray-50 dark:bg-[#111118]">
          <ViewLeafletMap lat={location.lat} lng={location.lng} />
        </div>

      </div>
    </div>
  );
}
