import React, { useState, useEffect } from 'react';
import { GlassCard } from './glass-card';
import { Lock, Eye, EyeOff, CheckCircle, Loader2, XCircle } from 'lucide-react';
import apiClient from '@/api/api-client';

interface ResetPasswordPageProps {
  onBackToLogin: () => void;
}

export function ResetPasswordPage({ onBackToLogin }: ResetPasswordPageProps) {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get('token');
    if (t) {
      setToken(t);
    } else {
      setStatus('error');
      setErrorMessage('Invalid or missing reset token.');
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setStatus('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('idle');
    try {
      await apiClient.post('/auth/reset-password-complete', {
        token,
        newPassword
      });
      setStatus('success');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful</h2>
          <p className="text-white/70 mb-8">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <button
            onClick={onBackToLogin}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] transition-all"
          >
            Back to Login
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Setup New Password</h2>
          <p className="text-white/60">Choose a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">New Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <XCircle size={16} />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            Back to Login
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
