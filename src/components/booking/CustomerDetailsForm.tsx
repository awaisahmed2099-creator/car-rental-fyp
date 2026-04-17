'use client';

import { useState } from 'react';
import { BookingFormData } from '@/hooks/useBooking';
import { ChevronRight, AlertCircle } from 'lucide-react';

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.customerName}
          onChange={(e) => {
            setFormData({ ...formData, customerName: e.target.value });
            if (errors.customerName) {
              setErrors({ ...errors, customerName: '' });
            }
          }}
          placeholder="Enter your full name"
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          } focus:outline-none focus:ring-2 focus:ring-orange-500`}
        />
        {errors.customerName && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {errors.customerName}
          </div>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
          Phone Number * <span className="text-gray-500 font-normal">(03XXXXXXXXX)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.customerPhone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="03001234567"
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.customerPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          } focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono`}
        />
        {errors.customerPhone && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {errors.customerPhone}
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
          Email <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          placeholder="your.email@example.com"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Pickup Location */}
      <div>
        <label htmlFor="pickup" className="block text-sm font-semibold text-gray-900 mb-2">
          Pickup Location *
        </label>
        <div className="relative">
          <input
            id="pickup"
            type="text"
            value={formData.pickupLocation}
            onChange={(e) => {
              setFormData({ ...formData, pickupLocation: e.target.value });
              setShowPickupSuggestions(true);
              if (errors.pickupLocation) {
                setErrors({ ...errors, pickupLocation: '' });
              }
            }}
            onFocus={() => setShowPickupSuggestions(true)}
            placeholder="Enter or select pickup location"
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.pickupLocation ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {showPickupSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {LOCATION_SUGGESTIONS.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleLocationSelect(location, 'pickup')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.pickupLocation && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {errors.pickupLocation}
          </div>
        )}
      </div>

      {/* Drop-off Location */}
      <div>
        <label htmlFor="dropoff" className="block text-sm font-semibold text-gray-900 mb-2">
          Drop-off Location *
        </label>
        <div className="relative">
          <input
            id="dropoff"
            type="text"
            value={formData.dropoffLocation}
            onChange={(e) => {
              setFormData({ ...formData, dropoffLocation: e.target.value });
              setShowDropoffSuggestions(true);
              if (errors.dropoffLocation) {
                setErrors({ ...errors, dropoffLocation: '' });
              }
            }}
            onFocus={() => setShowDropoffSuggestions(true)}
            placeholder="Enter or select drop-off location"
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.dropoffLocation ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {showDropoffSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {LOCATION_SUGGESTIONS.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleLocationSelect(location, 'dropoff')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.dropoffLocation && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {errors.dropoffLocation}
          </div>
        )}
      </div>

      {/* Special Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
          Special Notes <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any special requirements or additional notes?"
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      {/* Continue Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        Continue to Payment
        <ChevronRight size={20} />
      </button>
    </form>
  );
}
