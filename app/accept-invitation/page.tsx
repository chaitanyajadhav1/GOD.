'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const [token, setToken] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token') || '';
    setToken(t);
  }, [searchParams]);

  const isValidIndianMobile = (value: string) => {
    const cleaned = value.replace(/[\s\-()]/g, '');
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  const normalizeIndianMobile = (value: string) => {
    const cleaned = value.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+91')) return cleaned;
    if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
    if (cleaned.length === 10) return '+91' + cleaned;
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invitation token missing');
      return;
    }
    if (!isValidIndianMobile(mobileNumber)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          mobileNumber: normalizeIndianMobile(mobileNumber),
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation');
        return;
      }

      setAccepted(true);
      login(data.user, data.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Invitation Link Invalid</h1>
          <p className="mt-2 text-gray-600">Missing or invalid token in the link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Accept Invitation</h1>
        <p className="mt-2 text-gray-600">Enter your details to activate your account.</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength={12}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || accepted}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Accept Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
}