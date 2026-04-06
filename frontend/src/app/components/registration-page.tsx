import React, { useState, useEffect } from 'react';
import apiClient from '@/api/api-client';
import { GlassCard } from './glass-card';
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar, ArrowRight, Check, X } from 'lucide-react';
import ewayLogo from 'figma:asset/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';

interface RegistrationPageProps {
  onBackToHome?: () => void;
  onLoginClick?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface ValidationState {
  firstName: { isValid: boolean; message: string };
  lastName: { isValid: boolean; message: string };
  email: { isValid: boolean; message: string };
  phone: { isValid: boolean; message: string };
  gender: { isValid: boolean; message: string };
  birthday: { isValid: boolean; message: string };
  password: { isValid: boolean; message: string };
  confirmPassword: { isValid: boolean; message: string };
}

export function RegistrationPage({ onBackToHome, onLoginClick }: RegistrationPageProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [validation, setValidation] = useState<ValidationState>({
    firstName: { isValid: false, message: '' },
    lastName: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    phone: { isValid: false, message: '' },
    gender: { isValid: false, message: '' },
    birthday: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
  });

  // Validation functions
  const validateField = (name: keyof FormData, value: string) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          return { isValid: false, message: 'This field is required' };
        }
        if (value.length < 2) {
          return { isValid: false, message: 'Must be at least 2 characters' };
        }
        return { isValid: true, message: '' };

      case 'email':
        if (!value) {
          return { isValid: false, message: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, message: 'Please enter a valid email' };
        }
        return { isValid: true, message: '' };

      case 'phone':
        if (!value) {
          return { isValid: false, message: 'Phone number is required' };
        }
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(value.replace(/[\s-()]/g, ''))) {
          return { isValid: false, message: 'Please enter a valid phone number' };
        }
        return { isValid: true, message: '' };

      case 'gender':
        if (!value) {
          return { isValid: false, message: 'Please select your gender' };
        }
        return { isValid: true, message: '' };

      case 'birthday':
        if (!value) {
          return { isValid: false, message: 'Birthday is required' };
        }
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
          return { isValid: false, message: 'You must be at least 13 years old' };
        }
        return { isValid: true, message: '' };

      case 'password':
        if (!value) {
          return { isValid: false, message: 'Password is required' };
        }
        if (value.length < 8) {
          return { isValid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/[A-Z]/.test(value)) {
          return { isValid: false, message: 'Password must contain an uppercase letter' };
        }
        if (!/[a-z]/.test(value)) {
          return { isValid: false, message: 'Password must contain a lowercase letter' };
        }
        if (!/[0-9]/.test(value)) {
          return { isValid: false, message: 'Password must contain a number' };
        }
        return { isValid: true, message: '' };

      case 'confirmPassword':
        if (!value) {
          return { isValid: false, message: 'Please confirm your password' };
        }
        if (value !== formData.password) {
          return { isValid: false, message: 'Passwords do not match' };
        }
        return { isValid: true, message: '' };

      default:
        return { isValid: false, message: '' };
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  // Update validation when fields change
  useEffect(() => {
    const newValidation = { ...validation };
    Object.keys(formData).forEach((key) => {
      if (key !== 'agreeToTerms') {
        const fieldKey = key as keyof FormData;
        const value = formData[fieldKey] as string;
        if (touched[key] || value) {
          newValidation[fieldKey] = validateField(fieldKey, value);
        }
      }
    });
    setValidation(newValidation);

    // Update password strength
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleBlur = (field: string) => {
    setTouched({
      ...touched,
      [field]: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Check if all fields are valid
    const allValid = Object.values(validation).every((field) => field.isValid);

    if (!allValid) {
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms & Privacy Policy');
      return;
    }

    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      birthday: formData.birthday,
      password: formData.password,
    };

    console.log('Registration submitted:', registrationData);
    
    apiClient.post('/auth/register', registrationData)
      .then(response => {
        alert(response.data.message || 'Registration successful! Please check your email.');
        // Optionally redirect to login immediately or wait for verification
        if (onLoginClick) onLoginClick();
      })
      .catch(error => {
        console.error('Registration error:', error);
        alert(error.response?.data?.error || 'Registration failed. Please try again.');
      });
  };

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

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzQwMjU4NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Students Learning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A]/95 via-cyan-900/80 to-[#0B0F1A]/95" />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
              <img src={ewayLogo} alt="EWAY Logo" className="w-11 h-11 object-contain" />
            </div>
            <span className="text-white font-semibold text-2xl">EWAY Institute</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
            Start Your
            <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              Learning Journey
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-lg mb-8">
            Join EWAY Institute and unlock powerful learning tools. Get access to premium courses,
            smart attendance tracking, and AI-powered support.
          </p>

          {/* Benefits List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <Check className="text-cyan-400" size={20} />
              </div>
              <p className="text-white/90">Access to 50+ premium courses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <Check className="text-cyan-400" size={20} />
              </div>
              <p className="text-white/90">QR-based attendance system</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <Check className="text-cyan-400" size={20} />
              </div>
              <p className="text-white/90">24/7 AI chatbot support</p>
            </div>
          </div>

          {/* Glowing Gradient Overlay */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 to-indigo-400/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-3xl py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
              <img src={ewayLogo} alt="EWAY Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-semibold text-xl">EWAY Institute</span>
          </div>

          <GlassCard className="p-6 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-white/70">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-white font-semibold mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstName')}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                        touched.firstName
                          ? validation.firstName.isValid
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                          : 'border-white/10'
                      } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                        touched.firstName
                          ? validation.firstName.isValid
                            ? 'focus:ring-green-500/20'
                            : 'focus:ring-red-500/20'
                          : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                      } transition-all`}
                      placeholder="John"
                    />
                    {touched.firstName && validation.firstName.isValid && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  {touched.firstName && !validation.firstName.isValid && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <X size={16} />
                      {validation.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-white font-semibold mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastName')}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                        touched.lastName
                          ? validation.lastName.isValid
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                          : 'border-white/10'
                      } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                        touched.lastName
                          ? validation.lastName.isValid
                            ? 'focus:ring-green-500/20'
                            : 'focus:ring-red-500/20'
                          : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                      } transition-all`}
                      placeholder="Doe"
                    />
                    {touched.lastName && validation.lastName.isValid && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  {touched.lastName && !validation.lastName.isValid && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <X size={16} />
                      {validation.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Email (Full Width) */}
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
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                      touched.email
                        ? validation.email.isValid
                          ? 'border-green-500/50'
                          : 'border-red-500/50'
                        : 'border-white/10'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      touched.email
                        ? validation.email.isValid
                          ? 'focus:ring-green-500/20'
                          : 'focus:ring-red-500/20'
                        : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                    } transition-all`}
                    placeholder="you@example.com"
                  />
                  {touched.email && validation.email.isValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <Check size={20} />
                    </div>
                  )}
                </div>
                {touched.email && !validation.email.isValid && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <X size={16} />
                    {validation.email.message}
                  </p>
                )}
              </div>

              {/* Row 3: Phone Number (Full Width) */}
              <div>
                <label htmlFor="phone" className="block text-white font-semibold mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                      touched.phone
                        ? validation.phone.isValid
                          ? 'border-green-500/50'
                          : 'border-red-500/50'
                        : 'border-white/10'
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      touched.phone
                        ? validation.phone.isValid
                          ? 'focus:ring-green-500/20'
                          : 'focus:ring-red-500/20'
                        : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                    } transition-all`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {touched.phone && validation.phone.isValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <Check size={20} />
                    </div>
                  )}
                </div>
                {touched.phone && !validation.phone.isValid && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <X size={16} />
                    {validation.phone.message}
                  </p>
                )}
              </div>

              {/* Row 4: Gender & Birthday */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-white font-semibold mb-2">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={() => handleBlur('gender')}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        touched.gender
                          ? validation.gender.isValid
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                          : 'border-white/10'
                      } text-white focus:outline-none focus:ring-2 ${
                        touched.gender
                          ? validation.gender.isValid
                            ? 'focus:ring-green-500/20'
                            : 'focus:ring-red-500/20'
                          : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                      } transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-[#0B0F1A]">
                        Select Gender
                      </option>
                      <option value="male" className="bg-[#0B0F1A]">
                        Male
                      </option>
                      <option value="female" className="bg-[#0B0F1A]">
                        Female
                      </option>
                      <option value="other" className="bg-[#0B0F1A]">
                        Other
                      </option>
                      <option value="prefer-not-to-say" className="bg-[#0B0F1A]">
                        Prefer not to say
                      </option>
                    </select>
                    {touched.gender && validation.gender.isValid && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  {touched.gender && !validation.gender.isValid && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <X size={16} />
                      {validation.gender.message}
                    </p>
                  )}
                </div>

                {/* Birthday */}
                <div>
                  <label htmlFor="birthday" className="block text-white font-semibold mb-2">
                    Birthday
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                      <Calendar size={20} />
                    </div>
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      onBlur={() => handleBlur('birthday')}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                        touched.birthday
                          ? validation.birthday.isValid
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                          : 'border-white/10'
                      } text-white focus:outline-none focus:ring-2 ${
                        touched.birthday
                          ? validation.birthday.isValid
                            ? 'focus:ring-green-500/20'
                            : 'focus:ring-red-500/20'
                          : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                      } transition-all [color-scheme:dark]`}
                    />
                    {touched.birthday && validation.birthday.isValid && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  {touched.birthday && !validation.birthday.isValid && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <X size={16} />
                      {validation.birthday.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 5: Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-white font-semibold mb-2">
                    Password
                  </label>
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
                        touched.password
                          ? validation.password.isValid
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                          : 'border-white/10'
                      } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                        touched.password
                          ? validation.password.isValid
                            ? 'focus:ring-green-500/20'
                            : 'focus:ring-red-500/20'
                          : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                      } transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {touched.password && !validation.password.isValid && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <X size={16} />
                      {validation.password.message}
                    </p>
                  )}
                  {formData.password && (
                    <div className="mt-2">
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${
                        touched.confirmPassword
                          ? validation.confirmPassword.isValid
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                          : 'border-white/10'
                      } text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                        touched.confirmPassword
                          ? validation.confirmPassword.isValid
                            ? 'focus:ring-green-500/20'
                            : 'focus:ring-red-500/20'
                          : 'focus:ring-cyan-400/20 focus:border-cyan-400/50'
                      } transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {touched.confirmPassword && !validation.confirmPassword.isValid && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                      <X size={16} />
                      {validation.confirmPassword.message}
                    </p>
                  )}
                  {touched.confirmPassword && validation.confirmPassword.isValid && (
                    <p className="mt-2 text-green-400 text-sm flex items-center gap-1">
                      <Check size={16} />
                      Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:ring-offset-0"
                />
                <label htmlFor="agreeToTerms" className="text-white/90 text-sm">
                  I agree to the{' '}
                  <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-[1.02]"
              >
                Register
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-white/70">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Login
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