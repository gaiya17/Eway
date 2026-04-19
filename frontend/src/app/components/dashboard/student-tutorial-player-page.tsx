import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  FileText,
  Video,
  Link as LinkIcon,
  Play,
  Clock,
  User,
  BookOpen,
  ExternalLink,
  Youtube,
  Loader2,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface TutorialContent {
  id: string;
  file_name: string;
  file_url: string;
  file_type: 'pdf' | 'video' | 'link';
  order_index: number;
}

interface StudentTutorialPlayerPageProps {
  tutorialId: string;
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function StudentTutorialPlayerPage({
  tutorialId,
  onLogout,
  onNavigate,
}: StudentTutorialPlayerPageProps) {
  const [tutorial, setTutorial] = useState<any>(null);
  const [contents, setContents] = useState<TutorialContent[]>([]);
  const [activeContent, setActiveContent] = useState<TutorialContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tutorial metadata + contents
  useEffect(() => {
    fetchTutorialDetails();
  }, [tutorialId]);

  const fetchTutorialDetails = async () => {
    if (!tutorialId || tutorialId === 'undefined') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/free-tutorials/${tutorialId}`);
      setTutorial(response.data);
      const items = response.data.contents || [];
      setContents(items);
      if (items.length > 0) {
        setActiveContent(items[0]);
      }
    } catch (error) {
      console.error('Error fetching tutorial details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('be/')[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  const isYoutubeUrl = (url: string) =>
    url.includes('youtube.com') || url.includes('youtu.be');

  // Guard: No valid tutorialId
  if (!isLoading && (!tutorialId || tutorialId === 'undefined')) {
    return (
      <DashboardLayout
        userRole="student" breadcrumb="Tutorial Player"
        onNavigate={onNavigate} onLogout={onLogout}
      >
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Tutorial Not Found</h2>
          <p className="text-white/50 mb-8">Could not load this tutorial. Please go back to the library.</p>
          <button
            onClick={() => onNavigate?.('tutorials')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all"
          >
            ← Back to Library
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout
        userRole="student" breadcrumb="Tutorial Player"
        onNavigate={onNavigate} onLogout={onLogout}
      >
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin text-red-500" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  // Determine viewer height — PDFs need more space than video
  const isPdf = activeContent?.file_type === 'pdf';
  const viewerHeight = isPdf ? 'min-h-[75vh]' : 'aspect-video';

  return (
    <DashboardLayout
      userRole="student"
      breadcrumb={`Library / ${tutorial?.title || 'Tutorial'}`}
      activePage="tutorials"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => onNavigate?.('tutorials')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group mb-2"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Return to Library</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Player Area */}
          <div className="lg:col-span-8 space-y-6">
            <GlassCard className="p-0 overflow-hidden bg-black/40 border-white/5 shadow-2xl">
              {/* Viewer */}
              <div className={`${viewerHeight} bg-black relative w-full`}>

                {/* ── YouTube Embed ── */}
                {activeContent?.file_url && isYoutubeUrl(activeContent.file_url) ? (
                  <iframe
                    src={getYoutubeEmbedUrl(activeContent.file_url)}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                ) : activeContent?.file_type === 'pdf' ? (
                  /* ── PDF Download/Preview Placeholder ── */
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-[#0B0F1A] to-[#1a1c2e]">
                    <div className="relative mb-8 group">
                      <div className="absolute inset-0 bg-red-600/20 blur-[40px] rounded-full group-hover:bg-red-600/30 transition-all duration-500" />
                      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] border border-red-400/20 transform group-hover:scale-105 transition-all duration-300">
                        <FileText size={48} className="text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-3xl mb-3 tracking-tight">PDF Resource Available</h3>
                    <p className="text-white/40 mb-10 max-w-md leading-relaxed">
                      "{activeContent?.file_name}" is ready for you. You can preview it in a high-resolution viewer or download it for offline study.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                      <button
                        onClick={() => window.open(activeContent?.file_url, '_blank')}
                        className="w-full px-8 py-4 rounded-xl bg-white text-black font-black hover:bg-white/90 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <ExternalLink size={20} className="group-hover/btn:scale-110 transition-transform" />
                        Preview in New Tab
                      </button>
                      <a
                        href={activeContent?.file_url}
                        download={activeContent?.file_name}
                        className="w-full px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>

                ) : activeContent?.file_type === 'video' ? (
                  /* ── Native Video Player ── */
                  <video
                    key={activeContent.file_url}
                    src={activeContent.file_url}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>

                ) : activeContent?.file_type === 'link' ? (
                  /* ── External Link ── */
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                      <LinkIcon size={40} className="text-red-400" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-2">{activeContent?.file_name}</h3>
                    <p className="text-white/40 mb-8 max-w-sm">
                      This resource is an external link. Click below to open it.
                    </p>
                    <button
                      onClick={() => window.open(activeContent?.file_url, '_blank')}
                      className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center gap-2"
                    >
                      <ExternalLink size={20} /> Open Resource
                    </button>
                  </div>

                ) : (
                  /* ── No content selected ── */
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <p>Select a resource from the list →</p>
                  </div>
                )}
              </div>

              {/* Tutorial info below the player */}
              <div className="p-8 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">{tutorial?.title}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-widest text-xs">
                        <Youtube size={14} /> Free Tutorial
                      </div>
                      <span className="text-white/20">•</span>
                      <div className="flex items-center gap-1.5 text-white/60">
                        <User size={14} /> {tutorial?.profiles?.first_name} {tutorial?.profiles?.last_name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/70 leading-relaxed text-lg italic">
                    {tutorial?.description}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Meta cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-4 flex items-center gap-4 bg-green-500/5 border-green-500/10">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <BookOpen size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Subject</p>
                  <p className="text-white font-bold text-sm">{tutorial?.subject}</p>
                </div>
              </GlassCard>
              <GlassCard className="p-4 flex items-center gap-4 bg-indigo-500/5 border-indigo-500/10">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Clock size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Released</p>
                  <p className="text-white font-bold text-sm">
                    {tutorial?.created_at ? new Date(tutorial.created_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Sidebar: Content playlist */}
          <div className="lg:col-span-4">
            <GlassCard className="p-0 overflow-hidden flex flex-col border-white/5 sticky top-6">
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Tutorial Contents</h2>
                <div className="px-2 py-1 rounded bg-red-600 text-[10px] font-bold text-white">
                  {contents.length} ITEMS
                </div>
              </div>

              <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[70vh]">
                {contents.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">No content yet.</p>
                ) : contents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveContent(item)}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 text-left group ${
                      activeContent?.id === item.id
                        ? 'bg-red-600/20 border border-red-600/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      activeContent?.id === item.id ? 'bg-red-600 text-white shadow-lg' : 'bg-white/10 text-white/40 group-hover:text-white'
                    }`}>
                      {item.file_type === 'pdf' ? <FileText size={18} /> :
                       item.file_type === 'video' ? <Play size={18} /> :
                       <LinkIcon size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${activeContent?.id === item.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                        {item.file_name}
                      </p>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">
                        {item.file_type === 'pdf' ? '📄 PDF' : item.file_type === 'video' ? '🎬 Video' : '🔗 Link'}
                      </p>
                    </div>

                    {activeContent?.id === item.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                <button
                  onClick={() => onNavigate?.('chat')}
                  className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                >
                  Any questions? Ask Instructor
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
