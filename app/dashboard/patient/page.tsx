'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import UserDashboard from '../components/UserDashboard';

export default function PatientDashboard() {
  return <UserDashboard />;
}

