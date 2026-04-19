import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  Plus,
  FileText,
  Video,
  Link as LinkIcon,
  Trash2,
  GripVertical,
  Upload,
  CheckCircle,
  X,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface PackContent {
  id: string;
  file_name: string;
  file_url: string;
  file_type: 'pdf' | 'video' | 'link';
  is_preview: boolean;
  order_index: number;
}

interface TeacherStudyPackDetailsPageProps {
  packId: string;
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function TeacherStudyPackDetailsPage({
  packId,
  onLogout,
  onNavigate,
}: TeacherStudyPackDetailsPageProps) {
  const [pack, setPack] = useState<any>(null);
  const [contents, setContents] = useState<PackContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal for adding content
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMethod, setAddMethod] = useState<'pdf' | 'video' | 'link'>('pdf');
  const [newContent, setNewContent] = useState({
    name: '',
    url: '',
    isPreview: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPackDetails();
  }, [packId]);

  const fetchPackDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/study-packs/${packId}`);
      setPack(response.data);
      setContents(response.data.contents || []);
    } catch (error) {
      console.error('Error fetching pack details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file_name', newContent.name);
      formData.append('file_type', addMethod);
      formData.append('is_preview', String(newContent.isPreview));

      if (addMethod === 'link') {
        formData.append('file_url', newContent.url);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        alert('Please select a file or provide a link.');
        setIsUploading(false);
        return;
      }

      await apiClient.post(`/study-packs/${packId}/contents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Content added successfully!');
      setIsAddModalOpen(false);
      setNewContent({ name: '', url: '', isPreview: false });
      setSelectedFile(null);
      fetchPackDetails();
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Failed to add content.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      // Endpoint logic not fully in backend yet but assuming standard DELETE
      await apiClient.delete(`/study-packs/contents/${contentId}`);
      setContents(contents.filter(c => c.id !== contentId));
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <DashboardLayout
      userRole="teacher"
      notificationCount={8}
      breadcrumb={`Study Pack / ${pack?.title || 'Details'}`}
      activePage="teacher-study-packs"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => onNavigate?.('teacher-study-packs')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to All Study Packs
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                <img 
                  src={pack?.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 uppercase">{pack?.title}</h1>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 uppercase tracking-widest leading-none">
                    {pack?.level}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60 text-sm font-semibold">{pack?.subject}</span>
                  <span className="text-white/40">•</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    pack?.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    pack?.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  } uppercase`}>
                    {pack?.status}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Item to Pack
            </button>
          </div>
        </div>

        {/* Content List */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Pack Contents</h2>
            <p className="text-white/40 text-sm">Organize and manage the materials inside this pack</p>
          </div>

          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-20 text-center">
                <Loader2 className="animate-spin text-cyan-400 mx-auto" size={48} />
              </div>
            ) : contents.length === 0 ? (
              <div className="p-20 text-center">
                <FileText size={64} className="mx-auto text-white/5 mb-6" />
                <h3 className="text-white font-bold text-lg mb-2">No Content Added Yet</h3>
                <p className="text-white/40">Start adding PDF notes, video lessons or links to this pack.</p>
              </div>
            ) : (
              contents.map((item, index) => (
                <div key={item.id} className="p-4 flex items-center gap-4 group hover:bg-white/5 transition-colors">
                  <div className="p-2 text-white/20 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    item.file_type === 'pdf' ? 'bg-orange-500/10 text-orange-400' :
                    item.file_type === 'video' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {item.file_type === 'pdf' ? <FileText size={20} /> :
                     item.file_type === 'video' ? <Video size={20} /> :
                     <LinkIcon size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-bold truncate">{item.file_name}</h4>
                    </div>
                    <p className="text-white/40 text-xs truncate max-w-md">{item.file_url}</p>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button 
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Add Content Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Add New Item</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex bg-white/5 rounded-xl p-1">
                {(['pdf', 'video', 'link'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setAddMethod(method);
                      setSelectedFile(null);
                      setNewContent({ ...newContent, url: '' });
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      addMethod === method
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {method === 'pdf' ? <FileText size={16} /> :
                     method === 'video' ? <Video size={16} /> :
                     <LinkIcon size={16} />}
                    {method.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm font-semibold mb-2 block">Display Name</label>
                  <input
                    type="text"
                    required
                    value={newContent.name}
                    onChange={(e) => setNewContent({ ...newContent, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="e.g. Unit 1 Revision Notes"
                  />
                </div>

                {addMethod === 'link' ? (
                  <div>
                    <label className="text-white/60 text-sm font-semibold mb-2 block">Link URL (YouTube/Drive)</label>
                    <input
                      type="url"
                      required
                      value={newContent.url}
                      onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-white/60 text-sm font-semibold mb-2 block">Select {addMethod.toUpperCase()} File</label>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept={addMethod === 'pdf' ? '.pdf' : 'video/*'} 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-cyan-500/50 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {selectedFile ? (
                        <>
                          <CheckCircle className="text-green-400 mb-2" size={32} />
                          <p className="text-green-400 font-bold text-sm">{selectedFile.name}</p>
                          <p className="text-white/40 text-xs">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="text-white/20 mb-2" size={32} />
                          <p className="text-white/60 text-sm font-medium">Click to choose a {addMethod} file</p>
                          <p className="text-white/30 text-xs mt-1">Maximum 100 MB</p>
                        </>
                      )}
                    </div>
                  </div>
                )}


              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContent}
                  disabled={isUploading || (!selectedFile && addMethod !== 'link')}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  Add to Pack
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
