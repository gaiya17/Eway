import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  QrCode,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function MyAttendancePage({ onLogout, onNavigate }: { onLogout?: () => void, onNavigate?: (p: string) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, profileRes] = await Promise.all([
          apiClient.get('/attendance/student/history'),
          apiClient.get('/users/profile')
        ]);
        setHistory(historyRes.data);
        setProfile(profileRes.data);
      } catch (error) {
        console.error('Error fetching student attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    total: history.length,
    present: history.filter(h => h.status === 'Present').length,
    late: history.filter(h => h.status === 'Late').length,
    percentage: history.length > 0 ? Math.round((history.filter(h => h.status === 'Present' || h.status === 'Late').length / history.length) * 100) : 0
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" activePage="my-attendance" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="student"
      notificationCount={5}
      breadcrumb="My Attendance"
      activePage="my-attendance"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Attendance</h1>
            <p className="text-white/60">Track your class participation and scan history</p>
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2 group"
          >
            <QrCode size={20} className="group-hover:rotate-12 transition-transform" />
            Show Attendance QR
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Attendance Rate</span>
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.percentage}%</p>
            <p className="text-white/40 text-xs">Excluding unrecorded sessions</p>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">On Time</span>
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.present}</p>
            <p className="text-white/40 text-xs">Total present sessions</p>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Late Sessions</span>
              <Clock className="text-yellow-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.late}</p>
            <p className="text-white/40 text-xs">Arrived after threshold</p>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Total Classes</span>
              <CalendarIcon className="text-indigo-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-white/40 text-xs">Recorded log entries</p>
          </GlassCard>
        </div>

        {/* History Table */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Attendance Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">Date</th>
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">Class / Subject</th>
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">Time Recorded</th>
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">Method</th>
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{new Date(record.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-white/40 text-[10px]">{new Date(record.session_date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-white font-semibold">
                       {record.classes?.subject} - {record.classes?.title}
                    </td>
                    <td className="py-5 px-4 text-white/60 text-sm">
                      {new Date(record.marked_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="py-5 px-4">
                       <span className="px-2 py-1 rounded-md bg-white/5 text-white/50 text-[10px] uppercase font-bold border border-white/10">
                          {record.method.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit ${
                        record.status === 'Present' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : record.status === 'Late'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {record.status === 'Present' ? <CheckCircle size={14} /> : record.status === 'Late' ? <Clock size={14} /> : <XCircle size={14} />}
                        {record.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <CalendarIcon className="text-white/10 mx-auto mb-4" size={48} />
                      <p className="text-white/40 font-medium">No attendance records found</p>
                      <p className="text-white/20 text-sm mt-1">Your attendance will be logged automatically when joining sessions or by scanning your ID.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <GlassCard className="p-8 max-w-sm w-full border-blue-500/30 text-center relative">
            <button
               onClick={() => setShowQRModal(false)}
               className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"
            >
               <XCircle size={24} />
            </button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">My Attendance QR</h2>
              <p className="text-white/40 text-sm italic">Scan this at the institute entrance</p>
            </div>
            <div className="p-4 bg-white rounded-3xl inline-block shadow-[0_0_50px_rgba(59,130,246,0.5)] border-8 border-blue-500/20 mb-8">
               <QRCodeSVG value={profile?.student_id || 'PENDING'} size={220} level="H" includeMargin />
            </div>
            <div className="space-y-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Student Reference</p>
                  <p className="text-white font-bold text-xl tracking-tighter">{profile?.student_id}</p>
               </div>
               <p className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Ready for scanning
               </p>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-8 w-full py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
            >
              Close Panel
            </button>
          </GlassCard>
        </div>
      )}
      <AIChat />
    </DashboardLayout>
  );
}
