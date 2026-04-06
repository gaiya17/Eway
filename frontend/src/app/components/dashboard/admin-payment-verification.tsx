import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  ChevronDown,
  Eye,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import apiClient from '@/api/api-client';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AdminPaymentVerificationProps {
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
  transaction_ref?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  classes: { id: string; title: string; subject: string; price: number };
  student: { id: string; first_name: string; last_name: string; email: string; student_id?: string };
}

export function AdminPaymentVerification({ onLogout, onNavigate }: AdminPaymentVerificationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Payments');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSort, setSelectedSort] = useState('Newest');
  
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid receipt');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const statusOptions = ['All Payments', 'Pending', 'Approved', 'Rejected'];
  const classOptions = ['All Classes'];
  const sortOptions = ['Newest', 'Oldest', 'Highest Amount'];

  const [payments, setPayments] = useState<Payment[]>([]);

  // Chart data
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 320000 },
    { month: 'Feb', revenue: 380000 },
    { month: 'Mar', revenue: 450000 },
    { month: 'Apr', revenue: 420000 },
    { month: 'May', revenue: 490000 },
    { month: 'Jun', revenue: 520000 },
  ];

  const paymentStatusData = [
    { name: 'Approved', value: 1243, color: '#10B981' },
    { name: 'Pending', value: 23, color: '#F59E0B' },
    { name: 'Rejected', value: 17, color: '#EF4444' },
    { name: 'Disputed', value: 5, color: '#A855F7' },
  ];

  const topClassesData = [
    { class: 'A/L ICT', revenue: 1250000 },
    { class: 'A/L Math', revenue: 1180000 },
    { class: 'A/L Physics', revenue: 980000 },
    { class: 'A/L Chemistry', revenue: 850000 },
  ];

  // Fetch payments from real API
  const fetchPayments = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedStatus !== 'All Payments') params.status = selectedStatus.toLowerCase();
      const res = await apiClient.get('/payments/all', { params });
      setPayments(res.data || []);
    } catch (e) { console.error('fetch payments error:', e); }
  }, [selectedStatus]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleApprovePayment = async (payment: Payment) => {
    setIsActionLoading(true);
    try {
      await apiClient.patch(`/payments/${payment.id}/approve`);
      setShowViewModal(false);
      setSelectedPayment(null);
      await fetchPayments();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to approve payment');
    } finally { setIsActionLoading(false); }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    setIsActionLoading(true);
    try {
      await apiClient.patch(`/payments/${selectedPayment.id}/reject`, { rejection_reason: rejectReason });
      setShowRejectModal(false);
      setShowViewModal(false);
      setSelectedPayment(null);
      await fetchPayments();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to reject payment');
    } finally { setIsActionLoading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'disputed':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const name = `${payment.student?.first_name} ${payment.student?.last_name}`.toLowerCase();
    const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Payments' || payment.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (selectedSort === 'Highest Amount') return b.amount - a.amount;
    return 0;
  });

  const totalRevenue = payments.filter((p) => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const approvedCount = payments.filter((p) => p.status === 'approved').length;
  const rejectedCount = payments.filter((p) => p.status === 'rejected').length;

  return (
    <DashboardLayout userRole="admin" activePage="payment-verification" onNavigate={onNavigate} onLogout={onLogout}>
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
            <h1 className="text-3xl font-bold text-white mb-2">Payment Verification</h1>
            <p className="text-white/60">Review and manage all student payments across the LMS.</p>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <DollarSign className="text-cyan-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+18%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">LKR {totalRevenue.toLocaleString()}</h3>
            <p className="text-white/60 text-sm">Total Revenue</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <Clock className="text-orange-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-orange-400 text-sm">
                <TrendingUp size={16} />
                <span>+5</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{pendingCount}</h3>
            <p className="text-white/60 text-sm">Pending Payments</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+12%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{approvedCount}</h3>
            <p className="text-white/60 text-sm">Approved Payments</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20">
                <XCircle className="text-red-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <TrendingUp size={16} />
                <span>-3</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{rejectedCount}</h3>
            <p className="text-white/60 text-sm">Rejected Payments</p>
          </GlassCard>
        </div>

        {/* Payment Filter Bar */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or transaction ID"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div className="relative z-30">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[180px] justify-between"
              >
                <span>{selectedStatus}</span>
                <ChevronDown size={18} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors ${
                        selectedStatus === status ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative z-20">
              <button
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[200px] justify-between"
              >
                <span>{selectedClass}</span>
                <ChevronDown size={18} />
              </button>
              {showClassDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {classOptions.map((classOption) => (
                    <button
                      key={classOption}
                      onClick={() => {
                        setSelectedClass(classOption);
                        setShowClassDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors ${
                        selectedClass === classOption ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      {classOption}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative z-10">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[160px] justify-between"
              >
                <span>{selectedSort}</span>
                <ChevronDown size={18} />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {sortOptions.map((sort) => (
                    <button
                      key={sort}
                      onClick={() => {
                        setSelectedSort(sort);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors ${
                        selectedSort === sort ? 'bg-blue-500/10 text-blue-400' : ''
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

        {/* Payments Table */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Student Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Student</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Class</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Amount</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Transaction ID</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Payment Date</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Status</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-white">{payment.student?.first_name} {payment.student?.last_name}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/80">{payment.classes?.title}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white font-semibold">LKR {payment.amount?.toLocaleString()}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60 font-mono text-sm">{payment.transaction_ref || '—'}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60">{new Date(payment.submitted_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowViewModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(payment)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                              title="Approve" disabled={isActionLoading}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowRejectModal(true);
                              }}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Payment Analytics Panel */}
        <div className="grid grid-cols-3 gap-6">
          {/* Monthly Revenue Chart */}
          <GlassCard className="p-6 col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid key="grid-revenue" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis key="xaxis-revenue" dataKey="month" stroke="rgba(255,255,255,0.4)" />
                <YAxis key="yaxis-revenue" stroke="rgba(255,255,255,0.4)" />
                <Tooltip
                  key="tooltip-revenue"
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 26, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  key="line-revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  dot={{ fill: '#22D3EE', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Payment Success Rate */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Payment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 26, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {paymentStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/80 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Top Classes by Revenue */}
        <GlassCard className="p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Classes by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClassesData}>
              <CartesianGrid key="grid-classes" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis key="xaxis-classes" dataKey="class" stroke="rgba(255,255,255,0.4)" />
              <YAxis key="yaxis-classes" stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                key="tooltip-classes"
                contentStyle={{
                  backgroundColor: 'rgba(11, 15, 26, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Bar key="bar-classes" dataKey="revenue" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* View Payment Modal */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Payment Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPayment(null);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Student Name</label>
                    <p className="text-white">{selectedPayment.student?.first_name} {selectedPayment.student?.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Email</label>
                    <p className="text-white">{selectedPayment.student?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Class</label>
                    <p className="text-white">{selectedPayment.classes?.title}</p>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Amount</label>
                    <p className="text-white font-semibold">LKR {selectedPayment.amount?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Payment Date</label>
                    <p className="text-white">{new Date(selectedPayment.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Transaction Ref</label>
                    <p className="text-white font-mono">{selectedPayment.transaction_ref || '—'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Payment Slip</label>
                  {selectedPayment.slip_url ? (
                    selectedPayment.slip_url.endsWith('.pdf') ? (
                      <iframe src={selectedPayment.slip_url} className="w-full h-80 rounded-xl" title="Slip" />
                    ) : (
                      <img src={selectedPayment.slip_url} alt="Bank Slip" className="w-full rounded-xl max-h-80 object-contain bg-white/5" />
                    )
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex items-center justify-center">
                      <div className="text-center">
                        <AlertTriangle className="text-white/40 mx-auto mb-2" size={48} />
                        <p className="text-white/60">No payment slip uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                {selectedPayment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowRejectModal(true);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Reject Payment
                    </button>
                    <button
                      onClick={() => handleApprovePayment(selectedPayment)}
                      disabled={isActionLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(16,185,129,0.6)] transition-all duration-300 disabled:opacity-50"
                    >
                      Approve Payment
                    </button>
                  </>
                )}
                {selectedPayment.status !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Reject Payment Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reject Payment</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-white/80 mb-4">
                  Are you sure you want to reject this payment from <span className="font-semibold text-white">{selectedPayment.student?.first_name} {selectedPayment.student?.last_name}</span>?
                </p>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Reason for Rejection</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  >
                    <option value="Invalid receipt">Invalid receipt</option>
                    <option value="Incorrect amount">Incorrect amount</option>
                    <option value="Duplicate payment">Duplicate payment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectPayment}
                  disabled={isActionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300 disabled:opacity-50"
                >
                  {isActionLoading ? 'Rejecting...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
