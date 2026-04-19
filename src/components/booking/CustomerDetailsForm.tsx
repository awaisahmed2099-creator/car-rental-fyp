'use client';

import { useState } from 'react';
import { BookingFormData } from '@/hooks/useBooking';
import { ChevronRight, AlertCircle, MapPin } from 'lucide-react';

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
    pickupLocation: '',
    dropoffLocation: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

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

    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }

    if (!formData.dropoffLocation.trim()) {
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

  const handleLocationSelect = (location: string, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setFormData({ ...formData, pickupLocation: location });
      setShowPickupSuggestions(false);
    } else {
      setFormData({ ...formData, dropoffLocation: location });
      setShowDropoffSuggestions(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all text-sm";
  const errorInputClasses = "w-full px-4 py-3 bg-red-500/5 border border-red-500/50 rounded-xl text-white placeholder:text-red-500/50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-sm";

  return (
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
            className={errors.customerName ? errorInputClasses : inputClasses}
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
            className={`${errors.customerPhone ? errorInputClasses : inputClasses} font-mono`}
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
          Email <span className="text-gray-600 ml-1 font-normal capitalize tracking-normal">(Optional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          placeholder="your@email.com"
          className={inputClasses}
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
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="pickup"
              type="text"
              value={formData.pickupLocation}
              onChange={(e) => {
                setFormData({ ...formData, pickupLocation: e.target.value });
                setShowPickupSuggestions(true);
                if (errors.pickupLocation) setErrors({ ...errors, pickupLocation: '' });
              }}
              onFocus={() => setShowPickupSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
              placeholder="Enter pickup location"
              className={`${errors.pickupLocation ? errorInputClasses : inputClasses} pl-10`}
            />
            {showPickupSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-md">
                {LOCATION_SUGGESTIONS.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleLocationSelect(location, 'pickup')}
                    className="w-full text-left px-4 py-3 hover:bg-[#2a2a3a] text-sm text-gray-300 hover:text-white transition-colors border-b border-[#2a2a3a] last:border-0"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
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
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="dropoff"
              type="text"
              value={formData.dropoffLocation}
              onChange={(e) => {
                setFormData({ ...formData, dropoffLocation: e.target.value });
                setShowDropoffSuggestions(true);
                if (errors.dropoffLocation) setErrors({ ...errors, dropoffLocation: '' });
              }}
              onFocus={() => setShowDropoffSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
              placeholder="Enter drop-off location"
              className={`${errors.dropoffLocation ? errorInputClasses : inputClasses} pl-10`}
            />
            {showDropoffSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-md">
                {LOCATION_SUGGESTIONS.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleLocationSelect(location, 'dropoff')}
                    className="w-full text-left px-4 py-3 hover:bg-[#2a2a3a] text-sm text-gray-300 hover:text-white transition-colors border-b border-[#2a2a3a] last:border-0"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
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
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#2a2a3a] disabled:text-gray-600 text-white font-semibold flex items-center justify-center gap-2 py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
        >
          Proceed to Payment
          <ChevronRight size={18} />
        </button>
      </div>
    </form>
  );
}
