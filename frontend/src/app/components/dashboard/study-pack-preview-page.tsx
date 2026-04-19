import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../ui/image-with-fallback';
import {
  ArrowLeft,
  Play,
  FileText,
  Video,
  Lock,
  Download,
  Clock,
  Files,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Star,
  BookOpen,
  FileCode,
  Loader2,
  ExternalLink,
  ChevronRight,
  Info,
  Link as LinkIcon,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface StudyPackPreviewPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  packData?: any;
}

interface PackContent {
  id: string;
  file_name: string;
  file_url: string;
  file_type: 'pdf' | 'video' | 'link';
  is_preview: boolean;
  order_index: number;
}

export function StudyPackPreviewPage({
  onLogout,
  onNavigate,
  packData,
}: StudyPackPreviewPageProps) {
  const [pack, setPack] = useState<any>(packData || null);
  const [contents, setContents] = useState<PackContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeContent, setActiveContent] = useState<PackContent | null>(null);

  useEffect(() => {
    if (pack?.id) {
      fetchPackDetails();
    }
  }, [pack?.id]);

  const fetchPackDetails = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Basic Details and Preview Contents
      const response = await apiClient.get(`/study-packs/${pack.id}`);
      setPack(response.data);
      setContents(response.data.contents || []);

      // 2. Check Enrollment / Purchase Status
      try {
        const accessResponse = await apiClient.get(`/study-packs/${pack.id}/access`);
        if (accessResponse.data && accessResponse.status === 200) {
          setContents(accessResponse.data);
          setIsEnrolled(true);
        }
      } catch (e) {
        // Not purchased yet or forbidden, that's fine for preview
        setIsEnrolled(false);
      }

      // 3. Optional: Only set default active content if user is enrolled
      if (isEnrolled && (response.data.contents || []).length > 0) {
        setActiveContent(response.data.contents[0]);
      }
      
    } catch (error) {
      console.error('Error fetching pack details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) onNavigate('study-packs');
  };

  const handlePurchaseNavigation = () => {
    if (onNavigate) onNavigate('pack-checkout', pack);
  };

  const isYouTube = (url: string) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be') || false;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const renderViewer = () => {
    if (!activeContent) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/40">
           <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Play size={32} className="text-white/20" />
           </div>
           <h3 className="text-white font-bold text-lg">Select a preview item</h3>
           <p className="text-white/40 text-sm max-w-xs">Click on any item with a "Preview" badge to view internal content.</p>
        </div>
      );
    }

    if (activeContent.file_type === 'pdf') {
       return (
         <iframe 
           src={`${activeContent.file_url}#toolbar=0`} 
           className="w-full h-full border-none" 
           title={activeContent.file_name}
         />
       );
    }

    if (activeContent.file_type === 'link' && isYouTube(activeContent.file_url)) {
      return (
        <iframe
          className="w-full h-full"
          src={getYouTubeEmbedUrl(activeContent.file_url) || ''}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }

    if (activeContent.file_type === 'video') {
      return (
        <video key={activeContent.id} controls className="w-full h-full bg-black">
          <source src={activeContent.file_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/40">
         <LinkIcon size={48} className="text-cyan-400 mb-4" />
         <h3 className="text-white font-bold text-lg">External Link</h3>
         <p className="text-white/40 text-sm mb-6">This item is a link to an external resource.</p>
         <a href={activeContent.file_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold">
            Open Resource
         </a>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" notificationCount={0} breadcrumb="Loading Pack..." activePage="study-packs" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="h-[600px] flex items-center justify-center">
           <Loader2 className="animate-spin text-cyan-400" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout
        userRole="student"
        notificationCount={5}
        breadcrumb={`${pack.subject} Study Pack`}
        activePage="study-packs"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <button onClick={handleBack} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-3xl font-bold text-white uppercase tracking-tight">{pack.title}</h1>
                  <p className="text-cyan-400 text-sm font-semibold uppercase">{pack.level} • {pack.subject}</p>
               </div>
            </div>
            {!isEnrolled && (
              <button 
                onClick={handlePurchaseNavigation}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-all flex items-center gap-2"
              >
                <ShoppingCart size={20} /> Enroll Now • LKR {pack.price?.toLocaleString()}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Viewer Section */}
            <div className="lg:col-span-8 space-y-6">
               <GlassCard className="p-0 overflow-hidden bg-black/60 border-white/5 aspect-video flex flex-col items-center justify-center relative shadow-2xl">
                  {renderViewer()}
               </GlassCard>

               <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen size={20} className="text-cyan-400" /> Pack Description
                     </h2>
                  </div>
                  <p className="text-white/70 leading-relaxed text-sm">
                     {pack.description}
                  </p>
               </GlassCard>
            </div>

            {/* Sidebar Contents */}
            <div className="lg:col-span-4 space-y-6">
               <GlassCard className="p-0 overflow-hidden flex flex-col h-[550px]">
                  <div className="p-5 border-b border-white/10 bg-white/[0.02]">
                     <h3 className="text-white font-bold flex items-center gap-2">
                        <Files size={18} className="text-cyan-400" /> Pack Contents
                     </h3>
                     <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                        {contents.length} Items Total
                     </p>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                     <div className="divide-y divide-white/[0.03]">
                        {contents.map((item) => {
                          const isLocked = !isEnrolled;
                          const isActive = activeContent?.id === item.id;

                          return (
                            <button
                              key={item.id}
                              disabled={isLocked}
                              onClick={() => setActiveContent(item)}
                              className={`w-full p-4 flex items-center gap-4 text-left transition-all ${
                                isActive ? 'bg-cyan-500/10 border-r-2 border-cyan-400' : 
                                isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/5'
                              }`}
                            >
                               <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                 isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40'
                               }`}>
                                  {isLocked ? <Lock size={18} /> : 
                                   item.file_type === 'pdf' ? <FileText size={18} /> : 
                                   item.file_type === 'video' || (item.file_type === 'link' && isYouTube(item.file_url)) ? <Video size={18} /> : 
                                   <LinkIcon size={18} />}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-white/60'}`}>
                                    {item.file_name}
                                  </p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                     <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                                        {item.file_type}
                                     </span>
                                  </div>
                               </div>
                               {!isLocked && isActive && <ChevronRight size={16} className="text-cyan-400" />}
                            </button>
                          );
                        })}
                     </div>
                  </div>
                  {!isEnrolled && (
                    <div className="p-4 bg-yellow-500/10 border-t border-yellow-500/20">
                       <p className="text-[10px] text-yellow-400/80 font-bold flex items-center gap-2">
                          <Lock size={12} /> REST OF THE CONTENT IS LOCKED
                       </p>
                    </div>
                  )}
               </GlassCard>

               <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-400" /> Core Features
                  </h3>
                  <div className="space-y-3">
                     {[
                       'Expert Recorded Lessons',
                       'Downloadable PDF Notes',
                       'Quick Practical Guides',
                       'Unlimited Lifetime Access',
                       'Mobile & Tablet Ready'
                     ].map((feat) => (
                       <div key={feat} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                         <span className="text-white/70 text-xs">{feat}</span>
                       </div>
                     ))}
                  </div>
               </GlassCard>
            </div>
          </div>
        </div>
      </DashboardLayout>

      <AIChat />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.2);
        }
      `}</style>
    </>
  );
}
