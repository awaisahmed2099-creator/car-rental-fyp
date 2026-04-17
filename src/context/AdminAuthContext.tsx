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
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      try {
        if (user) {
          const adminDocRef = doc(db, COLLECTIONS.ADMINS, user.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            setAdminUser(adminDoc.data() as AdminUser);
          } else {
            // Not an admin - sign out
            await signOut(auth);
            setAdminUser(null);
          }
        } else {
          setAdminUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setAdminUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
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