'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronRight, ShieldUser, User, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPath, setMenuPath] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const showAdminLogin = pathname === '/home' || pathname === '/';
  const isMobileMenuVisible = isOpen && menuPath === pathname;
  const isAdmin = user?.email === 'admin@test.com';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    let presenceInterval: NodeJS.Timeout;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        document.cookie = 'driveease_auth=true; path=/; max-age=604800; SameSite=Lax';
        
        // Update presence immediately
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, { lastActive: serverTimestamp() });
        } catch (error) {
          console.error("Error setting presence:", error);
        }

        // Set interval to update every 5 minutes
        presenceInterval = setInterval(async () => {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { lastActive: serverTimestamp() });
          } catch (error) {
            console.error("Error setting presence interval:", error);
          }
        }, 5 * 60 * 1000);
      } else {
        document.cookie = 'driveease_auth=; path=/; max-age=0; SameSite=Lax';
        if (presenceInterval) clearInterval(presenceInterval);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (presenceInterval) clearInterval(presenceInterval);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { lastActive: null });
        } catch (error) {
          console.error("Error clearing presence:", error);
        }
      }
      await signOut(auth);
      document.cookie = 'driveease_auth=; path=/; max-age=0; SameSite=Lax';
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/home' },
    { label: 'Cars', href: '/cars' },
    { label: 'Packages', href: '/packages' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleToggleMenu = () => {
    if (isMobileMenuVisible) {
      setIsOpen(false);
      return;
    }

    setMenuPath(pathname);
    setIsOpen(true);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
            ? 'glass shadow-lg shadow-black/20'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold tracking-tight">
              <span className="text-white">Drive</span>
              <span className="text-orange-500">Ease</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-orange-500/10 ${isActive(link.href)
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {(!user || isAdmin) && showAdminLogin && (
                <div className="relative group">
                  <Link
                    href="/admin/login"
                    aria-label="Admin Login"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:scale-105 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white focus-visible:scale-105 focus-visible:border-orange-400/40 focus-visible:bg-orange-500/10 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                  >
                    <ShieldUser size={18} strokeWidth={1.9} />
                  </Link>

                  <span className="pointer-events-none absolute right-0 top-full mt-3 translate-y-1 whitespace-nowrap rounded-lg border border-[#2a2a3a] bg-[#111118] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    Admin Login
                  </span>
                </div>
              )}

              {/* User Login / Profile Dropdown */}
              <div className="relative group hidden md:block">
                {user ? (
                  <>
                    <button
                      aria-label="User Profile"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 transition-all duration-300 hover:scale-105 hover:border-orange-500/50 hover:bg-orange-500/20 focus-visible:outline-none cursor-pointer"
                    >
                      <User size={18} strokeWidth={2} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#2a2a3a] bg-[#111118] py-2 opacity-0 shadow-xl transition-all duration-200 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-1">
                      <div className="px-4 py-2 border-b border-[#2a2a3a] mb-2">
                        <p className="text-sm font-medium text-white truncate">
                          {isAdmin ? 'Admin' : (user.displayName || 'User')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link 
                        href={isAdmin ? "/admin/dashboard" : "/profile"} 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-orange-500/10 hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        {isAdmin ? 'Admin Dashboard' : 'My Profile'}
                      </Link>

                      <div className="mt-2 border-t border-[#2a2a3a] pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      aria-label="User Login"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:scale-105 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white focus-visible:outline-none"
                    >
                      <User size={18} strokeWidth={1.9} />
                    </Link>
                    <span className="pointer-events-none absolute right-0 top-full mt-3 translate-y-1 whitespace-nowrap rounded-lg border border-[#2a2a3a] bg-[#111118] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      Login
                    </span>
                  </>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href="/cars"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
              >
                Book Now
                <ChevronRight size={16} />
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
                onClick={handleToggleMenu}
                aria-label="Toggle menu"
              >
                {isMobileMenuVisible ? (
                  <X size={20} className="text-white" />
                ) : (
                  <Menu size={20} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuVisible && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />

          {/* Drawer */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[#111118] border-l border-[#2a2a3a] p-6 pt-24 overflow-y-auto"
            style={{ animation: 'slide-in-right 0.3s ease' }}
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.href)
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                  <ChevronRight size={16} className="text-gray-600" />
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#2a2a3a]">
              <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4">Legal</p>
              <div className="space-y-1 mb-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {user ? (
                <>
                  <Link
                    href={isAdmin ? "/admin/dashboard" : "/profile"}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 mb-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {isAdmin ? <ShieldUser size={18} /> : <User size={18} />}
                    {isAdmin ? 'Admin Dashboard' : 'My Profile'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 mb-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-semibold rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} />
                  Login
                </Link>
              )}

              <Link
                href="/cars"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Book Now
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
