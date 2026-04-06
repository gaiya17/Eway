import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { CustomDropdown } from '../custom-dropdown';
import {
  ArrowLeft,
  Send,
  Upload,
  Eye,
  Trash2,
  CheckCircle,
  Bell,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface StaffNotificationsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  class: string;
  type: string;
  dateSent: string;
  status: string;
}

export function StaffNotificationsPage({
  onLogout,
  onNavigate,
}: StaffNotificationsPageProps) {
  const [title, setTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationHistoryItem | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [notificationHistory, setNotificationHistory] = useState<
    NotificationHistoryItem[]
  >([
    {
      id: '1',
      title: 'Payment Reminder',
      class: 'A/L ICT 2026',
      type: 'Reminder',
      dateSent: 'March 20, 2026',
      status: 'Sent',
    },
    {
      id: '2',
      title: 'Class Schedule Update',
      class: 'A/L Mathematics 2026',
      type: 'Class Update',
      dateSent: 'March 18, 2026',
      status: 'Sent',
    },
    {
      id: '3',
      title: 'Exam Announcement',
      class: 'A/L Physics 2026',
      type: 'Announcement',
      dateSent: 'March 15, 2026',
      status: 'Sent',
    },
    {
      id: '4',
      title: 'System Maintenance Notice',
      class: 'All Classes',
      type: 'System Notice',
      dateSent: 'March 10, 2026',
      status: 'Sent',
    },
    {
      id: '5',
      title: 'Assignment Deadline Extension',
      class: 'A/L ICT 2026',
      type: 'Class Update',
      dateSent: 'March 8, 2026',
      status: 'Sent',
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSendNotification = () => {
    if (!title || !selectedClass || !notificationType || !message) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new notification
    const newNotification: NotificationHistoryItem = {
      id: Date.now().toString(),
      title,
      class: selectedClass,
      type: notificationType,
      dateSent: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      status: 'Sent',
    };

    setNotificationHistory([newNotification, ...notificationHistory]);

    // Reset form
    setTitle('');
    setSelectedClass('');
    setNotificationType('');
    setMessage('');
    setAttachment(null);

    // Show success toast
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleCancel = () => {
    setTitle('');
    setSelectedClass('');
    setNotificationType('');
    setMessage('');
    setAttachment(null);
  };

  const handleViewNotification = (notification: NotificationHistoryItem) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };

  const handleDeleteNotification = (notification: NotificationHistoryItem) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      setNotificationHistory(
        notificationHistory.filter((n) => n.id !== selectedNotification.id)
      );
      setShowDeleteModal(false);
      setSelectedNotification(null);
    }
  };

  return (
    <DashboardLayout
      userRole="staff"
      userName="Ms. Silva"
      userInitials="MS"
      notificationCount={5}
      breadcrumb="Notifications"
      activePage="notifications"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-4"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-white/60">Send announcements and monitor system alerts</p>
      </div>

      {/* Create Notification Panel */}
      <GlassCard className="p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6">Create Notification</h2>

        <div className="space-y-4">
          {/* Notification Title */}
          <div>
            <label className="block text-white/80 font-semibold mb-2">
              Notification Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Payment Reminder"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Class Selection and Notification Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 font-semibold mb-2">
                Class Selection <span className="text-red-400">*</span>
              </label>
              <CustomDropdown
                value={selectedClass}
                onChange={setSelectedClass}
                options={[
                  { value: '', label: 'Select Class' },
                  { value: 'A/L ICT 2026', label: 'A/L ICT 2026' },
                  { value: 'A/L Mathematics 2026', label: 'A/L Mathematics 2026' },
                  { value: 'A/L Physics 2026', label: 'A/L Physics 2026' },
                  { value: 'All Classes', label: 'All Classes' },
                ]}
                placeholder="Select Class"
                label="Class Selection"
              />
            </div>

            <div>
              <label className="block text-white/80 font-semibold mb-2">
                Notification Type <span className="text-red-400">*</span>
              </label>
              <CustomDropdown
                value={notificationType}
                onChange={setNotificationType}
                options={[
                  { value: '', label: 'Select Type' },
                  { value: 'Announcement', label: 'Announcement' },
                  { value: 'Payment Reminder', label: 'Payment Reminder' },
                  { value: 'Class Update', label: 'Class Update' },
                  { value: 'System Notice', label: 'System Notice' },
                ]}
                placeholder="Select Type"
                label="Notification Type"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-white/80 font-semibold mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to students..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-white/80 font-semibold mb-2">
              Attachment (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Upload size={20} className="text-blue-400" />
                <span>
                  {attachment ? attachment.name : 'Upload file (PDF / Image / Document)'}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSendNotification}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              <Send size={18} />
              Send Notification
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Notification Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Send className="text-blue-400" size={24} />
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Notifications Sent</h3>
          <p className="text-3xl font-bold text-white">{notificationHistory.length}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Bell className="text-orange-400" size={24} />
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Unread Notifications</h3>
          <p className="text-3xl font-bold text-white">5</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertCircle className="text-red-400" size={24} />
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">System Alerts</h3>
          <p className="text-3xl font-bold text-white">3</p>
        </GlassCard>
      </div>

      {/* Notification History */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Notification History</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/80 font-semibold">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-white/80 font-semibold">
                  Class
                </th>
                <th className="text-left py-3 px-4 text-white/80 font-semibold">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-white/80 font-semibold">
                  Date Sent
                </th>
                <th className="text-left py-3 px-4 text-white/80 font-semibold">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-white/80 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {notificationHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    No notifications sent yet
                  </td>
                </tr>
              )}
              {notificationHistory.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-white">{notification.title}</td>
                  <td className="py-4 px-4 text-white/70">{notification.class}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-semibold">
                      {notification.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white/70">{notification.dateSent}</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={16} />
                      {notification.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewNotification(notification)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-[0_0_16px_rgba(59,130,246,0.4)] transition-all duration-300"
                        title="View Notification"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all duration-300"
                        title="Delete Notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* View Notification Modal */}
      {showViewModal && selectedNotification && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="bg-[#1A1F2E] border border-white/10 rounded-2xl p-6 max-w-2xl w-full"
            style={{
              animation: 'scaleIn 0.2s ease-out',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Notification Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Title</p>
                <p className="text-white font-semibold text-lg">
                  {selectedNotification.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Class</p>
                  <p className="text-white">{selectedNotification.class}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Type</p>
                  <p className="text-blue-400">{selectedNotification.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Date Sent</p>
                  <p className="text-white">{selectedNotification.dateSent}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Status</p>
                  <p className="text-green-400">{selectedNotification.status}</p>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-2">Message Preview</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/70">
                    This is a preview of the notification message that was sent to
                    students.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="bg-[#1A1F2E] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            style={{
              animation: 'scaleIn 0.2s ease-out',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Delete Notification</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-white/70 mb-6">
              Are you sure you want to delete "{selectedNotification.title}"? This
              action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-[0_0_24px_rgba(34,197,94,0.6)] flex items-center gap-3 z-50"
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <CheckCircle size={24} />
          <span className="font-semibold">Notification sent successfully!</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
