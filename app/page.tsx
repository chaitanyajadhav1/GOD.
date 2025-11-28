'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Users, Building2, Shield, Stethoscope, Heart, Phone, Lock, ArrowRight } from 'lucide-react';

// EmailPasswordForm Component for Hospital Staff (DOCTOR/ADMIN)
function EmailPasswordForm({ userType }: { userType: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        login(data.user, data.accessToken);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Use the email address you received the invitation on
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Logging in...
          </>
        ) : (
          <>
            Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

// OTPForm Component for Patients/Users
function OTPForm({ userType }: { userType: string }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp' | 'setup'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [tempToken, setTempToken] = useState('');
  const [setupData, setSetupData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const { login } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          purpose: 'LOGIN',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setCountdown(60); // 60 seconds countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          otp,
          userType: userType === 'USER' ? 'PATIENT' : userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresSetup) {
          // New user - show setup form
          setTempToken(data.tempToken);
          setStep('setup');
        } else {
          // Existing user - store token and redirect to dashboard
          login(data.user || {
            id: data.user?.id || '',
            mobileNumber: data.user?.mobileNumber || mobileNumber,
            userType: data.user?.userType || userType,
          }, data.accessToken || data.tempToken);
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          purpose: 'LOGIN',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as Indian mobile number (10 digits)
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobileNumber(e.target.value);
    setMobileNumber(formatted);
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          email: setupData.email,
          password: setupData.password,
          firstName: setupData.firstName,
          lastName: setupData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data, then redirect to dashboard
        login(data.user, data.accessToken);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Failed to complete setup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'mobile') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-6">
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="mobile"
              type="tel"
              required
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              placeholder="Enter 10-digit mobile number"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              maxLength={12} // 3 spaces + 10 digits
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            We'll send a 6-digit OTP to this number
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || mobileNumber.replace(/\D/g, '').length !== 10}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending OTP...
            </>
          ) : (
            <>
              Send OTP
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    );
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Enter OTP
          </label>
          <span className="text-sm text-gray-500">
            Sent to {mobileNumber}
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={() => setStep('mobile')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Change number
          </button>
          
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || otp.length !== 6}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Verifying...
          </>
        ) : (
          <>
            Verify OTP
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
    </form>
    );
  }

  // Setup form for new users
  return (
    <form onSubmit={handleCompleteSetup} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Profile</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please provide your details to complete your registration
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={setupData.firstName}
            onChange={(e) => setSetupData({ ...setupData, firstName: e.target.value })}
            placeholder="First name"
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={setupData.lastName}
            onChange={(e) => setSetupData({ ...setupData, lastName: e.target.value })}
            placeholder="Last name"
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="setupEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="setupEmail"
            type="email"
            required
            value={setupData.email}
            onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
            placeholder="Enter your email"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="setupPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="setupPassword"
            type="password"
            required
            value={setupData.password}
            onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
            placeholder="Set a strong password (min 8 chars)"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Password must be at least 8 characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep('otp')}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !setupData.email || !setupData.password}
          className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Completing...
            </>
          ) : (
            <>
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Main Home Component
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<'USER' | 'DOCTOR' | 'ADMIN' | 'SUPER_ADMIN'>('USER');
  const [patientLoginMode, setPatientLoginMode] = useState<'otp' | 'password'>('otp');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hospital Management System
          </h1>
          <p className="text-sm text-gray-600">
            Secure access to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Login</h2>
            <p className="text-sm text-gray-600">
              {userType === 'DOCTOR' || userType === 'ADMIN' || userType === 'SUPER_ADMIN'
                ? 'Enter your email and password' 
                : 'Enter your mobile number to receive OTP'}
            </p>
          </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setUserType('USER')}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  userType === 'USER'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Users className={`w-5 h-5 mx-auto mb-1 ${
                  userType === 'USER' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-xs font-medium">Patient</span>
              </button>

              <button
                onClick={() => setUserType('DOCTOR')}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  userType === 'DOCTOR'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Stethoscope className={`w-5 h-5 mx-auto mb-1 ${
                  userType === 'DOCTOR' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-xs font-medium">Doctor</span>
              </button>

              <button
                onClick={() => setUserType('ADMIN')}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  userType === 'ADMIN'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Shield className={`w-5 h-5 mx-auto mb-1 ${
                  userType === 'ADMIN' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-xs font-medium">Admin</span>
              </button>

              <button
                onClick={() => setUserType('SUPER_ADMIN')}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  userType === 'SUPER_ADMIN'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Shield className={`w-5 h-5 mx-auto mb-1 ${
                  userType === 'SUPER_ADMIN' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-xs font-medium">Super Admin</span>
              </button>
            </div>

            {/* Patients: OTP initially, password after setup */}
            {userType === 'USER' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPatientLoginMode('otp')}
                    className={`px-3 py-1 rounded-md text-sm ${patientLoginMode === 'otp' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >OTP Login</button>
                  <button
                    onClick={() => setPatientLoginMode('password')}
                    className={`px-3 py-1 rounded-md text-sm ${patientLoginMode === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >Password Login</button>
                </div>
                {patientLoginMode === 'otp' ? (
                  <OTPForm userType={userType} />
                ) : (
                  <EmailPasswordForm userType={'USER'} />
                )}
              </div>
            ) : (
              <EmailPasswordForm userType={userType} />
            )}
          </div>
        </div>
      </div>
  );
}