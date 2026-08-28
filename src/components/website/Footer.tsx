'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Phone, Mail, MapPin, ArrowUpRight, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/collections';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const infoDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'companyInfo'));
        if (infoDoc.exists()) {
          setCompanyInfo(infoDoc.data());
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      } finally {
        setIsFetchingInfo(false);
      }
    };
    fetchCompanyInfo();
  }, []);

  const getFallback = (value: string | undefined, defaultVal: string) => {
    if (isFetchingInfo) return 'Loading...';
    return value || defaultVal;
  };

  const handleSubscribe = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    
    setIsSubscribing(true);
    setMessage(null);
    
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email,
        subscribedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'Successfully subscribed!' });
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again later.' });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="relative bg-[#0a0a0f] border-t border-[#1a1a24]">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-3">
              Drive<span className="text-orange-500">Ease</span>
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your trusted car rental partner for comfortable and affordable journeys across Rawalpindi & Islamabad.
            </p>
            {/* Contact quick info */}
            <div className="space-y-3">
              <a href={isFetchingInfo ? "#" : `tel:${companyInfo?.phoneNumber || '+921234567890'}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors cursor-default group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                  <Phone size={14} className="text-orange-500" />
                </div>
                {getFallback(companyInfo?.phoneNumber, '+92 123 456 7890')}
              </a>
              <a href={isFetchingInfo ? "#" : `mailto:${companyInfo?.email || 'info@driveease.com'}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors cursor-default group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                  <Mail size={14} className="text-orange-500" />
                </div>
                {getFallback(companyInfo?.email, 'info@driveease.com')}
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors cursor-default group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                  <MapPin size={14} className="text-orange-500" />
                </div>
                {getFallback(companyInfo?.address, 'Rawalpindi')}{!isFetchingInfo && (companyInfo?.city ? `, ${companyInfo.city}` : ', Pakistan')}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home', href: '/home' },
                { label: 'Cars', href: '/cars' },
                { label: 'Packages', href: '/packages' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-orange-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Self Drive' },
                { label: 'With Driver' },
                { label: 'Wedding Cars' },
                { label: 'Corporate Rentals' },
                { label: 'Safe Driver' },
              ].map((link, idx) => (
                <li key={idx}>
                  <span className="text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-2 group cursor-default">
                    <span className="w-0 group-hover:w-3 h-px bg-orange-500 transition-all duration-300" />
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe for exclusive deals and updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-[#2a2a3a] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors disabled:opacity-50"
              />
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubscribing ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1a1a24] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © {currentYear} DriveEase. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</Link>
              <Link href="/refund-policy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg shadow-green-500/25 flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </footer>
  );
}
