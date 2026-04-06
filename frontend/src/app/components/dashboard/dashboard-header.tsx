import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, HelpCircle, User, Settings, LogOut, Clock, X } from 'lucide-react';
import apiClient from '@/api/api-client';
import { useNotifications } from '@/hooks/useNotifications';

interface DashboardHeaderProps {
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  breadcrumb?: string;
  onHelpClick?: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  userRole?: string;
  profilePhoto?: string;
  showSystemStatus?: boolean;
  userId?: string;
}

export function DashboardHeader({
  userName = 'Guest User',
  userInitials = 'GU',
  notificationCount = 0,
  breadcrumb = 'Dashboard',
  onHelpClick,
  onNavigate,
  onLogout,
  userRole = 'User',
  profilePhoto = '',
  showSystemStatus = false,
  userId,
}: DashboardHeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { notifications, unreadCount, markAsRead } = useNotifications(userId || null);

  const typeToIcon = (type: string) => {
    if (type === 'success') return '🎉';
    if (type === 'error') return '❌';
    if (type === 'warning') return '⚠️';
    if (type === 'system') return '🔧';
    return '📚';
  };

  const typeToCategory = (type: string) => {
    if (type === 'success' || type === 'error') return 'Payment';
    if (type === 'warning') return 'Warning';
    if (type === 'system') return 'System';
    return 'Academic';
  };

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotificationDropdown(false);
  };

  const handleViewAllNotifications = () => {
    setShowNotificationDropdown(false);
    onNavigate?.('notifications');
  };

  const handleProfileNavigate = () => {
    setShowProfileDropdown(false);
    onNavigate?.('profile');
  };

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    onLogout?.();
  };

  return (
    <div className="h-20 bg-white/5 backdrop-blur-[15px] border-b border-white/10 flex items-center justify-between px-8 relative z-40">
      {/* Left: Breadcrumb */}
      <div>
        <h2 className="text-2xl font-bold text-white">{breadcrumb}</h2>
      </div>

      {/* Right: Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Help Button */}
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <HelpCircle size={20} className="text-white/70 group-hover:text-cyan-400" />
          </button>
        )}

        {/* Notification Bell with Dropdown */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={handleNotificationClick}
            className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <Bell size={20} className="text-white/70 group-hover:text-white" />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-[0_0_16px_rgba(239,68,68,0.6)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                {/* Red dot indicator */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2 duration-300">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Notifications</h3>
                <button
                  onClick={() => setShowNotificationDropdown(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} className="text-white/70" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-white/50">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) markAsRead(notification.id);
                        if (notification.type === 'Assignment') onNavigate?.('student-assignments');
                        // Expandable actions here based on type/class
                      }}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-500/5 border-l-2 border-l-cyan-400' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-2xl">{typeToIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-white font-semibold text-sm">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                            )}
                          </div>
                          <p className="text-white/60 text-xs mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-white/40" />
                            <span className="text-white/40 text-xs">{relativeTime(notification.created_at)}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 text-xs">
                              {typeToCategory(notification.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleViewAllNotifications}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile with Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
          >
            <div className="relative">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt={userName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-cyan-400 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm">
                  {userInitials}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0F1A]" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-white font-medium text-sm">{userName}</p>
              <p className="text-white/60 text-xs capitalize">{userRole}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-white/70 group-hover:text-white hidden md:block transition-transform ${
                showProfileDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_48px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2 duration-300">
              {/* User Info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt={userName} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white">
                      {userInitials}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">{userName}</p>
                    <p className="text-white/60 text-xs capitalize">{userRole}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={handleProfileNavigate}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                >
                  <User size={18} className="group-hover:text-cyan-400" />
                  <span className="font-medium">My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    // Settings functionality can be added later
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                >
                  <Settings size={18} className="group-hover:text-cyan-400" />
                  <span className="font-medium">Settings</span>
                  <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-white/10">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/10 transition-all duration-300 group"
                >
                  <LogOut size={18} className="group-hover:text-red-400" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
