import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  Plus,
  Database,
  Search,
  BookOpen,
  Filter,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Video,
  Link,
  ChevronRight,
  Upload,
  X,
  Loader2,
  Lock,
} from 'lucide-react';
import apiClient from '@/api/api-client';

const OL_SUBJECTS = [
  "Mathematics", "English", "Science", "Sinhala", "History", "Religion",
  "Business & Accounting Studies", "Commerce", "Geography", "Civic Education", "Entrepreneurship Studies", "Second Language (Sinhala)", "Second Language (Tamil)",
  "Music", "Art", "Dance", "Sinhala Literary", "English Literary", "Drama",
  "ICT", "Agriculture", "Health", "Communication"
];

const AL_STREAMS = {
  "Science": ["Biology", "Physics", "Chemistry", "Combined Mathematics", "Agriculture", "ICT (Information & Communication Technology)"],
  "Commerce": ["Accounting", "Business Studies", "Economics", "ICT"],
  "Arts": ["History", "Political Science", "Geography", "Logic", "Sinhala / Tamil / English Literature", "Media Studies", "Art"],
  "Technology": ["SFT", "ET / BST", "Agriculture", "ICT", "Geography", "Economics", "Business studies", "Accounting", "Home economics", "Communication and media studies", "Arts", "English", "Maths"]
};

interface StudyPack {
  id: string;
  title: string;
  description: string;
  price: number;
  level: 'OL' | 'AL';
  subject: string;
  category: string;
  cover_image: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

interface TeacherStudyPacksPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function TeacherStudyPacksPage({
  onLogout,
  onNavigate,
}: TeacherStudyPacksPageProps) {
  const [packs, setPacks] = useState<StudyPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    level: 'AL' as 'OL' | 'AL',
    subject: '',
    cover_image: '',
  });

  const [stream, setStream] = useState<keyof typeof AL_STREAMS>('Science');
  const [links, setLinks] = useState<{ file_name: string; file_url: string }[]>([]);
  const [newLink, setNewLink] = useState({ file_name: '', file_url: '' });

  // Edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPacks();
  }, []);

  const fetchMyPacks = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/study-packs/my-packs');
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      level: 'AL',
      subject: '',
      cover_image: '',
    });
    setLinks([]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (pack: StudyPack) => {
    setIsEditMode(true);
    setEditingId(pack.id);
    setFormData({
      title: pack.title,
      description: pack.description,
      price: pack.price.toString(),
      level: pack.level,
      subject: pack.subject,
      cover_image: pack.cover_image,
    });
    setLinks([]); // We don't fetch existing content for the edit modal yet for simplicity, but we could
    setIsCreateModalOpen(true);
  };

  const addLink = () => {
    if (!newLink.file_name || !newLink.file_url) return;
    setLinks([...links, newLink]);
    setNewLink({ file_name: '', file_url: '' });
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      if (isEditMode && editingId) {
        await apiClient.patch(`/study-packs/${editingId}`, formData);
        alert('Study pack updated! Note: Approved packs will require re-approval.');
      } else {
        await apiClient.post('/study-packs', {
          ...formData,
          contents: links
        });
        alert('Study pack submitted for approval!');
      }
      setIsCreateModalOpen(false);
      fetchMyPacks();
    } catch (error) {
      console.error('Error saving pack:', error);
      alert('Failed to save study pack.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredPacks = packs.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout
      userRole="teacher"
      userName="Mr. Silva"
      userInitials="MS"
      notificationCount={8}
      breadcrumb="Study Packs"
      activePage="teacher-study-packs"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Database size={24} className="text-white" />
              </div>
              Study Packs
            </h1>
            <p className="text-white/60">Manage your resource packages and sales</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Create New Pack
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <p className="text-white/60 text-sm mb-1">Total Packs</p>
            <p className="text-3xl font-bold text-white">{packs.length}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-white/60 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-400">
              {packs.filter((p) => p.status === 'approved').length}
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-white/60 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">
              {packs.filter((p) => p.status === 'pending').length}
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-white/60 text-sm mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-cyan-400">0</p>
          </GlassCard>
        </div>

        {/* Filters and Search */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search packs by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'approved', 'pending', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Packs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={48} />
          </div>
        ) : filteredPacks.length === 0 ? (
          <GlassCard className="p-20 text-center">
            <Database size={64} className="mx-auto text-white/10 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No Study Packs Found</h3>
            <p className="text-white/60">Get started by creating your first study pack!</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacks.map((pack) => (
              <GlassCard key={pack.id} className="p-0 overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
                <div className="h-40 relative overflow-hidden">
                  <img
                    src={pack.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'}
                    alt={pack.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      pack.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      pack.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {pack.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs text-white/60 uppercase tracking-widest font-bold">{pack.level} • {pack.subject}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors uppercase truncate">
                      {pack.title}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2">{pack.description}</p>
                  </div>

                  <div className="flex items-center justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Clock size={14} className="text-cyan-400" />
                      <span>{new Date(pack.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-green-400 font-bold text-lg">
                      LKR {pack.price.toLocaleString()}
                    </div>
                  </div>

                  {pack.status === 'rejected' && pack.rejection_reason && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason:</p>
                      <p className="text-white/70 text-xs">{pack.rejection_reason}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10 flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      onClick={() => onNavigate?.('teacher-study-pack-details', { id: pack.id })}
                    >
                      <Eye size={16} /> Manage
                    </button>
                    <button 
                      className="flex-1 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      onClick={() => handleOpenEditModal(pack)}
                    >
                      <AlertCircle size={16} /> Edit
                    </button>
                    <button className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Create Pack Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {isEditMode ? <AlertCircle size={24} className="text-cyan-400" /> : <Plus size={24} className="text-cyan-400" />}
                {isEditMode ? 'Edit Study Pack' : 'Create Study Pack'}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isUploading}
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePack} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/60 text-sm font-semibold mb-2 block">Pack Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="e.g. Physics Revision Pack"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm font-semibold mb-2 block">Price (LKR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <label className="text-white/60 text-sm font-semibold mb-2 block">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => {
                      const newLevel = e.target.value as 'OL' | 'AL';
                      setFormData({ ...formData, level: newLevel, subject: '' });
                    }}
                    className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="AL">A/L (Advanced Level)</option>
                    <option value="OL">O/L (Ordinary Level)</option>
                  </select>
                </div>
                {formData.level === 'AL' && (
                  <div>
                    <label className="text-white/60 text-sm font-semibold mb-2 block">Stream</label>
                    <select
                      value={stream}
                      onChange={(e) => {
                        setStream(e.target.value as keyof typeof AL_STREAMS);
                        setFormData({ ...formData, subject: '' });
                      }}
                      className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                    >
                      {Object.keys(AL_STREAMS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-white/60 text-sm font-semibold mb-2 block">Subject</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="">Select Subject...</option>
                    {formData.level === 'OL'
                      ? OL_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)
                      : AL_STREAMS[stream].map(sub => <option key={sub} value={sub}>{sub}</option>)
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm font-semibold mb-2 block">Description</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
                  placeholder="Tell students what is inside this pack..."
                />
              </div>

              <div>
                <label className="text-white/60 text-sm font-semibold mb-2 block">Cover Image URL</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.cover_image ? (
                      <img src={formData.cover_image} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="text-white/20" size={24} />
                    )}
                  </div>
                </div>
              </div>

              {!isEditMode && (
                <div className="p-5 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Link size={18} className="text-cyan-400" />
                    Initial Materials (Links)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                      <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest block mb-1">Title</label>
                      <input 
                        type="text" 
                        value={newLink.file_name} 
                        onChange={(e) => setNewLink({ ...newLink, file_name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        placeholder="Video Lesson 1"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest block mb-1">URL</label>
                      <input 
                        type="text" 
                        value={newLink.file_url} 
                        onChange={(e) => setNewLink({ ...newLink, file_url: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div className="md:col-span-2">
                       <button 
                        type="button" 
                        onClick={addLink}
                        className="w-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg py-2 text-sm font-bold hover:bg-cyan-500/30 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {links.length > 0 && (
                    <div className="mt-4 space-y-2">
                       {links.map((link, idx) => (
                         <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                           <div>
                              <p className="text-white text-sm font-bold flex items-center gap-2">
                                {link.file_name}
                              </p>
                           </div>
                           <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 p-2">
                              <X size={16} />
                           </button>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                  Submit for Approval
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
