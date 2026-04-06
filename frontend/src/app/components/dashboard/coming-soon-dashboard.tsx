import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { Construction } from 'lucide-react';

interface ComingSoonDashboardProps {
  role: 'teacher' | 'staff' | 'admin';
  onLogout?: () => void;
}

export function ComingSoonDashboard({ role, onLogout }: ComingSoonDashboardProps) {
  const getRoleLabel = () => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleDescription = () => {
    switch (role) {
      case 'teacher':
        return 'Manage courses, track student progress, and create assignments.';
      case 'staff':
        return 'Handle administrative tasks, manage resources, and support operations.';
      case 'admin':
        return 'Full system control, user management, and analytics.';
    }
  };

  return (
    <DashboardLayout
      userRole={role}
      userName={`${getRoleLabel()} User`}
      userInitials={role.substring(0, 2).toUpperCase()}
      notificationCount={0}
      breadcrumb={`${getRoleLabel()} Dashboard`}
      activePage="dashboard"
      onLogout={onLogout}
    >
      <div className="flex items-center justify-center min-h-[600px]">
        <GlassCard className="p-12 max-w-2xl w-full text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-8">
            <Construction size={48} className="text-cyan-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            {getRoleLabel()} Dashboard
            <span className="block text-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              Coming Soon
            </span>
          </h1>

          <p className="text-white/70 text-lg mb-8">{getRoleDescription()}</p>

          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 border border-cyan-400/30">
            <span className="text-cyan-400 font-semibold">
              🚧 This dashboard is under development (demo routing only)
            </span>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm">
              For demo purposes, you can log in with different email addresses:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
                student@email.com
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
                teacher@email.com
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
                staff@email.com
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
                admin@email.com
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
