'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justSignedIn, setJustSignedIn] = useState(false);

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
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );
      setJustSignedIn(true);
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
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/"
        aria-label="Back to Website"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:scale-105 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white focus-visible:scale-105 focus-visible:border-orange-400/40 focus-visible:bg-orange-500/10 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 sm:left-6 sm:top-6"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Website</span>
        <span className="sm:hidden">Back</span>
      </Link>

      <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Drive<span className="text-orange-500">Ease</span> Admin
        </h1>

        {errorMessage && (
          <div className="mb-4 text-red-400 text-sm">{errorMessage}</div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-slate-700 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded bg-slate-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 p-2 rounded text-white"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}