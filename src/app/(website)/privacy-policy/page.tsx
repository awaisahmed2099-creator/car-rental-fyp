import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-[0_2px_0_0_rgba(0,0,0,0.05)]">
            Privacy Policy
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Last updated: January 2024 | Version: 1.0
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-7">[Company Name] operates [App Name] at [Website URL]. This policy explains how we collect, use, share, and protect personal information in connection with the Service and is intended to support GDPR and CCPA disclosures.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Account data such as name, email, company, and login credentials.</li>
              <li>Usage data such as session activity, device details, and feature usage.</li>
              <li>Payment data processed by Paddle as Merchant of Record; we do not store full card details.</li>
              <li>Cookies and tracking technologies for authentication, preferences, analytics, and security.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>To deliver and maintain the Service.</li>
              <li>To process subscriptions and billing through Paddle.</li>
              <li>To provide support and service communications.</li>
              <li>To improve the product and analyze performance.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Legal Bases for Processing</h2>
            <p className="text-gray-600 leading-7">Where GDPR applies, we rely on contractual necessity, legitimate interests, and consent, depending on the context and the type of processing.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Data Sharing and Third Parties</h2>
            <p className="text-gray-600 leading-7">We share personal data only with service providers required to run the Service. Paddle (paddle.com) processes payments and acts as Merchant of Record. We do not sell personal data.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">International Transfers</h2>
            <p className="text-gray-600 leading-7">Data may be transferred internationally with appropriate safeguards, including Standard Contractual Clauses or adequacy-based transfers where applicable.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Data Retention</h2>
            <p className="text-gray-600 leading-7">We retain data only as long as necessary for service delivery, security, legal compliance, and legitimate business purposes.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Your Rights</h2>
            <p className="text-gray-600 leading-7">You may request access, correction, deletion, portability, and other rights under GDPR. California residents may also request information, deletion, and opt-out of sale where applicable. Contact [DPO Email] or [Support Email] to submit a request.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Cookies</h2>
            <p className="text-gray-600 leading-7">We use essential and optional cookies. See [Cookie Policy URL] for details.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Children's Privacy</h2>
            <p className="text-gray-600 leading-7">The Service is not directed to children under 16, or under 13 where applicable law requires a lower age threshold.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Contact Information</h2>
         <p>
  Email:{" "}
  <a
    href="mailto:cs@rental.dev"
    className="text-blue-600 hover:text-blue-800 hover:underline"
  >
    cs@rental.dev
  </a>
</p>

<p>
  Website:{" "}
  <a
    href="https://"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-800 hover:underline"
  >
    https://
  </a>
</p>
          </section>
        </div>
      </div>
    </div>
  );
}
