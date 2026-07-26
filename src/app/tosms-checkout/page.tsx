'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

function extractTxnId(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('txn_')) return value;
  return null;
}

/**
 * Checkout UI only. Firestore fulfillment is done server-side by the admin
 * auto-poller (and optionally Paddle webhooks) — this page must never call
 * fulfill, so users never see API errors in the browser.
 */
function TosmsCheckoutInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Preparing secure checkout…');

  const knownTxnId =
    extractTxnId(searchParams.get('_ptxn')) ||
    extractTxnId(searchParams.get('transactionId'));

  const returnUrlParam = searchParams.get('returnUrl');

  const returnUrl = useMemo(() => {
    if (
      returnUrlParam &&
      (returnUrlParam.startsWith('tosms://') ||
        returnUrlParam.startsWith('exp://') ||
        returnUrlParam.startsWith('http'))
    ) {
      return returnUrlParam;
    }
    return 'tosms://payment-return';
  }, [returnUrlParam]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token) {
        setError('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured');
        return;
      }

      if (!knownTxnId) {
        setError('Missing transaction. Open checkout from the TOSMS app.');
        return;
      }

      try {
        const paddle: Paddle | undefined = await initializePaddle({
          environment: 'sandbox',
          token,
          eventCallback(event) {
            if (event.name === 'checkout.completed') {
              setStatus('Payment successful. Returning to TOSMS…');
              window.location.href = `${returnUrl}?transactionId=${encodeURIComponent(knownTxnId)}`;
            }
            if (event.name === 'checkout.closed') {
              setStatus('Checkout closed. You can return to the app.');
            }
            if (event.name === 'checkout.error') {
              setError('Checkout failed. Please try again from the app.');
            }
          },
        });

        if (cancelled || !paddle) return;
        setStatus('Opening Paddle checkout…');
        paddle.Checkout.open({ transactionId: knownTxnId });
      } catch (err) {
        console.error('Paddle checkout init failed:', err);
        if (!cancelled) {
          setError('Failed to start checkout. Please try again.');
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [knownTxnId, returnUrl]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-[#2a2a3a] bg-[#1a1a24] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-3">
          TOSMS · Secure Checkout
        </p>
        <h1 className="text-2xl font-bold mb-3">Card Payment</h1>
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <p className="text-gray-300 text-sm">{status}</p>
        )}
        <p className="text-gray-500 text-xs mt-6">
          Powered by Paddle Sandbox. Do not close this window until payment
          completes.
        </p>
      </div>
    </main>
  );
}

export default function TosmsCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
          Loading checkout…
        </main>
      }
    >
      <TosmsCheckoutInner />
    </Suspense>
  );
}
