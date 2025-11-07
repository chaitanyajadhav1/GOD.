'use client';

import { useState } from 'react';

/**
 * Razorpay Payment Component
 * 
 * Security Features:
 * 1. Loads Razorpay script dynamically from official CDN
 * 2. Never exposes secret key (uses public key only)
 * 3. Server-side signature verification after payment
 * 4. Handles payment failures gracefully
 * 
 * Props:
 * - amount: Payment amount in INR (e.g., 500 for ₹500)
 * - currency: Currency code (default: 'INR')
 * - name: Business/Product name
 * - description: Payment description
 * - onSuccess: Callback on successful payment
 * - onFailure: Callback on payment failure
 */

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  amount,
  currency = 'INR',
  name,
  description,
  image,
  prefill,
  notes,
  theme,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load Razorpay script dynamically
   * This ensures PCI compliance by loading from official Razorpay CDN
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Create Razorpay order via backend API
   */
  const createOrder = async () => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            description,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create order');
    }
  };

  /**
   * Verify payment signature via backend API
   */
  const verifyPayment = async (paymentData: any) => {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Payment verification failed');
    }
  };

  /**
   * Handle payment process
   */
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Step 2: Create order on backend
      const orderData = await createOrder();

      // Step 3: Configure Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: name,
        description: description,
        image: image,
        order_id: orderData.orderId,
        
        // Payment success handler
        handler: async function (response: any) {
          try {
            // Verify payment signature on backend
            const verificationResult = await verifyPayment(response);
            
            console.log('Payment successful:', verificationResult);
            
            // Call success callback
            if (onSuccess) {
              onSuccess(verificationResult);
            }
            
            setLoading(false);
          } catch (err: any) {
            console.error('Payment verification failed:', err);
            setError(err.message);
            setLoading(false);
            
            if (onFailure) {
              onFailure(err);
            }
          }
        },

        // Prefill customer details (optional)
        prefill: prefill || {
          name: '',
          email: '',
          contact: '',
        },

        // Additional notes (optional)
        notes: notes || {
          description: description,
        },

        // Theme customization
        theme: {
          color: theme?.color || '#3399cc',
        },

        // Modal close handler
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
          },
        },
      };

      // Step 4: Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        setError(response.error.description || 'Payment failed');
        setLoading(false);
        
        if (onFailure) {
          onFailure(response.error);
        }
      });

      razorpay.open();

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      setLoading(false);
      
      if (onFailure) {
        onFailure(err);
      }
    }
  };

  return (
    <div className="razorpay-payment-container">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="payment-button"
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: loading ? '#cccccc' : '#3399cc',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s',
        }}
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>

      {error && (
        <div
          className="error-message"
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
