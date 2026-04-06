import React, { useState } from 'react';
import { GlassCard } from '../glass-card';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import apiClient from '@/api/api-client';

type UserRole = 'student' | 'teacher' | 'staff' | 'admin';
type UserStatus = 'active' | 'inactive';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    status: 'active' as UserStatus,
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/users/add', {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      });

      // Reset form
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'student',
        status: 'active',
        password: '',
        confirmPassword: '',
      });

      alert(response.data.message || 'User created successfully!');

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.error || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New User</h2>
            <button
              onClick={onClose}
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
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="relative z-40">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  <span className="capitalize">{newUser.role}</span>
                  <ChevronDown size={18} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    {['student', 'teacher', 'staff', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setNewUser({ ...newUser, role: role as UserRole });
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors capitalize ${
                          newUser.role === role ? 'bg-blue-500/10 text-blue-400' : ''
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Dropdown */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Account Status
              </label>
              <div className="relative z-30">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  <span className="capitalize">{newUser.status}</span>
                  <ChevronDown size={18} />
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    {['active', 'inactive'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setNewUser({ ...newUser, status: status as UserStatus });
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors capitalize ${
                          newUser.status === status ? 'bg-blue-500/10 text-blue-400' : ''
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Enter password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Confirm password"
              />
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
