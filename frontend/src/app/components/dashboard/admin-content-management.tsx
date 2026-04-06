import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  CheckCircle, XCircle, Clock, BookOpen, User, DollarSign,
  Calendar, AlertCircle, Search, Filter, Eye, MessageSquare
} from 'lucide-react';

interface ClassData {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  schedule: string;
  start_date: string;
  schedules: { day: string; start_time: string; end_time: string }[];
  force_request: boolean;
  conflict_details: any;
  mode: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function AdminContentManagement({ onLogout, onNavigate }: { onLogout?: () => void; onNavigate?: (page: string) => void }) {
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllClasses();
  }, []);

  const fetchAllClasses = async () => {
    try {
      const response = await apiClient.get('/classes/admin/all');
      setAllClasses(response.data);
    } catch (error) {
      console.error('Error fetching admin classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await apiClient.patch(`/classes/${id}/status`, { status: 'approved' });
      setAllClasses(allClasses.map(c => c.id === id ? { ...c, status: 'approved' } : c));
      setSelectedClass(prev => prev?.id === id ? { ...prev, status: 'approved' } : prev);
      alert('Class approved successfully!');
    } catch (error) {
      console.error('Error approving class:', error);
      alert('Failed to approve class.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!id) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.patch(`/classes/${id}/status`, { 
        status: 'rejected', 
        rejection_reason: rejectionReason 
      });
      setAllClasses(allClasses.map(c => c.id === id ? { ...c, status: 'rejected', rejection_reason: rejectionReason } : c));
      setSelectedClass(prev => prev?.id === id ? { ...prev, status: 'rejected', rejection_reason: rejectionReason } : prev);
      setRejectionReason('');
      alert('Class rejected successfully!');
    } catch (error) {
      console.error('Error rejecting class:', error);
      alert('Failed to reject class.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredClasses = allClasses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.profiles?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.profiles?.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      userRole="admin" userName="Admin" userInitials="AD" notificationCount={5}
      breadcrumb="Content Management" activePage="content-management"
      onNavigate={onNavigate} onLogout={onLogout}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
        <p className="text-white/60">Review and manage class submissions from teachers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of Classes */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  placeholder="Search by class title or teacher name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>
              <div className="relative w-full sm:w-48 shrink-0">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 appearance-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All Classes</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">No Classes Found</h3>
              <p className="text-white/60">There are no classes matching your current filters.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredClasses.map((item) => (
                <GlassCard 
                  key={item.id} 
                  className={`p-5 cursor-pointer transition-all duration-300 ${selectedClass?.id === item.id ? 'border-cyan-400 bg-white/10' : 'hover:bg-white/5'}`}
                  onClick={() => setSelectedClass(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {item.profiles?.first_name} {item.profiles?.last_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : item.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                      {item.status.toUpperCase()}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detail View & Actions */}
        <div className="space-y-6">
          {selectedClass ? (
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><Eye size={20} className="text-cyan-400" /> Class Details</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedClass.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : selectedClass.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                  {selectedClass.status.toUpperCase()}
                </span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Subject</label>
                  <p className="text-white font-medium">{selectedClass.subject}</p>
                </div>

                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Description</label>
                  <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedClass.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Price</label>
                    <p className="text-green-400 font-bold">LKR {selectedClass.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Mode</label>
                    <p className="text-white font-medium">{selectedClass.mode}</p>
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Schedule</label>
                  <div className="flex flex-col gap-1 text-white/80">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-blue-400" />
                      <span>Starts: {selectedClass.start_date || 'N/A'}</span>
                    </div>
                    {Array.isArray(selectedClass.schedules) && selectedClass.schedules.length > 0 ? (
                      selectedClass.schedules.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 mt-1">
                          <Clock size={16} className="text-green-400" />
                          <span>{s.day} • {s.start_time} - {s.end_time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={16} className="text-green-400" />
                        <span>{selectedClass.schedule}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedClass.force_request && (
                  <div className="p-4 rounded-xl border bg-yellow-500/10 border-yellow-500/30">
                    <h4 className="text-yellow-400 font-bold flex items-center gap-2 mb-2">
                      <AlertCircle size={18} /> Forced Overlap Request
                    </h4>
                    <p className="text-white/80 text-sm">The teacher requested to force this schedule despite detecting a warning overlap.</p>
                    {selectedClass.conflict_details && (
                      <div className="mt-3 p-3 bg-black/20 rounded-lg text-sm text-white/60">
                        <p><strong className="text-white">Conflicts With:</strong> {selectedClass.conflict_details.title} ({selectedClass.conflict_details.subject})</p>
                        <p><strong className="text-white">Teacher:</strong> {selectedClass.conflict_details.profiles?.first_name} {selectedClass.conflict_details.profiles?.last_name}</p>
                        <div className="mt-1">
                          <strong className="text-white block mb-1">Overlapping Schedule:</strong>
                          {Array.isArray(selectedClass.conflict_details.schedules) ? (
                             selectedClass.conflict_details.schedules.map((s: any, idx: number) => (
                               <p key={idx} className="pl-2 border-l-2 border-white/20 mb-1">{s.day} | {s.start_time} - {s.end_time}</p>
                             ))
                          ) : (
                            <p>{selectedClass.conflict_details.schedule}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedClass.status === 'rejected' && selectedClass.rejection_reason && (
                  <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30">
                    <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                      <XCircle size={18} /> Rejection Reason
                    </h4>
                    <p className="text-white/80 text-sm">{selectedClass.rejection_reason}</p>
                  </div>
                )}

                {selectedClass.status === 'pending' && (
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <MessageSquare size={18} className="text-cyan-400" /> Review Action
                    </h3>
                    
                    <textarea
                      placeholder="Reason for rejection (required if rejecting)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-red-400/50 min-h-[100px] mb-4 text-sm transition-all resize-none"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleReject(selectedClass.id)}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 border border-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedClass.id)}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle size={18} /> Approve
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedClass.status !== 'pending' && (
                  <div className="pt-4 border-t border-white/10 flex justify-center">
                    <button onClick={() => setSelectedClass(null)} className="text-white/60 hover:text-white transition-colors text-sm font-medium">
                      Close Details
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center border-dashed border-white/20">
              <AlertCircle className="mx-auto text-white/20 mb-4" size={48} />
              <p className="text-white/40">Select a class from the list to see full details and take action.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
