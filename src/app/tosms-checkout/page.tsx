'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

/**
 * Hosted on the Paddle-approved domain (car-rental-fyp-nine.vercel.app).
 * On success it fulfills the fee via the TOSMS admin API, then deep-links back.
 */
function TosmsCheckoutInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Preparing secure checkout…');

  const transactionId = searchParams.get('_ptxn');
  const returnUrlParam = searchParams.get('returnUrl');
  const apiBaseParam = searchParams.get('apiBase');

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

    async function fulfill(txnId: string): Promise<boolean> {
      if (!apiBaseParam) {
        console.warn('No apiBase — skipping server fulfill');
        return false;
      }
      try {
        const res = await fetch(`${apiBaseParam}/api/paddle/fulfill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txnId }),
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Fulfill failed', data);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Fulfill network error', err);
        return false;
      }
    }

    async function boot() {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token) {
        setError('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured');
        return;
      }

      if (!transactionId) {
        setError('Missing transaction. Open checkout from the TOSMS app.');
        return;
      }

      try {
        const paddle: Paddle | undefined = await initializePaddle({
          environment: 'sandbox',
          token,
          eventCallback(event) {
            void (async () => {
              if (event.name === 'checkout.completed') {
                const id =
                  (event.data &&
                    typeof event.data === 'object' &&
                    'id' in event.data &&
                    typeof event.data.id === 'string' &&
                    event.data.id) ||
                  transactionId;

                setStatus('Payment successful. Saving record…');
                const saved = await fulfill(id);
                setStatus(
                  saved
                    ? 'Saved. Returning to TOSMS…'
                    : 'Paid, but save may need a moment. Returning…',
                );
                window.location.href = `${returnUrl}?transactionId=${encodeURIComponent(id)}`;
              }
              if (event.name === 'checkout.closed') {
                setStatus('Checkout closed. You can return to the app.');
              }
              if (event.name === 'checkout.error') {
                setError('Checkout failed. Please try again from the app.');
              }
            })();
          },
        });

        if (cancelled || !paddle) return;
        setStatus('Opening Paddle checkout…');
        paddle.Checkout.open({ transactionId });
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
  }, [transactionId, returnUrl, apiBaseParam]);

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
