import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import ewayLogo from '@/assets/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';
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
  GraduationCap,
  Printer,
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
          studentId: data.student_id || 'PENDING',
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
    studentId: profile?.studentId || 'EW-ID-PENDING',
    email: profile?.email || 'N/A',
    mobile: profile?.phone || 'Not set',
    grade: 'LMS Student',
    batch: profile ? new Date(profile.joinedDate).getFullYear().toString() : '2026',
    issueDate: profile ? new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    expiryDate: profile ? new Date(new Date(profile.joinedDate).setFullYear(new Date(profile.joinedDate).getFullYear() + 2)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    status: 'Active',
  };

  const qrCodeData = studentData.studentId;

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

          {/* Main ID Card - Horizontal Design */}
          <div className="flex justify-center overflow-x-auto pb-4 custom-scrollbar">
            <div className="w-full max-w-2xl min-w-[600px] sm:min-w-0 transition-all duration-500">
              <div className="overflow-hidden border-0 shadow-2xl relative group pb-0 aspect-[1.58/1] bg-white rounded-2xl ring-1 ring-black/5">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#0a0f2c] via-[#1a237e] to-[#0a0f2c] p-4 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
                  <div className="z-10 bg-black p-1.5 rounded-full shadow-lg overflow-hidden flex items-center justify-center w-14 h-14">
                    <img src={ewayLogo} alt="Logo" className="w-10 h-10 object-contain rounded-full" />
                  </div>
                  <div className="z-10 flex-1">
                    <h2 className="text-white font-bold text-xl tracking-wider uppercase leading-none mb-1">EWAY INSTITUTE</h2>
                    <div className="flex items-center gap-2">
                      <div className="h-[1px] bg-white/30 flex-1" />
                      <span className="text-white/70 text-[10px] uppercase tracking-[0.3em] font-light">Excellence in Education</span>
                      <div className="h-[1px] bg-white/30 flex-1" />
                    </div>
                    <p className="text-white/90 text-xs font-medium uppercase tracking-widest mt-1">Student Identity Card</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 grid grid-cols-[140px_1fr_120px] gap-8 items-center h-[calc(100%-88px)] relative overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute top-1/4 -left-10 w-40 h-40 bg-blue-400/10 blur-[60px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-1/4 -right-10 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  {/* 1. Portrait Photo */}
                  <div className="relative">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center">
                      {profile?.profilePhoto ? (
                        <img src={profile.profilePhoto} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-gray-300" size={60} />
                      )}
                    </div>
                  </div>

                  {/* 2. Demographic Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-0.5">Full Name</label>
                      <p className="text-gray-900 font-bold text-lg leading-none truncate overflow-ellipsis max-w-[300px]">
                        {studentData.firstName} {studentData.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-0.5">Student No</label>
                      <p className="text-gray-800 font-bold text-base">{studentData.studentId}</p>
                    </div>

                    <div className="flex gap-10">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-0.5">Valid Till</label>
                        <p className="text-gray-800 font-bold text-sm tracking-tight">{studentData.expiryDate}</p>
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-0.5">Status</label>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Verification QR */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-2 border-2 border-gray-100 rounded-xl shadow-md bg-white ring-4 ring-gray-50/50">
                      <QRCodeSVG value={qrCodeData} size={90} level="H" includeMargin={false} />
                    </div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.15em] text-center leading-tight">
                      Digital Login QR
                    </p>
                  </div>
                </div>

                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>


              {/* Action Buttons Below Card */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download PDF
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Print Card
                </button>
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
