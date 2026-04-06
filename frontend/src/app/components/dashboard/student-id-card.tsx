import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  BadgeCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Download,
  Shield,
  CheckCircle,
} from 'lucide-react';

interface StudentIdCardProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function StudentIdCard({ onLogout, onNavigate }: StudentIdCardProps) {
  const [profile, setProfile] = React.useState<{
    firstName: string;
    lastName: string;
    studentId: string;
    email: string;
    phone: string;
    profilePhoto: string;
    joinedDate: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        const data = response.data;
        setProfile({
          firstName: data.first_name || 'Student',
          lastName: data.last_name || '',
          studentId: data.id || 'N/A',
          email: data.email || '',
          phone: data.phone || '',
          profilePhoto: data.profile_photo || '',
          joinedDate: data.created_at || new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching id card profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const studentData = {
    firstName: profile?.firstName || 'Student',
    lastName: profile?.lastName || '',
    studentId: profile?.studentId ? profile.studentId.toString().slice(0, 10).toUpperCase() : 'EW-ID-PENDING',
    email: profile?.email || 'N/A',
    mobile: profile?.phone || 'Not set',
    grade: 'LMS Student',
    batch: profile ? new Date(profile.joinedDate).getFullYear().toString() : '2026',
    issueDate: profile ? new Date(profile.joinedDate).toLocaleDateString() : 'N/A',
    expiryDate: 'Dec 31, 2026',
    status: 'Active',
  };

  const qrCodeData = JSON.stringify({
    id: studentData.studentId,
    name: `${studentData.firstName} ${studentData.lastName}`,
    verify: 'https://eway.lk/verify/' + studentData.studentId,
  });

  const handleDownloadPDF = () => {
    console.log('Downloading ID card as PDF...');
    alert('PDF download feature - Coming soon!');
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" activePage="student-id" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName={studentData.firstName}
        userInitials={`${studentData.firstName[0]}${studentData.lastName?.[0] || ''}`}
        profilePhoto={profile?.profilePhoto}
        notificationCount={5}
        breadcrumb="Student ID Card"
        activePage="student-id"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Student ID Card</h1>
            <p className="text-white/60">Your official digital identity card</p>
          </div>

          {/* Main ID Card - Centered */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <GlassCard className="p-0 overflow-hidden group hover:shadow-[0_0_48px_rgba(59,130,246,0.4)] transition-all duration-500 hover:scale-[1.02] transform">
                {/* Top Header Strip */}
                <div className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 p-6 overflow-hidden">
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {/* Holographic shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative flex items-center justify-between">
                    {/* Left - Institute Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <BadgeCheck size={32} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-white text-2xl font-bold">EWAY Institute</h2>
                        <p className="text-white/90 text-sm">Official Student ID Card</p>
                      </div>
                    </div>

                    {/* Right - Verified Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-xl border border-green-400/50 shadow-[0_0_24px_rgba(34,197,94,0.4)]">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="text-green-300 font-semibold text-sm">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - Photo + QR */}
                    <div className="flex flex-col items-center gap-6">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-400/30 backdrop-blur-xl border-4 border-blue-400/50 shadow-[0_0_32px_rgba(59,130,246,0.4)] flex items-center justify-center overflow-hidden">
                          {profile?.profilePhoto ? (
                            <img src={profile.profilePhoto} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-8xl">👨‍🎓</span>
                          )}
                        </div>
                        {/* Decorative corner badge */}
                        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                          <Shield size={20} className="text-white" />
                        </div>
                      </div>

                      {/* Student ID Badge */}
                      <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 border border-cyan-400/30 backdrop-blur-xl">
                        <p className="text-cyan-300 font-bold text-lg text-center">
                          {studentData.studentId}
                        </p>
                      </div>

                      {/* QR Code */}
                      <GlassCard className="p-4 hover:scale-105 transition-transform duration-300 cursor-pointer group/qr">
                        <div className="bg-white rounded-xl p-3 relative overflow-hidden">
                          <QRCodeSVG value={qrCodeData} size={140} level="H" />
                          {/* Scan line animation */}
                          <div className="absolute inset-x-0 h-0.5 bg-cyan-400 opacity-0 group-hover/qr:opacity-100 group-hover/qr:animate-pulse" style={{ top: '50%' }} />
                        </div>
                        <p className="text-white/70 text-xs text-center mt-3 group-hover/qr:text-cyan-400 transition-colors">
                          Scan for verification
                        </p>
                      </GlassCard>
                    </div>

                    {/* RIGHT COLUMN - Student Information */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Name Section */}
                      <div>
                        <h3 className="text-white/60 text-sm mb-4 uppercase tracking-wider">
                          Student Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* First Name */}
                          <div>
                            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                              <User size={14} />
                              First Name
                            </label>
                            <p className="text-white font-bold text-xl">
                              {studentData.firstName}
                            </p>
                          </div>

                          {/* Last Name */}
                          <div>
                            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                              <User size={14} />
                              Last Name
                            </label>
                            <p className="text-white font-bold text-xl">{studentData.lastName}</p>
                          </div>

                          {/* Mobile Number */}
                          <div>
                            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                              <Phone size={14} />
                              Mobile Number
                            </label>
                            <p className="text-white font-semibold text-lg">{studentData.mobile}</p>
                          </div>

                          {/* Email */}
                          <div>
                            <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                              <Mail size={14} />
                              Email Address
                            </label>
                            <p className="text-white font-semibold text-lg break-all">
                              {studentData.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Grade Info */}
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-white/70 text-sm mb-1">Current Enrollment</p>
                        <p className="text-white font-bold text-lg">{studentData.grade}</p>
                        <p className="text-cyan-400 text-sm">Batch {studentData.batch}</p>
                      </div>

                      {/* Additional Info Strip */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        {/* Issue Date */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Calendar size={16} className="text-cyan-400" />
                            <p className="text-white/60 text-xs uppercase">Issued</p>
                          </div>
                          <p className="text-white font-semibold text-sm">
                            {studentData.issueDate}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="border-l border-white/10" />

                        {/* Expiry Date */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Calendar size={16} className="text-cyan-400" />
                            <p className="text-white/60 text-xs uppercase">Expires</p>
                          </div>
                          <p className="text-white font-semibold text-sm">
                            {studentData.expiryDate}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="border-l border-white/10" />

                        {/* Status */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="relative">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
                            </div>
                            <p className="text-white/60 text-xs uppercase">Status</p>
                          </div>
                          <p className="text-green-400 font-semibold text-sm">
                            {studentData.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Security Strip */}
                <div className="border-t border-white/10 bg-white/5 px-8 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-cyan-400" />
                      <p className="text-white/70 text-sm">
                        This is an official digital ID card issued by EWAY Institute
                      </p>
                    </div>
                    <p className="text-white/50 text-xs">ID: {studentData.studentId}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Download Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105"
                >
                  <Download size={20} />
                  <span>Download as PDF</span>
                </button>
              </div>

              {/* Info Notice */}
              <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-white/70 text-sm text-center">
                  💡 Keep your Student ID safe. You may be asked to show it for verification at any
                  time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />
    </>
  );
}
