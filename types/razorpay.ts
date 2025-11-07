/**
 * TypeScript Type Definitions for Razorpay Integration
 */

// Razorpay Order Types
export interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, any>;
  payment_capture?: 0 | 1;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

// Razorpay Payment Types
export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: 'card' | 'netbanking' | 'wallet' | 'emi' | 'upi';
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
}

// Payment Verification Types
export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

// Webhook Types
export interface WebhookPayload {
  entity: string;
  account_id: string;
  event: WebhookEvent;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    order?: {
      entity: RazorpayOrder;
    };
  };
  created_at: number;
}

export type WebhookEvent =
  | 'payment.authorized'
  | 'payment.captured'
  | 'payment.failed'
  | 'order.paid'
  | 'refund.created'
  | 'refund.processed'
  | 'refund.failed';

// Razorpay Checkout Options
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    ondismiss?: () => void;
    animation?: boolean;
  };
  subscription_id?: string;
  subscription_card_change?: boolean;
  recurring?: boolean;
  callback_url?: string;
  redirect?: boolean;
  customer_id?: string;
  remember_customer?: boolean;
  timeout?: number;
  readonly?: {
    contact?: boolean;
    email?: boolean;
    name?: boolean;
  };
  hidden?: {
    contact?: boolean;
    email?: boolean;
  };
  send_sms_hash?: boolean;
  allow_rotation?: boolean;
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  config?: {
    display?: {
      language?: string;
      hide?: Array<{
        method?: string;
      }>;
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
}

export interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Error Types
export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}

// API Response Types
export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  key?: string;
  error?: string;
  details?: string;
}

// Component Props Types
export interface RazorpayPaymentProps {
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
  theme?: {
    color?: string;
  };
  onSuccess?: (response: PaymentVerificationResponse) => void;
  onFailure?: (error: RazorpayError | Error) => void;
  notes?: Record<string, any>;
}

// Utility Types
export type PaymentStatus = 
  | 'created'
  | 'authorized'
  | 'captured'
  | 'refunded'
  | 'failed';

export type OrderStatus = 
  | 'created'
  | 'attempted'
  | 'paid';

export type PaymentMethod = 
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'emi'
  | 'upi';

// Environment Variables
export interface RazorpayEnv {
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
}
