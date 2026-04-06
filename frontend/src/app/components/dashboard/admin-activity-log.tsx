import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  Activity,
  Shield,
  Users,
  Server,
  TrendingUp,
  Search,
  Eye,
  FileText,
  FileSpreadsheet,
  FileDown,
  X,
} from 'lucide-react';

interface AdminActivityLogProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface ActivityLog {
  id: number;
  user: string;
  role: 'Admin' | 'Staff' | 'Teacher' | 'Student';
  action: string;
  module: string;
  ipAddress: string;
  dateTime: string;
  device?: string;
  description?: string;
}

export function AdminActivityLog({ onLogout, onNavigate }: AdminActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-13');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const activityLogs: ActivityLog[] = [
    {
      id: 1,
      user: 'Admin',
      role: 'Admin',
      action: 'Created new teacher account',
      module: 'User Management',
      ipAddress: '192.168.1.12',
      dateTime: 'Mar 13, 2026 — 10:45 AM',
      device: 'Chrome on Windows 10',
      description: 'Admin created a new teacher account for "Nimal Silva".',
    },
    {
      id: 2,
      user: 'Kasun Perera',
      role: 'Staff',
      action: 'Verified payment transaction',
      module: 'Payments',
      ipAddress: '192.168.1.45',
      dateTime: 'Mar 13, 2026 — 10:32 AM',
      device: 'Chrome on macOS',
      description: 'Staff member verified payment transaction #PAY-2026-1243 for student Shalini Jayawardena.',
    },
    {
      id: 3,
      user: 'Admin',
      role: 'Admin',
      action: 'Generated revenue report',
      module: 'Reports',
      ipAddress: '192.168.1.12',
      dateTime: 'Mar 13, 2026 — 10:15 AM',
      device: 'Chrome on Windows 10',
      description: 'Admin generated a revenue report for March 2026.',
    },
    {
      id: 4,
      user: 'Nimali Silva',
      role: 'Teacher',
      action: 'Marked attendance for class',
      module: 'Attendance',
      ipAddress: '192.168.1.78',
      dateTime: 'Mar 13, 2026 — 09:50 AM',
      device: 'Safari on iPhone',
      description: 'Teacher marked attendance for A/L ICT 2026 class with 28 students present.',
    },
    {
      id: 5,
      user: 'System',
      role: 'Admin',
      action: 'Automated backup completed',
      module: 'Reports',
      ipAddress: '127.0.0.1',
      dateTime: 'Mar 13, 2026 — 09:00 AM',
      device: 'Server',
      description: 'System performed automated database backup successfully.',
    },
    {
      id: 6,
      user: 'Admin',
      role: 'Admin',
      action: 'Updated chatbot FAQ',
      module: 'Chatbot',
      ipAddress: '192.168.1.12',
      dateTime: 'Mar 13, 2026 — 08:45 AM',
      device: 'Chrome on Windows 10',
      description: 'Admin updated FAQ entry for "How to reset password".',
    },
    {
      id: 7,
      user: 'Tharindu Fernando',
      role: 'Staff',
      action: 'Rejected payment verification',
      module: 'Payments',
      ipAddress: '192.168.1.56',
      dateTime: 'Mar 13, 2026 — 08:20 AM',
      device: 'Firefox on Ubuntu',
      description: 'Staff member rejected payment transaction #PAY-2026-1189 due to invalid receipt.',
    },
    {
      id: 8,
      user: 'Admin',
      role: 'Admin',
      action: 'Deleted user account',
      module: 'User Management',
      ipAddress: '192.168.1.12',
      dateTime: 'Mar 13, 2026 — 08:05 AM',
      device: 'Chrome on Windows 10',
      description: 'Admin deleted inactive student account for "Test User 123".',
    },
    {
      id: 9,
      user: 'Dilini Perera',
      role: 'Teacher',
      action: 'Created new assignment',
      module: 'User Management',
      ipAddress: '192.168.1.89',
      dateTime: 'Mar 12, 2026 — 11:30 PM',
      device: 'Chrome on macOS',
      description: 'Teacher created a new assignment for A/L Mathematics 2026 class.',
    },
    {
      id: 10,
      user: 'Ravindu Bandara',
      role: 'Student',
      action: 'Submitted payment receipt',
      module: 'Payments',
      ipAddress: '192.168.1.102',
      dateTime: 'Mar 12, 2026 — 09:15 PM',
      device: 'Chrome on Android',
      description: 'Student submitted payment receipt for March class fees.',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/20 text-red-400';
      case 'Staff':
        return 'bg-purple-500/20 text-purple-400';
      case 'Teacher':
        return 'bg-blue-500/20 text-blue-400';
      case 'Student':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'User Management':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'Payments':
        return 'bg-green-500/20 text-green-400';
      case 'Attendance':
        return 'bg-orange-500/20 text-orange-400';
      case 'Reports':
        return 'bg-pink-500/20 text-pink-400';
      case 'Chatbot':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleViewDetails = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const handleExportPDF = () => {
    alert('Exporting activity logs as PDF...');
  };

  const handleExportExcel = () => {
    alert('Exporting activity logs as Excel...');
  };

  const handleExportCSV = () => {
    alert('Exporting activity logs as CSV...');
  };

  return (
    <DashboardLayout userRole="admin" activePage="attendance-management" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Activity Log</h1>
            <p className="text-white/60">Monitor system actions and user activities.</p>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Activity className="text-cyan-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+8%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">145</h3>
            <p className="text-white/60 text-sm">Total Activities Today</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20">
                <Shield className="text-red-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+12%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">32</h3>
            <p className="text-white/60 text-sm">Admin Actions</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                <Users className="text-purple-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+5%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">54</h3>
            <p className="text-white/60 text-sm">Staff Actions</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <Server className="text-orange-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+3%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">59</h3>
            <p className="text-white/60 text-sm">System Events</p>
          </GlassCard>
        </div>

        {/* Filter Bar */}
        <GlassCard className="p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-white/80 text-sm font-semibold mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user name or action"
                  className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Role Filter</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors hover:bg-[#1e293b] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  appearance: 'none',
                }}
              >
                <option value="All Roles" className="bg-[#0f172a] text-[#e2e8f0]">All Roles</option>
                <option value="Admin" className="bg-[#0f172a] text-[#e2e8f0]">Admin</option>
                <option value="Staff" className="bg-[#0f172a] text-[#e2e8f0]">Staff</option>
                <option value="Teacher" className="bg-[#0f172a] text-[#e2e8f0]">Teacher</option>
                <option value="Student" className="bg-[#0f172a] text-[#e2e8f0]">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Module Filter</label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors hover:bg-[#1e293b] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  appearance: 'none',
                }}
              >
                <option value="All Modules" className="bg-[#0f172a] text-[#e2e8f0]">All Modules</option>
                <option value="User Management" className="bg-[#0f172a] text-[#e2e8f0]">User Management</option>
                <option value="Payments" className="bg-[#0f172a] text-[#e2e8f0]">Payments</option>
                <option value="Attendance" className="bg-[#0f172a] text-[#e2e8f0]">Attendance</option>
                <option value="Reports" className="bg-[#0f172a] text-[#e2e8f0]">Reports</option>
                <option value="Chatbot" className="bg-[#0f172a] text-[#e2e8f0]">Chatbot</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors hover:bg-[#1e293b] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  appearance: 'none',
                }}
              >
                <option value="Newest" className="bg-[#0f172a] text-[#e2e8f0]">Newest</option>
                <option value="Oldest" className="bg-[#0f172a] text-[#e2e8f0]">Oldest</option>
              </select>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-red-400/30 hover:text-red-400 transition-all duration-300"
            >
              <FileText size={18} />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-green-400/30 hover:text-green-400 transition-all duration-300"
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-400/30 hover:text-blue-400 transition-all duration-300"
            >
              <FileDown size={18} />
              Export CSV
            </button>
          </div>
        </GlassCard>

        {/* Activity Log Table */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">System Activity Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">User</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Role</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Action</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Module</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">IP Address</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Date & Time</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-white font-medium">{log.user}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/80">{log.action}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getModuleColor(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60 font-mono text-sm">{log.ipAddress}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60">{log.dateTime}</span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgba(30,41,59,0.6)] text-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:bg-blue-500/20 transition-all duration-300"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Activity Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-1">User Name</label>
                  <p className="text-white font-medium">{selectedActivity.user}</p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-1">Role</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(selectedActivity.role)}`}>
                    {selectedActivity.role}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-1">Action</label>
                <p className="text-white">{selectedActivity.action}</p>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-1">Module</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getModuleColor(selectedActivity.module)}`}>
                  {selectedActivity.module}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-1">IP Address</label>
                  <p className="text-white font-mono text-sm">{selectedActivity.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-1">Device</label>
                  <p className="text-white/80">{selectedActivity.device}</p>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-1">Date & Time</label>
                <p className="text-white">{selectedActivity.dateTime}</p>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-1">Description</label>
                <p className="text-white/80 bg-white/5 rounded-xl p-4 border border-white/10">
                  {selectedActivity.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
