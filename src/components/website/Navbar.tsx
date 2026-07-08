'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, ShieldUser } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPath, setMenuPath] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const showAdminLogin = pathname === '/home' || pathname === '/';
  const isMobileMenuVisible = isOpen && menuPath === pathname;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
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
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
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
              {showAdminLogin && (
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
            className="absolute right-0 top-0 bottom-0 w-72 bg-[#111118] border-l border-[#2a2a3a] p-6 pt-24"
            style={{ animation: 'slide-in-right 0.3s ease' }}
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
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
