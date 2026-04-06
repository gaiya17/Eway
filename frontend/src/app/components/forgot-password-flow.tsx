import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './glass-card';
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Shield, Loader2 } from 'lucide-react';
import apiClient from '@/api/api-client';

interface ForgotPasswordFlowProps {
  onBackToLogin?: () => void;
}

type FlowStep = 'forgot' | 'verify' | 'reset' | 'success';

export function ForgotPasswordFlow({ onBackToLogin }: ForgotPasswordFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('forgot');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '', code: '' });
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Refs for OTP inputs
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  // Step 1: Forgot Password
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ ...errors, email: 'Email is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: 'Please enter a valid email address' });
      return;
    }

    setErrors({ ...errors, email: '' });
    setLoading(true);
    setServerError('');
    
    try {
      await apiClient.post('/auth/request-password-reset', { email });
      setResendTimer(60);
      setCurrentStep('verify');
    } catch (err: any) {
      console.error('Request password reset error:', err);
      setServerError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...resetCode];
    newCode[index] = value.slice(-1);
    setResetCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newCode = pasteData.split('').concat(Array(6 - pasteData.length).fill(''));
    setResetCode(newCode.slice(0, 6));

    const nextIndex = Math.min(pasteData.length, 5);
    otpInputs.current[nextIndex]?.focus();
  };

  // Step 2: Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = resetCode.join('');
    if (code.length !== 6) {
      setErrors({ ...errors, code: 'Please enter the complete 6-digit code' });
      return;
    }

    setErrors({ ...errors, code: '' });
    setLoading(true);
    setServerError('');

    try {
      await apiClient.post('/auth/verify-reset-code', { email, code });
      setCurrentStep('reset');
    } catch (err: any) {
      console.error('Verify code error:', err);
      setErrors({ ...errors, code: err.response?.data?.error || 'Invalid or expired code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setServerError('');
    try {
      await apiClient.post('/auth/request-password-reset', { email });
      setResetCode(['', '', '', '', '', '']);
      setResendTimer(60);
      otpInputs.current[0]?.focus();
    } catch (err: any) {
      console.error('Resend code error:', err);
      setServerError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { ...errors };

    if (!newPassword) {
      newErrors.password = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.password = 'Password must contain a number';
    } else {
      newErrors.password = '';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    } else {
      newErrors.confirmPassword = '';
    }

    setErrors(newErrors);

    if (!newErrors.password && !newErrors.confirmPassword) {
      setLoading(true);
      setServerError('');
      try {
        await apiClient.post('/auth/reset-password-complete', {
          email,
          code: resetCode.join(''),
          newPassword
        });
        setCurrentStep('success');
      } catch (err: any) {
        console.error('Reset password error:', err);
        setServerError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'forgot':
        return (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-white/70">
                Enter your email address and we'll send you a code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendResetLink} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${
                      errors.email ? 'border-red-500' : 'border-white/10 focus:border-cyan-400/50'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      errors.email ? 'focus:ring-red-500/20' : 'focus:ring-cyan-400/20'
                    } transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-red-400 text-sm">{errors.email}</p>}
                {serverError && <p className="mt-2 text-red-400 text-sm text-center">{serverError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-white/70 hover:text-cyan-400 transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </div>
            </form>
          </>
        );

      case 'verify':
        return (
          <>
            <div className="mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-cyan-400" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 text-center">Verify Reset Code</h2>
              <p className="text-white/70 text-center">
                We've sent a 6-digit code to <span className="text-cyan-400">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-4 text-center">
                  Enter Reset Code
                </label>
                <div className="flex gap-2 justify-center mb-2">
                  {resetCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  ))}
                </div>
                {errors.code && (
                  <p className="mt-2 text-red-400 text-sm text-center">{errors.code}</p>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                  className={`text-sm ${
                    resendTimer > 0
                      ? 'text-white/50 cursor-not-allowed'
                      : 'text-cyan-400 hover:text-cyan-300'
                  } transition-colors`}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('forgot')}
                  className="text-white/70 hover:text-cyan-400 transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Change Email
                </button>
              </div>
            </form>
          </>
        );

      case 'reset':
        return (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create New Password</h2>
              <p className="text-white/70">
                Choose a strong password to secure your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-white font-semibold mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                      errors.password
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-cyan-400/50'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      errors.password ? 'focus:ring-red-500/20' : 'focus:ring-cyan-400/20'
                    } transition-all`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-red-400 text-sm">{errors.password}</p>}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/70">Password Strength</span>
                      <span className="text-xs text-white/70">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                      errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-cyan-400/50'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword ? 'focus:ring-red-500/20' : 'focus:ring-cyan-400/20'
                    } transition-all`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
                {serverError && <p className="mt-2 text-red-400 text-sm text-center">{serverError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-400/30 backdrop-blur-xl border border-green-400/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-400" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Password Reset Successfully!</h2>
            <p className="text-white/70 mb-8 max-w-sm mx-auto">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <button
              onClick={onBackToLogin}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-[1.02] inline-flex items-center gap-2"
            >
              Back to Login
            </button>
          </div>
        );
    }
  };

  // Get left side content based on step
  const getLeftSideContent = () => {
    switch (currentStep) {
      case 'forgot':
        return {
          title: 'Need Help Accessing Your Account?',
          subtitle: "We'll help you reset your password quickly and securely.",
        };
      case 'verify':
        return {
          title: 'Check Your Email',
          subtitle: 'Enter the verification code we sent to your email address.',
        };
      case 'reset':
        return {
          title: 'Create a Strong Password',
          subtitle: 'Choose a secure password to protect your account.',
        };
      case 'success':
        return {
          title: 'All Set!',
          subtitle: 'Your password has been updated. Welcome back to EWAY LMS!',
        };
    }
  };

  const leftContent = getLeftSideContent();

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cmUlMjBsb2NrJTIwc2VjdXJpdHl8ZW58MXx8fHwxNzQwMjU4NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Security"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A]/95 via-indigo-900/80 to-[#0B0F1A]/95" />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xl">
              EW
            </div>
            <span className="text-white font-semibold text-2xl">EWAY Institute</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
            {leftContent.title.split(' ').slice(0, 3).join(' ')}
            <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              {leftContent.title.split(' ').slice(3).join(' ')}
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-lg mb-8">{leftContent.subtitle}</p>

          {/* Security Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
              <p className="text-white/90">Secure password reset process</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <span className="text-xl">📧</span>
              </div>
              <p className="text-white/90">Email verification for safety</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <p className="text-white/90">Quick and easy recovery</p>
            </div>
          </div>

          {/* Glowing Gradient Overlay */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white">
              EW
            </div>
            <span className="text-white font-semibold text-xl">EWAY Institute</span>
          </div>

          <GlassCard className="p-8 md:p-10">
            {/* Step Indicator */}
            {currentStep !== 'success' && (
              <div className="flex justify-center gap-2 mb-8">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === 'forgot' ? 'w-12 bg-cyan-400' : 'w-2 bg-white/30'
                  }`}
                />
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === 'verify' ? 'w-12 bg-cyan-400' : 'w-2 bg-white/30'
                  }`}
                />
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === 'reset' ? 'w-12 bg-cyan-400' : 'w-2 bg-white/30'
                  }`}
                />
              </div>
            )}

            {/* Content */}
            <div className="transition-all duration-300">{renderStepContent()}</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
