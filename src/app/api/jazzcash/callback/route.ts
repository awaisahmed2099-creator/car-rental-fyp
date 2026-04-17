import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const integrityKey = process.env.NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT;

    // Extract response data from JazzCash
    const ppResponseCode = formData.get('pp_ResponseCode')?.toString()|| '';
    const ppTxnRefNo = formData.get('pp_TxnRefNo')?.toString() || '';
    const ppAmount = formData.get('pp_Amount')?.toString() || '';
    const ppBillReference = formData.get('pp_BillReference')?.toString() || '';
    const ppSecureHash = formData.get('pp_SecureHash')?.toString() || '';

    // Verify hash
    if (integrityKey) {
      const signatureString = `${integrityKey}&${ppAmount}&${ppBillReference}&${ppResponseCode}&${ppTxnRefNo}`;
      const expectedHash = crypto
        .createHmac('sha256', integrityKey)
        .update(signatureString)
        .digest('hex')
        .toUpperCase();

      if (ppSecureHash !== expectedHash) {
        console.error('Hash verification failed');
        return NextResponse.redirect(
          new URL(`/booking/failed?reason=invalid_hash`, request.nextUrl.origin),
          { status: 303 }
        );
      }
    }

    // Check response code (000 = success)
    const isSuccess = ppResponseCode === '000';
    const bookingId = ppBillReference;

    if (isSuccess && bookingId) {
      // Update booking in Firestore
      try {
        const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
        await updateDoc(bookingRef, {
          paymentStatus: 'paid',
          bookingStatus: 'active',
          txnRefNo: ppTxnRefNo,
        });

        return NextResponse.redirect(
          new URL(`/booking/success?bookingId=${bookingId}`, request.nextUrl.origin),
          { status: 303 }
        );
      } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.redirect(
          new URL(`/booking/failed?reason=update_error`, request.nextUrl.origin),
          { status: 303 }
        );
      }
    } else {
      // Payment failed
      if (bookingId) {
        try {
          const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
          await updateDoc(bookingRef, {
            paymentStatus: 'failed',
          });
        } catch (error) {
          console.error('Error updating failed booking:', error);
        }
      }

      return NextResponse.redirect(
        new URL(`/booking/failed?bookingId=${bookingId}&code=${ppResponseCode}`, request.nextUrl.origin),
        { status: 303 }
      );
    }
  } catch (error) {
    console.error('JazzCash callback error:', error);
    return NextResponse.redirect(
      new URL('/booking/failed?reason=callback_error', request.nextUrl.origin),
      { status: 303 }
    );
  }
}
