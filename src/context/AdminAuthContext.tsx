'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { AdminUser } from '@/types';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize loading state based on localStorage to prevent showing verification screen
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    const alreadyInitialized = localStorage.getItem('__driveease_auth_initialized__') === 'true';
    return !alreadyInitialized; // If NOT initialized, show loading; if already initialized, don't show
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const sessionInitKey = '__driveease_auth_initialized__';

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const adminDocRef = doc(db, COLLECTIONS.ADMINS, user.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            setAdminUser(adminDoc.data() as AdminUser);
          } else {
            // ❗ NOT ADMIN → SIGN OUT
            await signOut(auth);
            setAdminUser(null);
            alert('Access denied: Not an admin');
          }
        } catch (error) {
          console.error(error);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }

      // Mark initialization complete and stop showing loading screen
      if (typeof window !== 'undefined') {
        localStorage.setItem(sessionInitKey, 'true');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('__driveease_auth_initialized__');
    }
    await signOut(auth);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, isLoading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within provider');
  return context;
}