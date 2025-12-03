
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Create an audit log entry
 * @param data - Audit log data
 */
export async function createAuditLog(data: {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: data.userId,
      action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        timestamp: new Date(),
      } as any,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent blocking the main operation
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get user's IP address from request
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}
// Add these exports at the end of your utils.ts file

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  // TODO: Implement email sending logic
  console.log(`Welcome email would be sent to ${email} for ${name}`);
  return Promise.resolve();
}