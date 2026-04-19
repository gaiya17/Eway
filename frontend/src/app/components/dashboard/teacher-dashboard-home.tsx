import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import { getGreeting as getGreetingHelper } from '../../utils/helpers';
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
  Radio,
  Bell,
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

// ─── Countdown Hook ────────────────────────────────────────────────────────
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = React.useState('');
  const [isLive, setIsLive] = React.useState(false);

  React.useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const now = Date.now();
      const start = new Date(targetDate).getTime();
      const end = start + 3 * 60 * 60 * 1000;
      const diff = start - now;
      if (now >= start && now <= end) {
        setIsLive(true); setTimeLeft('LIVE NOW');
      } else if (now > end) {
        setIsLive(false); setTimeLeft('Ended');
      } else {
        setIsLive(false);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { timeLeft, isLive };
}

// ─── Upcoming Class Row ────────────────────────────────────────────────────
function TeacherUpcomingClassRow({ session, onNavigate }: { session: any; onNavigate: (page: string) => void }) {
  const { timeLeft, isLive } = useCountdown(session.rawTime);
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
      isLive ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30' 
             : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isLive ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-white/10'
        }`}>
          <Radio size={24} className={isLive ? 'text-white animate-pulse' : 'text-white/60'} />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{session.title}</h3>
          <p className="text-white/60 text-sm mt-0.5">{session.className}</p>
        </div>
      </div>
      <div className="text-right sm:mr-6 hidden sm:block">
        <div className="flex items-center justify-end gap-2 text-white/70 text-sm mb-1.5">
          <Clock size={14} />
          {session.time}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide flex items-center justify-end gap-1.5 inline-flex ${
          isLive
            ? 'bg-green-500 text-white animate-pulse'
            : timeLeft === 'Ended'
            ? 'bg-white/10 text-white/40'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
          {isLive ? 'LIVE NOW' : timeLeft}
        </span>
      </div>
      <button 
        onClick={() => onNavigate('teacher-classes')}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2 ml-4 sm:ml-0"
      >
        <Radio size={16} /> Start Class
      </button>
    </div>
  );
}

interface TeacherDashboardHomeProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function TeacherDashboardHome({
  onLogout,
  onNavigate,
}: TeacherDashboardHomeProps): React.ReactElement {
  const [profile, setProfile] = React.useState<{
    firstName: string;
    lastName: string;
    profilePhoto: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dashboardData, setDashboardData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const profileRes = await apiClient.get('/users/profile');
        setProfile({
          firstName: profileRes.data.first_name || 'Teacher',
          lastName: profileRes.data.last_name || '',
          profilePhoto: profileRes.data.profile_photo || '',
        });

        const statsRes = await apiClient.get('/reports/teacher/dashboard-stats');
        setDashboardData(statsRes.data);
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);



  const getActivityStyles = (type: string) => {
    switch (type) {
      case 'submission':
        return { icon: CheckCircle, iconColor: 'text-green-400', bgColor: 'bg-green-500/20' };
      case 'attendance':
        return { icon: Clock, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/20' };
      case 'deadline':
        return { icon: AlertCircle, iconColor: 'text-orange-400', bgColor: 'bg-orange-500/20' };
      default:
        return { icon: Bell, iconColor: 'text-cyan-400', bgColor: 'bg-cyan-500/20' };
    }
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
      value: dashboardData?.stats?.totalClasses || '0',
      icon: BookOpen,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      change: 'Live from system',
    },
    {
      title: 'Total Students',
      value: dashboardData?.stats?.totalStudents || '0',
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      change: 'Enrolled students',
    },
    {
      title: 'Assignments',
      value: dashboardData?.stats?.assignments || '0',
      icon: ClipboardList,
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
      change: 'Created assignments',
    },
    {
      title: 'Attendance Rate',
      value: dashboardData?.stats?.attendanceRate || '0%',
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
      change: 'Average across classes',
    },
  ];

  const upcomingSessions = dashboardData?.upcomingSessions || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const attendanceData = dashboardData?.attendanceTrend || [
    { id: 'mon', day: 'Mon', rate: 0 },
    { id: 'tue', day: 'Tue', rate: 0 },
    { id: 'wed', day: 'Wed', rate: 0 },
    { id: 'thu', day: 'Thu', rate: 0 },
    { id: 'fri', day: 'Fri', rate: 0 },
    { id: 'sat', day: 'Sat', rate: 0 },
    { id: 'sun', day: 'Sun', rate: 0 },
  ];

  if (isLoading && !dashboardData) {
    return (
      <DashboardLayout
        userRole="teacher"
        breadcrumb="Teacher Dashboard"
        activePage="dashboard"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="teacher"
      breadcrumb="Overview"
      activePage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Greeting Header */}
      <div className="mb-8 p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">
              {getGreetingHelper()}, {profile?.firstName || 'Teacher'}! 🎓
            </h1>
            <p className="text-white/60 text-lg max-w-2xl">
              You have <span className="text-white font-bold">{dashboardData?.upcomingSessions?.filter((s:any) => s.isToday).length || 0} classes</span> scheduled for today. Ready to inspire your students?
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Activity size={20} className="text-green-400" />
            <div>
              <p className="text-xs text-white/60">Today's Classes</p>
              <p className="text-lg font-bold text-green-400">{dashboardData?.upcomingSessions?.filter((s:any) => s.isToday).length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <GlassCard
              key={action.id}
              className="p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              onClick={action.onClick}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className={`w-14 h-14 rounded-xl ${action.bgColor} flex items-center justify-center mb-4 relative z-10`}>
                <Icon className="text-white" size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                <p className="text-white/60 text-sm">{action.description}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="text-blue-400" size={24} />
        Your Upcoming Live Classes
      </h2>
      <GlassCard className="p-6 mb-8">
        <div className="space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session: any, index: number) => (
              <TeacherUpcomingClassRow key={index} session={session} onNavigate={onNavigate || (() => {})} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 italic">No upcoming sessions today or tomorrow.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <Bell className="text-white/40" size={20} />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any, index: number) => {
                const styles = getActivityStyles(activity.type);
                const Icon = styles.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${styles.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={styles.iconColor} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-1">{activity.title}</h4>
                      <p className="text-white/60 text-xs mb-1 truncate">{activity.description}</p>
                      <p className="text-white/40 text-xs">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-white/40 italic">No recent student activity.</p>
              </div>
            )}
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
                  domain={[0, 100]}
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
            <span className="text-cyan-400 font-bold">{dashboardData?.weeklyAvg || 0}%</span>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
