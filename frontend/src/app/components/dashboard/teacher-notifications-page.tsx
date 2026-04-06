import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  Bell,
  Send,
  Upload,
  X,
  CheckCircle,
  Clock,
  FileText,
  Paperclip,
  Info,
} from 'lucide-react';

interface TeacherNotificationsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

type NotificationType = 'announcement' | 'assignment' | 'class' | 'important' | 'system' | 'success' | 'error';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
  metadata?: any;
}

export function TeacherNotificationsPage({
  onLogout,
  onNavigate,
}: TeacherNotificationsPageProps) {
  const [notificationTitle, setNotificationTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType | ''>('');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'announcement':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            Announcement
          </span>
        );
      case 'assignment':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            Assignment
          </span>
        );
      case 'class':
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            Class
          </span>
        );
      case 'important':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">
            Important
          </span>
        );
      case 'system':
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
            System
          </span>
        );
      case 'success':
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
            Success
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">
            Action Required
          </span>
        );
      default:
        return null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleCancel = () => {
    setNotificationTitle('');
    setSelectedClass('');
    setNotificationType('');
    setMessage('');
    setAttachedFile(null);
  };

  const handleSendNotification = () => {
    if (!notificationTitle || !selectedClass || !notificationType || !message) {
      alert('Please fill in all required fields');
      return;
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: notificationTitle,
      type: notificationType as NotificationType,
      created_at: new Date().toISOString(),
      is_read: false,
      message: message,
    };

    setNotifications([newNotification, ...notifications]);

    // Reset form
    handleCancel();

    alert(`Notification sent to ${selectedClass} students!`);
  };

  return (
    <DashboardLayout
      userRole="teacher"
      userName="Teacher"
      userInitials="TR"
      notificationCount={notifications.filter(n => !n.is_read).length}
      breadcrumb="Notifications"
      activePage="notifications"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Notifications
            </h1>
            <p className="text-white/60">
              Send announcements and view notification history
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE - Create Notification */}
        <div>
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell size={24} className="text-blue-400" />
                Create Notification
              </h3>
              <p className="text-white/60 text-sm mt-1">
                Send announcements to your students
              </p>
            </div>

            <div className="space-y-5">
              {/* Notification Title */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">
                  Notification Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Assignment Reminder"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">
                  Select Class <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="" className="bg-[#0B0F1A]">
                    Select a class
                  </option>
                  <option value="A/L ICT 2026" className="bg-[#0B0F1A]">
                    A/L ICT 2026
                  </option>
                  <option value="A/L Maths 2026" className="bg-[#0B0F1A]">
                    A/L Maths 2026
                  </option>
                  <option value="A/L Physics 2026" className="bg-[#0B0F1A]">
                    A/L Physics 2026
                  </option>
                </select>
              </div>

              {/* Notification Type */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">
                  Notification Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value as NotificationType)}
                  className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  <option value="" className="bg-[#0B0F1A]">
                    Select type
                  </option>
                  <option value="announcement" className="bg-[#0B0F1A]">
                    Announcement
                  </option>
                  <option value="assignment" className="bg-[#0B0F1A]">
                    Assignment Reminder
                  </option>
                  <option value="class" className="bg-[#0B0F1A]">
                    Class Reminder
                  </option>
                  <option value="important" className="bg-[#0B0F1A]">
                    Important Notice
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message to students..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">
                  Attachment (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="block w-full px-4 py-8 rounded-xl bg-white/5 border-2 border-dashed border-white/20 text-center cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <Upload className="text-white/40 mx-auto mb-3" size={32} />
                    <p className="text-white/60 text-sm font-semibold mb-1">
                      Drag and drop file or click to upload
                    </p>
                    <p className="text-white/40 text-xs">
                      Supported files: PDF / Image / Document
                    </p>
                  </label>
                </div>

                {attachedFile && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip size={16} className="text-blue-400" />
                      <span className="text-white text-sm font-medium">
                        {attachedFile.name}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-white/60" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Notification
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT SIDE - Notification History */}
        <div>
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText size={24} className="text-cyan-400" />
                Notifications Box
              </h3>
              <p className="text-white/60 text-sm mt-1">
                {notifications.length} notification
                {notifications.length !== 1 ? 's' : ''} received
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-10">
                    <Bell className="mx-auto text-white/20 mb-3" size={48} />
                    <p className="text-white/40">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        notification.is_read
                          ? 'bg-white/5 border-white/10 text-white/60'
                          : 'bg-blue-500/10 border-blue-500/30 text-white ring-1 ring-blue-500/20 shadow-[0_0_16px_rgba(59,130,246,0.1)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${notification.is_read ? 'bg-white/20' : 'bg-blue-400 animate-pulse'}`} />
                          <h4 className="font-bold text-sm">{notification.title}</h4>
                        </div>
                        {getTypeBadge(notification.type)}
                      </div>
                      <p className="text-sm mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                          <Clock size={12} />
                          {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {!notification.is_read && (
                          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
                            <Info size={10} />
                            New Action
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-white/60 text-sm">
                Showing all received notifications
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
