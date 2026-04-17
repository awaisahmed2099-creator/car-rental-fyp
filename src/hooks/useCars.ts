'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Car } from '@/types';

export interface CarFilters {
  category?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest';
}

export function useCars(filters?: CarFilters) {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, COLLECTIONS.CARS),
          where('available', '==', true)
        );
        const querySnapshot = await getDocs(q);
        
        const carsData: Car[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          carsData.push({
            carId: doc.id,
            name: data.name || '',
            brand: data.brand || '',
            model: data.model || '',
            year: data.year || new Date().getFullYear(),
            price: data.price || 0,
            images: (Array.isArray(data.images) ? data.images : []).filter((img: any) => img && typeof img === 'string'),
            category: data.category || 'sedan',
            seats: data.seats || 5,
            transmission: data.transmission || 'automatic',
            fuel: data.fuel || 'petrol',
            features: Array.isArray(data.features) ? data.features : [],
            available: data.available !== false,
            description: data.description || 'Premium vehicle rental',
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
          } as Car);
        });
        setCars(carsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to fetch cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...cars];

    // Category filter
    if (filters?.category && filters.category !== 'all') {
      result = result.filter((car) => car.category === filters.category);
    }

    // Transmission filter
    if (filters?.transmission && filters.transmission !== 'all') {
      result = result.filter(
        (car) => car.transmission === filters.transmission
      );
    }

    // Price range filter
    if (filters?.minPrice !== undefined) {
      result = result.filter((car) => car.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter((car) => car.price <= filters.maxPrice!);
    }

    // Seats filter
    if (filters?.minSeats) {
      result = result.filter((car) => car.seats >= filters.minSeats!);
    }

    // Sorting
    if (filters?.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters?.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters?.sortBy === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredCars(result);
  }, [cars, filters]);

  return { cars: filteredCars, allCars: cars, loading, error };
}

// Fetch a single car by ID
export async function fetchCarById(carId: string): Promise<Car | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.CARS),
      where('carId', '==', carId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      carId: doc.id,
    } as Car;
  } catch (err) {
    console.error('Error fetching car:', err);
    return null;
  }
}

// Fetch cars by category
export async function fetchCarsByCategory(category: string): Promise<Car[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.CARS),
      where('category', '==', category),
      where('available', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const carsData: Car[] = [];
    querySnapshot.forEach((doc) => {
      carsData.push({
        ...doc.data(),
        carId: doc.id,
      } as Car);
    });
    return carsData;
  } catch (err) {
    console.error('Error fetching cars by category:', err);
    return [];
  }
}
