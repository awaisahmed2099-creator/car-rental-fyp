'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from '@/app/(auth)/login/login.module.css';

export interface LoginFormData {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

interface LoginFormProps {
  /** Throw an Error with a friendly message on failure — the form will display it. */
  onSubmit: (data: LoginFormData) => Promise<void>;
  onSwitchToSignup: () => void;
  onForgotPassword?: (email: string) => Promise<void>;
}

export default function LoginForm({ onSubmit, onSwitchToSignup, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotView, setShowForgotView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ email, password, keepLoggedIn });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onForgotPassword) return;
    setError('');
    setLoading(true);
    try {
      await onForgotPassword(email);
      setShowForgotView(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotView) {
    return (
      <div className={`${styles.formPanel} ${styles.visible}`}>
        <div className={styles.panelTitle}>Reset Password.</div>
        <div className={styles.panelSub}>Enter your email to get a reset link.</div>
        
        <form onSubmit={handleForgotSubmit}>
          <div className={styles.field}>
            <label htmlFor="resetEmail">Email</label>
            <input
              id="resetEmail"
              type="email"
              placeholder="you@roadmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
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
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className={styles.switchLine} style={{ marginTop: '1.5rem' }}>
          <a onClick={() => { setShowForgotView(false); setError(''); }}>Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.formPanel} ${styles.visible}`}>
      <div className={styles.panelTitle}>Welcome back!</div>
      <div className={styles.panelSub}>Log in to book your perfect ride.</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            type="email"
            placeholder="you@roadmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="loginPass">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="loginPass"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button 
              type="button" 
              className={`${styles.eyeIcon} hover:text-orange-500 cursor-pointer transition-colors`}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.rowInline}>
          <label className={styles.remember}>
            <input
              type="checkbox"
              className="cursor-pointer hover:accent-orange-500 accent-orange-500 hover:ring-2 hover:ring-orange-500/50 transition-all outline-none"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              disabled={loading}
            />
            Keep me logged in
          </label>
          <a 
            className={styles.forgot} 
            onClick={(e) => {
              e.preventDefault();
              setShowForgotView(true);
              setError('');
            }}
          >
            Forgot?
          </a>
        </div>

        <button className={styles.ignition} type="submit" disabled={loading}>
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#041410" />
            </svg>
          )}
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>



      <div className={styles.switchLine}>
        New to DriveEase? <a onClick={onSwitchToSignup}>Create an account</a>
      </div>
    </div>
  );
}