'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  User,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { User as UserIcon, CalendarDays, Settings, Mail, ShieldCheck, Phone, MapPin, CreditCard, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });

  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSettingsForm(prev => ({
              ...prev,
              fullName: currentUser.displayName || data.name || '',
              phone: data.phone || ''
            }));
          } else {
            setSettingsForm(prev => ({ ...prev, fullName: currentUser.displayName || '' }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setSettingsForm(prev => ({ ...prev, fullName: currentUser.displayName || '' }));
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setLoadingBookings(true);

    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('customerId', '==', user.uid));

    const unsubscribeBookings = onSnapshot(q, (querySnapshot) => {
      const bookingsData: any[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() });
      });
      bookingsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setBookings(bookingsData);
      setLoadingBookings(false);
    }, (error: any) => {
      console.error("Error fetching bookings (snapshot), retrying with getDocs:", error);
      getDocs(q).then((snapshot: any) => {
        const bookingsData: any[] = [];
        snapshot.forEach((doc: any) => {
          bookingsData.push({ id: doc.id, ...doc.data() });
        });
        bookingsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setBookings(bookingsData);
        setLoadingBookings(false);
      }).catch((fallbackError: any) => {
        console.error("Fallback error fetching bookings:", fallbackError);
        setLoadingBookings(false);
      });
    });

    return () => unsubscribeBookings();
  }, [user]);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  const handleTabChange = (tab: string) => {
    router.push(`/profile?tab=${tab}`);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 11);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      if (settingsForm.fullName !== user.displayName) {
        await updateProfile(user, { displayName: settingsForm.fullName });
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name: settingsForm.fullName,
        phone: settingsForm.phone,
        updatedAt: new Date()
      }, { merge: true });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !user.email) return;
    if (!settingsForm.currentPassword || !settingsForm.newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, settingsForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, settingsForm.newPassword);

      setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      toast.success('Password updated successfully!');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        toast.error('The current password you entered is incorrect.');
      } else {
        toast.error(error.message || 'Failed to update password');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    setIsDeletingAccount(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      await deleteUser(user);

      document.cookie = 'driveease_auth=; path=/; max-age=0; SameSite=Lax';
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in before deleting your account.');
      } else {
        toast.error(error.message || 'Failed to delete account');
      }
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050301] pt-32 pb-16 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-[#140803] to-[#2a1104] pointer-events-none"></div>
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin z-10"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-[#050301] overflow-hidden">

      {/* PERFECT FULL-PAGE GRADIENT BACKGROUND (Matches image_e1b462.png) */}
      {/* 1. Base Gradient covering entire screen */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-[#140803] to-[#2a1104] pointer-events-none"></div>

      {/* 2. Massive Right-side Orange/Copper Glow */}
      <div className="fixed top-[-20%] right-[-10%] z-0 w-[1200px] h-[1200px] bg-orange-600/20 rounded-full blur-[200px] pointer-events-none"></div>

      {/* 3. Bottom-left Orange Glow */}
      <div className="fixed bottom-[-10%] left-[-10%] z-0 w-[800px] h-[800px] bg-orange-700/20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* 4. Top-left subtle ambient light */}
      <div className="fixed top-[10%] left-[-10%] z-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>


      {/* Actual Profile Content */}
      <div className="relative z-10 pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-6">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account and bookings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#111118]/60 backdrop-blur-xl border border-[#2a2a3a] rounded-2xl overflow-hidden sticky top-28">
              <nav className="flex flex-col">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 cursor-pointer ${activeTab === 'overview'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-transparent text-gray-400 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500'
                    }`}
                >
                  <UserIcon size={18} />
                  Account Overview
                </button>
                <button
                  onClick={() => handleTabChange('bookings')}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 cursor-pointer ${activeTab === 'bookings'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-transparent text-gray-400 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500'
                    }`}
                >
                  <CalendarDays size={18} />
                  My Bookings
                </button>
                <button
                  onClick={() => handleTabChange('settings')}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 cursor-pointer ${activeTab === 'settings'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-transparent text-gray-400 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500'
                    }`}
                >
                  <Settings size={18} />
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1">
            <div className="bg-[#111118]/60 backdrop-blur-xl border border-[#2a2a3a] rounded-2xl p-6 md:p-8 min-h-[400px]">

              {/* TAB: Account Overview */}
              {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <UserIcon className="text-orange-500" size={24} />
                    Account Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a24] p-5 rounded-xl border border-[#2a2a3a] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.15)]">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="text-gray-500" size={16} />
                        <span className="text-sm font-medium text-gray-400">Full Name</span>
                      </div>
                      <p className="text-lg text-white font-semibold">{user.displayName || 'Not Provided'}</p>
                    </div>

                    <div className="bg-[#1a1a24] p-5 rounded-xl border border-[#2a2a3a] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.15)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="text-gray-500" size={16} />
                        <span className="text-sm font-medium text-gray-400">Email Address</span>
                      </div>
                      <p className="text-lg text-white font-semibold">{user.email}</p>
                    </div>

                    <div className="bg-[#1a1a24] p-5 rounded-xl border border-[#2a2a3a] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.15)]">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="text-gray-500" size={16} />
                        <span className="text-sm font-medium text-gray-400">Phone Number</span>
                      </div>
                      <p className="text-lg text-white font-semibold">{settingsForm.phone || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: My Bookings */}
              {activeTab === 'bookings' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CalendarDays className="text-orange-500" size={24} />
                    My Bookings
                  </h2>

                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12 bg-[#1a1a24] rounded-2xl border border-[#2a2a3a]">
                      <CalendarDays size={48} className="mx-auto text-[#2a2a3a] mb-4" />
                      <p className="text-gray-400">You don't have any bookings yet.</p>
                      <button onClick={() => router.push('/cars')} className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                        Browse Cars
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="bg-[#1a1a24] p-5 rounded-2xl border border-[#2a2a3a] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-[#3a3a4a] transition-colors">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-white flex items-center flex-wrap gap-2">
                                <span>{booking.packageId ? `Package: ${booking.packageName || 'Unknown'}` : `Car: ${booking.carName || 'Unknown Car'}`}</span>
                                {booking.tag && (
                                  <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full capitalize">
                                    {booking.tag}
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`capitalize px-2.5 py-1 text-xs font-semibold rounded-full ${(booking.bookingStatus || booking.status || '').toLowerCase() === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                    (booking.bookingStatus || booking.status || '').toLowerCase() === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                      'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                  }`}>
                                  {booking.bookingStatus || booking.status || 'Pending'}
                                </span>
                                {booking.paymentMethod && (
                                  <span className={`capitalize px-2.5 py-1 text-xs font-semibold rounded-full ${(booking.paymentStatus || '').toLowerCase() === 'paid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                    {booking.paymentMethod === 'cash' ? 'Cash' : 'Card'} - {booking.paymentStatus || 'Pending'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {booking.packageDetails && (
                              <p className="text-sm text-gray-400 mt-1">{booking.packageDetails}</p>
                            )}

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                                <span>Pick-up: {formatDate(booking.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                                <span>Drop-off: {formatDate(booking.endDate)}</span>
                              </div>
                            </div>

                            {(booking.pickupLocation || booking.dropoffLocation) && (
                              <div className="flex flex-col gap-1.5 mt-2 text-sm text-gray-400 w-full sm:w-auto overflow-hidden">
                                {booking.pickupLocation && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                                    <span className="font-medium text-gray-300">Pick-up:</span>
                                    <span
                                      className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm"
                                      title={typeof booking.pickupLocation === 'string' ? booking.pickupLocation : booking.pickupLocation.address}
                                    >
                                      {typeof booking.pickupLocation === 'string' ? booking.pickupLocation : booking.pickupLocation.address}
                                    </span>
                                  </div>
                                )}
                                {booking.dropoffLocation && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                                    <span className="font-medium text-gray-300">Drop-off:</span>
                                    <span
                                      className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm"
                                      title={typeof booking.dropoffLocation === 'string' ? booking.dropoffLocation : booking.dropoffLocation.address}
                                    >
                                      {typeof booking.dropoffLocation === 'string' ? booking.dropoffLocation : booking.dropoffLocation.address}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="w-full md:w-auto flex justify-between md:flex-col items-center md:items-end gap-2 pt-4 md:pt-0 border-t border-[#2a2a3a] md:border-t-0 mt-2 md:mt-0">
                            <span className="text-sm text-gray-400">Total</span>
                            <span className="text-xl font-bold text-orange-500">
                              Rs {Number(booking.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Settings */}
              {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                    <Settings className="text-orange-500" size={24} />
                    Account Settings
                  </h2>

                  <div className="space-y-10">
                    {/* Personal Information */}
                    <section>
                      <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                      <div className="bg-[#1a1a24] p-6 rounded-2xl border border-[#2a2a3a] space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Full Name</label>
                            <input
                              type="text"
                              value={settingsForm.fullName}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, fullName: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#111118] border border-[#2a2a3a] rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                              placeholder="Your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Phone Number</label>
                            <input
                              type="tel"
                              value={settingsForm.phone}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                              className="w-full px-4 py-3 bg-[#111118] border border-[#2a2a3a] rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                              placeholder="03001234567"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl text-sm font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2">
                            {isUpdatingProfile ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Security */}
                    <section>
                      <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
                      <div className="bg-[#1a1a24] p-6 rounded-2xl border border-[#2a2a3a] space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Current Password</label>
                            <input
                              type="password"
                              value={settingsForm.currentPassword}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#111118] border border-[#2a2a3a] rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">New Password</label>
                            <input
                              type="password"
                              value={settingsForm.newPassword}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#111118] border border-[#2a2a3a] rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl text-sm font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2">
                            {isUpdatingPassword ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                      <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
                      <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-1">Delete Account</h4>
                          <p className="text-sm text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                        </div>
                        <button onClick={handleDeleteAccount} disabled={isDeletingAccount} className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/50 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                          {isDeletingAccount ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : 'Delete Account'}
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050301] pt-32 pb-16 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-[#140803] to-[#2a1104] pointer-events-none"></div>
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin z-10"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}