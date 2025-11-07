import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * API Route: Create Razorpay Order
 * 
 * Security Best Practices:
 * 1. Server-side only - secret key never exposed to client
 * 2. Environment variables for sensitive credentials
 * 3. Input validation and sanitization
 * 4. HTTPS required in production
 * 5. Rate limiting recommended (implement via middleware)
 */

// Initialize Razorpay instance with credentials from environment variables
// CRITICAL: RAZORPAY_KEY_SECRET must NEVER be exposed to the frontend
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    // Input validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be greater than 0.' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create Razorpay order
    // Amount should be in smallest currency unit (paise for INR)
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (₹1 = 100 paise)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      // Optional: Add payment capture settings
      payment_capture: 1, // Auto capture payment (1 = auto, 0 = manual)
    };

    const order = await razorpay.orders.create(options);

    // Log order creation (remove in production or use proper logging service)
    console.log('Order created successfully:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

    // Return order details to frontend
    // Only send necessary information
    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Safe to send public key
      },
      { status: 200 }
    );

  } catch (error: any) {
    // Error handling with security in mind
    console.error('Error creating Razorpay order:', error);
    
    // Don't expose internal error details to client
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order. Please try again.',
        // In development, you might want to include error details
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message 
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
