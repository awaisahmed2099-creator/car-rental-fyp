'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

function extractTxnId(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('txn_')) return value;
  return null;
}

/**
 * Hosted on the Paddle-approved domain (car-rental-fyp-nine.vercel.app).
 * Always fulfills with the `_ptxn` transaction id (never checkout event `.id`).
 */
function TosmsCheckoutInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Preparing secure checkout…');

  // Paddle may put the id on _ptxn; we also accept txn from query if present
  const knownTxnId =
    extractTxnId(searchParams.get('_ptxn')) ||
    extractTxnId(searchParams.get('transactionId'));

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

    async function fulfill(txnId: string): Promise<{ ok: boolean; error?: string }> {
      if (!apiBaseParam) {
        return { ok: false, error: 'Missing apiBase' };
      }
      try {
        const res = await fetch(`${apiBaseParam}/api/paddle/fulfill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txnId }),
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message =
            typeof data === 'object' &&
            data !== null &&
            'error' in data &&
            typeof data.error === 'string'
              ? data.error
              : `Fulfill failed (${res.status})`;
          return { ok: false, error: message };
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Network error',
        };
      }
    }

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
            void (async () => {
              if (event.name !== 'checkout.completed') {
                if (event.name === 'checkout.closed') {
                  setStatus('Checkout closed. You can return to the app.');
                }
                if (event.name === 'checkout.error') {
                  setError('Checkout failed. Please try again from the app.');
                }
                return;
              }

              // Prefer known _ptxn id — event.data.id is often NOT a txn_ id
              const fromEvent =
                event.data && typeof event.data === 'object'
                  ? extractTxnId(
                      'transaction_id' in event.data
                        ? event.data.transaction_id
                        : 'transactionId' in event.data
                          ? event.data.transactionId
                          : 'id' in event.data
                            ? event.data.id
                            : null,
                    )
                  : null;

              const txnId = knownTxnId || fromEvent;
              if (!txnId) {
                setError('Payment succeeded but transaction id was missing.');
                return;
              }

              setStatus('Payment successful. Saving record…');
              const result = await fulfill(txnId);
              setStatus(
                result.ok
                  ? 'Saved. Returning to TOSMS…'
                  : `Paid. Save deferred (${result.error || 'unknown'}). Returning…`,
              );
              window.location.href = `${returnUrl}?transactionId=${encodeURIComponent(txnId)}`;
            })();
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
  }, [knownTxnId, returnUrl, apiBaseParam]);

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
