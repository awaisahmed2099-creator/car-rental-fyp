'use client';

import { useState, useEffect } from 'react';
import { BookingFormData } from '@/hooks/useBooking';
import { ChevronRight, AlertCircle, MapPin } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import MapLocationPicker from './MapLocationPicker';

import { LocationData } from '@/types';

interface CustomerDetailsFormProps {
  onContinue: (data: BookingFormData) => void;
  loading?: boolean;
}

const LOCATION_SUGGESTIONS = ['Rawalpindi', 'Islamabad', 'Airport', 'Other'];

export default function CustomerDetailsForm({
  onContinue,
  loading = false,
}: CustomerDetailsFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupLocation: '' as string | LocationData,
    dropoffLocation: '' as string | LocationData,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mapModalFor, setMapModalFor] = useState<'pickup' | 'dropoff' | null>(null);
  
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            let displayPhone = data.phone || data.phoneNumber || '';
            if (displayPhone.startsWith('+92')) {
              displayPhone = '0' + displayPhone.substring(3);
            }
            setFormData(prev => ({
              ...prev,
              customerName: data.fullName || data.name || user.displayName || '',
              customerPhone: displayPhone,
              customerEmail: user.email || data.email || '',
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              customerName: user.displayName || '',
              customerEmail: user.email || '',
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoadingUserData(false);
    });

    return () => unsubscribe();
  }, []);

  const validatePhoneNumber = (phone: string): boolean => {
    // Pakistani phone format: 03XXXXXXXXX
    const phoneRegex = /^03\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid Pakistani phone number (03XXXXXXXXX)';
    }

    const pickupAddress = typeof formData.pickupLocation === 'string' ? formData.pickupLocation : formData.pickupLocation?.address || '';
    if (!pickupAddress.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }

    const dropoffAddress = typeof formData.dropoffLocation === 'string' ? formData.dropoffLocation : formData.dropoffLocation?.address || '';
    if (!dropoffAddress.trim()) {
      newErrors.dropoffLocation = 'Drop-off location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onContinue(formData);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow only digits and +
    const cleaned = value.replace(/\D/g, '');
    setFormData({ ...formData, customerPhone: cleaned });
    if (errors.customerPhone) {
      setErrors({ ...errors, customerPhone: '' });
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    if (mapModalFor === 'pickup') {
      setFormData({ ...formData, pickupLocation: location });
      if (errors.pickupLocation) setErrors({ ...errors, pickupLocation: '' });
    } else if (mapModalFor === 'dropoff') {
      setFormData({ ...formData, dropoffLocation: location });
      if (errors.dropoffLocation) setErrors({ ...errors, dropoffLocation: '' });
    }
    setMapModalFor(null);
  };

  const inputClasses = "w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all text-sm";
  const errorInputClasses = "w-full px-4 py-3 bg-red-500/5 border border-red-500/50 rounded-xl text-white placeholder:text-red-500/50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-sm";

  if (loadingUserData) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-sm text-gray-500">Provide your details to securely confirm the booking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Full Name <span className="text-orange-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.customerName}
            onChange={(e) => {
              setFormData({ ...formData, customerName: e.target.value });
              if (errors.customerName) setErrors({ ...errors, customerName: '' });
            }}
            placeholder="Enter your full name"
            readOnly={isLoggedIn}
            className={`${errors.customerName ? errorInputClasses : inputClasses} ${isLoggedIn ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
          />
          {errors.customerName && (
            <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
              <AlertCircle size={14} /> {errors.customerName}
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Phone Number <span className="text-orange-500">*</span> 
            <span className="text-gray-600 ml-1 font-normal lowercase tracking-normal">(03XXXXXXXXX)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="03001234567"
            readOnly={isLoggedIn}
            className={`${errors.customerPhone ? errorInputClasses : inputClasses} font-mono ${isLoggedIn ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
          />
          {errors.customerPhone && (
            <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
              <AlertCircle size={14} /> {errors.customerPhone}
            </div>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          Email <span className="text-orange-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          placeholder="your@email.com"
          readOnly={isLoggedIn}
          className={`${inputClasses} ${isLoggedIn ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
        />
      </div>

      <div className="pt-6 mt-6 border-t border-[#2a2a3a]">
        <h2 className="text-xl font-bold text-white mb-2">Location Information</h2>
        <p className="text-sm text-gray-500 mb-6">Where should we deliver and pick up the vehicle?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Location */}
        <div>
          <label htmlFor="pickup" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Pickup Location <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
            <button
              id="pickup"
              type="button"
              onClick={() => setMapModalFor('pickup')}
              className={`${errors.pickupLocation ? errorInputClasses : inputClasses} pl-10 text-left cursor-pointer ${!formData.pickupLocation ? 'text-gray-500' : 'text-white'}`}
            >
              {typeof formData.pickupLocation === 'string' && formData.pickupLocation 
                ? formData.pickupLocation 
                : typeof formData.pickupLocation === 'object' && formData.pickupLocation?.address 
                  ? formData.pickupLocation.address 
                  : 'Choose Location...'}
            </button>
          </div>
          {errors.pickupLocation && (
            <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
              <AlertCircle size={14} /> {errors.pickupLocation}
            </div>
          )}
        </div>

        {/* Drop-off Location */}
        <div>
          <label htmlFor="dropoff" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Drop-off Location <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
            <button
              id="dropoff"
              type="button"
              onClick={() => setMapModalFor('dropoff')}
              className={`${errors.dropoffLocation ? errorInputClasses : inputClasses} pl-10 text-left cursor-pointer ${!formData.dropoffLocation ? 'text-gray-500' : 'text-white'}`}
            >
              {typeof formData.dropoffLocation === 'string' && formData.dropoffLocation 
                ? formData.dropoffLocation 
                : typeof formData.dropoffLocation === 'object' && formData.dropoffLocation?.address 
                  ? formData.dropoffLocation.address 
                  : 'Choose Location...'}
            </button>
          </div>
          {errors.dropoffLocation && (
            <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
              <AlertCircle size={14} /> {errors.dropoffLocation}
            </div>
          )}
        </div>
      </div>

      {/* Special Notes */}
      <div className="pt-6">
        <label htmlFor="notes" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          Special Notes <span className="text-gray-600 ml-1 font-normal capitalize tracking-normal">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any special requirements or additional notes?"
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </div>

      {/* Continue Button */}
      <div className="pt-4 mt-6 border-t border-[#2a2a3a]">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#2a2a3a] disabled:text-gray-600 text-white font-semibold flex items-center justify-center gap-2 py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer disabled:cursor-not-allowed"
        >
          Proceed to Payment
          <ChevronRight size={18} />
        </button>
        </div>
      </form>

      {mapModalFor && (
        <MapLocationPicker
          title={mapModalFor === 'pickup' ? 'Pickup Location' : 'Drop-off Location'}
          onSelect={handleLocationSelect}
          onClose={() => setMapModalFor(null)}
        />
      )}
    </>
  );
}
