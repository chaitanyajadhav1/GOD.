import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Hospital Management System - Professional Medical Platform',
  description: 'Comprehensive hospital administration, patient care, and medical records management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}