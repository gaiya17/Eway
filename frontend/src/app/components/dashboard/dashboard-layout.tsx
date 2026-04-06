import React, { ReactNode, useState, useEffect } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';
import apiClient from '@/api/api-client';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'student' | 'teacher' | 'staff' | 'admin';
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  breadcrumb?: string;
  activePage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onHelpClick?: () => void;
  showSystemStatus?: boolean;
  profilePhoto?: string;
  userId?: string;
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  userInitials,
  notificationCount,
  breadcrumb,
  activePage,
  onNavigate,
  onLogout,
  onHelpClick,
  showSystemStatus,
  profilePhoto,
  userId,
}: DashboardLayoutProps) {
  const [internalUser, setInternalUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
  } | null>(null);

  useEffect(() => {
    // Only fetch if data isn't provided as props
    if (!userName || !profilePhoto) {
      const fetchProfile = async () => {
        try {
          const response = await apiClient.get('/users/profile');
          const profile = response.data;
          setInternalUser({
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            profilePhoto: profile.profile_photo || '',
          });
        } catch (error) {
          console.error('Error fetching layout profile:', error);
        }
      };
      fetchProfile();
    }
  }, [userName, profilePhoto]);

  // Use props if available, otherwise use internal state
  const displayUserName = userName || (internalUser ? `${internalUser.firstName} ${internalUser.lastName}` : 'User');
  const displayInitials = userInitials || (internalUser ? `${internalUser.firstName?.[0] || ''}${internalUser.lastName?.[0] || ''}` : 'U');
  const displayPhoto = profilePhoto || internalUser?.profilePhoto || '';
  const currentUserId = userId || internalUser?.id || '';

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10">
        <DashboardSidebar
          userRole={userRole}
          activePage={activePage}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 relative z-10">
        {/* Header */}
        <DashboardHeader
          userName={displayUserName}
          userInitials={displayInitials}
          notificationCount={notificationCount}
          breadcrumb={breadcrumb}
          onHelpClick={onHelpClick}
          onNavigate={onNavigate}
          onLogout={onLogout}
          showSystemStatus={showSystemStatus}
          userRole={userRole}
          profilePhoto={displayPhoto}
          userId={currentUserId}
        />

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}