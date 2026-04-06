import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Calendar,
  Camera,
  Edit,
  Lock,
  Activity,
  FileText,
  DollarSign,
  UserPlus,
  MessageSquare,
  Monitor,
  Globe,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';

interface AdminMyProfileProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

import { ProfilePhotoUploader } from './profile-photo-uploader';
import apiClient from '@/api/api-client';

export function AdminMyProfile({ onLogout, onNavigate }: AdminMyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'System Administrator',
    twoFactorEnabled: false,
    joinedDate: '',
    profilePhoto: '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
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
        jobTitle: 'System Administrator', // Assuming this is fixed for admin
        twoFactorEnabled: false, // Assuming this is fixed or fetched separately
        joinedDate: profile.created_at || new Date().toISOString(),
        profilePhoto: profile.profile_photo || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Optionally set some default values or show an error message
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
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

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Re-fetch to revert changes
  };

  const handlePhotoUploadSuccess = (newPhotoUrl: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: newPhotoUrl }));
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      alert('Please fill in all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }

    try {
      // Mock for now, replace with actual API call
      // await apiClient.post('/users/change-password', {
      //   current_password: passwordData.current,
      //   new_password: passwordData.new,
      // });
      alert('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert(error.response?.data?.error || 'Failed to update password');
    }
  };

  const recentActivities = [
    {
      id: 1,
      icon: FileText,
      action: 'Generated monthly revenue report',
      time: '1 hour ago',
      color: 'text-blue-400',
    },
    {
      id: 2,
      icon: DollarSign,
      action: 'Verified student payment',
      time: '2 hours ago',
      color: 'text-green-400',
    },
    {
      id: 3,
      icon: UserPlus,
      action: 'Created new teacher account',
      time: 'yesterday',
      color: 'text-purple-400',
    },
    {
      id: 4,
      icon: MessageSquare,
      action: 'Updated chatbot FAQ',
      time: 'yesterday',
      color: 'text-cyan-400',
    },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <DashboardLayout 
        userRole="admin" 
        activePage="profile" 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        userName={`${formData.firstName} ${formData.lastName}`}
        userInitials={getInitials(formData.firstName, formData.lastName)}
        profilePhoto={formData.profilePhoto}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      userRole="admin" 
      activePage="profile" 
      onNavigate={onNavigate} 
      onLogout={onLogout}
      userName={`${formData.firstName} ${formData.lastName}`}
      userInitials={getInitials(formData.firstName, formData.lastName)}
      profilePhoto={formData.profilePhoto}
    >
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-white/60">Manage your administrator account and security settings.</p>
          </div>
        </div>

        {/* Profile Summary Card */}
        <GlassCard className="mb-6 overflow-hidden">
          {/* Cover/Banner Background */}
          <div className="h-32 w-full bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-purple-600/30 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0F1A]/50"></div>
          </div>

          <div className="px-8 pb-8 -mt-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Photo - Overlapping */}
              <div className="relative">
                <ProfilePhotoUploader 
                  currentPhoto={formData.profilePhoto}
                  initials={getInitials(formData.firstName, formData.lastName)}
                  onUploadSuccess={handlePhotoUploadSuccess}
                  size="xl"
                />
              </div>

              {/* Basic Info - Aligned to center of photo */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                      Admin
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                      Active
                    </span>
                  </div>
                </div>
                <p className="text-white/60 flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-400" />
                  {formData.jobTitle}
                </p>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black hover:shadow-[0_0_32px_rgba(59,130,246,0.5)] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl tracking-tighter uppercase text-xs ring-1 ring-white/20"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Stats/Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-blue-400 border border-white/5">
                  <Mail size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Email Address</p>
                  <p className="text-white font-medium truncate">{formData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-green-400 border border-white/5">
                  <Phone size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Phone Number</p>
                  <p className="text-white font-medium">{formData.phone || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-purple-400 border border-white/5">
                  <Shield size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Security Level</p>
                  <p className="text-white font-medium">Administrator</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-cyan-400 border border-white/5">
                  <Calendar size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Member Since</p>
                  <p className="text-white font-medium">{formatJoinedDate(formData.joinedDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Personal Information Section */}
          <div className="col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white/60 placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Role</label>
                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white/60 placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-white/40 text-xs mt-1">Role cannot be changed</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
                  >
                    {isSaving && <Loader2 size={18} className="animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </GlassCard>

            {/* Security Settings */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdatePassword}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
              >
                <Lock size={20} />
                Update Password
              </button>

              {/* Two-Factor Authentication */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Two-Factor Authentication</h3>
                    <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('twoFactorEnabled', !formData.twoFactorEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      formData.twoFactorEnabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        formData.twoFactorEnabled ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Session Information */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Session Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Clock className="text-white/60" size={18} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Last Login</p>
                    <p className="text-white font-medium">Mar 13, 2026 — 09:30 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Monitor className="text-white/60" size={18} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Login Device</p>
                    <p className="text-white font-medium">Windows 10 Desktop</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Globe className="text-white/60" size={18} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Browser</p>
                    <p className="text-white font-medium">Chrome 122.0</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <MapPin className="text-white/60" size={18} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">IP Address</p>
                    <p className="text-white font-medium font-mono text-sm">192.168.1.12</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <activity.icon className={activity.color} size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <p className="text-white/60 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}