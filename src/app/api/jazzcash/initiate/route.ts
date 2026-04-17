import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { amount, bookingId, customerPhone, description } = await request.json();

    // Validate required request fields
    if (!amount || !bookingId || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, bookingId, customerPhone' },
        { status: 400 }
      );
    }

    // JazzCash credentials from environment
    const merchantId = process.env.NEXT_PUBLIC_JAZZCASH_MERCHANT_ID;
    const password = process.env.NEXT_PUBLIC_JAZZCASH_PASSWORD;
    const integrityKey = process.env.NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT;

    // Check for missing environment variables
    const missingVars = [];
    if (!merchantId) missingVars.push('NEXT_PUBLIC_JAZZCASH_MERCHANT_ID');
    if (!password) missingVars.push('NEXT_PUBLIC_JAZZCASH_PASSWORD');
    if (!integrityKey) missingVars.push('NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT');

    if (missingVars.length > 0) {
      console.error('Missing JazzCash environment variables:', missingVars);
      return NextResponse.json(
        { 
          error: `JazzCash configuration incomplete. Missing: ${missingVars.join(', ')}. Please set these in your .env.local file.`,
          missingVars 
        },
        { status: 500 }
      );
    }

    // TypeScript assertions after validation
    const authenticatedMerchantId = merchantId as string;
    const authenticatedPassword = password as string;
    const authenticatedIntegrityKey = integrityKey as string;

    // Generate transaction reference
    const txnRefNo = `DR${Date.now()}${Math.random().toString(9).substr(2, 5)}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jazzcash/callback`;
    const lang = 'en';
    const txnType = 'MWALLET';
    const ppDesc = description || 'Car Rental Booking';
    const billRef = bookingId;

    // Build signature string
    const signatureString = `${authenticatedIntegrityKey}&${amount}&${billRef}&${ppDesc}&${lang}&${authenticatedMerchantId}&${authenticatedPassword}&${returnUrl}&${txnRefNo}&${txnType}`;

    // Generate HMAC-SHA256 hash
    const hash = crypto
      .createHmac('sha256', authenticatedIntegrityKey)
      .update(signatureString)
      .digest('hex')
      .toUpperCase();

    // Prepare form data
    const formData = {
      pp_merchant_id: authenticatedMerchantId,
      pp_password: authenticatedPassword,
      pp_Amount: Math.round(parseFloat(amount.toString()) * 100).toString(), // Convert to paisa
      pp_TxnRefNo: txnRefNo,
      pp_TxnType: txnType,
      pp_Language: lang,
      pp_Description: ppDesc,
      pp_BillReference: billRef,
      pp_ReturnURL: returnUrl,
      pp_CNIC: '', // Optional
      pp_CustomerEmail: '', // Optional
      pp_CustomerMobile: customerPhone,
      pp_SecureHash: hash,
      pp_IsContractPayment: '0',
      pp_SubMerchantId: '',
      pp_DiscountedAmount: '',
      pp_DiscountBank: '',
      pp_BankID: '',
    };

    return NextResponse.json({
      success: true,
      formData,
      redirectUrl: 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/DoTransaction/DoTransaction',
      txnRefNo,
    });
  } catch (error) {
    console.error('JazzCash initiate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to initiate payment: ${errorMessage}` },
      { status: 500 }
    );
  }
}
