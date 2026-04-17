'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';

const SETUP_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SETUP_TOKEN;

export default function AdminSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam && SETUP_TOKEN && tokenParam === SETUP_TOKEN) {
      setIsVerified(true);
    }
  }, [searchParams]);

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!SETUP_TOKEN) {
      setError('Setup token not configured');
      return;
    }
    if (token === SETUP_TOKEN) {
      setIsVerified(true);
      setError('');
    } else {
      setError('Invalid setup token');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, COLLECTIONS.ADMINS, uid), {
        uid,
        email,
        fullName,
        role: 'admin',
        createdAt: new Date(),
      });

      setMessage('Admin created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setIsLoading(false);
    }
  };

  if (!SETUP_TOKEN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md">
          <div className="bg-slate-700 rounded-lg shadow-2xl p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Drive<span className="text-orange-500">Ease</span>
              </h1>
              <p className="text-red-400 text-sm mt-4">Setup token not configured</p>
              <p className="text-gray-400 text-xs mt-2">Add NEXT_PUBLIC_ADMIN_SETUP_TOKEN to .env.local</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md">
          <div className="bg-slate-700 rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Drive<span className="text-orange-500">Ease</span>
              </h1>
              <p className="text-gray-300">Admin Setup</p>
            </div>

            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Setup Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter setup token"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Verify Token
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <div className="bg-slate-700 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Drive<span className="text-orange-500">Ease</span>
            </h1>
            <p className="text-gray-300">Create Admin Account</p>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="admin@driveease.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-900/30 border border-green-500/50 rounded text-green-200 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
