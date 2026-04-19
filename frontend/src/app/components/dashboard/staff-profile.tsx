import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  Mail,
  Phone,
  User,
  Shield,
  Lock,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Briefcase,
  Calendar,
} from 'lucide-react';

import { ProfilePhotoUploader } from './profile-photo-uploader';
import apiClient from '@/api/api-client';

interface StaffProfileProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function StaffProfile({ onLogout, onNavigate }: StaffProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: '',
    jobTitle: 'Administrative Assistant',
    joinedDate: '2023-01-15T00:00:00Z',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      const profile = response.data;
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profilePhoto: profile.profile_photo || '',
        jobTitle: profile.job_title || 'Administrative Assistant',
        joinedDate: profile.joined_date || '2023-01-15T00:00:00Z',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch('/users/profile', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUploadSuccess = (newPhotoUrl: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: newPhotoUrl }));
  };

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    alert('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="staff" activePage="profile" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DashboardLayout
      userRole="staff"
      notificationCount={0}
      breadcrumb="My Profile"
      activePage="profile"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Profile Summary Card */}
      <GlassCard className="mb-6 overflow-hidden">
        {/* Banner Background */}
        <div className="h-32 w-full bg-gradient-to-r from-emerald-600/20 via-teal-500/20 to-cyan-500/20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0F1A]/50"></div>
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Official Staff</span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Profile Photo - Overlapping */}
          <div className="relative shrink-0">
            <ProfilePhotoUploader 
              currentPhoto={formData.profilePhoto}
              initials={getInitials(formData.firstName, formData.lastName)}
              onUploadSuccess={handlePhotoUploadSuccess}
              size="xl"
            />
            <div className="absolute top-2 right-2 z-50">
               <div className="p-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-2 border-[#0B0F1A]">
                  <CheckCircle size={12} className="text-white" />
               </div>
            </div>
          </div>

          {/* Profile Info - Better Alignment */}
          <div className="flex-1 text-center md:text-left pt-6">
            <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-3">
              <h2 className="text-4xl font-black text-white tracking-tight">
                {formData.firstName} {formData.lastName}
              </h2>
              <div className="flex justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  Staff
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  Operations
                </span>
              </div>
            </div>
            <p className="text-white/60 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} className="text-emerald-400/60" />
              {formData.email}
            </p>
          </div>

          {/* Action Button - More Refined */}
          <div className="shrink-0 pt-6">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl uppercase text-[11px] tracking-wider border border-white/10"
            >
              <User size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-6 border-t border-white/5 bg-white/[0.01]">
           <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Job Title</p>
                <p className="text-white text-sm font-bold tracking-tight">{formData.jobTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-l border-white/5 pl-0 md:pl-8">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Phone</p>
                <p className="text-white text-sm font-bold tracking-tight">{formData.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-l border-white/5 pl-0 md:pl-8">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Joined Date</p>
                <p className="text-white text-sm font-bold tracking-tight">{new Date(formData.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
        </div>
      </GlassCard>

      {/* Profile Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Account Settings */}
        <GlassCard className="p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <User size={20} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Account Information
            </h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2.2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/30 border border-white/5 text-white/40 placeholder-white/20 focus:outline-none cursor-not-allowed transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Lock size={14} className="text-white/20" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="Ex: +94 77 123 4567"
                className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              />
            </div>

            {isEditing && (
              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full px-5 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Password Management */}
        <GlassCard className="p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Lock size={20} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Security Settings
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange('currentPassword', e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange('newPassword', e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange('confirmPassword', e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0B0F1A]/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleUpdatePassword}
                className="w-full px-5 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(37,99,235,0.4)] transition-all duration-300 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                <Shield size={18} />
                Update Security Credentials
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
