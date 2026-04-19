'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
              <a href="tel:+921234567890" className="flex items-center gap-3 text-sm text-gray-400 hover:text-orange-500 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                  <Phone size={14} className="text-orange-500" />
                </div>
                +92 123 456 7890
              </a>
              <a href="mailto:info@driveease.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-orange-500 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                  <Mail size={14} className="text-orange-500" />
                </div>
                info@driveease.com
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin size={14} className="text-orange-500" />
                </div>
                Rawalpindi, Pakistan
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home', href: '/home' },
                { label: 'Our Fleet', href: '/cars' },
                { label: 'Packages', href: '/packages' },
                { label: 'About Us', href: '/about' },
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
                { label: 'Self Drive', href: '/cars' },
                { label: 'With Driver', href: '/packages' },
                { label: 'Wedding Cars', href: '/packages' },
                { label: 'Corporate Rentals', href: '/packages' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-orange-500 transition-all duration-300" />
                    {link.label}
                  </Link>
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
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-[#2a2a3a] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <button className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex-shrink-0">
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1a1a24] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © {currentYear} DriveEase. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</a>
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
