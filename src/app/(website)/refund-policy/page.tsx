import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-[0_2px_0_0_rgba(0,0,0,0.05)]">
            Refund Policy
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            Refund Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Last updated: January 2024 | Version: 1.0
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Overview</h2>
            <p className="text-gray-600 leading-7">We believe in fair pricing and customer satisfaction. Refund eligibility is based on subscription type and time elapsed since purchase. Paddle (paddle.com) is our Merchant of Record and processes all payments and refunds.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Refund Eligibility</h2>
            
            <h3 className="text-lg font-semibold text-gray-950 mt-6 mb-3">Monthly Subscriptions</h3>
            <p className="text-gray-600 leading-7">Refund requests must be made within 7 days of the purchase or renewal date. Refunds are issued in full, provided the refund window has not closed.</p>

            <h3 className="text-lg font-semibold text-gray-950 mt-6 mb-3">Annual Subscriptions</h3>
            <p className="text-gray-600 leading-7">Refund requests must be made within 14 days of the purchase or renewal date. This extended window acknowledges the longer commitment of annual plans.</p>

            <h3 className="text-lg font-semibold text-gray-950 mt-6 mb-3">Free Trial</h3>
            <p className="text-gray-600 leading-7">Cancellation during the free trial period incurs no charges. No refund is required.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Non-Refundable Situations</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Requests made after the refund window has closed.</li>
              <li>Subscriptions activated during a promotion or discount period (subject to promotion terms).</li>
              <li>Refund requests related to disputes over features, design, or performance.</li>
              <li>Canceled subscriptions where the refund window already passed.</li>
              <li>Charges incurred due to account inactivity after the initial billing.</li>
              <li>Refund requests for usage within the refund window (charges for overages).</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">How to Request a Refund</h2>
            <p className="text-gray-600 leading-7 mb-4">
              To request a refund, please contact us at [Support Email] with your order details, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Subscription type (Monthly or Annual).</li>
              <li>Purchase or renewal date.</li>
              <li>Reason for the refund request.</li>
              <li>Order reference number or account email.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Refund Processing Timeline</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>
                <strong>Review (24-48 hours):</strong> We review your request for eligibility.
              </li>
              <li>
                <strong>Approval (if eligible):</strong> Paddle processes the refund automatically.
              </li>
              <li>
                <strong>Bank processing (3-5 business days):</strong> Refunds are credited to your original payment method; processing time depends on your bank.
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Disputes and Appeals</h2>
            <p className="text-gray-600 leading-7">If you believe your refund was incorrectly denied, you may appeal within 30 days of the denial. Please provide additional context for your appeal. Appeals are reviewed case-by-case.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Paddle as Merchant of Record</h2>
            <p className="text-gray-600 leading-7">Paddle (paddle.com) is the Merchant of Record for all [Company Name] transactions. Refund disputes and payment-related inquiries are ultimately governed by Paddle's policies and terms. For questions about Paddle's refund processes, visit <a href="https://www.paddle.com" className="text-gray-900 underline underline-offset-4 hover:text-gray-700">paddle.com</a>.</p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-7">
              For refund requests or questions, please contact:<br />
              Email: [Support Email]<br />
              Phone: [Support Phone]<br />
              Address: [Company Address]
            </p>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Policy Updates</h2>
            <p className="text-gray-600 leading-7">We may update this Refund Policy at any time. Changes take effect upon posting. Continued subscription after updates constitute acceptance.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
