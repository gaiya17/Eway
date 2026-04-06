import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AddUserModal } from './add-user-modal';
import apiClient from '@/api/api-client';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCog,
  Search,
  Plus,
  Eye,
  Edit,
  Lock,
  Power,
  Trash2,
  X,
  ChevronDown,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Activity,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface AdminUserManagementProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

type UserRole = 'student' | 'teacher' | 'staff' | 'admin';
type UserStatus = 'active' | 'inactive' | 'suspended';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  registeredDate: string;
  avatar?: string;
  lastLogin?: string;
  assignmentsSubmitted?: number;
  attendanceRate?: number;
}

export function AdminUserManagement({ onLogout, onNavigate }: AdminUserManagementProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Form state for adding new user
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    password: '',
    confirmPassword: '',
  });
  const [showNewUserRoleDropdown, setShowNewUserRoleDropdown] = useState(false);

  // Form state for editing user
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    status: 'active' as UserStatus,
  });
  const [showEditUserRoleDropdown, setShowEditUserRoleDropdown] = useState(false);
  const [showEditUserStatusDropdown, setShowEditUserStatusDropdown] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users');
      // Map backend data to User interface
      const mappedUsers = response.data.map((u: any) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone: u.phone || 'N/A',
        role: u.role,
        status: u.is_verified ? 'active' : 'inactive',
        registeredDate: u.created_at,
        avatar: u.profile_photo,
        lastLogin: 'Not implemented',
        assignmentsSubmitted: 0,
        attendanceRate: 0,
      }));
      setAllUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredUsers = allUsers
    .filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime();
      } else {
        return new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime();
      }
    });

  // Calculate statistics
  const stats = {
    total: allUsers.length,
    students: allUsers.filter((u) => u.role === 'student').length,
    teachers: allUsers.filter((u) => u.role === 'teacher').length,
    staff: allUsers.filter((u) => u.role === 'staff').length,
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'teacher':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'staff':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'admin':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const handleAddUser = () => {
    // Mock add user functionality
    console.log('Adding new user:', newUser);
    setShowAddModal(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'student',
      password: '',
      confirmPassword: '',
    });
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
      setShowEditModal(true);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const response = await apiClient.post('/auth/request-password-reset', { email });
      alert(response.data.message || 'Reset link sent successfully!');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(error.response?.data?.error || 'Failed to send reset link.');
    }
  };

  const handleToggleStatus = (userId: string) => {
    console.log('Toggling status for user:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowDeleteModal(true);
    }
  };

  return (
    <>
      <DashboardLayout
        userRole="admin"
        userName="Admin"
        userInitials="AD"
        notificationCount={7}
        breadcrumb="User Management"
        activePage="user-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
        showSystemStatus={true}
      >
        {/* Page Header */}
        <div className="mb-8">
          {/* Back Link */}
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          {/* Title and Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
              <p className="text-white/60">
                Manage all system users including students, teachers, staff, and administrators.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              <Plus size={20} />
              Add New User
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <Users className="text-indigo-400" size={28} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Total Users</p>
              <h3 className="text-3xl font-bold text-white">{stats.total.toLocaleString()}</h3>
            </div>
            <div className="absolute inset-0 border border-indigo-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(99,102,241,0.3)] transition-all duration-300" />
          </GlassCard>

          {/* Students */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <GraduationCap className="text-blue-400" size={28} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Students</p>
              <h3 className="text-3xl font-bold text-white">{stats.students.toLocaleString()}</h3>
            </div>
            <div className="absolute inset-0 border border-blue-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all duration-300" />
          </GlassCard>

          {/* Teachers */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <BookOpen className="text-purple-400" size={28} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Teachers</p>
              <h3 className="text-3xl font-bold text-white">{stats.teachers}</h3>
            </div>
            <div className="absolute inset-0 border border-purple-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(168,85,247,0.3)] transition-all duration-300" />
          </GlassCard>

          {/* Staff */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                  <UserCog className="text-cyan-400" size={28} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Staff</p>
              <h3 className="text-3xl font-bold text-white">{stats.staff}</h3>
            </div>
            <div className="absolute inset-0 border border-cyan-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] transition-all duration-300" />
          </GlassCard>
        </div>

        {/* Filter Bar */}
        <GlassCard className="p-6 mb-8 relative z-30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Role Filter */}
            <div className="relative z-40">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <span className="capitalize">{roleFilter === 'all' ? 'All Roles' : roleFilter}</span>
                <ChevronDown size={18} />
              </button>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                  {['all', 'student', 'teacher', 'staff', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role as any);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors capitalize ${
                        roleFilter === role ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      {role === 'all' ? 'All Roles' : role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative z-40">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                <ChevronDown size={18} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                  {['all', 'active', 'inactive', 'suspended'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as any);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors capitalize ${
                        statusFilter === status ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By */}
            <div className="relative z-40">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <span className="capitalize">{sortBy}</span>
                <ChevronDown size={18} />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                  {['newest', 'oldest'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => {
                        setSortBy(sort as any);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors capitalize ${
                        sortBy === sort ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Users Table */}
        <GlassCard className="p-6 relative z-10">
          <h2 className="text-xl font-bold text-white mb-6">System Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">User</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Role</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Email</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Phone</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Status</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Registered</th>
                  <th className="text-center text-white/60 font-semibold text-sm pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-semibold text-white">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-white/80 text-sm">{user.email}</td>
                    <td className="py-4 text-white/80 text-sm">{user.phone}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadgeColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 text-white/80 text-sm">
                      {new Date(user.registeredDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all duration-200"
                          title="View User"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all duration-200"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-200"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-blue-400 mb-4" />
                <p className="text-white/60">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No users found matching your filters.</p>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </DashboardLayout>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-3xl">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(
                          selectedUser.role
                        )}`}
                      >
                        {selectedUser.role}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadgeColor(
                          selectedUser.status
                        )}`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-white/70">
                        <Mail size={16} />
                        <span className="text-sm">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Phone size={16} />
                        <span className="text-sm">{selectedUser.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar size={16} />
                        <span className="text-sm">
                          Registered:{' '}
                          {new Date(selectedUser.registeredDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Activity Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Last Login */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Activity className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Last Login</p>
                        <p className="text-white font-semibold">{selectedUser.lastLogin}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assignments */}
                  {selectedUser.role === 'student' && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <FileText className="text-purple-400" size={20} />
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">Assignments</p>
                          <p className="text-white font-semibold">
                            {selectedUser.assignmentsSubmitted} submitted
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendance */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="text-green-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Attendance</p>
                        <p className="text-white font-semibold">{selectedUser.attendanceRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    handleEditUser(selectedUser.id);
                    setShowViewModal(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  <Edit size={18} />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    handleResetPassword(selectedUser.email);
                    setShowViewModal(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
                >
                  <Lock size={18} />
                  Reset Password
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editUser.firstName}
                      onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editUser.lastName}
                      onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Role</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowEditUserRoleDropdown(!showEditUserRoleDropdown)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="capitalize">{editUser.role}</span>
                      <ChevronDown size={18} />
                    </button>
                    {showEditUserRoleDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                        {['student', 'teacher', 'staff', 'admin'].map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              setEditUser({ ...editUser, role: role as UserRole });
                              setShowEditUserRoleDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors capitalize"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Status</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowEditUserStatusDropdown(!showEditUserStatusDropdown)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="capitalize">{editUser.status}</span>
                      <ChevronDown size={18} />
                    </button>
                    {showEditUserStatusDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                        {['active', 'inactive', 'suspended'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setEditUser({ ...editUser, status: status as UserStatus });
                              setShowEditUserStatusDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors capitalize"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Mock edit user functionality
                    console.log('Editing user:', editUser);
                    setShowEditModal(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
                >
                  Update User
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Delete User</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Confirmation Message */}
              <div className="text-center mb-6">
                <p className="text-white/80 text-lg mb-2">
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  ?
                </p>
                <p className="text-white/60 text-sm">This action cannot be undone.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(selectedUser.id);
                    setShowDeleteModal(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}