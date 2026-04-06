import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, CheckCheck, Bell, BookOpen, CreditCard, AlertTriangle,
  Settings, Clock, Circle, Loader2, RefreshCw, Send, X, Users, User as UserIcon
} from 'lucide-react';

interface NotificationsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
  userRole?: 'student' | 'teacher' | 'staff' | 'admin';
  userId?: string;
}

type NotificationFilter = 'all' | 'unread' | 'academic' | 'classes' | 'payments' | 'warnings' | 'system';

interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const typeToCategory = (type: string): string => {
  const t = type?.toLowerCase();
  if (t === 'success' || t === 'payment' || t === 'enrollment') return 'Payment';
  if (t === 'error' || t === 'warning') return 'Warning';
  if (t === 'system') return 'System';
  return 'Academic';
};

const typeToIcon = (type: string): string => {
  const t = type?.toLowerCase();
  if (t === 'success' || t === 'enrollment') return '🎉';
  if (t === 'error') return '❌';
  if (t === 'warning') return '⚠️';
  if (t === 'system') return '🔧';
  if (t === 'assignment') return '📝';
  return '📚';
};

const relativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export function NotificationsPage({ onLogout, onNavigate, userRole, userId }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (e) { /* silently fail */ }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try { 
      await apiClient.post('/notifications/read-all'); 
    } catch (_) { /* */ }
  };

  const getFiltered = () => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter((n) => !n.is_read);
    const catMap: Record<string, string> = {
      academic: 'Academic', classes: 'Classes', payments: 'Payment',
      warnings: 'Warning', system: 'System'
    };
    return notifications.filter((n) => typeToCategory(n.type) === catMap[activeFilter]);
  };

  const filtered = getFiltered();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filterCategories = [
    { id: 'all', label: 'All Notifications', icon: Bell, count: notifications.length },
    { id: 'unread', label: 'Unread', icon: Circle, count: unreadCount },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: notifications.filter((n) => typeToCategory(n.type) === 'Payment').length },
    { id: 'academic', label: 'Academic', icon: BookOpen, count: notifications.filter((n) => typeToCategory(n.type) === 'Academic').length },
    { id: 'warnings', label: 'Warnings', icon: AlertTriangle, count: notifications.filter((n) => typeToCategory(n.type) === 'Warning').length },
    { id: 'system', label: 'System', icon: Settings, count: notifications.filter((n) => typeToCategory(n.type) === 'System').length },
  ];

  const getTypeColor = (type: string) => {
    const t = type?.toLowerCase();
    if (t === 'success' || t === 'enrollment') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (t === 'error') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (t === 'warning') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (t === 'system') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  // Compose State
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient_role: 'All Students',
    title: '',
    message: '',
    type: 'Info'
  });
  const [isSending, setIsSending] = useState(false);

  const canSend = ['admin', 'staff', 'teacher'].includes(userRole?.toLowerCase() || '');

  const handleSendNotification = async () => {
    if (!composeData.title || !composeData.message) return alert('Please fill in all fields');
    setIsSending(true);
    try {
      await apiClient.post('/notifications/send', composeData);
      alert('Notification sent successfully!');
      setShowCompose(false);
      setComposeData({ recipient_role: 'All Students', title: '', message: '', type: 'Info' });
      fetchNotifications();
    } catch (e: any) {
      alert('Failed to send: ' + (e.response?.data?.error || e.message));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <DashboardLayout userRole={userRole || 'student'} userName="User" userInitials="U"
        notificationCount={unreadCount} breadcrumb="Notifications" userId={userId}
        activePage="notifications" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => onNavigate?.('dashboard')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-white/60">Stay updated with your academic activities</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchNotifications}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold transition-all duration-300">
                <RefreshCw size={18} /> Refresh
              </button>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300">
                  <CheckCheck size={20} /> Mark read
                </button>
              )}
              {canSend && (
                <button onClick={() => setShowCompose(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105">
                  <Send size={20} /> Send Notification
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter sidebar */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6 sticky top-8">
                <h2 className="text-white font-bold text-lg mb-4">Filter By</h2>
                <div className="space-y-2">
                  {filterCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeFilter === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setActiveFilter(cat.id as NotificationFilter)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-cyan-400/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-white/70'} />
                          <span className={`font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>{cat.label}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/10 text-white/60'}`}>{cat.count}</span>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Notifications list */}
            <div className="lg:col-span-3">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-white font-bold text-xl">
                    {filterCategories.find((c) => c.id === activeFilter)?.label || 'Notifications'}
                  </h2>
                  <span className="text-white/60 text-sm">{filtered.length} total</span>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-cyan-400" size={32} />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-white/60 text-lg">No notifications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((n) => (
                      <div key={n.id} onClick={() => handleMarkRead(n.id)}
                        className={`p-5 rounded-xl transition-all duration-300 cursor-pointer group ${!n.is_read ? 'bg-blue-500/10 border-l-4 border-l-cyan-400 hover:bg-blue-500/15 shadow-[0_0_16px_rgba(6,182,212,0.2)]' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center text-2xl">
                              {typeToIcon(n.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors">{n.title}</h3>
                              {!n.is_read && <div className="w-3 h-3 bg-cyan-400 rounded-full flex-shrink-0 ml-2 mt-1 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />}
                            </div>
                            <p className="text-white/70 text-sm mb-3 leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                                <Clock size={14} />
                                <span>{relativeTime(n.created_at)}</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(n.type)}`}>
                                {typeToCategory(n.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <GlassCard className="w-full max-w-xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center">
                    <Send className="text-cyan-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Send Notification</h2>
                    <p className="text-white/50 text-sm">Broadcasting message to users</p>
                  </div>
                </div>
                <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} className="text-white/50" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm font-semibold ml-1">Target Recipients</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <select 
                        value={composeData.recipient_role}
                        onChange={(e) => setComposeData({...composeData, recipient_role: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none"
                      >
                        <option value="All Students" className="bg-[#0B0F1A]">All Students</option>
                        {userRole?.toLowerCase() === 'admin' && <option value="All Teachers" className="bg-[#0B0F1A]">All Teachers</option>}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm font-semibold ml-1">Notification Type</label>
                    <select 
                      value={composeData.type}
                      onChange={(e) => setComposeData({...composeData, type: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none"
                    >
                      <option value="Info" className="bg-[#0B0F1A]">Information</option>
                      <option value="Success" className="bg-[#0B0F1A]">Success / Approval</option>
                      <option value="Warning" className="bg-[#0B0F1A]">Warning</option>
                      <option value="Error" className="bg-[#0B0F1A]">Urgent / Error</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-semibold ml-1">Subject / Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter notification title..."
                    value={composeData.title}
                    onChange={(e) => setComposeData({...composeData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-semibold ml-1">Message Body</label>
                  <textarea 
                    rows={4}
                    placeholder="Type your message here..."
                    value={composeData.message}
                    onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowCompose(false)}
                    className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendNotification}
                    disabled={isSending}
                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {isSending ? 'Sending...' : 'Send Broadcast'}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
      <AIChat />
    </>
  );
}
