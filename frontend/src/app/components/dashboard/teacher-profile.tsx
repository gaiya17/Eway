import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  BookOpen,
  Award,
  Shield,
  Bell,
  Lock,
  Save,
  X,
  BadgeCheck,
  Loader2,
  Check,
  CheckCircle,
} from 'lucide-react';
import { ProfilePhotoUploader } from './profile-photo-uploader';
import apiClient from '@/api/api-client';

interface TeacherProfileProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function TeacherProfile({ onLogout, onNavigate }: TeacherProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '123, Galle Road, Colombo 03, Sri Lanka',
    teacherId: '',
    subject: 'Mathematics & Physics',
    experience: '8 years',
    qualification: 'B.Sc in Mathematics, M.Ed in Physics',
    joinedDate: '',
    profilePhoto: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      const profile = response.data;
      setFormData({
        fullName: `${profile.first_name || ''} ${profile.last_name || ''}`,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : '',
        address: '123, Galle Road, Colombo 03, Sri Lanka',
        teacherId: profile.id?.slice(0, 8).toUpperCase() || 'TCH-PENDING',
        subject: 'Mathematics & Physics',
        experience: '8 years',
        qualification: 'B.Sc in Mathematics, M.Ed in Physics',
        joinedDate: profile.created_at || new Date().toISOString(),
        profilePhoto: profile.profile_photo || '',
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthday: formData.dateOfBirth,
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

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handlePhotoUploadSuccess = (newPhotoUrl: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: newPhotoUrl }));
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="teacher" activePage="profile" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="teacher"
      userName={formData.firstName || 'Teacher'}
      userInitials={formData.firstName && formData.lastName ? `${formData.firstName[0]}${formData.lastName[0]}` : 'TC'}
      profilePhoto={formData.profilePhoto}
      breadcrumb="My Profile"
      activePage="profile"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-3 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-white/60">
              Manage your personal information and account settings
            </p>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <GlassCard className="mb-6 overflow-hidden">
        {/* Banner Background */}
        <div className="h-32 w-full bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-purple-500/20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0F1A]/50"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-md">
              <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Premium Faculty</span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Profile Image - Overlapping */}
          <div className="relative group/photo">
            <ProfilePhotoUploader 
              currentPhoto={formData.profilePhoto}
              initials={formData.firstName && formData.lastName ? `${formData.firstName[0]}${formData.lastName[0]}` : 'TC'}
              onUploadSuccess={handlePhotoUploadSuccess}
              size="xl"
            />
            <div className="absolute top-2 -right-2 flex items-center justify-center z-20">
               <div className="p-1.5 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] border-2 border-[#0B0F1A]">
                  <BadgeCheck size={16} className="text-white" />
               </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h2 className="text-4xl font-black text-white tracking-tight">
                {formData.firstName} {formData.lastName}
              </h2>
              <div className="flex justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                  Teacher
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                  Mathematics
                </span>
              </div>
            </div>
            <p className="text-white/40 flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
              <Mail size={14} className="text-blue-400/60" />
              {formData.email}
            </p>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-8 py-3.5 rounded-2xl font-black transition-all duration-500 shadow-2xl tracking-tighter uppercase text-xs ${
                isEditing
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 ring-1 ring-white/20'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">ID</p>
              <p className="text-white text-sm font-semibold">{formData.teacherId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/10">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Phone</p>
              <p className="text-white text-sm font-semibold">{formData.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Subject</p>
              <p className="text-white text-sm font-semibold">{formData.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/10">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Joined</p>
              <p className="text-white text-sm font-semibold">{new Date(formData.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal Information */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <User className="text-blue-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Personal Information
            </h3>
          </div>

          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange('dateOfBirth', e.target.value)
                }
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </GlassCard>

        {/* Professional Information */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="text-purple-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Professional Information
            </h3>
          </div>

          <div className="space-y-4">
            {/* Teacher ID */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Teacher ID
              </label>
              <input
                type="text"
                value={formData.teacherId}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Subject Specialization
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Teaching Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) =>
                  handleInputChange('experience', e.target.value)
                }
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Qualifications
              </label>
              <textarea
                value={formData.qualification}
                onChange={(e) =>
                  handleInputChange('qualification', e.target.value)
                }
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {/* Joined Date */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Joined Date
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="text-cyan-400" size={18} />
                <span className="text-white">
                  {formData.joinedDate ? new Date(formData.joinedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Account Settings */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Shield className="text-green-400" size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">Account Settings</h3>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Lock className="text-blue-400" size={18} />
              </div>
              <div>
                <p className="text-white font-semibold">Change Password</p>
                <p className="text-white/60 text-sm">
                  Update your account password
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-semibold text-sm">
              Change
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="text-purple-400" size={18} />
              </div>
              <div>
                <p className="text-white font-semibold">
                  Two-Factor Authentication
                </p>
                <p className="text-white/60 text-sm">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  twoFactorEnabled ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Bell className="text-orange-400" size={18} />
              </div>
              <div>
                <p className="text-white font-semibold">Email Notifications</p>
                <p className="text-white/60 text-sm">
                  Receive updates via email
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
