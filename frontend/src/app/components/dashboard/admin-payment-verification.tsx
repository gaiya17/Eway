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
  BookOpen,
  Database,
  Loader2,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface AdminPaymentVerificationProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface Payment {
  id: string;
  student_id: string;
  class_id?: string;
  study_pack_id?: string;
  amount: number;
  slip_url?: string;
  payment_method: string;
  transaction_ref?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  created_at?: string; // for study packs
  classes?: { id: string; title: string; subject: string; price: number };
  study_packs?: { id: string; title: string; price: number };
  student?: { id: string; first_name: string; last_name: string; email: string; student_id?: string };
  profiles?: { first_name: string; last_name: string; email: string };
}

export function AdminPaymentVerification({ onLogout, onNavigate }: AdminPaymentVerificationProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'study-packs'>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Payments');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid receipt');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const statusOptions = ['All Payments', 'Pending', 'Approved', 'Rejected'];
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = useCallback(async () => {
    setIsDataLoading(true);
    try {
      if (activeTab === 'classes') {
        const params: any = {};
        if (selectedStatus !== 'All Payments') params.status = selectedStatus.toLowerCase();
        const res = await apiClient.get('/payments/all', { params });
        setPayments(res.data || []);
      } else {
        const res = await apiClient.get('/study-packs/purchases/pending');
        setPayments(res.data || []);
      }
    } catch (e) { 
      console.error('fetch payments error:', e); 
      setPayments([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [selectedStatus, activeTab]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleApprovePayment = async (payment: Payment) => {
    setIsActionLoading(true);
    try {
      if (activeTab === 'classes') {
        await apiClient.patch(`/payments/${payment.id}/approve`);
      } else {
        await apiClient.patch(`/study-packs/purchases/${payment.id}/status`, { status: 'approved' });
      }
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
      if (activeTab === 'classes') {
        await apiClient.patch(`/payments/${selectedPayment.id}/reject`, { rejection_reason: rejectReason });
      } else {
        await apiClient.patch(`/study-packs/purchases/${selectedPayment.id}/status`, { 
            status: 'rejected', 
            rejection_reason: rejectReason 
        });
      }
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
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStudentInfo = (payment: Payment) => {
    const student = payment.student || payment.profiles;
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  const getProductTitle = (payment: Payment) => {
    return payment.classes?.title || payment.study_packs?.title || 'Unknown Product';
  };

  const filteredPayments = payments.filter((payment) => {
    const name = getStudentInfo(payment).toLowerCase();
    const title = getProductTitle(payment).toLowerCase();
    const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Payments' || payment.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout 
        userRole="admin" 
        activePage="payment-verification" 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        breadcrumb={`Payment Verification`}
    >
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Payment Verification</h1>
            <p className="text-white/40 text-sm">Review bank slips for both classes and study packs.</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit shrink-0">
             <button 
               onClick={() => setActiveTab('classes')}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                 activeTab === 'classes' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
               }`}
             >
                <BookOpen size={16} /> Classes
             </button>
             <button 
               onClick={() => setActiveTab('study-packs')}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                 activeTab === 'study-packs' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
               }`}
             >
                <Database size={16} /> Study Packs
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <GlassCard className="p-6">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Queue</p>
              <p className="text-3xl font-bold text-orange-400">{payments.filter(p => p.status === 'pending').length} Pending</p>
           </GlassCard>
           <GlassCard className="p-6">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <p className="text-white font-bold">System Active</p>
              </div>
           </GlassCard>
           <GlassCard className="p-6">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Processed</p>
              <p className="text-3xl font-bold text-green-400">12 Aujourd'hui</p>
           </GlassCard>
           <GlassCard className="p-6">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Revenue</p>
              <div className="flex items-center gap-2 mt-1">
                 <TrendingUp size={16} className="text-green-400" />
                 <p className="text-xl font-bold text-white">LKR 45,250</p>
              </div>
           </GlassCard>
        </div>

        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students, classes, or packs..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 min-w-[150px] justify-between transition-all"
              >
                <span>{selectedStatus}</span>
                <ChevronDown size={18} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0C1221] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                       <th className="p-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Student</th>
                       <th className="p-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">{activeTab === 'classes' ? 'Class' : 'Study Pack'}</th>
                       <th className="p-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                       <th className="p-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Date</th>
                       <th className="p-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">Status</th>
                       <th className="p-6 text-white/40 text-[10px] font-bold uppercase tracking-widest text-right">Preview</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {isDataLoading ? (
                       <tr>
                          <td colSpan={6} className="p-20 text-center">
                             <Loader2 className="animate-spin text-cyan-400 mx-auto" size={32} />
                          </td>
                       </tr>
                    ) : filteredPayments.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="p-20 text-center text-white/40 italic">
                             No matching payments found in this category.
                          </td>
                       </tr>
                    ) : (
                       filteredPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-white/[0.02] transition-all group">
                             <td className="p-6">
                                <p className="font-bold text-white leading-tight">{getStudentInfo(payment)}</p>
                                <p className="text-[10px] text-white/30 uppercase font-bold mt-1">ID: {payment.id.split('-')[0]}</p>
                             </td>
                             <td className="p-6">
                                <p className="text-white/60 text-sm font-medium">{getProductTitle(payment)}</p>
                             </td>
                             <td className="p-6 font-bold text-cyan-400">LKR {payment.amount?.toLocaleString()}</td>
                             <td className="p-6 text-white/40 text-xs">
                                {new Date(payment.submitted_at || payment.created_at || '').toLocaleDateString()}
                             </td>
                             <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(payment.status)}`}>
                                   {payment.status}
                                </span>
                             </td>
                             <td className="p-6 text-right">
                                <button 
                                  onClick={() => { setSelectedPayment(payment); setShowViewModal(true); }}
                                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all ml-auto block"
                                >
                                   <Eye size={18} />
                                </button>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </GlassCard>
      </div>

      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <GlassCard className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Receipt Verification</h2>
                    <p className="text-white/40 text-xs mt-1">Processing payment from {getStudentInfo(selectedPayment)}</p>
                 </div>
                 <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={24} className="text-white/40 hover:text-white" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-inner">
                       <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2">Order Information</h3>
                       <div className="space-y-4">
                          <div className="flex justify-between items-start">
                             <span className="text-white/60 text-sm">Product Name</span>
                             <span className="text-white font-bold text-sm text-right max-w-[200px]">{getProductTitle(selectedPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-white/60 text-sm">Amount Paid</span>
                             <span className="text-cyan-400 font-bold text-lg">LKR {selectedPayment.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="text-white/60 text-sm">Student ID</span>
                             <span className="text-white/60 font-mono text-xs">{selectedPayment.student_id}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-1">Actions</label>
                       <div className="flex gap-3">
                          <button 
                            disabled={isActionLoading || selectedPayment.status !== 'pending'}
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold transition-all disabled:opacity-30"
                          >
                             Reject
                          </button>
                          <button 
                            disabled={isActionLoading || selectedPayment.status !== 'pending'}
                            onClick={() => handleApprovePayment(selectedPayment)}
                            className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                          >
                             {isActionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                             Approve & Notify
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Bank Slip Preview</label>
                        <a href={selectedPayment.slip_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-[10px] font-bold uppercase hover:underline flex items-center gap-1">
                           Open Full Size <ExternalLink size={10} />
                        </a>
                    </div>
                    <div className="w-full aspect-[4/5] rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center relative bg-gradient-to-b from-transparent to-black/20">
                       {selectedPayment.slip_url ? (
                          selectedPayment.slip_url.endsWith('.pdf') ? (
                             <iframe src={selectedPayment.slip_url} className="w-full h-full border-none" title="PDF Receipt" />
                          ) : (
                             <img src={selectedPayment.slip_url} className="w-full h-full object-contain" alt="Receipt" />
                          )
                       ) : (
                          <div className="text-center text-white/10 p-10">
                             <AlertTriangle size={64} className="mx-auto mb-4" />
                             <p className="font-bold uppercase tracking-widest text-xs">No Upload Found</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </GlassCard>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[60] p-4 animate-in zoom-in-95 duration-200">
           <GlassCard className="w-full max-w-md shadow-2xl">
              <div className="p-8">
                 <h2 className="text-2xl font-bold text-white mb-2">Rejection Reason</h2>
                 <p className="text-white/40 text-sm mb-8 leading-relaxed">This message will be sent to the student to help them correct their submission.</p>
                 
                 <div className="space-y-2 mb-10">
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-red-500/50 appearance-none transition-all"
                    >
                       <option value="Invalid receipt">Invalid receipt image</option>
                       <option value="Incorrect amount">Incorrect amount paid</option>
                       <option value="Incorrect account">Paid to wrong account</option>
                       <option value="Account mismatch">Account name mismatch</option>
                       <option value="Other">Other reason...</option>
                    </select>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 text-white/40 font-bold hover:text-white transition-colors">
                       Cancel
                    </button>
                    <button 
                      onClick={handleRejectPayment}
                      className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(239,68,68,0.3)]"
                    >
                       Reject Payment
                    </button>
                 </div>
              </div>
           </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
