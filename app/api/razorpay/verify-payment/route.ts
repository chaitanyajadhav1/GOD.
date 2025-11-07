import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API Route: Verify Razorpay Payment Signature
 * 
 * Security Best Practices:
 * 1. Server-side signature verification prevents payment tampering
 * 2. Uses HMAC SHA256 cryptographic verification
 * 3. Secret key stays server-side only
 * 4. Validates all required parameters
 * 5. Implements timing-safe comparison
 * 
 * PCI Compliance Notes:
 * - No card data is stored or processed
 * - All sensitive operations handled by Razorpay
 * - Only payment metadata is verified
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payment verification parameters',
        },
        { status: 400 }
      );
    }

    // Validate environment variable
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay secret key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification not configured',
        },
        { status: 500 }
      );
    }

    // Generate signature for verification
    // Format: order_id|payment_id
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (isValid) {
      // Payment signature is valid
      console.log('Payment verified successfully:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      // TODO: Update your database here
      // Example: Mark order as paid, update user subscription, etc.
      // await updateOrderStatus(razorpay_order_id, 'paid');
      // await sendConfirmationEmail(razorpay_payment_id);

      return NextResponse.json(
        {
          success: true,
          message: 'Payment verified successfully',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        },
        { status: 200 }
      );
    } else {
      // Invalid signature - potential tampering
      console.error('Payment verification failed: Invalid signature', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed. Invalid signature.',
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error verifying payment:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed. Please contact support.',
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
        }),
      },
      { status: 500 }
    );
  }
}

// Prevent GET requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
