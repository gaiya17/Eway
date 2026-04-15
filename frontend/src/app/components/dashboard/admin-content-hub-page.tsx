import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  User,
  Database,
  Youtube,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  Video,
  Link as LinkIcon,
  X,
} from 'lucide-react';

type TabType = 'classes' | 'study-packs' | 'tutorials';

export function AdminContentHubPage({ onLogout, onNavigate }: { onLogout?: () => void; onNavigate?: (page: string, data?: any) => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Data States
  const [classes, setClasses] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  
  // Detail States
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemContents, setItemContents] = useState<any[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<{ classes: number; studyPacks: number; tutorials: number }>({
    classes: 0,
    studyPacks: 0,
    tutorials: 0
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await apiClient.get('/admin/pending-summary');
      setPendingCounts(res.data);
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setSelectedItem(null);
    try {
      if (activeTab === 'classes') {
        const res = await apiClient.get('/classes/admin/all');
        setClasses(res.data);
      } else if (activeTab === 'study-packs') {
        const res = await apiClient.get('/study-packs/admin/all'); 
        setPacks(res.data);
      } else if (activeTab === 'tutorials') {
        const res = await apiClient.get('/free-tutorials/admin/all');
        setTutorials(res.data);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectItem = async (item: any) => {
    setSelectedItem(item);
    setRejectionReason('');
    if (activeTab !== 'classes') {
      setIsDetailLoading(true);
      try {
        const endpoint = activeTab === 'study-packs' ? `/study-packs/${item.id}` : `/free-tutorials/${item.id}`;
        const res = await apiClient.get(endpoint);
        setItemContents(res.data.contents || []);
      } catch (error) {
        console.error('Error fetching contents:', error);
      } finally {
        setIsDetailLoading(false);
      }
    }
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setIsProcessing(true);
    try {
      let endpoint = '';
      if (activeTab === 'classes') endpoint = `/classes/${selectedItem.id}/status`;
      else if (activeTab === 'study-packs') endpoint = `/study-packs/${selectedItem.id}/status`;
      else if (activeTab === 'tutorials') endpoint = `/free-tutorials/${selectedItem.id}/status`;

      await apiClient.patch(endpoint, { status, rejection_reason: rejectionReason });
      
      alert(`${activeTab.slice(0, -1)} ${status} successfully!`);
      setSelectedItem(null);
      fetchData();
      fetchCounts();
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter Logic
  const getFilteredData = () => {
    let data = activeTab === 'classes' ? classes : activeTab === 'study-packs' ? packs : tutorials;
    
    return data.filter(item => {
      const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.profiles?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredData = getFilteredData();

  return (
    <DashboardLayout
      userRole="admin" userName="Admin" userInitials="AD" notificationCount={5}
      breadcrumb="Content Approval Hub" activePage="content-management"
      onNavigate={onNavigate} onLogout={onLogout}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 text-left">
            <CheckCircle size={32} className="text-cyan-400" />
            Content Approval Hub
          </h1>
          <p className="text-white/60 text-left">Centralized hub for reviewing Classes, Study Packs, and Free Tutorials.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
          {(['classes', 'study-packs', 'tutorials'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'classes' ? <BookOpen size={18} /> : 
               tab === 'study-packs' ? <Database size={18} /> : 
               <Youtube size={18} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              
              {/* Badge for Pending Items */}
              {((tab === 'classes' && pendingCounts.classes > 0) || 
                (tab === 'study-packs' && pendingCounts.studyPacks > 0) || 
                (tab === 'tutorials' && pendingCounts.tutorials > 0)) && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab ? 'bg-white text-indigo-600' : 'bg-cyan-500 text-white'
                }`}>
                  {tab === 'classes' ? pendingCounts.classes : 
                   tab === 'study-packs' ? pendingCounts.studyPacks : 
                   pendingCounts.tutorials}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Column */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all text-left"
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
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-cyan-400" size={48} />
              </div>
            ) : filteredData.length === 0 ? (
              <GlassCard className="p-20 text-center">
                <CheckCircle size={64} className="mx-auto text-green-400/20 mb-6" />
                <h3 className="text-white font-bold text-xl mb-2">Queue Clear!</h3>
                <p className="text-white/40">No {activeTab} matching your current filters.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredData.map((item) => (
                  <GlassCard 
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-5 cursor-pointer transition-all duration-300 border-l-4 ${
                      selectedItem?.id === item.id ? 'border-cyan-400 bg-white/10' : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          activeTab === 'classes' ? 'bg-blue-500/20 text-blue-400' :
                          activeTab === 'study-packs' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {activeTab === 'classes' ? <BookOpen size={24} /> : 
                           activeTab === 'study-packs' ? <Database size={24} /> : 
                           <Youtube size={24} />}
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-white/50">
                            <span className="flex items-center gap-1"><User size={12} /> {item.profiles?.first_name} {item.profiles?.last_name}</span>
                            <span>•</span>
                            <span>{item.subject}</span>
                            <span>•</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        item.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                        item.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            {selectedItem ? (
              <GlassCard className="p-6 sticky top-8 text-left">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Eye size={20} className="text-cyan-400" /> Review Details
                  </h2>
                  <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/10 rounded-lg text-white/40">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{selectedItem.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{selectedItem.description}</p>
                  </div>

                  {/* Grid Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Level</p>
                      <p className="text-white font-bold">{selectedItem.level}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{activeTab === 'classes' ? 'Mode' : 'Type'}</p>
                       <p className="text-white font-bold">{activeTab === 'classes' ? selectedItem.mode : activeTab === 'study-packs' ? 'Pack' : 'Tutorial'}</p>
                    </div>
                    {activeTab !== 'tutorials' && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left col-span-2">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Price</p>
                        <p className="text-green-400 font-bold">LKR {selectedItem.price?.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Class Specific: Schedule */}
                  {activeTab === 'classes' && (
                    <div className="space-y-3">
                      <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                        <Calendar size={16} className="text-blue-400" /> Schedule
                      </h4>
                      {selectedItem.schedules?.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-white/60 p-2 bg-white/5 rounded-lg">
                          <span>{s.day}</span>
                          <span>{s.start_time} - {s.end_time}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content Audit (Packs & Tutorials) */}
                  {activeTab !== 'classes' && (
                    <div className="space-y-3">
                      <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                        <FileText size={16} className="text-indigo-400" /> Content Audit ({itemContents.length})
                      </h4>
                      {isDetailLoading ? (
                        <div className="p-4 text-center"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={24} /></div>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                           {itemContents.map((content) => (
                             <div key={content.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-3 min-w-0">
                                   <div className="text-white/40">
                                      {content.file_type === 'pdf' ? <FileText size={16} /> : <Video size={16} />}
                                   </div>
                                   <p className="text-xs text-white font-medium truncate">{content.file_name}</p>
                                </div>
                                <a href={content.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Eye size={14} />
                                </a>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Section */}
                  {selectedItem.status === 'pending' ? (
                    <div className="pt-6 border-t border-white/10 space-y-4">
                      <textarea
                        placeholder="Rejection reason (required for rejection)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50 min-h-[100px] resize-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleUpdateStatus('rejected')}
                          disabled={isProcessing}
                          className="py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} /> Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('approved')}
                          disabled={isProcessing}
                          className="py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-6 border-t border-white/10">
                       <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                         selectedItem.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                       }`}>
                          {selectedItem.status === 'approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                          <div>
                            <p className="text-sm font-bold uppercase italic">Content {selectedItem.status}</p>
                            {selectedItem.rejection_reason && <p className="text-xs opacity-70 mt-1">{selectedItem.rejection_reason}</p>}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center border-dashed border-white/20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                   <AlertCircle className="text-white/20" size={32} />
                </div>
                <h3 className="text-white font-bold mb-2">No Item Selected</h3>
                <p className="text-white/40 text-sm">Select an item from the list to view its full details and content for review.</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
