import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  BookOpen,
  FileText,
  TrendingUp,
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Award,
  Activity,
  BarChart3,
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

interface TeacherDashboardHomeProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function TeacherDashboardHome({
  onLogout,
  onNavigate,
}: TeacherDashboardHomeProps) {
  const [profile, setProfile] = React.useState<{
    firstName: string;
    lastName: string;
    profilePhoto: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        const data = response.data;
        setProfile({
          firstName: data.first_name || 'Teacher',
          lastName: data.last_name || '',
          profilePhoto: data.profile_photo || '',
        });
      } catch (error) {
        console.error('Error fetching teacher dashboard profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    {
      id: 'classes',
      title: 'Manage Classes',
      description: 'Access and edit your courses',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      onClick: () => onNavigate?.('teacher-classes'),
    },
    {
      id: 'assignments',
      title: 'Create Assignment',
      description: 'Create or update assignments',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      onClick: () => onNavigate?.('teacher-assignments'),
    },
    {
      id: 'attendance',
      title: 'View Attendance',
      description: 'Monitor student attendance',
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      onClick: () => onNavigate?.('teacher-attendance'),
    },
  ];

  const stats = [
    {
      title: 'Total Classes',
      value: '8',
      icon: BookOpen,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      change: '+2 this month',
    },
    {
      title: 'Total Students',
      value: '215',
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      change: '+18 this month',
    },
    {
      title: 'Assignments',
      value: '12',
      icon: ClipboardList,
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
      change: '3 pending review',
    },
    {
      title: 'Attendance Rate',
      value: '94%',
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
      change: '+2% from last week',
    },
  ];

  const recentActivity = [
    {
      title: 'New assignment submission',
      description: 'React Components - Web Development Class',
      time: '15 minutes ago',
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Upcoming class today',
      description: 'Database Systems - 2:00 PM',
      time: 'In 3 hours',
      icon: Clock,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Assignment deadline approaching',
      description: 'UI/UX Design Project - Due in 2 days',
      time: '2 days remaining',
      icon: AlertCircle,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      title: 'Student query received',
      description: 'Question about JavaScript Arrays',
      time: '1 hour ago',
      icon: Users,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      title: 'Class completed successfully',
      description: 'Web Development - Morning Session',
      time: '3 hours ago',
      icon: Award,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
  ];

  const attendanceData = [
    { id: 'mon', day: 'Mon', rate: 92 },
    { id: 'tue', day: 'Tue', rate: 88 },
    { id: 'wed', day: 'Wed', rate: 95 },
    { id: 'thu', day: 'Thu', rate: 91 },
    { id: 'fri', day: 'Fri', rate: 94 },
    { id: 'sat', day: 'Sat', rate: 96 },
    { id: 'sun', day: 'Sun', rate: 89 },
  ];

  return (
    <DashboardLayout
      userRole="teacher"
      userName={profile ? `${profile.firstName} ${profile.lastName}` : 'Teacher'}
      userInitials={profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : 'TR'}
      profilePhoto={profile?.profilePhoto}
      notificationCount={8}
      breadcrumb="Dashboard"
      activePage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Greeting Card */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Teacher'}! 👋
            </h1>
            <p className="text-white/60">Let's inspire students today</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Activity size={20} className="text-green-400" />
            <div>
              <p className="text-xs text-white/60">Today's Classes</p>
              <p className="text-lg font-bold text-green-400">3</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <GlassCard
              key={action.id}
              className="p-6 cursor-pointer hover:scale-105 transition-transform duration-300 group"
              onClick={action.onClick}
            >
              <div
                className={`w-14 h-14 rounded-xl ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {action.title}
              </h3>
              <p className="text-white/60 text-sm">{action.description}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Hero Banner */}
      <GlassCard className="p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Eway Teacher Portal
          </h2>
          <p className="text-white/70 mb-4">
            Empowering Education Through Innovation
          </p>
          <button
            onClick={() => onNavigate?.('teacher-profile')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
          >
            View My Profile
          </button>
        </div>
      </GlassCard>

      {/* Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                >
                  <Icon className={stat.textColor} size={24} />
                </div>
              </div>
              <h3 className="text-white/60 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.change}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Recent Activity & Attendance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <Calendar className="text-white/40" size={20} />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={activity.iconColor} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-white/60 text-xs mb-1 truncate">
                      {activity.description}
                    </p>
                    <p className="text-white/40 text-xs">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Attendance Trend Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Attendance Trend</h3>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  key="xaxis"
                  dataKey="day"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  key="yaxis"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  domain={[80, 100]}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                />
                <Line
                  key="line"
                  type="monotone"
                  dataKey="rate"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  dot={{ fill: '#22D3EE', r: 5 }}
                  activeDot={{ r: 7, fill: '#06B6D4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-white/60">Weekly Average</span>
            <span className="text-cyan-400 font-bold">92.4%</span>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}