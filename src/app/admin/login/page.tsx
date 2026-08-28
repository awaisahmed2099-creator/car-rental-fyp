'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/collections';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ArrowLeft, Mail, Lock, Loader2, Check, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Toast from '@/components/ui/auth/Toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  const router = useRouter();
  const { adminUser, isLoading: authLoading } = useAdminAuth();

  // Only redirect after successful sign in
  useEffect(() => {
    if (justSignedIn && adminUser && !authLoading) {
      router.push('/admin/dashboard');
    }
  }, [justSignedIn, adminUser, authLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );
      
      const user = userCredential.user;
      let isAdmin = false;
      
      if (user.email === 'admin@test.com') {
        isAdmin = true;
      }

      if (!isAdmin) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        const adminDocRef = doc(db, COLLECTIONS.ADMINS, user.uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        await signOut(auth);
        setErrorMessage("Unauthorized: You do not have admin privileges.");
        setIsLoading(false);
        return;
      }

      // Set the auth cookie so middleware recognizes the session
      document.cookie = 'driveease_auth=true; path=/; max-age=604800; SameSite=Lax';

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          lastActive: new Date()
        });
      } catch (updateError) {
        console.error("Failed to update lastActive status:", updateError);
      }

      fireToast("You have successfully logged in");
      
      clearTimeout(redirectTimer.current);
      redirectTimer.current = setTimeout(() => {
        setJustSignedIn(true);
      }, 900);
      
    } catch (error: unknown) {
      let message = 'Invalid email or password';

      if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'auth/user-not-found') {
        message = 'User not found';
      } else if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'auth/wrong-password') {
        message = 'Wrong password';
      }

      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-200">
      <Link
        href="/"
        aria-label="Back to Website"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-[#1a1b23]/80 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Website</span>
        <span className="sm:hidden">Back</span>
      </Link>

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-600 via-orange-800 to-[#0a0a0f] flex-col justify-center px-16 xl:px-24 border-r border-gray-800/50">
        <div className="max-w-xl">
          <div className="mb-12 text-center">
            <div className="w-full flex justify-center mb-8">
              <div className="w-16 h-16 bg-[#0a0b0f] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
                <span className="text-3xl font-extrabold text-orange-500 tracking-tighter">DE</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              DriveEase <span className="text-white/90">Admin Portal</span>
            </h1>
            <p className="text-orange-100 text-lg">Car Rental Management System</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/20 p-1.5 rounded-full">
                <Check size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Fleet Management</h3>
                <p className="text-orange-100 text-sm leading-relaxed">Monitor vehicle inventory and availability.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/20 p-1.5 rounded-full">
                <Check size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Booking Operations</h3>
                <p className="text-orange-100 text-sm leading-relaxed">Manage customer reservations and schedules.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/20 p-1.5 rounded-full">
                <Check size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Revenue Tracking</h3>
                <p className="text-orange-100 text-sm leading-relaxed">Secure payments and financial analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (Login Form) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-[#0a0b0f] p-8 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to your admin account</p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 block ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1b23] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 block ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[#1a1b23] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-orange-500 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full rounded-lg py-3 flex justify-center items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium mt-6"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
          
          <div>
            <div className="w-full border-t border-gray-800 my-6"></div>
            <div className="text-center text-gray-500 text-sm">
              Powered by DriveEase
            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMsg} show={toastVisible} />
    </div>
  );
}