import React, { useState } from 'react';
import apiClient from '@/api/api-client';
import { GlassCard } from './glass-card';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import ewayLogo from 'figma:asset/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';

interface LoginPageProps {
  onBackToHome?: () => void;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: (role: 'student' | 'teacher' | 'staff' | 'admin') => void;
}

/**
 * Login Page Component
 * Handles user authentication, validation, and role-based redirects.
 * 
 * @param {Object} props
 * @param {LoginPageProps} props - Component props
 */
export function LoginPage({
  onBackToHome,
  onRegisterClick,
  onForgotPasswordClick,
  onLoginSuccess,
}: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched({
      ...touched,
      [field]: true,
    });

    // Validate on blur
    if (field === 'email' && formData.email && !validateEmail(formData.email)) {
      setErrors({
        ...errors,
        email: 'Please enter a valid email address',
      });
    }

    if (field === 'password' && formData.password && formData.password.length < 6) {
      setErrors({
        ...errors,
        password: 'Password must be at least 6 characters',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (!newErrors.email && !newErrors.password) {
      apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })
      .then(response => {
        const { token, user } = response.data;
        // Store session info
        localStorage.setItem('eway_token', token);
        localStorage.setItem('eway_user', JSON.stringify(user));
        
        console.log('Login successful! Role:', user.role);
        onLoginSuccess?.(user.role);
      })
      .catch(error => {
        console.error('Login error:', error);
        setErrors({
          ...newErrors,
          email: error.response?.data?.error || 'Invalid email or password'
        });
        setTouched({ email: true, password: true });
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1764720573370-5008f1ccc9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGFzc3Jvb20lMjBzdHVkZW50cyUyMGxlYXJuaW5nfGVufDF8fHx8MTc3MTY2NzU4OHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Modern Classroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A]/95 via-indigo-900/80 to-[#0B0F1A]/95" />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
              <img src={ewayLogo} alt="EWAY Logo" className="w-11 h-11 object-contain" />
            </div>
            <span className="text-white font-semibold text-2xl">EWAY Institute</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
            Welcome Back to
            <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              EWAY LMS
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-lg mb-8">
            Continue your learning journey with smart education tools. Access your courses, track
            progress, and achieve your goals.
          </p>

          {/* Decorative Elements */}
          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-white font-semibold">50+ Courses</p>
                <p className="text-white/60 text-sm">Expert Content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <p className="text-white font-semibold">500+ Students</p>
                <p className="text-white/60 text-sm">Active Learners</p>
              </div>
            </div>
          </div>

          {/* Glowing Gradient Overlay */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="hidden lg:flex absolute top-8 left-8 items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Homepage
          </button>
        )}
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
              <img src={ewayLogo} alt="EWAY Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-semibold text-xl">EWAY Institute</span>
          </div>

          <GlassCard className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Login to Your Account</h2>
              <p className="text-white/70">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${
                      errors.email && touched.email
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-cyan-400/50'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      errors.email && touched.email
                        ? 'focus:ring-red-500/20'
                        : 'focus:ring-cyan-400/20'
                    } transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-2 text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-white font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                      errors.password && touched.password
                        ? 'border-red-500'
                        : 'border-white/10 focus:border-cyan-400/50'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      errors.password && touched.password
                        ? 'focus:ring-red-500/20'
                        : 'focus:ring-cyan-400/20'
                    } transition-all`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-2 text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:ring-offset-0"
                />
                <label htmlFor="rememberMe" className="ml-2 text-white/70 text-sm">
                  Remember me for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-[1.02]"
              >
                Login
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-white/70">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onRegisterClick}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Register Now
                  </button>
                </p>
              </div>
            </form>
          </GlassCard>

          {/* Back to Home Link */}
          {onBackToHome && (
            <div className="mt-6 text-center">
              <button
                onClick={onBackToHome}
                className="text-white/70 hover:text-cyan-400 transition-colors text-sm"
              >
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}