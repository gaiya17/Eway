import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, BookOpen, Play, CheckCircle, Clock, Plus,
  Search, Wifi, MapPin, User, Calendar, AlertCircle, Loader2,
} from 'lucide-react';

interface MyClassesPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  classes: {
    id: string;
    title: string;
    subject: string;
    schedule: string;
    time: string;
    duration: string;
    mode: string;
    thumbnail_url: string;
    teacher_id: string;
    profiles: { id: string; first_name: string; last_name: string; profile_photo?: string };
  };
}

interface Payment {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  classes: {
    id: string;
    title: string;
    subject: string;
    schedule: string;
    time: string;
    duration: string;
    mode: string;
    thumbnail_url: string;
    teacher_id: string;
    profiles: { first_name: string; last_name: string };
  };
}

export function MyClassesPage({ onLogout, onNavigate }: MyClassesPageProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [enrollRes, paymentRes] = await Promise.allSettled([
        apiClient.get('/payments/my-enrollments'),
        apiClient.get('/classes/my-payments'),
      ]);
      if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value.data || []);
      if (paymentRes.status === 'fulfilled') {
        // Only show pending/rejected (not approved — those show as enrollments)
        const pending = (paymentRes.value.data || []).filter((p: Payment) => p.status !== 'approved');
        setPayments(pending);
      }
    } catch (e) {
      console.error('Error loading classes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Combined list for display
  type DisplayItem =
    | { _type: 'enrollment'; data: Enrollment }
    | { _type: 'payment'; data: Payment };

  const allItems: DisplayItem[] = [
    ...enrollments.map((e) => ({ _type: 'enrollment' as const, data: e })),
    ...payments.map((p) => ({ _type: 'payment' as const, data: p })),
  ];

  const filteredItems = allItems.filter((item) => {
    const cls = item._type === 'enrollment' ? item.data.classes : (item.data as Payment).classes;
    const matchSearch =
      !searchQuery ||
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${cls.profiles?.first_name} ${cls.profiles?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return item._type === 'enrollment';
    if (activeFilter === 'pending') return item._type === 'payment' && (item.data as Payment).status === 'pending';
    if (activeFilter === 'rejected') return item._type === 'payment' && (item.data as Payment).status === 'rejected';
    return true;
  });

  const stats = {
    active: enrollments.length,
    pending: payments.filter((p) => p.status === 'pending').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
  };

  return (
    <>
      <DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
        breadcrumb="My Classes" activePage="classes" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => onNavigate?.('dashboard')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">My Classes</h1>
              <p className="text-white/60">Access and manage your enrolled courses</p>
            </div>
            <button onClick={() => onNavigate?.('purchase')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105">
              <Plus size={20} /> Browse Courses
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 hover:shadow-[0_0_32px_rgba(59,130,246,0.3)] transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Enrolled Classes</p>
                  <h3 className="text-white text-3xl font-bold">{stats.active}</h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen size={28} className="text-cyan-400" />
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6 hover:shadow-[0_0_32px_rgba(251,146,60,0.3)] transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Pending Review</p>
                  <h3 className="text-white text-3xl font-bold">{stats.pending}</h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock size={28} className="text-orange-400" />
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6 hover:shadow-[0_0_32px_rgba(239,68,68,0.3)] transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Payment Rejected</p>
                  <h3 className="text-white text-3xl font-bold">{stats.rejected}</h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Search & Filter */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input type="text" placeholder="Search classes..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {([['all', 'All'], ['active', 'Enrolled'], ['pending', 'Pending'], ['rejected', 'Rejected']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setActiveFilter(id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${activeFilter === id ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-cyan-400" size={40} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-white/60 text-lg">No classes found</p>
              <p className="text-white/40 text-sm mt-2">Browse courses and enroll to get started</p>
              <button onClick={() => onNavigate?.('purchase')}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => {
                const isEnrollment = item._type === 'enrollment';
                const cls = isEnrollment ? (item.data as Enrollment).classes : (item.data as Payment).classes;
                const paymentData = !isEnrollment ? (item.data as Payment) : null;

                return (
                  <GlassCard key={index} className="p-0 overflow-hidden group hover:shadow-[0_0_32px_rgba(59,130,246,0.4)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={cls.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000'}
                        alt={cls.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/60 to-transparent" />
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl border ${cls.mode === 'Online' ? 'bg-blue-500/30 text-blue-300 border-blue-400/50' : 'bg-orange-500/30 text-orange-300 border-orange-400/50'}`}>
                          {cls.mode === 'Online' ? <Wifi size={12} /> : <MapPin size={12} />}
                          {cls.mode}
                        </div>
                        {/* Status badge */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl border ${isEnrollment ? 'bg-green-500/30 text-green-300 border-green-400/50' : paymentData?.status === 'pending' ? 'bg-orange-500/30 text-orange-300 border-orange-400/50' : 'bg-red-500/30 text-red-300 border-red-400/50'}`}>
                          {isEnrollment ? <><Play size={12} /> Enrolled</> : paymentData?.status === 'pending' ? <><Clock size={12} /> Pending</> : <><AlertCircle size={12} /> Rejected</>}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <h3 className="text-white font-bold text-xl group-hover:text-cyan-400 transition-colors">{cls.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <User size={16} className="text-cyan-400" />
                          <span>{cls.profiles?.first_name} {cls.profiles?.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Calendar size={16} className="text-cyan-400" />
                          <span>{cls.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Clock size={16} className="text-cyan-400" />
                          <span>{cls.duration}</span>
                        </div>
                      </div>

                      {/* Rejection reason */}
                      {paymentData?.status === 'rejected' && paymentData.rejection_reason && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                          <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason:</p>
                          <p className="text-red-300 text-xs">{paymentData.rejection_reason}</p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {isEnrollment ? (
                          <button
                            onClick={() => onNavigate?.('student-class-view', { classId: cls.id, teacherId: cls.teacher_id })}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                            <Play size={16} /> Open Class
                          </button>
                        ) : paymentData?.status === 'pending' ? (
                          <div className="flex-1 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm text-center font-medium">
                            ⏳ Awaiting payment verification...
                          </div>
                        ) : (
                          <button onClick={() => onNavigate?.('checkout', { id: cls.id, title: cls.title, teacher: `${cls.profiles?.first_name} ${cls.profiles?.last_name}`, type: cls.mode.toLowerCase(), price: 0, thumbnail: cls.thumbnail_url || '' })}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_16px_rgba(239,68,68,0.6)] transition-all duration-300 flex items-center justify-center gap-2">
                            Resubmit Payment
                          </button>
                        )}
                        {isEnrollment && (
                          <button
                            onClick={() => onNavigate?.('chat', { id: cls.teacher_id })}
                            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all duration-300">
                            💬
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
      <AIChat />
    </>
  );
}
