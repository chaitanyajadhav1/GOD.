// White label branding configuration
export interface BrandingConfig {
  appName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  companyName?: string;
  supportEmail?: string;
}

// Default branding - can be customized per deployment
export const branding: BrandingConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Hospital Management System',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#2563eb', // blue-600
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#7c3aed', // purple-600
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',
};

// Get CSS variables for dynamic theming
export function getBrandingStyles(): React.CSSProperties {
  return {
    '--primary-color': branding.primaryColor,
    '--secondary-color': branding.secondaryColor,
  } as React.CSSProperties;
}