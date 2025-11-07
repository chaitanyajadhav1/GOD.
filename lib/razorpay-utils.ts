/**
 * Razorpay Utility Functions
 * 
 * Helper functions for Razorpay integration
 */

/**
 * Convert amount to paise (smallest currency unit)
 * Razorpay requires amount in paise (1 INR = 100 paise)
 * 
 * @param amount - Amount in INR
 * @returns Amount in paise
 */
export function convertToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert paise to INR
 * 
 * @param paise - Amount in paise
 * @returns Amount in INR
 */
export function convertToINR(paise: number): number {
  return paise / 100;
}

/**
 * Format amount for display
 * 
 * @param amount - Amount in INR
 * @param currency - Currency code (default: INR)
 * @returns Formatted amount string
 */
export function formatAmount(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Generate unique receipt ID
 * 
 * @param prefix - Optional prefix for receipt ID
 * @returns Unique receipt ID
 */
export function generateReceiptId(prefix: string = 'receipt'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate Razorpay order ID format
 * 
 * @param orderId - Order ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidOrderId(orderId: string): boolean {
  return /^order_[A-Za-z0-9]{14}$/.test(orderId);
}

/**
 * Validate Razorpay payment ID format
 * 
 * @param paymentId - Payment ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidPaymentId(paymentId: string): boolean {
  return /^pay_[A-Za-z0-9]{14}$/.test(paymentId);
}

/**
 * Get payment status display text
 * 
 * @param status - Razorpay payment status
 * @returns User-friendly status text
 */
export function getPaymentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    created: 'Payment Initiated',
    authorized: 'Payment Authorized',
    captured: 'Payment Successful',
    refunded: 'Payment Refunded',
    failed: 'Payment Failed',
  };
  
  return statusMap[status] || status;
}

/**
 * Get payment status color for UI
 * 
 * @param status - Razorpay payment status
 * @returns Color code for status
 */
export function getPaymentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    created: '#FFA500',    // Orange
    authorized: '#1E90FF', // Blue
    captured: '#28A745',   // Green
    refunded: '#6C757D',   // Gray
    failed: '#DC3545',     // Red
  };
  
  return colorMap[status] || '#6C757D';
}

/**
 * Validate amount
 * 
 * @param amount - Amount to validate
 * @param min - Minimum allowed amount (default: 1)
 * @param max - Maximum allowed amount (default: 10000000)
 * @returns Validation result
 */
export function validateAmount(
  amount: number,
  min: number = 1,
  max: number = 10000000
): { valid: boolean; error?: string } {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (amount < min) {
    return { valid: false, error: `Amount must be at least ₹${min}` };
  }
  
  if (amount > max) {
    return { valid: false, error: `Amount cannot exceed ₹${max}` };
  }
  
  return { valid: true };
}

/**
 * Parse webhook event payload
 * 
 * @param payload - Webhook payload
 * @returns Parsed event data
 */
export function parseWebhookPayload(payload: any) {
  const event = payload.event;
  const entity = payload.payload.payment?.entity || payload.payload.order?.entity;
  
  return {
    event,
    entityType: event.split('.')[0],
    entityId: entity.id,
    orderId: entity.order_id,
    amount: entity.amount,
    currency: entity.currency,
    status: entity.status,
    method: entity.method,
    email: entity.email,
    contact: entity.contact,
    createdAt: new Date(entity.created_at * 1000),
  };
}

/**
 * Check if payment is successful
 * 
 * @param status - Payment status
 * @returns True if payment is successful
 */
export function isPaymentSuccessful(status: string): boolean {
  return status === 'captured' || status === 'authorized';
}

/**
 * Get Razorpay checkout options
 * 
 * @param config - Configuration options
 * @returns Razorpay checkout options
 */
export function getRazorpayCheckoutOptions(config: {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}) {
  return {
    key: config.key,
    amount: convertToPaise(config.amount),
    currency: config.currency,
    name: config.name,
    description: config.description,
    order_id: config.orderId,
    handler: config.handler,
    prefill: config.prefill || {},
    theme: {
      color: config.theme?.color || '#3399cc',
    },
    modal: {
      ondismiss: config.modal?.ondismiss || (() => {}),
    },
  };
}

/**
 * Sanitize payment data for logging
 * Removes sensitive information
 * 
 * @param data - Payment data
 * @returns Sanitized data safe for logging
 */
export function sanitizePaymentData(data: any): any {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  delete sanitized.razorpay_signature;
  delete sanitized.card;
  delete sanitized.bank;
  
  // Mask email
  if (sanitized.email) {
    const [name, domain] = sanitized.email.split('@');
    sanitized.email = `${name.substring(0, 2)}***@${domain}`;
  }
  
  // Mask contact
  if (sanitized.contact) {
    sanitized.contact = `***${sanitized.contact.slice(-4)}`;
  }
  
  return sanitized;
}
