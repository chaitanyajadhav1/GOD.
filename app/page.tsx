// 'use client';

// import { useAuth } from '@/components/AuthProvider';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { FileText, Users, Building2, Shield, Stethoscope, Heart, Phone, Lock, ArrowRight } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // EmailPasswordForm Component for Hospital Staff (DOCTOR/ADMIN)
// function EmailPasswordForm({ userType }: { userType: string }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { login } = useAuth();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         login(data.user, data.accessToken);
//         window.location.href = '/dashboard';
//       } else {
//         setError(data.error || 'Invalid credentials');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleLogin} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="email">Email Address</Label>
//         <div className="relative">
//           <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             id="email"
//             type="email"
//             required
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter your email"
//             className="pl-10"
//           />
//         </div>
//         <p className="text-sm text-muted-foreground">
//           Use the email address you received the invitation on
//         </p>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="password">Password</Label>
//         <div className="relative">
//           <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             id="password"
//             type="password"
//             required
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//             className="pl-10"
//           />
//         </div>
//       </div>

//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       <Button
//         type="submit"
//         disabled={isLoading || !email || !password}
//         className="w-full"
//       >
//         {isLoading ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//             Logging in...
//           </>
//         ) : (
//           <>
//             Login
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </>
//         )}
//       </Button>
//     </form>
//   );
// }

// // OTPForm Component for Patients/Users
// function OTPForm({ userType }: { userType: string }) {
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState<'mobile' | 'otp' | 'setup'>('mobile');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [countdown, setCountdown] = useState(0);
//   const [tempToken, setTempToken] = useState('');
//   const [setupData, setSetupData] = useState({ email: '', password: '', firstName: '', lastName: '' });
//   const { login } = useAuth();

//   const handleSendOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           mobileNumber,
//           purpose: 'LOGIN',
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setStep('otp');
//         setCountdown(60);
//         const timer = setInterval(() => {
//           setCountdown((prev) => {
//             if (prev <= 1) {
//               clearInterval(timer);
//               return 0;
//             }
//             return prev - 1;
//           });
//         }, 1000);
//       } else {
//         setError(data.error || 'Failed to send OTP');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/auth/verify-otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           mobileNumber,
//           otp,
//           userType: userType === 'USER' ? 'PATIENT' : userType,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.requiresSetup) {
//           setTempToken(data.tempToken);
//           setStep('setup');
//         } else {
//           login(data.user || {
//             id: data.user?.id || '',
//             mobileNumber: data.user?.mobileNumber || mobileNumber,
//             userType: data.user?.userType || userType,
//           }, data.accessToken || data.tempToken);
//           window.location.href = '/dashboard';
//         }
//       } else {
//         setError(data.error || 'Invalid OTP');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (countdown > 0) return;

//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           mobileNumber,
//           purpose: 'LOGIN',
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setCountdown(60);
//         const timer = setInterval(() => {
//           setCountdown((prev) => {
//             if (prev <= 1) {
//               clearInterval(timer);
//               return 0;
//             }
//             return prev - 1;
//           });
//         }, 1000);
//       } else {
//         setError(data.error || 'Failed to resend OTP');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatMobileNumber = (value: string) => {
//     const digits = value.replace(/\D/g, '');
    
//     if (digits.length <= 3) {
//       return digits;
//     } else if (digits.length <= 6) {
//       return `${digits.slice(0, 3)} ${digits.slice(3)}`;
//     } else if (digits.length <= 10) {
//       return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
//     } else {
//       return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
//     }
//   };

//   const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formatted = formatMobileNumber(e.target.value);
//     setMobileNumber(formatted);
//   };

//   const handleCompleteSetup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/auth/complete-setup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${tempToken}`,
//         },
//         body: JSON.stringify({
//           email: setupData.email,
//           password: setupData.password,
//           firstName: setupData.firstName,
//           lastName: setupData.lastName,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         login(data.user, data.accessToken);
//         window.location.href = '/dashboard';
//       } else {
//         setError(data.error || 'Failed to complete setup');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (step === 'mobile') {
//     return (
//       <form onSubmit={handleSendOTP} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="mobile">Mobile Number</Label>
//           <div className="relative">
//             <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="mobile"
//               type="tel"
//               required
//               value={mobileNumber}
//               onChange={handleMobileNumberChange}
//               placeholder="Enter 10-digit mobile number"
//               className="pl-10"
//               maxLength={12}
//             />
//           </div>
//           <p className="text-sm text-muted-foreground">
//             We'll send a 6-digit OTP to this number
//           </p>
//         </div>

//         {error && (
//           <Alert variant="destructive">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         <Button
//           type="submit"
//           disabled={isLoading || mobileNumber.replace(/\D/g, '').length !== 10}
//           className="w-full"
//         >
//           {isLoading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Sending OTP...
//             </>
//           ) : (
//             <>
//               Send OTP
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </>
//           )}
//         </Button>
//       </form>
//     );
//   }


//   if (step === 'otp') {
//     return (
//       <form onSubmit={handleVerifyOTP} className="space-y-4">
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <Label htmlFor="otp">Enter OTP</Label>
//             <span className="text-sm text-muted-foreground">
//               Sent to {mobileNumber}
//             </span>
//           </div>
//           <div className="relative">
//             <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="otp"
//               type="text"
//               required
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//               placeholder="Enter 6-digit OTP"
//               className="pl-10 text-center text-lg tracking-widest"
//               maxLength={6}
//             />
//           </div>
          
//           <div className="flex justify-between items-center">
//             <Button
//               type="button"
//               variant="link"
//               onClick={() => setStep('mobile')}
//               className="text-sm px-0"
//             >
//               Change number
//             </Button>
            
//             <Button
//               type="button"
//               variant="link"
//               onClick={handleResendOTP}
//               disabled={countdown > 0 || isLoading}
//               className="text-sm px-0"
//             >
//               {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
//             </Button>
//           </div>
//         </div>

//         {error && (
//           <Alert variant="destructive">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         <Button
//           type="submit"
//           disabled={isLoading || otp.length !== 6}
//           className="w-full"
//         >
//           {isLoading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Verifying...
//             </>
//           ) : (
//             <>
//               Verify OTP
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </>
//           )}
//         </Button>
//       </form>
//     );
//   }

//   // Setup form for new users
//   return (
//     <form onSubmit={handleCompleteSetup} className="space-y-4">
//       <div>
//         <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
//         <p className="text-sm text-muted-foreground mb-4">
//           Please provide your details to complete your registration
//         </p>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="firstName">First Name</Label>
//           <Input
//             id="firstName"
//             type="text"
//             value={setupData.firstName}
//             onChange={(e) => setSetupData({ ...setupData, firstName: e.target.value })}
//             placeholder="First name"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="lastName">Last Name</Label>
//           <Input
//             id="lastName"
//             type="text"
//             value={setupData.lastName}
//             onChange={(e) => setSetupData({ ...setupData, lastName: e.target.value })}
//             placeholder="Last name"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="setupEmail">Email Address</Label>
//         <div className="relative">
//           <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             id="setupEmail"
//             type="email"
//             required
//             value={setupData.email}
//             onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
//             placeholder="Enter your email"
//             className="pl-10"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="setupPassword">Password</Label>
//         <div className="relative">
//           <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             id="setupPassword"
//             type="password"
//             required
//             value={setupData.password}
//             onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
//             placeholder="Set a strong password (min 8 chars)"
//             className="pl-10"
//           />
//         </div>
//         <p className="text-sm text-muted-foreground">
//           Password must be at least 8 characters with uppercase, lowercase, number, and special character
//         </p>
//       </div>

//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       <div className="flex gap-3">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => setStep('otp')}
//           className="flex-1"
//         >
//           Back
//         </Button>
//         <Button
//           type="submit"
//           disabled={isLoading || !setupData.email || !setupData.password}
//           className="flex-1"
//         >
//           {isLoading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Completing...
//             </>
//           ) : (
//             <>
//               Complete Setup
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </>
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }

// // Main Home Component
// export default function Home() {
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();
//   const [userType, setUserType] = useState<'USER' | 'DOCTOR' | 'ADMIN' | 'SUPER_ADMIN'>('USER');
//   const [patientLoginMode, setPatientLoginMode] = useState<'otp' | 'password'>('otp');

//   useEffect(() => {
//     if (isAuthenticated && !isLoading) {
//       router.push('/dashboard');
//     }
//   }, [isAuthenticated, isLoading, router]);

//   if (isLoading || isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo/Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <Building2 className="h-12 w-12 text-blue-600" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             Hospital Management System
//           </h1>
//           <p className="text-sm text-gray-600">
//             Secure access to your account
//           </p>
//         </div>

//         {/* Login Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Login</CardTitle>
//             <CardDescription>
//               {userType === 'DOCTOR' || userType === 'ADMIN' || userType === 'SUPER_ADMIN'
//                 ? 'Enter your email and password' 
//                 : 'Enter your mobile number to receive OTP'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Role Selection */}
//             <div className="grid grid-cols-2 gap-3">
//               <Button
//                 type="button"
//                 variant={userType === 'USER' ? 'default' : 'outline'}
//                 onClick={() => setUserType('USER')}
//                 className="flex flex-col h-auto py-3"
//               >
//                 <Users className="w-5 h-5 mb-1" />
//                 <span className="text-xs font-medium">Patient</span>
//               </Button>

//               <Button
//                 type="button"
//                 variant={userType === 'DOCTOR' ? 'default' : 'outline'}
//                 onClick={() => setUserType('DOCTOR')}
//                 className="flex flex-col h-auto py-3"
//               >
//                 <Stethoscope className="w-5 h-5 mb-1" />
//                 <span className="text-xs font-medium">Doctor</span>
//               </Button>

//               <Button
//                 type="button"
//                 variant={userType === 'ADMIN' ? 'default' : 'outline'}
//                 onClick={() => setUserType('ADMIN')}
//                 className="flex flex-col h-auto py-3"
//               >
//                 <Shield className="w-5 h-5 mb-1" />
//                 <span className="text-xs font-medium">Admin</span>
//               </Button>

//               <Button
//                 type="button"
//                 variant={userType === 'SUPER_ADMIN' ? 'default' : 'outline'}
//                 onClick={() => setUserType('SUPER_ADMIN')}
//                 className="flex flex-col h-auto py-3"
//               >
//                 <Shield className="w-5 h-5 mb-1" />
//                 <span className="text-xs font-medium">Super Admin</span>
//               </Button>
//             </div>

//             {/* Patients: OTP initially, password after setup */}
//             {userType === 'USER' ? (
//               <Tabs value={patientLoginMode} onValueChange={(v) => setPatientLoginMode(v as 'otp' | 'password')}>
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="otp">OTP Login</TabsTrigger>
//                   <TabsTrigger value="password">Password Login</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="otp">
//                   <OTPForm userType={userType} />
//                 </TabsContent>
//                 <TabsContent value="password">
//                   <EmailPasswordForm userType={'USER'} />
//                 </TabsContent>
//               </Tabs>
//             ) : (
//               <EmailPasswordForm userType={userType} />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Home() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
        // Check if user is Super Admin
        if (data.user.userType !== 'SUPER_ADMIN') {
          setError('Access denied. Super Admin credentials required.');
          return;
        }

        login(data.user, data.accessToken);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hospital Management System
          </h1>
          <p className="text-sm text-gray-600">
            Super Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Super Admin Login</CardTitle>
            <CardDescription>
              Enter your email and password to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full"
              >
                {isSubmitting ? (
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
              </Button>
            </form>
            
            {/* Link to create Super Admin */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-muted-foreground mb-2">
                Don't have a Super Admin account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/create-super-admin')}
                className="w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                Create Super Admin Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}