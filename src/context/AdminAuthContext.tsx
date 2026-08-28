'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { AdminUser } from '@/types';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  authUser: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setAuthUser(user);
      try {
        if (user) {
          let isAdmin = false;
          let adminData = null;

          // Check if it's the strict admin email
          if (user.email === 'admin@test.com') {
            isAdmin = true;
            adminData = { email: user.email, role: 'admin', id: user.uid };
          }

          // Check `users` collection for role: 'admin'
          if (!isAdmin) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().role === 'admin') {
              isAdmin = true;
              adminData = userDoc.data();
            }
          }

          // Legacy check in COLLECTIONS.ADMINS just in case
          if (!isAdmin) {
            const adminDocRef = doc(db, COLLECTIONS.ADMINS, user.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists()) {
              isAdmin = true;
              adminData = adminDoc.data();
            }
          }

          if (isAdmin) {
            setAdminUser(adminData as AdminUser);
          } else {
            // Not an admin - do NOT sign out (to preserve frontend login)
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
    <AdminAuthContext.Provider value={{ adminUser, authUser, isLoading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within provider');
  return context;
}