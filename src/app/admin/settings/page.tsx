'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import MapLocationPicker from '@/components/booking/MapLocationPicker';

interface CompanyInfo {
  companyName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  workingHours: string;
  websiteTagline: string;
  mapEmbedUrl: string;
  companyLocation?: { address: string; lat: number; lng: number } | null;
}

interface BookingConfig {
  minimumDays: number;
  maximumDays: number;
  advanceDays: number;
  showAvailableOnly: boolean;
  autoConfirmBookings: boolean;
}

export default function SettingsPage() {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  // Company Information
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: 'DriveEase',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    address: '',
    city: '',
    workingHours: '8:00 AM - 10:00 PM',
    websiteTagline: '',
    mapEmbedUrl: '',
    companyLocation: null,
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Booking Settings
  const [bookingConfig, setBookingConfig] = useState<BookingConfig>({
    minimumDays: 1,
    maximumDays: 30,
    advanceDays: 0,
    showAvailableOnly: true,
    autoConfirmBookings: true,
  });
  const [savingBooking, setSavingBooking] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get admin email
        if (auth.currentUser) {
          setAdminEmail(auth.currentUser.email || '');
        }

        // Get company info
        const companyDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'companyInfo'));
        if (companyDoc.exists()) {
          setCompanyInfo({ ...companyInfo, ...companyDoc.data() });
        }

        // Get booking config
        const bookingDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'bookingConfig'));
        if (bookingDoc.exists()) {
          setBookingConfig({ ...bookingConfig, ...bookingDoc.data() });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save company info
  const handleSaveCompany = async () => {
    if (!companyInfo.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      setSavingCompany(true);
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'companyInfo'), companyInfo);
      toast.success('Company information saved successfully');
    } catch (error) {
      console.error('Error saving company info:', error);
      toast.error('Failed to save company information');
    } finally {
      setSavingCompany(false);
    }
  };

  // Save booking config
  const handleSaveBooking = async () => {
    if (bookingConfig.minimumDays < 1) {
      toast.error('Minimum days must be at least 1');
      return;
    }

    if (bookingConfig.minimumDays > bookingConfig.maximumDays) {
      toast.error('Minimum days cannot exceed maximum days');
      return;
    }

    try {
      setSavingBooking(true);
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'bookingConfig'), bookingConfig);
      toast.success('Booking settings saved successfully');
    } catch (error) {
      console.error('Error saving booking config:', error);
      toast.error('Failed to save booking settings');
    } finally {
      setSavingBooking(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);

      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user logged in');
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        toast.error('New password is too weak');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AdminHeader title="Settings" />

      <main className="max-w-4xl mx-auto px-8 py-8">
        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Company Information</h2>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
              <input
                type="text"
                value={companyInfo.companyName}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={companyInfo.phoneNumber}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phoneNumber: e.target.value })}
                placeholder=" "
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={companyInfo.whatsappNumber}
                onChange={(e) => setCompanyInfo({ ...companyInfo, whatsappNumber: e.target.value })}
                placeholder=" "
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                placeholder=" "
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                placeholder=" "
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={companyInfo.city}
                onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                placeholder=" "
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <div className="relative cursor-pointer">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="text-orange-500 w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full text-left truncate cursor-pointer"
                >
                  {companyInfo.companyLocation?.address || 'Choose Location...'}
                </button>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Working Hours</label>
              <input
                type="text"
                value={companyInfo.workingHours}
                onChange={(e) => setCompanyInfo({ ...companyInfo, workingHours: e.target.value })}
                placeholder=" "
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
            </div>

            {/* Website Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website Tagline</label>
              <textarea
                value={companyInfo.websiteTagline}
                onChange={(e) => setCompanyInfo({ ...companyInfo, websiteTagline: e.target.value })}
                placeholder=" "
                rows={3}
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveCompany}
              disabled={savingCompany}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {savingCompany ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Company Information
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 2: JAZZCASH SETTINGS */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg shadow p-8 mb-8 border-l-4 border-purple-500">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="text-purple-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">JazzCash Settings</h2>
              <p className="text-sm text-gray-600 mt-2">
                These credentials are stored in your .env.local file and should never be shared.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-2">⚠️ Security Warning</p>
              <p>Never expose these credentials in public repositories or documentation. These should only be in:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>.env.local (local development)</li>
                <li>Environment variables (production servers)</li>
                <li>Secure vaults or secret managers</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 dark:bg-[#0a0a0f] p-6 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                NEXT_PUBLIC_JAZZCASH_MERCHANT_ID
              </label>
              <p className="text-sm text-gray-600 font-mono bg-white dark:bg-[#1a1a24] p-3 rounded border border-gray-200 dark:border-[#2a2a3a]">
                {process.env.NEXT_PUBLIC_JAZZCASH_MERCHANT_ID || 'Not configured'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                NEXT_PUBLIC_JAZZCASH_PASSWORD
              </label>
              <p className="text-sm text-gray-600 font-mono bg-white dark:bg-[#1a1a24] p-3 rounded border border-gray-200 dark:border-[#2a2a3a]">
                {process.env.NEXT_PUBLIC_JAZZCASH_PASSWORD ? '••••••••' : 'Not configured'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT
              </label>
              <p className="text-sm text-gray-600 font-mono bg-white dark:bg-[#1a1a24] p-3 rounded border border-gray-200 dark:border-[#2a2a3a]">
                {process.env.NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT ? '••••••••' : 'Not configured'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ How to Update:</strong> Edit your <code className="bg-white dark:bg-[#1a1a24] px-2 py-1 rounded">.env.local</code> file
                with the JazzCash credentials provided by their support team.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: BOOKING SETTINGS */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Booking Settings</h2>

          <div className="space-y-6">
            {/* Minimum Booking Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Booking Days</label>
              <input
                type="number"
                min="1"
                value={bookingConfig.minimumDays}
                onChange={(e) =>
                  setBookingConfig({ ...bookingConfig, minimumDays: parseInt(e.target.value) || 1 })
                }
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Customers must book for at least this many days</p>
            </div>

            {/* Maximum Booking Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Booking Days</label>
              <input
                type="number"
                min="1"
                value={bookingConfig.maximumDays}
                onChange={(e) =>
                  setBookingConfig({ ...bookingConfig, maximumDays: parseInt(e.target.value) || 30 })
                }
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Maximum duration allowed for a single booking</p>
            </div>

            {/* Advance Booking Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advance Booking Days Required</label>
              <input
                type="number"
                min="0"
                value={bookingConfig.advanceDays}
                onChange={(e) =>
                  setBookingConfig({ ...bookingConfig, advanceDays: parseInt(e.target.value) || 0 })
                }
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Days in advance required for booking (0 = same day allowed)</p>
            </div>

            {/* Show Available Cars Only */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showAvailable"
                checked={bookingConfig.showAvailableOnly}
                onChange={(e) =>
                  setBookingConfig({ ...bookingConfig, showAvailableOnly: e.target.checked })
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="showAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show only available cars
              </label>
            </div>

            {/* Auto Confirm Bookings */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoConfirm"
                checked={bookingConfig.autoConfirmBookings}
                onChange={(e) =>
                  setBookingConfig({ ...bookingConfig, autoConfirmBookings: e.target.checked })
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="autoConfirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Automatically confirm bookings
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveBooking}
              disabled={savingBooking}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {savingBooking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Booking Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 4: ADMIN ACCOUNT */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Account</h2>

          <div className="space-y-6">
            {/* Current Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Email Address</label>
              <input
                type="email"
                value={adminEmail}
                disabled
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 outline-none w-full disabled:opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Email cannot be changed directly. Contact support if needed.</p>
            </div>

            {/* Change Password Form */}
            <div className="pt-6 border-t border-gray-200 dark:border-[#2a2a3a]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-3 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password (min. 6 characters)"
                      className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-3 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white border border-gray-300 dark:border-[#2a2a3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-3 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Change Password Button */}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {showMapPicker && (
        <MapLocationPicker
          title="Select Company Location"
          onClose={() => setShowMapPicker(false)}
          onSelect={(location) => {
            setCompanyInfo({ ...companyInfo, companyLocation: location });
            setShowMapPicker(false);
          }}
        />
      )}
    </div>
  );
}
