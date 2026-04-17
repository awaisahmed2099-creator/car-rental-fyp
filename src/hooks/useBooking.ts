'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Booking } from '@/types';

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
}

export interface BookingData {
  carId: string;
  carName: string;
  carImage: string;
  packageId?: string;
  packageName?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number;
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: 'cash' | 'jazzcash';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

interface UseBookingReturn {
  createBooking: (data: BookingData) => Promise<string>;
  updateBookingPayment: (bookingId: string, paymentStatus: string, txnRefNo?: string) => Promise<void>;
  getBooking: (bookingId: string) => Promise<Booking | null>;
  loading: boolean;
  error: string | null;
}

export function useBooking(): UseBookingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: BookingData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        carId: data.carId,
        carName: data.carName,
        carImage: data.carImage,
        packageId: data.packageId || null,
        packageName: data.packageName || null,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: data.totalDays,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'pending',
        bookingStatus: 'confirmed',
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        notes: data.notes || '',
        txnRefNo: null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTIONS.BOOKINGS),
        bookingData
      );

      return docRef.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingPayment = async (
    bookingId: string,
    paymentStatus: string,
    txnRefNo?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const updateData: any = {
        paymentStatus: paymentStatus,
      };

      if (txnRefNo) {
        updateData.txnRefNo = txnRefNo;
      }

      if (paymentStatus === 'paid') {
        updateData.bookingStatus = 'active';
      }

      await updateDoc(bookingRef, updateData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBooking = async (bookingId: string): Promise<Booking | null> => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('__name__', '==', bookingId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        bookingId: doc.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        carId: data.carId,
        carName: data.carName,
        carImage: data.carImage,
        packageId: data.packageId,
        packageName: data.packageName,
        startDate: data.startDate?.toDate?.() || data.startDate,
        endDate: data.endDate?.toDate?.() || data.endDate,
        totalDays: data.totalDays,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        bookingStatus: data.bookingStatus,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        notes: data.notes,
        txnRefNo: data.txnRefNo,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      } as Booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    updateBookingPayment,
    getBooking,
    loading,
    error,
  };
}
