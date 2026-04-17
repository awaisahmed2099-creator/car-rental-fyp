'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Drive<span className="text-orange-500">Ease</span>
            </h3>
            <p className="text-sm text-gray-400">
              Your trusted car rental partner for comfortable and affordable journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#cars" className="hover:text-orange-500 transition-colors">
                  Cars
                </Link>
              </li>
              <li>
                <Link href="/#packages" className="hover:text-orange-500 transition-colors">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-orange-500 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#contact" className="hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Share2 size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 DriveEase. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 mt-4 md:mt-0">
              Made with ❤️ by DriveEase Team
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-colors"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </footer>
  );
}
