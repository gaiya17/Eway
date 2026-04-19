import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import { StudentIdCardUI } from './student-id-card-ui';
import ewayLogo from '@/assets/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isDownloading, setIsDownloading] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!cardRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Student_ID_${studentData.studentId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. This may be due to complex CSS styles or network issues with the profile photo.');
    } finally {
      setIsDownloading(false);
    }
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
        notificationCount={5}
        breadcrumb="Student ID Card"
        activePage="student-id"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Main ID Card - Vertical Standardized Design */}
          <div className="flex justify-center overflow-x-auto pb-4 custom-scrollbar">
            <div className="w-full max-w-2xl transition-all duration-500">
              <div ref={cardRef}>
                <StudentIdCardUI
                  studentName={`${studentData.firstName} ${studentData.lastName}`}
                  studentId={studentData.studentId}
                  expiryDate={studentData.expiryDate}
                  issuedDate={studentData.issueDate}
                  photoUrl={profile?.profilePhoto}
                  qrValue={qrCodeData}
                />
              </div>

              {/* Action Buttons Below Card */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isDownloading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating PDF...
                    </div>
                  ) : (
                    <>
                      <Download size={24} />
                      Download Your Digital ID Card
                    </>
                  )}
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
