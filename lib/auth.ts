// lib/auth.ts

import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from './constants';

export interface TokenPayload {
  userId: string;
  userType: string;
  mobileNumber: string;
}

// ==================== JWT Token Functions ====================

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET!, 
    {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    }
  );
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    payload, 
    process.env.JWT_REFRESH_SECRET!, 
    {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}

// ==================== Phone Validation Functions ====================

/**
 * Validates Indian mobile number format
 * Accepts: 9876543210, 919876543210, +919876543210
 * Must start with digits 6-9
 */
export function validateIndianPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Validate: optional +91 or 91, then digit 6-9, then 9 more digits
  const regex = /^(\+91|91)?[6-9]\d{9}$/;
  
  return regex.test(cleaned);
}

/**
 * Normalizes phone number to +91XXXXXXXXXX format
 * Examples:
 * - 9876543210 → +919876543210
 * - 919876543210 → +919876543210
 * - +919876543210 → +919876543210
 */
export function normalizeIndianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  if (cleaned.startsWith('+91')) {
    return cleaned;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  } else if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  return cleaned; // Return as-is if format is unexpected
}

// ==================== Password Validation Functions ====================

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Quick password validation - returns boolean only
 */
export function isPasswordValid(password: string): boolean {
  return validatePassword(password).valid;
}

/**
 * Get password strength level
 * Returns: 'weak' | 'medium' | 'strong' | 'very-strong'
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;
  if (password.length >= 16) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  if (strength <= 5) return 'strong';
  return 'very-strong';
}

// ==================== Email Validation ====================

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates email with additional checks
 */
export function validateEmailStrict(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Check for common typos in domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  const suspiciousDomains = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
  
  if (suspiciousDomains.includes(domain)) {
    return { valid: false, error: 'Please check your email domain for typos' };
  }
  
  return { valid: true };
}

// ==================== Token Extraction Helpers ====================

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Extract user ID from token without full verification
 * Useful for logging/debugging only - DO NOT use for authorization
 */
export function decodeTokenUnsafe(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

// ==================== RBAC Helper Functions ====================

/**
 * Check if user has required role
 */
export function hasRole(userType: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userType);
}

/**
 * Check if user is admin or super user
 */
export function isAdminOrSuperUser(userType: string): boolean {
  return userType === 'ADMIN' || userType === 'SUPER_USER';
}

/**
 * Check if user is doctor
 */
export function isDoctor(userType: string): boolean {
  return userType === 'DOCTOR';
}

/**
 * Check if user is patient/regular user
 */
export function isPatient(userType: string): boolean {
  return userType === 'USER' || userType === 'FAMILY_MEMBER';
}



// Add this function to check user roles
export function isSuperAdmin(userType: string): boolean {
  return userType === 'SUPER_ADMIN';
}

export function isHospitalAdmin(userType: string): boolean {
  return userType === 'HOSPITAL_ADMIN';
}

// Update the existing role checking functions:
