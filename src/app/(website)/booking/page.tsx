'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car, Package, Booking } from '@/types';
import { useBooking, BookingFormData } from '@/hooks/useBooking';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import CustomerDetailsForm from '@/components/booking/CustomerDetailsForm';
import PaymentMethodSelector from '@/components/booking/PaymentMethodSelector';
import toast from 'react-hot-toast';
import { differenceInDays } from 'date-fns';

type Step = 'details' | 'payment';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { createBooking, loading: bookingLoading } = useBooking();

  const [step, setStep] = useState<Step>('details');
  const [car, setCar] = useState<Car | null>(null);
  const [package_, setPackage] = useState<Package | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<BookingFormData | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [jazzcashEnabled, setJazzcashEnabled] = useState(false);
  const hasShownErrorRef = useRef(false);

  // Check if JazzCash is configured
  useEffect(() => {
    const hasJazzcashConfig =
      typeof process !== 'undefined' &&
      process.env.NEXT_PUBLIC_JAZZCASH_MERCHANT_ID &&
      process.env.NEXT_PUBLIC_JAZZCASH_PASSWORD &&
      process.env.NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT;
    
    setJazzcashEnabled(!!hasJazzcashConfig);
  }, []);

  // Parse query parameters
  useEffect(() => {
    const carId = searchParams.get('carId');
    const packageId = searchParams.get('packageId');
    const startStr = searchParams.get('startDate');
    const endStr = searchParams.get('endDate');
    const amountStr = searchParams.get('amount');

    if (!startStr || !endStr || !amountStr) {
      // Only show error once
      if (!hasShownErrorRef.current) {
        hasShownErrorRef.current = true;
        toast.error('Missing booking information. Please try again.');
        router.push('/cars');
      }
      return;
    }

    const start = new Date(startStr);
    const end = new Date(endStr);
    const amt = parseFloat(amountStr);

    setStartDate(start);
    setEndDate(end);
    setAmount(amt);

    // Fetch car or package
    const fetchData = async () => {
      try {
        setLoading(true);

        if (carId) {
          const carRef = doc(db, COLLECTIONS.CARS, carId);
          const carSnap = await getDoc(carRef);
          if (carSnap.exists()) {
            const data = carSnap.data();
            setCar({
              carId: carSnap.id,
              name: data.name || '',
              brand: data.brand || '',
              model: data.model || '',
              year: data.year || 0,
              price: data.price || 0,
              images: data.images || [],
              category: data.category || 'sedan',
              seats: data.seats || 5,
              transmission: data.transmission || 'automatic',
              fuel: data.fuel || 'petrol',
              features: data.features || [],
              available: data.available || false,
              description: data.description || '',
              createdAt: data.createdAt?.toDate?.() || new Date(),
            } as Car);
          }
        }

        if (packageId) {
          const pkgRef = doc(db, COLLECTIONS.PACKAGES, packageId);
          const pkgSnap = await getDoc(pkgRef);
          if (pkgSnap.exists()) {
            const data = pkgSnap.data();
            setPackage({
              packageId: pkgSnap.id,
              name: data.name || '',
              description: data.description || '',
              cars: data.cars || [],
              duration: data.duration || '',
              pricePerDay: data.pricePerDay || 0,
              discount: data.discount || 0,
              features: data.features || [],
              image: data.image || '',
              popular: data.popular || false,
              available: data.available || false,
              createdAt: data.createdAt?.toDate?.() || new Date(),
            } as Package);
            if (data.discount) {
              setDiscount(data.discount);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        toast.error('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, router]);

  const handleContinueToPayment = (data: BookingFormData) => {
    setCustomerData(data);
    setStep('payment');
  };

  const handleBackToDetails = () => {
    setStep('details');
  };

  const handleCashPayment = async () => {
    if (!customerData || !startDate || !endDate || !car) return;

    try {
      setLoadingPayment(true);

      const bookingData = {
        carId: car.carId,
        carName: car.name,
        carImage: car.images?.[0] || '',
        packageId: package_?.packageId,
        packageName: package_?.name,
        startDate,
        endDate,
        totalDays: differenceInDays(endDate, startDate) || 1,
        totalAmount: amount,
        pickupLocation: customerData.pickupLocation,
        dropoffLocation: customerData.dropoffLocation,
        notes: customerData.notes,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail,
        paymentMethod: 'cash' as const,
        paymentStatus: 'pending' as const,
      };

      const bookingId = await createBooking(bookingData);
      toast.success('Booking confirmed! Redirecting to success page...');
      
      // Redirect to success page
      setTimeout(() => {
        router.push(`/booking/success?bookingId=${bookingId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleJazzCashPayment = async () => {
    if (!customerData || !startDate || !endDate || !car) return;

    try {
      setLoadingPayment(true);

      // First create the booking with pending status
      const bookingData = {
        carId: car.carId,
        carName: car.name,
        carImage: car.images?.[0] || '',
        packageId: package_?.packageId,
        packageName: package_?.name,
        startDate,
        endDate,
        totalDays: differenceInDays(endDate, startDate) || 1,
        totalAmount: amount,
        pickupLocation: customerData.pickupLocation,
        dropoffLocation: customerData.dropoffLocation,
        notes: customerData.notes,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail,
        paymentMethod: 'jazzcash' as const,
        paymentStatus: 'pending' as const,
      };

      const bookingId = await createBooking(bookingData);

      // Call JazzCash initiate API
      const response = await fetch('/api/jazzcash/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          bookingId,
          customerPhone: customerData.customerPhone,
          description: `Car Rental: ${car.name}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to initiate JazzCash payment (${response.status})`;
        console.error('JazzCash API Error:', errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Create a form to submit to JazzCash
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.redirectUrl || 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/DoTransaction/DoTransaction';

      Object.entries(data.formData || {}).forEach(([key, value]: [string, any]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error initiating JazzCash payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.';
      toast.error(errorMessage);
      setLoadingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (!car || !startDate || !endDate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Booking information not found.</p>
          <button
            onClick={() => router.push('/cars')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">
            Step {step === 'details' ? '1' : '2'} of 2 - {step === 'details' ? 'Your Details' : 'Payment'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex gap-2">
          <div className={`flex-1 h-2 rounded-lg ${step === 'details' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 h-2 rounded-lg ${step === 'payment' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Summary */}
          <div className="lg:col-span-1">
            <BookingSummaryCard
              car={car}
              package={package_ || undefined}
              startDate={startDate}
              endDate={endDate}
              totalAmount={amount}
              discount={discount}
              pickupLocation={customerData?.pickupLocation}
              dropoffLocation={customerData?.dropoffLocation}
            />
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              {step === 'details' && (
                <CustomerDetailsForm
                  onContinue={handleContinueToPayment}
                  loading={bookingLoading}
                />
              )}

              {step === 'payment' && customerData && (
                <PaymentMethodSelector
                  amount={amount}
                  onCashSelect={handleCashPayment}
                  onJazzCashSelect={handleJazzCashPayment}
                  onBack={handleBackToDetails}
                  loading={loadingPayment}
                  jazzcashEnabled={jazzcashEnabled}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
