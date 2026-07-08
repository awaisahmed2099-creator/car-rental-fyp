'use client';

import React, { useState } from 'react';
import { Check, Zap, Shield } from 'lucide-react';

const FREE_FEATURES = [
  'Up to 5 vehicles',
  'Basic booking management',
  'Customer management',
  'Email support',
  'Basic analytics',
  'Fleet dashboard',
];

const PRO_FEATURES = [
  'Unlimited vehicles',
  'Advanced booking system',
  'Driver management',
  'Priority support',
  'Advanced analytics',
  'API access',
  'Custom reports',
  'Business insights',
];

const FAQS = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrade or downgrade whenever you need. Changes apply immediately, and billing is prorated to the day.',
  },
  {
    q: 'Is there a free trial on the Pro plan?',
    a: 'Yes — Pro includes a 14-day free trial. No credit card required to start. Trial terms are shown at checkout.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major cards and Paddle-supported local payment methods. Taxes and VAT are automatically handled at checkout.',
  },
  {
    q: 'Who processes my payment?',
    a: 'Payments are securely processed by Paddle, our Merchant of Record. We never store your card details.',
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  const proMonthly = 5;
  const proYearly = 60;

  return (
    <div
      style={{ backgroundColor: '#080D1A', fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen text-white"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="py-16 text-center sm:py-20">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-8"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              color: '#F97316',
            }}
          >
            <Zap size={12} />
            Pricing
          </div>

          <h1
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.08, letterSpacing: '-0.03em' }}
          >
            Fleet management that
            <br />
            <span style={{ color: '#F97316' }}>scales with you</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: '#94A3B8' }}
          >
            Start free with your first five vehicles. When your operation grows, one upgrade unlocks the full power of the platform.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <div
              className="inline-flex rounded-2xl p-1"
              style={{
                background: '#0F172A',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <button
                onClick={() => setYearly(false)}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                style={
                  !yearly
                    ? { background: '#F97316', color: '#fff' }
                    : { color: '#64748B' }
                }
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                style={
                  yearly
                    ? { background: '#F97316', color: '#fff' }
                    : { color: '#64748B' }
                }
              >
                Yearly
              </button>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: yearly ? '#34D399' : '#475569' }}
            >
              
            </p>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────── */}
        <section className="grid gap-6 sm:grid-cols-2 lg:gap-8">

          {/* Free Card */}
          <article
            className="relative rounded-3xl p-8 transition-all duration-300"
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.14)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(100,116,139,0.15)' }}
                >
                  <Shield size={16} style={{ color: '#94A3B8' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Free</h2>
                  <p className="text-xs" style={{ color: '#64748B' }}>Perfect for getting started</p>
                </div>
              </div>

              <div className="flex items-end gap-1 mt-6">
                <span className="text-5xl font-bold text-white" style={{ letterSpacing: '-0.04em' }}>$0</span>
                <span className="mb-2 text-sm" style={{ color: '#475569' }}>/month · forever</span>
              </div>
            </div>

            <ul className="mb-8 space-y-3.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: '#CBD5E1' }}>
                  <span
                    className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
                    style={{ background: 'rgba(100,116,139,0.2)' }}
                  >
                    <Check size={11} style={{ color: '#94A3B8' }} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
<br>
</br>
<br>
</br>
<br>
</br>
            <button
              className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all duration-200"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#CBD5E1',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              Get Started Free
            </button>
          </article>

          {/* Pro Card */}
          <article
            className="relative rounded-3xl p-8 transition-all duration-300"
            style={{
              background: '#0F172A',
              border: '1.5px solid #F97316',
              boxShadow: '0 0 60px -10px rgba(249,115,22,0.25), 0 0 120px -30px rgba(249,115,22,0.12)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 80px -10px rgba(249,115,22,0.4), 0 0 160px -30px rgba(249,115,22,0.18)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 60px -10px rgba(249,115,22,0.25), 0 0 120px -30px rgba(249,115,22,0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Popular badge */}
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: '#F97316', color: '#fff' }}
            >
              Most Popular
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(249,115,22,0.15)' }}
                >
                  <Zap size={16} style={{ color: '#F97316' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pro</h2>
                  <p className="text-xs" style={{ color: '#64748B' }}>For serious rental operations</p>
                </div>
              </div>

              <div className="flex items-end gap-1 mt-6">
                <span
                  className="text-5xl font-bold"
                  style={{ color: '#F97316', letterSpacing: '-0.04em' }}
                >
                  ${yearly ? proYearly : proMonthly}
                </span>
                <span className="mb-2 text-sm" style={{ color: '#475569' }}>
                  {yearly ? '/month · billed yearly' : '/month'}
                </span>
              </div>

              {yearly && (
                <p className="mt-1 text-xs font-medium" style={{ color: '#34D399' }}>
                  You save ${(proMonthly - proYearly) * 12}/year
                </p>
              )}
            </div>

            <ul className="mb-8 space-y-3.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white">
                  <span
                    className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
                    style={{ background: 'rgba(249,115,22,0.2)' }}
                  >
                    <Check size={11} style={{ color: '#F97316' }} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="w-full rounded-2xl py-3.5 text-sm font-bold transition-all duration-200"
              style={{ background: '#F97316', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EA6C0A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F97316'; }}
            >
              Start Free Trial
            </button>
          </article>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="mt-24">
          <div className="mb-10 text-center">
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#F97316' }}
            >
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Common questions
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map(item => (
              <article
                key={item.q}
                className="rounded-2xl p-6 transition-all duration-200"
                style={{
                  background: '#0F172A',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(249,115,22,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; }}
              >
                <h3 className="mb-2 text-base font-semibold text-white">{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}