//app/create-super-admin/page.tsx

'use client';

import { useState } from 'react';
import { Shield, Lock, Mail, Phone, User, Key, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateSuperAdmin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    secretCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    firstName: '',
    lastName: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'verify' | 'create'>('verify');
  const [verifiedCode, setVerifiedCode] = useState(''); // Store verified code in memory

  const handleVerifySecretCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-secret-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretCode: formData.secretCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerifiedCode(formData.secretCode); // Store in component state
        setStep('create');
      } else {
        setError(data.error || 'Invalid secret code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
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
    setFormData({ ...formData, mobileNumber: formatted });
  };

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      setIsLoading(false);
      return;
    }

    // Validate mobile number
    const cleanedMobile = formData.mobileNumber.replace(/\D/g, '');
    if (cleanedMobile.length !== 10 || !['6', '7', '8', '9'].includes(cleanedMobile[0])) {
      setError('Invalid mobile number. Must be 10 digits starting with 6-9');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/create-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretCode: verifiedCode, // Use the verified code from memory
          email: formData.email,
          password: formData.password,
          mobileNumber: cleanedMobile,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Clear sensitive data from memory
        setVerifiedCode('');
        setFormData({
          secretCode: '',
          email: '',
          password: '',
          confirmPassword: '',
          mobileNumber: '',
          firstName: '',
          lastName: '',
        });
      } else {
        setError(data.error || 'Failed to create Super Admin');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('verify');
    setVerifiedCode('');
    setError('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Super Admin Created Successfully!
              </h2>
              <p className="text-gray-600 mb-2">
                Your Super Admin account has been created.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Save your credentials securely. You can now login using your email and password.
                </p>
              </div>
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Super Admin
            </h1>
            <p className="text-sm text-gray-600">
              Enter the secret code to continue
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Verification</CardTitle>
              <CardDescription>
                This secret code is required to create a Super Admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifySecretCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secretCode">Secret Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="secretCode"
                      type="password"
                      required
                      value={formData.secretCode}
                      onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                      placeholder="Enter secret code"
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contact your system administrator if you don't have the secret code
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.secretCode}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Super Admin
          </h1>
          <p className="text-sm text-gray-600">
            Fill in the details to create a new Super Admin account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Super Admin Details</CardTitle>
            <CardDescription>
              Provide the required information to create the account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last name"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={handleMobileNumberChange}
                    placeholder="Enter 10-digit mobile number"
                    className="pl-10"
                    maxLength={12}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Indian mobile number (10 digits starting with 6-9)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Set a strong password"
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Min 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Super Admin
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}