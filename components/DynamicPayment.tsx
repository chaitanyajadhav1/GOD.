'use client';

import { useState } from 'react';

/**
 * Dynamic Payment Component with Amount Input and Payment Method Selection
 * 
 * Features:
 * - User can enter custom amount
 * - QR code generation for UPI payments
 * - Direct PhonePe redirect option
 * - Multiple payment methods
 */

interface DynamicPaymentProps {
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
  businessName?: string;
  description?: string;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DynamicPayment({
  onSuccess,
  onFailure,
  businessName = 'Your Business',
  description = 'Payment',
}: DynamicPaymentProps) {
  const [amount, setAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'phonepe' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  /**
   * Load Razorpay script
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
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
   * Create Razorpay order
   */
  const createOrder = async (amountInRupees: number) => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInRupees,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            description,
            paymentMethod,
            phoneNumber: phoneNumber || undefined,
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
   * Verify payment
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
   * Handle payment with selected method
   */
  const handlePayment = async () => {
    try {
      // Validate amount
      const amountValue = parseFloat(amount);
      if (!amountValue || amountValue <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      // Validate phone number for PhonePe
      if (paymentMethod === 'phonepe' && !phoneNumber) {
        setError('Please enter your phone number for PhonePe payment');
        return;
      }

      if (phoneNumber && !/^[6-9]\d{9}$/.test(phoneNumber)) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      setLoading(true);
      setError(null);
      setQrCode(null);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      // Create order
      const orderData = await createOrder(amountValue);

      // Configure Razorpay options based on payment method
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: businessName,
        description: `${description} - ₹${amountValue}`,
        order_id: orderData.orderId,
        
        handler: async function (response: any) {
          try {
            const verificationResult = await verifyPayment(response);
            console.log('Payment successful:', verificationResult);
            
            if (onSuccess) {
              onSuccess(verificationResult);
            }
            
            setLoading(false);
            setError(null);
          } catch (err: any) {
            console.error('Payment verification failed:', err);
            setError(err.message);
            setLoading(false);
            
            if (onFailure) {
              onFailure(err);
            }
          }
        },

        prefill: {
          contact: phoneNumber || '',
        },

        notes: {
          description,
          amount: amountValue,
        },

        theme: {
          color: '#3399cc',
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
          },
        },
      };

      // Configure payment method preferences
      if (paymentMethod === 'qr') {
        // Show only UPI payment method (which includes QR code)
        options.method = 'upi';
      } else if (paymentMethod === 'phonepe') {
        // Show UPI with preference for PhonePe
        options.method = 'upi';
        if (phoneNumber) {
          options.prefill.contact = phoneNumber;
        }
      }
      // For 'all' method, don't set any restrictions

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Enter Payment Details</h2>

        {/* Amount Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Payment Method Selection */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Payment Method</label>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="all"
                checked={paymentMethod === 'all'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                disabled={loading}
              />
              <span style={styles.radioText}>All Methods</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="qr"
                checked={paymentMethod === 'qr'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                disabled={loading}
              />
              <span style={styles.radioText}>UPI QR Code</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="phonepe"
                checked={paymentMethod === 'phonepe'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                disabled={loading}
              />
              <span style={styles.radioText}>PhonePe Direct</span>
            </label>
          </div>
        </div>

        {/* Phone Number Input (for PhonePe) */}
        {paymentMethod === 'phonepe' && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (for PhonePe)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              style={styles.input}
              disabled={loading}
            />
            <small style={styles.hint}>
              PhonePe will open on your phone automatically
            </small>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !amount}
          style={{
            ...styles.button,
            backgroundColor: loading || !amount ? '#cccccc' : '#3399cc',
            cursor: loading || !amount ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing...' : `Pay ₹${amount || '0'}`}
        </button>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Payment Method Info */}
        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Payment Method Info:</h4>
          {paymentMethod === 'all' && (
            <p style={styles.infoText}>
              ✓ Card, UPI, Net Banking, Wallets, and more
            </p>
          )}
          {paymentMethod === 'qr' && (
            <p style={styles.infoText}>
              ✓ Scan QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)
            </p>
          )}
          {paymentMethod === 'phonepe' && (
            <p style={styles.infoText}>
              ✓ Direct redirect to PhonePe app on your phone
              <br />
              ✓ Instant payment confirmation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.3s',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    transition: 'all 0.3s',
  },
  radioText: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#333',
  },
  hint: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: '#666',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    transition: 'background-color 0.3s',
    marginTop: '8px',
  },
  errorBox: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '8px',
    fontSize: '14px',
  },
  infoBox: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
    border: '1px solid #b3d9ff',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  infoText: {
    fontSize: '13px',
    color: '#555',
    margin: '4px 0',
    lineHeight: '1.6',
  },
};
