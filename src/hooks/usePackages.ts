'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Package } from '@/types';

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, COLLECTIONS.PACKAGES),
          where('available', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const packagesData: Package[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          packagesData.push({
            packageId: doc.id,
            name: data.name || '',
            description: data.description || '',
            cars: Array.isArray(data.cars) ? data.cars : [],
            duration: data.duration || '',
            pricePerDay: data.pricePerDay || 0,
            discount: data.discount || 0,
            features: Array.isArray(data.features) ? data.features : [],
            image: data.image && typeof data.image === 'string' ? data.image : '',
            popular: data.popular === true,
            available: data.available !== false,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
          } as Package);
        });
        // Sort by popular first, then by creation date
        packagesData.sort((a, b) => {
          if (a.popular !== b.popular) {
            return a.popular ? -1 : 1;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        setPackages(packagesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
}

// Fetch a single package by ID
export async function fetchPackageById(packageId: string): Promise<Package | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.PACKAGES),
      where('packageId', '==', packageId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      packageId: doc.id,
    } as Package;
  } catch (err) {
    console.error('Error fetching package:', err);
    return null;
  }
}
