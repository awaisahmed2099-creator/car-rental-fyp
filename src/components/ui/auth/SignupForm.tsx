'use client';

import { FormEvent, useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Eye, EyeOff } from 'lucide-react';
import styles from '@/app/(auth)/login/login.module.css';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface SignupFormProps {
  /** Throw an Error with a friendly message on failure — the form will display it. */
  onSubmit: (data: SignupFormData) => Promise<void>;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSubmit, onSwitchToLogin }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formatPhone = (value: string) => {
    let text = value.replace(/[^\d+]/g, '');
    if (text && !text.startsWith('+')) {
      text = '+' + text.replace(/\+/g, '');
    }
    return text.slice(0, 13);
  };

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const pkPhoneRegex = /^\+923\d{9}$/;
    if (!pkPhoneRegex.test(phone)) {
      setError('Please enter a valid Pakistani phone number (e.g., +923001234567).');
      return;
    }

    setLoading(true);
    try {
      // Pre-flight Duplicate Checks
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', email));
      const phoneQuery = query(usersRef, where('phone', '==', phone));
      
      const [emailSnapshot, phoneSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(phoneQuery)
      ]);

      if (!emailSnapshot.empty || !phoneSnapshot.empty) {
        setError('An account with this email or phone number is already registered.');
        setLoading(false);
        return;
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setError('');
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      await onSubmit({ name, email, phone, password });
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP code. Please try again.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.formPanel} ${styles.visible}`}>
      <div className={styles.panelTitle}>Create an Account</div>
      <div className={styles.panelSub}>Sign up to easily rent premium cars.</div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className={styles.field}>
            <label htmlFor="suName">Full name</label>
            <input
              id="suName"
              type="text"
              placeholder="Jordan Cruz"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="suEmail">Email</label>
            <input
              id="suEmail"
              type="email"
              placeholder="you@roadmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="suPhone">Phone Number</label>
            <input
              id="suPhone"
              type="tel"
              placeholder="+923001234567"
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              disabled={loading}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="suPass">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="suPass"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div 
                className={styles.eyeIcon} 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </div>
            </div>
          </div>

          {error && <div className={styles.errorText}>{error}</div>}
          <div id="recaptcha-container" style={{ position: 'absolute', bottom: 0, right: 0, visibility: 'hidden', width: 0, height: 0, overflow: 'hidden' }}></div>

          <button className={styles.ignition} type="submit" disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#041410" />
              </svg>
            )}
            {loading ? 'Sending OTP…' : 'Register'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className={styles.field}>
            <label htmlFor="suOtp">Enter 6-digit OTP</label>
            <input
              id="suOtp"
              type="text"
              placeholder="123456"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-2">Sent to {phone}</p>
          </div>

          {error && <div className={styles.errorText}>{error}</div>}

          <button className={styles.ignition} type="submit" disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#041410" />
              </svg>
            )}
            {loading ? 'Verifying…' : 'Complete Signup'}
          </button>
          
          <button 
            type="button"
            className="w-full text-center text-sm text-gray-400 hover:text-white mt-4"
            onClick={() => {
              setStep(1);
              setError('');
            }}
            disabled={loading}
          >
            Back to details
          </button>
        </form>
      )}

      <div className="text-[10px] text-gray-500 text-center mt-4">
        This site is protected by reCAPTCHA and the Google 
        <a href="https://policies.google.com/privacy" className="hover:underline text-gray-400 mx-1">Privacy Policy</a> and 
        <a href="https://policies.google.com/terms" className="hover:underline text-gray-400 mx-1">Terms of Service</a> apply.
      </div>

      <div className={styles.switchLine}>
        Already have an account? <a onClick={onSwitchToLogin}>Log in</a>
      </div>
    </div>
  );
}