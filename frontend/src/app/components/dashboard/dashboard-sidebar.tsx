import React from 'react';
import {
  Home,
  User,
  BookOpen,
  QrCode,
  FileText,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Youtube,
  Headphones,
  Users,
  ClipboardList,
  MessageCircle,
  BarChart3,
  IdCard,
  UserCog,
  Shield,
  MessageSquare,
  CheckCircle,
  Database,
  Circle,
} from 'lucide-react';
import ewayLogo from 'figma:asset/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';

interface SidebarProps {
  userRole: 'student' | 'teacher' | 'staff' | 'admin';
  activePage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function DashboardSidebar({ userRole, activePage = 'dashboard', onNavigate, onLogout }: SidebarProps) {
  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'My Profile', icon: User },
    ];

    if (userRole === 'student') {
      return [
        ...commonItems,
        { id: 'student-id', label: 'My Student ID', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'classes', label: 'My Classes', icon: BookOpen },
        { id: 'purchase', label: 'Purchase Classes', icon: CreditCard },
        { id: 'tutorials', label: 'Free Tutorials', icon: Youtube },
        { id: 'study-packs', label: 'Study Packs', icon: BookOpen },
        { id: 'teachers', label: 'Teachers', icon: User },
        { id: 'chat', label: 'Chat with Teachers', icon: HelpCircle },
        { id: 'performance', label: 'My Performance', icon: BarChart3 },
        { id: 'my-attendance', label: 'My Attendance', icon: CheckCircle },
        { id: 'support', label: 'Support', icon: Headphones },
      ];
    }

    if (userRole === 'teacher') {
      return [
        ...commonItems,
        { id: 'teacher-classes', label: 'My Classes', icon: BookOpen },
        { id: 'teacher-study-packs', label: 'Study Packs', icon: Database },
        { id: 'teacher-tutorials', label: 'Free Tutorials', icon: Youtube },
        { id: 'teacher-attendance', label: 'Attendance', icon: QrCode },
        { id: 'teacher-reports', label: 'Reports', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'teacher-chat', label: 'Chat with Students', icon: MessageCircle },
      ];
    }

    if (userRole === 'staff') {
      return [
        ...commonItems,
        { id: 'verify-payments', label: 'Verify Payments', icon: CreditCard },
        { id: 'attendance-management', label: 'Attendance', icon: QrCode },
        { id: 'student-cards', label: 'Student Cards', icon: IdCard },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
      ];
    }

    if (userRole === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'main' },
        { id: 'user-management', label: 'User Management', icon: Users, section: 'main' },
        { id: 'content-management', label: 'Content Approval Hub', icon: BookOpen, section: 'main' },
        { id: 'chatbot-management', label: 'Chatbot Management', icon: MessageSquare, section: 'main' },
        { id: 'payment-verification', label: 'Payment Verification', icon: CreditCard, section: 'main' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'main' },
        { id: 'report-generation', label: 'Report Generation', icon: FileText, section: 'main' },
        { id: 'attendance-management', label: 'Activity Log', icon: QrCode, section: 'main' },
        { id: 'profile', label: 'My Profile', icon: User, section: 'system' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  const getRoleLabel = () => {
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
  };

  // Organize menu items by sections for admin
  const mainMenuItems = userRole === 'admin' 
    ? menuItems.filter(item => (item as any).section === 'main')
    : menuItems;
  
  const systemMenuItems = userRole === 'admin'
    ? menuItems.filter(item => (item as any).section === 'system')
    : [];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white/5 backdrop-blur-[15px] border-r border-white/10 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
            <img src={ewayLogo} alt="EWAY Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">EWAY LMS</h1>
            <p className="text-white/60 text-xs">{getRoleLabel()}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Menu Section */}
        {userRole === 'admin' && (
          <div className="mb-2 px-4">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
              Main Menu
            </p>
          </div>
        )}
        <div className="space-y-1 mb-4">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 to-cyan-400 rounded-r-full" />
                )}
                <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto text-cyan-400" />}
              </button>
            );
          })}
        </div>

        {/* System Menu Section (Admin Only) */}
        {userRole === 'admin' && systemMenuItems.length > 0 && (
          <>
            <div className="mb-2 px-4 mt-4">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                System
              </p>
            </div>
            <div className="space-y-1">
              {systemMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 to-cyan-400 rounded-r-full" />
                    )}
                    <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* System Status Indicators (Admin Only) */}
      {userRole === 'admin' && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
            System Status
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className="text-green-400 fill-green-400" size={8} />
                <span className="text-white/70 text-xs">Database</span>
              </div>
              <span className="text-green-400 text-xs font-semibold">Stable</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className="text-green-400 fill-green-400" size={8} />
                <span className="text-white/70 text-xs">Server</span>
              </div>
              <span className="text-green-400 text-xs font-semibold">Online</span>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:text-red-400" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
