import { prisma } from './prisma';
import { sendWelcomeEmail as sendEmail } from './email';
export async function createAuditLog(
  userId: string,
  actionType: string,
  entityType?: string,
  entityId?: string,
  details?: any,
  hospitalId?: string,
  ipAddress?: string
) {
  await prisma.auditLog.create({
    data: {
      user_id: userId,
      hospital_id: hospitalId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      details: details,
      ip_address: ipAddress,
    },
  });
}

export function generateOTP(): string {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  try {
    await sendEmail(email, name, role);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}