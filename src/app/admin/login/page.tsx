'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { adminUser, isLoading: authLoading } = useAdminAuth();

  // ✅ Instant redirect when adminUser is set
  useEffect(() => {
    if (!authLoading && adminUser) {
      router.replace('/admin/dashboard');
    }
  }, [adminUser, authLoading, router]);

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
      // ❗ No manual redirect here — context will handle it
    } catch (error: any) {
      let message = 'Invalid email or password';

      if (error.code === 'auth/user-not-found') {
        message = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Wrong password';
      }

      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
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