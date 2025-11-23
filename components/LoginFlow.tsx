// components/LoginFlow.tsx

'use client';

import { useState } from 'react';

export default function LoginFlow() {
  const [step, setStep] = useState<'phone' | 'otp' | 'setup' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: phone }),
    });
    
    if (res.ok) {
      setStep('otp');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: phone, otp }),
    });
    
    const data = await res.json();
    
    if (data.requiresSetup) {
      // New user - show setup form
      setTempToken(data.tempToken);
      setIsNewUser(true);
      setStep('setup');
    } else {
      // Existing user - redirect to dashboard
      localStorage.setItem('accessToken', data.accessToken);
      window.location.href = '/dashboard';
    }
  };

  // Step 3: Complete Setup (for new users)
  const handleCompleteSetup = async () => {
    const res = await fetch('/api/auth/complete-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      window.location.href = '/dashboard';
    }
  };

  // Alternative: Password Login
  const handlePasswordLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: phone, password }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      window.location.href = '/dashboard';
    }
  };

  return (
    <div>
      {step === 'phone' && (
        <div>
          <input 
            type="tel" 
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleSendOTP}>Send OTP</button>
          <button onClick={() => setStep('password')}>Login with Password</button>
        </div>
      )}

      {step === 'otp' && (
        <div>
          <input 
            type="text" 
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Verify OTP</button>
        </div>
      )}

      {step === 'setup' && (
        <div>
          <h3>Complete Your Profile</h3>
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Set Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleCompleteSetup}>Complete Setup</button>
        </div>
      )}

      {step === 'password' && (
        <div>
          <input 
            type="tel" 
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handlePasswordLogin}>Login</button>
          <button onClick={() => setStep('phone')}>Use OTP Instead</button>
        </div>
      )}
    </div>
  );
}