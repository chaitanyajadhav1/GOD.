import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API Route: Razorpay Webhook Handler
 * 
 * Webhooks are server-to-server callbacks from Razorpay for payment events.
 * This provides reliable payment status updates even if user closes browser.
 * 
 * Security Best Practices:
 * 1. Verify webhook signature to ensure authenticity
 * 2. Use webhook secret from Razorpay dashboard
 * 3. Implement idempotency to handle duplicate webhooks
 * 4. Log all webhook events for audit trail
 * 5. Return 200 OK quickly to prevent retries
 * 
 * Setup Instructions:
 * 1. Go to Razorpay Dashboard > Settings > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/razorpay/webhook
 * 3. Select events: payment.authorized, payment.captured, payment.failed
 * 4. Copy webhook secret to RAZORPAY_WEBHOOK_SECRET env variable
 */

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      console.error('Webhook signature missing');
      return NextResponse.json(
        { error: 'Signature missing' },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload.payment.entity;

    console.log('Webhook received:', {
      event,
      paymentId: paymentEntity.id,
      orderId: paymentEntity.order_id,
      amount: paymentEntity.amount,
      status: paymentEntity.status,
    });

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
        // Payment has been authorized but not captured
        console.log('Payment authorized:', paymentEntity.id);
        // TODO: Update your database
        // await updatePaymentStatus(paymentEntity.order_id, 'authorized');
        break;

      case 'payment.captured':
        // Payment has been successfully captured
        console.log('Payment captured:', paymentEntity.id);
        // TODO: Update your database and fulfill order
        // await updatePaymentStatus(paymentEntity.order_id, 'captured');
        // await fulfillOrder(paymentEntity.order_id);
        // await sendConfirmationEmail(paymentEntity.email);
        break;

      case 'payment.failed':
        // Payment has failed
        console.log('Payment failed:', paymentEntity.id);
        // TODO: Update your database and notify user
        // await updatePaymentStatus(paymentEntity.order_id, 'failed');
        // await sendFailureNotification(paymentEntity.email);
        break;

      case 'order.paid':
        // Order has been paid (all payments captured)
        console.log('Order paid:', paymentEntity.id);
        // TODO: Mark order as completely paid
        // await markOrderPaid(paymentEntity.id);
        break;

      case 'refund.created':
        // Refund has been created
        console.log('Refund created:', paymentEntity.id);
        // TODO: Handle refund
        // await processRefund(paymentEntity.payment_id, paymentEntity.amount);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // Always return 200 OK to acknowledge receipt
    // Razorpay will retry if non-200 status is returned
    return NextResponse.json(
      { success: true, received: true },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    // Return 200 even on error to prevent retries
    // Log error for manual investigation
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 200 }
    );
  }
}

// Prevent other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
