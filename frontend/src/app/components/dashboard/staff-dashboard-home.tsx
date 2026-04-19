import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import { getGreeting } from '../../utils/helpers';
import {
  CreditCard,
  FileText,
  QrCode,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  BarChart3,
  ClipboardCheck,
} from 'lucide-react';

interface StaffDashboardHomeProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function StaffDashboardHome({
  onLogout,
  onNavigate,
}: StaffDashboardHomeProps) {
  const [profile, setProfile] = React.useState<{
    firstName: string;
    lastName: string;
    profilePhoto: string;
  } | null>(null);
  const [statsData, setStatsData] = React.useState<{
    paymentsVerified: number;
    pendingApprovals: number;
    reportsGenerated: number;
    attendanceToday: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileResp, statsResp] = await Promise.all([
          apiClient.get('/users/profile'),
          apiClient.get('/users/staff/dashboard')
        ]);
        
        const pData = profileResp.data;
        setProfile({
          firstName: pData.first_name || 'Staff',
          lastName: pData.last_name || '',
          profilePhoto: pData.profile_photo || '',
        });

        setStatsData(statsResp.data.stats);
      } catch (error) {
        console.error('Error fetching staff dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);



  const quickActions = [
    {
      id: 'verify-payments',
      title: 'Verify Payments',
      description: 'Review and approve pending student payments.',
      icon: CreditCard,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      buttonText: 'Open Payment Verification',
      onClick: () => onNavigate?.('verify-payments'),
    },
    {
      id: 'generate-reports',
      title: 'Generate Reports',
      description: 'Create and export system reports.',
      icon: FileText,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      buttonText: 'Generate Reports',
      onClick: () => onNavigate?.('reports'),
    },
    {
      id: 'attendance-management',
      title: 'Attendance Management',
      description: 'Mark student attendance and manage QR scanning.',
      icon: QrCode,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      buttonText: 'Open Attendance Manager',
      onClick: () => onNavigate?.('attendance-management'),
    },
  ];

  const stats = [
    {
      title: 'Payments Verified',
      value: statsData?.paymentsVerified.toString() || '0',
      subtitle: 'Approved today',
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Pending Approvals',
      value: statsData?.pendingApprovals.toString() || '0',
      subtitle: 'Awaiting review',
      icon: Clock,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      title: 'Reports Generated',
      value: statsData?.reportsGenerated.toString() || '0',
      subtitle: 'Logs recorded today',
      icon: BarChart3,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Attendance Today',
      value: statsData?.attendanceToday.toString() || '0',
      subtitle: 'Scans & manual entries',
      icon: ClipboardCheck,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
  ];

  return (
    <DashboardLayout
      userRole="staff"
      notificationCount={5}
      breadcrumb="Dashboard"
      activePage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Greeting Banner */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {getGreeting()}, {profile?.firstName || 'Staff Member'}
        </h1>
        <p className="text-white/60 text-lg">
          Welcome to your staff dashboard
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <GlassCard key={action.id} className="p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl ${action.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={action.iconColor} size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-white/60 text-sm mb-6 flex-1">
                  {action.description}
                </p>
                <button
                  onClick={action.onClick}
                  className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {action.buttonText}
                  <ArrowRight size={18} />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* System Overview Panel */}
      <GlassCard className="p-8 mb-8 bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to Eway Staff Portal
            </h2>
            <p className="text-white/70 text-lg max-w-2xl">
              Manage attendance, verify payments, issue student cards, and generate reports.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-48 h-48 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 rounded-full blur-2xl"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-blue-500/30 to-cyan-400/30 rounded-full flex items-center justify-center">
                <Users className="text-white/40" size={80} />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* System Statistics */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">System Statistics</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={stat.iconColor} size={28} />
                </div>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-2">{stat.title}</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-white/50 text-xs">{stat.subtitle}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
