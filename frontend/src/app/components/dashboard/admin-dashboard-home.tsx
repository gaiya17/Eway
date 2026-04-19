import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import { AddUserModal } from './add-user-modal';
import { getGreeting } from '../../utils/helpers';
import {
  Users,
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  UserPlus,
  FileText,
  CheckCircle,
  ClipboardCheck,
  Cpu,
  HardDrive,
  Database,
  Wifi,
  Circle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdminDashboardHomeProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function AdminDashboardHome({ onLogout, onNavigate }: AdminDashboardHomeProps) {
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    profilePhoto: string;
  } | null>(null);
  const [stats, setStats] = useState<{
    users: number;
    revenue: number;
    pendingPayments: number;
    attendanceToday: number;
    totalLogs: number;
    recentActivities: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          apiClient.get('/users/profile'),
          apiClient.get('/admin/dashboard-stats')
        ]);
        
        setProfile({
          firstName: profileRes.data.first_name || 'Admin',
          lastName: profileRes.data.last_name || '',
          profilePhoto: profileRes.data.profile_photo || '',
        });
        
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  // Sample data for the chart
  const chartData = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1500 },
    { month: 'Mar', users: 1800 },
    { month: 'Apr', users: 2100 },
    { month: 'May', users: 2400 },
    { month: 'Jun', users: 2650 },
    { month: 'Jul', users: 2847 },
  ];

  // Recent activities data
  const activities = stats?.recentActivities || [];

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins";
    return Math.floor(seconds) + " secs";
  };

  // System health data
  const systemHealth = [
    { label: 'CPU Usage', value: 45, color: 'from-blue-500 to-cyan-500' },
    { label: 'Memory', value: 62, color: 'from-purple-500 to-pink-500' },
    { label: 'Storage', value: 78, color: 'from-orange-500 to-red-500' },
    { label: 'Network', value: 34, color: 'from-green-500 to-teal-500' },
  ];

  // Quick actions
  const quickActions = [
    { icon: UserPlus, label: 'Add User', color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, label: 'View Reports', color: 'from-purple-500 to-pink-500' },
    { icon: CheckCircle, label: 'Verify Payment', color: 'from-green-500 to-teal-500' },
    { icon: ClipboardCheck, label: 'Check Attendance', color: 'from-orange-500 to-yellow-500' },
  ];

  // State to control the Add User modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <DashboardLayout
      userRole="admin"
      userName={profile ? `${profile.firstName} ${profile.lastName}` : 'Admin'}
      userInitials={profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : 'AD'}
      profilePhoto={profile?.profilePhoto}
      notificationCount={7}
      breadcrumb="Dashboard"
      activePage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      showSystemStatus={true}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{getGreeting()}, {profile?.firstName || 'Admin'} 👋</h1>
        <p className="text-white/60">System Control & Performance Overview</p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Users className="text-blue-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>+12.5%</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Total Users</h3>
          <p className="text-white text-3xl font-bold">{stats?.users.toLocaleString() || '0'}</p>
        </GlassCard>

        {/* Active Sessions */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Activity className="text-purple-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>+8.2%</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Active Sessions</h3>
          <p className="text-white text-3xl font-bold">{stats?.totalLogs.toLocaleString() || '0'}</p>
        </GlassCard>

        {/* Revenue */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <DollarSign className="text-green-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>+15.3%</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Total Revenue</h3>
          <p className="text-white text-3xl font-bold">LKR {stats?.revenue.toLocaleString() || '0'}</p>
        </GlassCard>

        {/* Pending Payments */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Clock className="text-orange-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <TrendingDown size={16} />
              <span>-3.1%</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Pending Payments</h3>
          <p className="text-white text-3xl font-bold">{stats?.pendingPayments || '0'}</p>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* System Usage Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              System Usage – Last 30 Days
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs key="admin-chart-defs">
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop key="start" offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop key="end" offset="95%" stopColor="#22D3EE" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    key="xaxis"
                    dataKey="month"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    key="yaxis"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    key="tooltip"
                    contentStyle={{
                      backgroundColor: 'rgba(26, 31, 46, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    key="line"
                    type="monotone"
                    dataKey="users"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ fill: '#22D3EE', r: 5 }}
                    activeDot={{ r: 7, fill: '#22D3EE' }}
                    fill="url(#colorUsers)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activities Panel */}
        <div>
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {activity.user}
                    </p>
                    <p className="text-white/60 text-sm">{activity.action}</p>
                    <p className="text-white/40 text-[10px] mt-1 font-mono uppercase tracking-tighter">{timeSince(activity.time)} ago</p>
                  </div>
                </div>
              )) : (
                <p className="text-white/40 text-center py-10 italic">No recent activities available.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Panel */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
          <div className="space-y-6">
            {systemHealth.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 font-semibold">{item.label}</span>
                  <span className="text-white/60 font-semibold">{item.value}%</span>
                </div>
                <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* System Status Indicators */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-white/80 font-semibold mb-4 text-sm">System Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Circle className="text-green-400 fill-green-400" size={12} />
                <div>
                  <p className="text-white/60 text-xs">Database</p>
                  <p className="text-white text-sm font-semibold">Stable</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="text-green-400 fill-green-400" size={12} />
                <div>
                  <p className="text-white/60 text-xs">Server</p>
                  <p className="text-white text-sm font-semibold">Online</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions Panel */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (action.label === 'Add User') {
                      setIsAddUserModalOpen(true);
                    } else if (action.label === 'View Reports') {
                      onNavigate?.('reports');
                    } else if (action.label === 'Verify Payment') {
                      onNavigate?.('verify-payments');
                    } else if (action.label === 'Check Attendance') {
                      onNavigate?.('attendance');
                    }
                  }}
                  className="group relative overflow-hidden rounded-xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-3 text-center relative z-10">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-20`}
                    >
                      <Icon className="text-white" size={28} />
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {action.label}
                    </span>
                  </div>
                  {/* Hover Glow Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                </button>
              );
            })}
          </div>

          {/* Additional Quick Stats */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Database className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Storage Used</p>
                  <p className="text-white font-bold text-lg">156 GB</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Wifi className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Uptime</p>
                  <p className="text-white font-bold text-lg">99.8%</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />
    </DashboardLayout>
  );
}
