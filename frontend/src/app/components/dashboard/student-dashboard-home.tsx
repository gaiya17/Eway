import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import { DemoGuide } from './demo-guide';
import { getGreeting as getGreetingHelper } from '../../utils/helpers';
import {
  BookOpen, QrCode, FileText, CreditCard, TrendingUp, Clock,
  Video, CheckCircle, Calendar, DollarSign, Award, Target,
  Radio, ExternalLink, Loader2, ArrowRight
} from 'lucide-react';

// ─── Countdown Hook ────────────────────────────────────────────────────────
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
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
function UpcomingClassRow({ classItem, onNavigate }: { classItem: any; onNavigate: (page: string, data?: any) => void }) {
  const { timeLeft, isLive } = useCountdown(classItem.rawTime);
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
      isLive ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
             : 'bg-white/5 hover:bg-white/10 border-white/10'
    }`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isLive ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                 : 'bg-white/10'
        }`}>
          <Radio size={24} className={isLive ? 'text-white animate-pulse' : 'text-white/60'} />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{classItem.name || classItem.title}</h3>
          <p className="text-white/60 text-sm mt-0.5">{classItem.teacher}</p>
        </div>
      </div>
      <div className="text-right sm:mr-6 hidden sm:block">
        <div className="flex items-center justify-end gap-2 text-white/70 text-sm mb-1.5">
          <Clock size={14} />
          {classItem.time}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide flex items-center justify-end gap-1.5 inline-flex ${
          isLive
            ? 'bg-green-500 text-white animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]'
            : timeLeft === 'Ended'
            ? 'bg-white/10 text-white/40'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
          {isLive ? 'LIVE NOW' : timeLeft}
        </span>
      </div>
      <button 
        onClick={() => onNavigate('class-dashboard', { classId: classItem.classId })}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm shadow-md hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-0.5 flex items-center gap-2 group-hover:scale-105 ml-4 sm:ml-0"
      >
        Open
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

interface StudentDashboardHomeProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function StudentDashboardHome({ onLogout, onNavigate }: StudentDashboardHomeProps) {
  const [showGuide, setShowGuide] = useState(true);
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    studentId: string;
    profilePhoto: string;
  } | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      attendanceRate: number;
      upcomingCount: number;
      completedAssignments: number;
      overallScore: number;
    };
    upcomingClasses: any[];
    recentActivity: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileResp, dashboardResp] = await Promise.all([
          apiClient.get('/users/profile'),
          apiClient.get('/users/student/dashboard')
        ]);
        
        const pData = profileResp.data;
        setProfile({
          firstName: pData.first_name || 'Student',
          lastName: pData.last_name || '',
          studentId: pData.student_id || 'PENDING',
          profilePhoto: pData.profile_photo || '',
        });

        setDashboardData(dashboardResp.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);



  const quickActions = [
    {
      id: 'classes',
      title: 'My Classes',
      description: '6 active courses',
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/20',
    },
    {
      id: 'attendance',
      title: 'QR Attendance',
      description: 'Mark your presence',
      icon: QrCode,
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/20',
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: '2 pending tasks',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'View transactions',
      icon: CreditCard,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
    },
  ];

  const upcomingClasses = [
    {
      name: 'Web Development',
      teacher: 'Prof. Sarah Johnson',
      time: '10:00 AM - 11:30 AM',
      status: 'Starting Soon',
      color: 'blue',
    },
    {
      name: 'Database Systems',
      teacher: 'Dr. Michael Chen',
      time: '2:00 PM - 3:30 PM',
      status: 'Today',
      color: 'cyan',
    },
    {
      name: 'UI/UX Design',
      teacher: 'Emily Rodriguez',
      time: '4:30 PM - 6:00 PM',
      status: 'Today',
      color: 'purple',
    },
  ];

  const recentActivity = [
    {
      title: 'Assignment Submitted',
      description: 'React Components - Web Development',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-400',
    },
    {
      title: 'Payment Completed',
      description: 'Course fee for Database Systems',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-blue-400',
    },
    {
      title: 'Class Attended',
      description: 'UI/UX Design - Session 12',
      time: '2 days ago',
      icon: Video,
      color: 'text-cyan-400',
    },
    {
      title: 'Achievement Unlocked',
      description: 'Perfect Attendance for January',
      time: '3 days ago',
      icon: Award,
      color: 'text-yellow-400',
    },
  ];

  // Circular progress component
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#06B6D4' }: { percentage: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Demo Guide */}
      {showGuide && <DemoGuide onClose={() => setShowGuide(false)} />}

      <DashboardLayout
        userRole="student"
        notificationCount={5}
        breadcrumb="Dashboard"
        activePage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onHelpClick={() => setShowGuide(true)}
      >
        <div className="space-y-8">
          {/* SECTION 1: SMART GREETING CARD */}
          <GlassCard className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {getGreetingHelper()}, {profile?.firstName || 'Student'} 👋
                </h1>
                <p className="text-white/70 text-lg mb-6">
                  Ready to continue your learning journey?
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate?.('classes')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105"
                  >
                    My Classes
                  </button>
                  <button
                    onClick={() => onNavigate?.('purchase')}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    Purchase Classes
                  </button>
                  <button
                    onClick={() => onNavigate?.('tutorials')}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    Free Tutorials
                  </button>
                </div>
              </div>

              {/* Student Avatar & ID */}
              <div className="hidden xl:flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/30 backdrop-blur-xl border-4 border-white/10 flex items-center justify-center overflow-hidden">
                    {profile?.profilePhoto ? (
                      <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">👨‍🎓</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-sm font-bold whitespace-nowrap shadow-lg">
                    ID: {profile?.studentId ? profile.studentId : 'PENDING'}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* SECTION 2: WELCOME BANNER (NEW) */}
          <GlassCard className="relative overflow-hidden p-0 group hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500">
            {/* Background with Gradient and Optional Image */}
            <div className="absolute inset-0 z-0">
              {/* Optional Background Image */}
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBjbGFzc3Jvb20lMjBzdHVkZW50c3xlbnwxfHx8fDE3NDAyNTg1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Education"
                className="w-full h-full object-cover opacity-10 blur-sm"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] via-[#0EA5E9] to-[#1E3A8A] opacity-90" />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content */}
            <div className="relative z-10 py-16 px-12 text-center">
              {/* Top Badge */}
              <div className="inline-block mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="px-5 py-2 rounded-full bg-cyan-400/10 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_24px_rgba(6,182,212,0.3)]">
                  <span className="text-cyan-300 font-semibold text-sm tracking-wide">
                    ✨ Empowering Learning with Innovation
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-3 leading-tight tracking-tight">
                  Welcome to EWAY
                </h2>
                <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                    Student Portal
                  </span>
                </h2>
              </div>

              {/* Subtext */}
              <p className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                Your gateway to quality education, seamless learning, and academic excellence.
              </p>

              {/* Decorative Elements */}
              <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full bg-blue-400/10 blur-3xl" />
            </div>
          </GlassCard>

          {/* SECTION 3: QUICK ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate?.(action.id)}
                  className="group"
                >
                  <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_32px_rgba(59,130,246,0.3)]">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{action.title}</h3>
                    <p className="text-white/60 text-sm">{action.description}</p>
                  </GlassCard>
                </button>
              );
            })}
          </div>

          {/* SECTION 4: LEARNING OVERVIEW */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Learning Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Attendance Rate with Circular Progress */}
              <GlassCard className="p-6 flex flex-col items-center justify-center">
                <CircularProgress percentage={dashboardData?.stats.attendanceRate || 0} color="#06B6D4" />
                <h3 className="text-white font-bold text-lg mt-4">Attendance Rate</h3>
                <p className="text-white/60 text-sm">Overall attendance</p>
              </GlassCard>

              {/* Upcoming Classes */}
              <GlassCard className="p-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 flex items-center justify-center mb-4">
                  <Calendar size={40} className="text-blue-400" />
                </div>
                <h3 className="text-5xl font-bold text-white mb-2">{dashboardData?.stats.upcomingCount || 0}</h3>
                <p className="text-white/70 font-semibold">Upcoming Live Classes</p>
                <p className="text-white/50 text-sm">Scheduled</p>
              </GlassCard>

              {/* Completed Assignments */}
              <GlassCard className="p-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center mb-4">
                  <CheckCircle size={40} className="text-green-400" />
                </div>
                <h3 className="text-5xl font-bold text-white mb-2">{dashboardData?.stats.completedAssignments || 0}</h3>
                <p className="text-white/70 font-semibold">Completed</p>
                <p className="text-white/50 text-sm">Assignments</p>
              </GlassCard>

              {/* Overall Score */}
              <GlassCard className="p-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center mb-4">
                  <Target size={40} className="text-cyan-400" />
                </div>
                <h3 className="text-5xl font-bold text-white mb-2">{dashboardData?.stats.overallScore || 0}%</h3>
                <p className="text-white/70 font-semibold">Overall Score</p>
                <p className="text-white/50 text-sm">Avg. Assignment Grade</p>
              </GlassCard>
            </div>
          </div>

          {/* SECTION 5: UPCOMING CLASSES */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Classes</h2>
            <GlassCard className="p-6">
              <div className="space-y-4">
                {(!dashboardData?.upcomingClasses || dashboardData.upcomingClasses.length === 0) ? (
                  <div className="text-center py-10">
                    <Calendar className="mx-auto text-white/20 mb-3" size={48} />
                    <p className="text-white/40">No upcoming live classes scheduled.</p>
                  </div>
                ) : (
                  dashboardData.upcomingClasses.map((classItem, index) => (
                    <UpcomingClassRow key={index} classItem={classItem} onNavigate={onNavigate || (() => {})} />
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* SECTION 6: RECENT ACTIVITY TIMELINE */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <GlassCard className="p-6">
              <div className="space-y-6">
                {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) ? (
                  <div className="text-center py-10 text-white/40">
                    No recent activity found.
                  </div>
                ) : (
                  dashboardData.recentActivity.map((activity, index) => {
                    const getActivityIcon = () => {
                      if (activity.type === 'submission') return CheckCircle;
                      if (activity.type === 'payment') return DollarSign;
                      return activity.category === 'Class_Request' ? BookOpen : Calendar;
                    };
                    const getActivityColor = () => {
                      if (activity.type === 'submission') return 'text-green-400';
                      if (activity.type === 'payment') return activity.status === 'approved' ? 'text-green-400' : 'text-blue-400';
                      return 'text-cyan-400';
                    };
                    const Icon = getActivityIcon();
                    const color = getActivityColor();

                    return (
                      <div key={index} className="flex items-start gap-4 relative">
                        {/* Timeline Line */}
                        {index !== dashboardData.recentActivity.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-12 bg-white/10" />
                        )}

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 relative z-10">
                          <Icon size={20} className={color} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <h4 className="text-white font-semibold">{activity.title}</h4>
                          <p className="text-white/60 text-sm">{activity.description}</p>
                        </div>

                        {/* Time */}
                        <div className="text-white/50 text-sm pt-2">
                          {new Date(activity.time).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? 'Today' 
                            : new Date(activity.time).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />
    </>
  );
}
