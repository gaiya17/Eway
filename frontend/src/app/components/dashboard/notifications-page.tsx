import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import { 
  Bell, Mail, Send, Search, 
  CheckCircle2, AlertCircle, Clock, Inbox,
  RefreshCw, Loader2, User
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  recipient_id?: string;
  sender_id?: string;
  recipient?: {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  };
}

interface NotificationsPageProps {
  userRole: string;
  userName: string;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function NotificationsPage({ userRole, userName, onLogout, onNavigate }: NotificationsPageProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Compose State
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('All Students');
  const [isSending, setIsSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'inbox' ? '/notifications' : '/notifications/sent';
      if (activeTab === 'compose') {
        setIsLoading(false);
        return;
      }
      const res = await apiClient.get(endpoint);
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async () => {
    if (!composeTitle || !composeMessage) return alert('Please fill in all fields');
    setIsSending(true);
    try {
      await apiClient.post('/notifications/send', {
        title: composeTitle,
        message: composeMessage,
        recipient_role: recipientRole,
        type: 'Announcement'
      });
      alert('Notification sent successfully!');
      setComposeTitle('');
      setComposeMessage('');
      setActiveTab('sent');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'Enrollment': return <CheckCircle2 className="text-green-400" size={20} />;
      case 'Payment': return <AlertCircle className="text-orange-400" size={20} />;
      case 'Assignment': return <Mail className="text-blue-400" size={20} />;
      default: return <Bell className="text-cyan-400" size={20} />;
    }
  };

  const canCompose = ['admin', 'staff', 'teacher'].includes(userRole);

  return (
    <DashboardLayout 
      userRole={userRole as any} 
      userName={userName} 
      activePage="notifications"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Notification Center</h1>
        <p className="text-white/60">Stay updated with system activities and communications.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)]">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-4">
          <GlassCard className="p-2">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'inbox' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Inbox size={20} />
              <span className="font-semibold">Inbox</span>
              {activeTab === 'inbox' && notifications.some(n => !n.is_read) && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'sent' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send size={20} />
              <span className="font-semibold">Sent Items</span>
            </button>

            {canCompose && (
              <button
                onClick={() => setActiveTab('compose')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 ${
                  activeTab === 'compose' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <RefreshCw size={20} className={activeTab === 'compose' ? '' : 'text-green-400'} />
                <span className="font-semibold">Compose</span>
              </button>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4 text-white/40 text-xs font-bold uppercase tracking-wider">
              <span>Stats</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Total Items</span>
                <span className="text-white font-bold">{notifications.length}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full min-h-0">
          {activeTab === 'compose' ? (
            <GlassCard className="p-8 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Send className="text-green-400" /> New Broadcast
              </h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Recipient Group</label>
                  <select 
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 outline-none"
                  >
                    <option value="All Students" className="bg-[#0B0F1A]">All Students</option>
                    {userRole === 'admin' && <option value="All Teachers" className="bg-[#0B0F1A]">All Teachers</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Title</label>
                  <input 
                    type="text"
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                    placeholder="Enter notification title..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Message</label>
                  <textarea 
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50 outline-none resize-none"
                  />
                </div>
                <button
                  disabled={isSending}
                  onClick={handleSend}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  Send Broadcast
                </button>
              </div>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="p-4 mb-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search messages..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={fetchNotifications}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={18} />
                  </button>
                  {activeTab === 'inbox' && notifications.some(n => !n.is_read) && (
                    <button 
                      onClick={markAllAsRead}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </GlassCard>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <GlassCard className="p-12 flex flex-center flex-col items-center">
                    <Bell size={64} className="text-white/10 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No notifications found</h3>
                    <p className="text-white/40">Everything is caught up!</p>
                  </GlassCard>
                ) : (
                  filteredNotifications.map((notification) => (
                    <GlassCard 
                      key={notification.id} 
                      className={`p-5 transition-all hover:translate-x-1 border-l-4 ${
                        activeTab === 'inbox' && !notification.is_read 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : activeTab === 'sent' ? 'border-purple-500/40' : 'border-white/10'
                      }`}
                      onClick={() => activeTab === 'inbox' && !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 pt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-bold text-lg truncate ${activeTab === 'inbox' && !notification.is_read ? 'text-white' : 'text-white/80'}`}>
                              {notification.title}
                            </h3>
                            <span className="text-white/30 text-xs flex items-center gap-1 whitespace-nowrap">
                              <Clock size={12} />
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed mb-4">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {activeTab === 'sent' ? (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                  <User size={12} className="text-purple-400" />
                                  <span className="text-xs text-purple-300">
                                    To: {notification.recipient ? `${notification.recipient.first_name} ${notification.recipient.last_name}` : 'Unknown'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-white/30 px-2 py-0.5 rounded bg-white/5">
                                  {notification.type}
                                </span>
                              )}
                            </div>
                            {activeTab === 'inbox' && !notification.is_read && (
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </DashboardLayout>
  );
}
