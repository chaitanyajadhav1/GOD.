export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '7d', // 7 days - reasonable for web app
  REFRESH_TOKEN_EXPIRY: '30d', // 30 days
} as const;

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
} as const;

export const USER_TYPES = {
  SUPER_USER: 'SUPER_USER',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  USER: 'USER',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
} as const;

export const PROFILE_TYPES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
} as const;

export const RELATIONSHIPS = {
  SELF: 'SELF',
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD',
  PARENT: 'PARENT',
  OTHER: 'OTHER',
} as const;