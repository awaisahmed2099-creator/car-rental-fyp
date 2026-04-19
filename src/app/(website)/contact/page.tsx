'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CompanyInfo {
  companyName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  workingHours: string;
  websiteTagline: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Fetch company info
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const infoDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'companyInfo'));
        if (infoDoc.exists()) {
          setCompanyInfo(infoDoc.data() as CompanyInfo);
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };
    fetchCompanyInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      await addDoc(collection(db, COLLECTIONS.SETTINGS, 'messages', 'messages'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        createdAt: serverTimestamp(),
        read: false
      });
      
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqs: FAQItem[] = [
    { question: 'What documents do I need to rent a car?', answer: 'You\'ll need a valid driving license (original or international), a copy of your CNIC/passport, and a proof of address. For corporate clients, we may require additional documentation.' },
    { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 48 hours before the booking date. Cancellations within 48 hours may incur 25% fee. Cancellations within 24 hours will forfeit 50% of the booking amount.' },
    { question: 'Do you offer delivery to my location?', answer: 'Yes! We offer free delivery and pickup within Rawalpindi and Islamabad for bookings starting at PKR 5,000. Outside these areas, delivery charges apply.' },
    { question: 'What are your payment methods?', answer: 'We accept cash, JazzCash, and online bank transfers. A 30% advance is required to confirm bookings, with the balance due on pickup.' },
    { question: 'Do you offer monthly rental packages?', answer: 'Yes! We offer competitive monthly packages with discounts up to 30%. Contact our sales team for customized long-term rental solutions.' },
    { question: 'What if there\'s an accident or damage?', answer: 'All our vehicles are insured. In case of damage, customers are responsible for the insurance excess (typically 10-15% of vehicle value). Our team will guide you through the claims process.' },
  ];

  const contactInfo = [
    { icon: MapPin, title: 'Address', details: [companyInfo?.address || 'Rawalpindi', companyInfo?.city || 'Islamabad, Pakistan'] },
    { icon: Phone, title: 'Phone', details: [companyInfo?.phoneNumber || '+92 51 XXXX XXXX'] },
    { icon: Mail, title: 'Email', details: [companyInfo?.email || 'contact@driveease.pk'] },
    { icon: Clock, title: 'Working Hours', details: [companyInfo?.workingHours || 'Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM'] },
  ];

  const inputClasses = "w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200&h=600&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/80 to-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">Contact Us</h1>
          <p className="text-lg text-gray-400">Get in touch with our team. We're here to help 24/7</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            {contactInfo.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="card-dark p-6 text-center group hover-lift"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <div className="space-y-1">
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-gray-500 text-sm">{detail}</p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card-dark p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-2">Send a Message</p>
                <h2 className="text-2xl font-bold text-white">We'd Love to Hear From You</h2>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-gray-400">We've received your message and will get back to you soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                        Full Name <span className="text-orange-500">*</span>
                      </label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Your full name" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                        Email <span className="text-orange-500">*</span>
                      </label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="your@email.com" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="+92 300 1234567" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Subject</label>
                      <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className={inputClasses}>
                        <option value="">Select a subject</option>
                        <option value="booking">Booking Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="complaint">Complaint</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      Message <span className="text-orange-500">*</span>
                    </label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} className={`${inputClasses} resize-none`} placeholder="Your message..." required />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#2a2a3a] disabled:text-gray-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/20"
                  >
                    <Send size={16} />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-2">Location</p>
            <h2 className="text-2xl font-bold text-white">Find Us on Map</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#2a2a3a] h-96">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.9151245088487!2d72.73912332346945!3d33.57457032277856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfc15cf779b2ed%3A0x70ccc1e5bc9c8b80!2sRawalpindi%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 gradient-mesh">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-2">FAQ</p>
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="card-dark overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <h3 className="font-medium text-white text-sm pr-4">{faq.question}</h3>
                  <ChevronDown
                    size={18}
                    className={`text-orange-500 flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-5 border-t border-[#2a2a3a]"
                  >
                    <p className="text-gray-500 text-sm leading-relaxed pt-4">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-10 card-dark p-5 text-center">
            <p className="text-gray-400 text-sm">
              <span className="text-white font-medium">Didn't find what you're looking for?</span> Contact us directly and we'll be happy to help!
            </p>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      {companyInfo?.whatsappNumber && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.1)_0%,_transparent_60%)]" />
          <div className="relative max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Chat with us on WhatsApp</h3>
            <p className="text-gray-400 mb-6">Get instant responses to your booking queries</p>
            <a
              href={`https://wa.me/${companyInfo.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
            >
              <MessageCircle size={18} />
              Open WhatsApp
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
