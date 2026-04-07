import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, Download, Search, Eye, Check, X, Clock,
  CheckCircle, XCircle, CreditCard, Calendar, User, FileText,
  AlertCircle, Loader2, RefreshCw,
} from 'lucide-react';

interface VerifyPaymentsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface Payment {
  id: string;
  student_id: string;
  class_id: string;
  amount: number;
  slip_url?: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  classes: { id: string; title: string; subject: string; price: number };
  student: { id: string; first_name: string; last_name: string; email: string; student_id?: string };
}

export function VerifyPaymentsPage({ onLogout, onNavigate }: VerifyPaymentsPageProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await apiClient.get('/payments/all', { params });
      setPayments(res.data || []);
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    const name = `${p.student?.first_name} ${p.student?.last_name}`.toLowerCase();
    const sid = (p.student?.student_id || '').toLowerCase();
    return !searchTerm || name.includes(searchTerm.toLowerCase()) || sid.includes(searchTerm.toLowerCase());
  });

  const stats = {
    pending: payments.filter((p) => p.status === 'pending').length,
    approved: payments.filter((p) => p.status === 'approved').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setIsActionLoading(true); setActionError('');
    try {
      await apiClient.patch(`/payments/${selectedPayment.id}/approve`);
      setShowApproveModal(false);
      setSelectedPayment(null);
      await fetchPayments();
    } catch (e: any) {
      setActionError(e.response?.data?.error || 'Failed to approve payment');
    } finally { setIsActionLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason.trim()) {
      setActionError('Please enter a rejection reason'); return;
    }
    setIsActionLoading(true); setActionError('');
    try {
      await apiClient.patch(`/payments/${selectedPayment.id}/reject`, { rejection_reason: rejectReason });
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectReason('');
      await fetchPayments();
    } catch (e: any) {
      setActionError(e.response?.data?.error || 'Failed to reject payment');
    } finally { setIsActionLoading(false); }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { icon: any; cls: string }> = {
      pending: { icon: Clock, cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      approved: { icon: CheckCircle, cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
      rejected: { icon: XCircle, cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const { icon: Icon, cls } = cfg[status] || cfg.pending;
    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 w-fit ${cls}`}>
        <Icon size={14} /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <DashboardLayout userRole="staff" userName="Staff" userInitials="ST"
      notificationCount={stats.pending} breadcrumb="Verify Payments"
      activePage="verify-payments" onNavigate={onNavigate} onLogout={onLogout}>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <button onClick={() => onNavigate?.('dashboard')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-3 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Payments</h1>
            <p className="text-white/60">Review and approve student payment submissions</p>
          </div>
          <button onClick={fetchPayments}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Pending Payments', count: stats.pending, color: 'border-orange-500', bg: 'bg-orange-500/20', icon: Clock, iconColor: 'text-orange-400' },
          { label: 'Approved Payments', count: stats.approved, color: 'border-green-500', bg: 'bg-green-500/20', icon: CheckCircle, iconColor: 'text-green-400' },
          { label: 'Rejected Payments', count: stats.rejected, color: 'border-red-500', bg: 'bg-red-500/20', icon: XCircle, iconColor: 'text-red-400' },
        ].map(({ label, count, color, bg, icon: Icon, iconColor }) => (
          <GlassCard key={label} className={`p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">{label}</p>
                <p className="text-4xl font-bold text-white">{count}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={iconColor} size={28} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input type="text" placeholder="Search student name or ID..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Payment Requests</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Student Name', 'Student ID', 'Course / Class', 'Amount', 'Payment Method', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-white/60 text-sm font-semibold pb-4 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                          {payment.student?.first_name?.[0] || '?'}
                        </div>
                        <span className="text-white font-medium">{payment.student?.first_name} {payment.student?.last_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4"><span className="text-white/70">{payment.student?.student_id || '—'}</span></td>
                    <td className="py-4 px-4"><span className="text-white">{payment.classes?.title}</span></td>
                    <td className="py-4 px-4"><span className="text-white font-semibold">LKR {payment.amount?.toLocaleString()}</span></td>
                    <td className="py-4 px-4"><span className="text-white/70 capitalize">{payment.payment_method?.replace('_', ' ')}</span></td>
                    <td className="py-4 px-4"><span className="text-white/70">{new Date(payment.submitted_at).toLocaleDateString()}</span></td>
                    <td className="py-4 px-4"><StatusBadge status={payment.status} /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="View Slip">
                          <Eye size={18} />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button onClick={() => { setSelectedPayment(payment); setActionError(''); setShowApproveModal(true); }}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="Approve">
                              <Check size={18} />
                            </button>
                            <button onClick={() => { setSelectedPayment(payment); setRejectReason(''); setActionError(''); setShowRejectModal(true); }}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Reject">
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12"><p className="text-white/40 text-lg">No payments found</p></div>
            )}
          </div>
        )}
      </GlassCard>

      {/* View Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Payment Slip</h2>
              <button onClick={() => setShowReceiptModal(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              {/* Slip Image/PDF */}
              {selectedPayment.slip_url ? (
                selectedPayment.slip_url.endsWith('.pdf') ? (
                  <iframe src={selectedPayment.slip_url} className="w-full h-96 rounded-xl" title="Bank Slip" />
                ) : (
                  <div className="relative">
                    <img src={selectedPayment.slip_url} alt="Bank Slip" className="w-full rounded-xl max-h-96 object-contain bg-white/5" />
                    <a href={selectedPayment.slip_url} target="_blank" rel="noopener noreferrer"
                      className="absolute top-3 right-3 px-3 py-2 rounded-lg bg-blue-500/80 text-white text-xs font-semibold flex items-center gap-1">
                      <Download size={12} /> Download
                    </a>
                  </div>
                )
              ) : (
                <div className="w-full h-48 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="text-white/40 mx-auto mb-2" size={48} />
                    <p className="text-white/40">No slip uploaded</p>
                  </div>
                </div>
              )}
              {/* Details */}
              <GlassCard className="p-5 space-y-3">
                {[
                  [<User key="u" className="text-blue-400" size={18} />, 'Student', `${selectedPayment.student?.first_name} ${selectedPayment.student?.last_name} (${selectedPayment.student?.student_id || '—'})`],
                  [<CreditCard key="c" className="text-green-400" size={18} />, 'Amount', `LKR ${selectedPayment.amount?.toLocaleString()}`],
                  [<FileText key="f" className="text-purple-400" size={18} />, 'Class', selectedPayment.classes?.title],
                  [<Calendar key="d" className="text-cyan-400" size={18} />, 'Submitted', new Date(selectedPayment.submitted_at).toLocaleString()],
                ].map(([icon, label, value], i) => (
                  <div key={i} className="flex items-center gap-3">
                    {icon}
                    <div>
                      <p className="text-white/60 text-xs">{label}</p>
                      <p className="text-white font-medium">{String(value)}</p>
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Approve Payment?</h2>
              <p className="text-white/60">
                This will enroll <span className="text-white font-semibold">{selectedPayment.student?.first_name} {selectedPayment.student?.last_name}</span> in <span className="text-white font-semibold">{selectedPayment.classes?.title}</span> and send them a notification.
              </p>
            </div>
            {actionError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">{actionError}</div>}
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} disabled={isActionLoading}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold">Cancel</button>
              <button onClick={handleApprove} disabled={isActionLoading}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                {isActionLoading ? <><Loader2 size={18} className="animate-spin" /> Approving...</> : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reject Payment?</h2>
              <p className="text-white/60 mb-4">Provide a reason. The student will be notified.</p>
            </div>
            <div className="mb-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Invalid receipt', 'Incorrect amount', 'Duplicate payment', 'Unclear proof of payment'].map((r) => (
                  <button key={r} onClick={() => setRejectReason(r)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${rejectReason === r ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Or type a custom reason..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 transition-colors resize-none" rows={3} />
            </div>
            {actionError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">{actionError}</div>}
            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} disabled={isActionLoading}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold">Cancel</button>
              <button onClick={handleReject} disabled={isActionLoading || !rejectReason.trim()}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {isActionLoading ? <><Loader2 size={18} className="animate-spin" /> Rejecting...</> : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
