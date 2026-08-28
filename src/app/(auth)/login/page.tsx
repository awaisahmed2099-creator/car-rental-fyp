'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getAuthErrorMessage } from '@/lib/authErrors';
import styles from './login.module.css';
import { X } from 'lucide-react';
import Tabs, { AuthTab } from '@/components/ui/auth/Tabs';
import LoginForm, { LoginFormData } from '@/components/ui/auth/LoginForm';
import SignupForm, { SignupFormData } from '@/components/ui/auth/SignupForm';
import Toast from '@/components/ui/auth/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);


  // ---- Redirect to the site's home page after a successful login/signup ----
  const goHome = useCallback(() => {
    clearTimeout(redirectTimer.current);
    
    // Set a cookie so middleware knows we are logged in
    document.cookie = 'driveease_auth=true; path=/; max-age=604800; SameSite=Lax'; // 7 days

    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl') || '/';

    redirectTimer.current = setTimeout(() => {
      router.push(callbackUrl);
    }, 900); // small delay so the toast is visible before navigating
  }, [router]);

  // Throws on failure — LoginForm/SignupForm catch this and show the message.
    const handleLoginSubmit = async ({ email, password, keepLoggedIn }: LoginFormData) => {
    try {
      await setPersistence(auth, keepLoggedIn ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setShowVerificationScreen(true);
        return;
      }

      try {
        const userRef = doc(db, 'users', userCredential.user.uid);
        await updateDoc(userRef, {
          lastActive: new Date()
        });
      } catch (updateError) {
        console.error("Failed to update lastActive status:", updateError);
      }

      fireToast("You have successfully logged in");
      goHome();
    } catch (err: any) {
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const handleSignupSubmit = async ({ name, email, phone, password }: SignupFormData) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      
      const userRef = doc(db, 'users', credential.user.uid);
      await setDoc(userRef, {
        name: name.trim(),
        email: email,
        phone: phone,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await signOut(auth);
      fireToast('Your account has been successfully created');
      setActiveTab('login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email is already registered.');
      }
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      fireToast('A password reset link has been sent to your email. Please check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        throw new Error('No account found with this email');
      }
      throw new Error(getAuthErrorMessage(err));
    }
  };

  return (
    <div className={styles.page} onClick={() => router.push('/')}>
      {/* PERFECT FULL-PAGE GRADIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-[#140803] to-[#2a1104] pointer-events-none"></div>
      <div className="fixed top-[-20%] right-[-10%] z-0 w-[1200px] h-[1200px] bg-orange-600/20 rounded-full blur-[200px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] z-0 w-[800px] h-[800px] bg-orange-700/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed top-[10%] left-[-10%] z-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className={styles.authWrap}>
        <div 
          className={`${styles.authPanel} relative`}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            type="button"
            onClick={() => router.push('/')} 
            className="absolute top-2 right-2 p-1 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-gray-400 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-500 transition-all z-50 cursor-pointer"
          >
            <X size={18} />
          </button>
          {showVerificationScreen ? (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/>
                  <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
              <p className="text-gray-400 mb-8 max-w-sm">
                A verification link has been sent to your email. Please click the link to verify your account, then log in again.
              </p>
              <button 
                onClick={() => setShowVerificationScreen(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors w-full"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8">
                <Tabs active={activeTab} onChange={setActiveTab} />
              </div>
              {activeTab === 'login' ? (
                <LoginForm onSubmit={handleLoginSubmit} onSwitchToSignup={() => setActiveTab('signup')} onForgotPassword={handleForgotPassword} />
              ) : (
                <SignupForm onSubmit={handleSignupSubmit} onSwitchToLogin={() => setActiveTab('login')} />
              )}
            </>
          )}
        </div>
      </div>

      <Toast message={toastMsg} show={toastVisible} />
    </div>
  );
}