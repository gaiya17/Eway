import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, BookOpen, Calendar, ChevronDown, ChevronUp,
  Download, ExternalLink, FileText, Loader2, MessageCircle,
  MonitorPlay, Play, Radio, Video, ClipboardList, Upload,
  Award, Clock, Users, Zap, X, Maximize2
} from 'lucide-react';
import { JitsiEmbed } from './jitsi-embed';

interface StudentClassViewProps {
  classId: string;
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'live' | 'file' | 'link';
  url: string;
  scheduled_at?: string;
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  order_index: number;
  class_materials: Material[];
}

interface ClassData {
  id: string;
  title: string;
  description: string;
  subject: string;
  mode: string;
  schedule: string;
  teacher_id: string;
  profiles: { id: string; first_name: string; last_name: string; profile_photo?: string; subject?: string };
  sections: Section[];
}

// ─── URL Helper ─────────────────────────────────────────────────────────────
const ensureAbsoluteUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// ─── Countdown Hook ────────────────────────────────────────────────────────
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isPast, setIsPast] = useState(false);
  const [minutesUntil, setMinutesUntil] = useState<number>(Infinity);

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const now = Date.now();
      const start = new Date(targetDate).getTime();
      const end = start + 3 * 60 * 60 * 1000;
      const diff = start - now;
      const mins = Math.round(diff / 60000);
      setMinutesUntil(mins);
      if (now >= start && now <= end) {
        setIsLive(true); setIsPast(false); setTimeLeft('LIVE NOW');
      } else if (now > end) {
        setIsLive(false); setIsPast(true); setTimeLeft('Session Ended');
      } else {
        setIsLive(false); setIsPast(false);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { timeLeft, isLive, isPast, minutesUntil };
}

// ─── Live Material Row ────────────────────────────────────────────────────
function LiveMaterialRow({ material, teacher, classId }: { material: Material; teacher: any; classId: string }) {
  const { timeLeft, isLive, isPast, minutesUntil } = useCountdown(material.scheduled_at || null);
  const [joined, setJoined] = useState(false);
  const isJitsi = material.url?.includes('meet.jit.si');
  const isGoogleMeet = material.url?.includes('meet.google.com');
  const isZoom = material.url?.includes('zoom.us');
  const canJoin = isLive || minutesUntil <= 10; // Enable 10 min before

  // If Jitsi and joined — show embedded viewer
  if (joined && isJitsi) {
    return (
      <div className="rounded-2xl overflow-hidden border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
        <JitsiEmbed 
          roomUrl={material.url} 
          title={material.title} 
          userName={teacher?.first_name ? 'Student' : 'Student'} 
          role="student"
          classId={classId}
          onClose={() => setJoined(false)} 
        />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-500 ${
      isLive
        ? 'border-green-500/50 bg-gradient-to-br from-green-950/60 to-emerald-950/40 shadow-[0_0_40px_rgba(34,197,94,0.15)]'
        : isPast
        ? 'border-white/5 bg-white/2'
        : 'border-green-500/20 bg-white/3 hover:bg-white/5'
    }`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Icon + Status */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            isLive ? 'bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-white/5'
          }`}>
            <Radio size={26} className={isLive ? 'text-green-400 animate-pulse' : isPast ? 'text-white/20' : 'text-green-400/60'} />
          </div>

          <div>
            <p className="text-white font-bold text-base">{material.title}</p>
            {material.scheduled_at && (
              <p className="text-white/40 text-xs mt-0.5">
                🗓 {new Date(material.scheduled_at).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {isJitsi && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/70 font-bold border border-green-500/10">
                  <Zap size={8} className="inline mr-0.5" />Built-in
                </span>
              )}
              {isGoogleMeet && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400/70 font-bold border border-blue-500/10">Google Meet</span>}
              {isZoom && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400/70 font-bold border border-blue-500/10">Zoom</span>}
            </div>
          </div>
        </div>

        {/* Right side: countdown + join */}
        <div className="sm:ml-auto flex flex-col items-start sm:items-end gap-3">
          {material.scheduled_at && !isPast && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
              isLive
                ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse'
                : minutesUntil <= 30
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-white/5 text-white/60 border border-white/10'
            }`}>
              <Clock size={14} />
              {isLive ? '🔴 LIVE NOW' : timeLeft}
            </div>
          )}
          {isPast && <span className="text-white/30 text-xs font-medium">Session ended</span>}

          {!isPast && (
            isJitsi ? (
              <button
                onClick={() => setJoined(true)}
                disabled={!canJoin}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  canJoin
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] hover:scale-105'
                    : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                }`}
              >
                <MonitorPlay size={16} />
                {isLive ? 'Join Live Class' : canJoin ? 'Join Now (Starting soon)' : 'Join class (opens when live)'}
              </button>
            ) : (
              <a
                href={canJoin ? ensureAbsoluteUrl(material.url) : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={e => !canJoin && e.preventDefault()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  canJoin
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] hover:scale-105'
                    : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                }`}
              >
                <ExternalLink size={16} />
                {isLive ? 'Open Live Session' : canJoin ? 'Open Now' : 'Opens when live'}
              </a>
            )
          )}
        </div>
      </div>

      {/* Pre-class info bar (if ≤ 60 min away or live) */}
      {material.scheduled_at && !isPast && minutesUntil <= 60 && (
        <div className={`px-5 py-3 border-t flex items-center gap-3 text-sm ${
          isLive
            ? 'border-green-500/30 bg-green-500/10'
            : 'border-white/5 bg-white/3'
        }`}>
          {teacher?.profile_photo ? (
            <img src={teacher.profile_photo} className="w-7 h-7 rounded-full object-cover border border-green-500/30" alt="" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
              {teacher?.first_name?.[0]}{teacher?.last_name?.[0]}
            </div>
          )}
          <span className="text-white/60">
            <span className="text-white font-semibold">{teacher?.first_name} {teacher?.last_name}</span>
            {isLive ? ' is live — join now!' : ` will start this session in ${timeLeft}`}
          </span>
          {!isJitsi && (
            <span className="ml-auto text-white/30 text-xs">Will open in new tab</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Regular Material Row ─────────────────────────────────────────────────
function MaterialRow({ material }: { material: Material }) {
  const [expanded, setExpanded] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const prevBlob = useRef<string | null>(null);

  const isPdf = material.type === 'pdf' || material.type === 'file';
  const isVideo = material.type === 'video';
  const isLink = material.type === 'link';

  function getVideoEmbedUrl(url: string): string | null {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/) || url.match(/v=([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    const vmMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
    return null;
  }

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && isPdf && !pdfBlobUrl) {
      setPdfLoading(true);
      fetch(material.url)
        .then(r => r.blob())
        .then(blob => {
          if (prevBlob.current) URL.revokeObjectURL(prevBlob.current);
          const url = URL.createObjectURL(blob);
          prevBlob.current = url;
          setPdfBlobUrl(url);
        })
        .catch(console.error)
        .finally(() => setPdfLoading(false));
    }
  };

  const icon = {
    pdf: <FileText size={18} className="text-red-400" />,
    file: <FileText size={18} className="text-red-400" />,
    video: <Video size={18} className="text-purple-400" />,
    link: <ExternalLink size={18} className="text-blue-400" />,
  }[material.type] ?? <FileText size={18} className="text-white/60" />;

  const videoEmbed = isVideo ? getVideoEmbedUrl(material.url) : null;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={handleExpand}>
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">{icon}</div>
        <span className="text-white font-medium flex-1">{material.title}</span>
        <div className="flex items-center gap-2">
          {isPdf && (
            <a href={ensureAbsoluteUrl(material.url)} download target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-colors flex items-center gap-1">
              <Download size={12} /> Download
            </a>
          )}
          {isLink && (
            <a href={ensureAbsoluteUrl(material.url)} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-semibold transition-colors flex items-center gap-1">
              <ExternalLink size={12} /> Open
            </a>
          )}
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1">
            {expanded ? <><ChevronUp size={12} /> Hide</> : <><Play size={12} /> {isPdf ? 'View' : 'Watch'}</>}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
          {isPdf && (
            pdfLoading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-400" size={32} />
              </div>
            ) : pdfBlobUrl ? (
              <iframe src={`${pdfBlobUrl}#toolbar=1`} className="w-full h-[600px] bg-white" title={material.title} />
            ) : null
          )}
          {isVideo && videoEmbed && (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe src={videoEmbed} className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title={material.title} />
            </div>
          )}
          {isVideo && !videoEmbed && (
            <div className="p-6 text-center">
              <p className="text-white/60 mb-3">Cannot embed this video URL directly.</p>
              <a href={ensureAbsoluteUrl(material.url)} target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold inline-flex items-center gap-2">
                <ExternalLink size={16} /> Open Video
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Live Banner ──────────────────────────────────────────────────────────
function LiveBanner({ session, teacher, onJoin }: { session: Material; teacher: any; onJoin: () => void }) {
  const { isLive } = useCountdown(session.scheduled_at || null);
  if (!isLive) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-green-500/50 bg-gradient-to-r from-green-950/80 to-emerald-950/60 shadow-[0_0_60px_rgba(34,197,94,0.2)] p-5 flex items-center gap-5">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
        <Radio size={24} className="text-green-400 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-green-400 font-black text-sm uppercase tracking-widest">🔴 Live Now</p>
        <p className="text-white font-bold text-lg truncate">{session.title}</p>
        <p className="text-white/50 text-sm">
          {teacher?.first_name} {teacher?.last_name} is teaching right now
        </p>
      </div>
      <button
        onClick={onJoin}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-all hover:scale-105 flex items-center gap-2 shrink-0"
      >
        <MonitorPlay size={20} /> Join Now
      </button>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────
export function StudentClassViewPage({ classId, onLogout, onNavigate }: StudentClassViewProps) {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'content' | 'assignments'>('content');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Live session the student joined from the banner
  const [bannerJoinedSession, setBannerJoinedSession] = useState<Material | null>(null);

  useEffect(() => {
    if (!classId) { setError('No class ID provided'); setIsLoading(false); return; }
    fetchClass();
  }, [classId]);

  useEffect(() => {
    if (activeTab === 'assignments' && classId) fetchAssignments();
  }, [activeTab, classId]);

  const fetchAssignments = async () => {
    try {
      const res = await apiClient.get(`/assignments/class/${classId}`);
      setAssignments(res.data);
    } catch (e) { console.error('Failed to grab assignments', e); }
  };

  const handleSubmitAssignment = async (assignId: string) => {
    if (!submitFile) return alert('Please select a file to submit!');
    setSubmittingId(assignId);
    try {
      const formData = new FormData();
      formData.append('file', submitFile);
      await apiClient.post(`/assignments/${assignId}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitFile(null);
      alert('Homework submitted successfully!');
      fetchAssignments();
    } catch (e: any) {
      alert('Failed to submit assignment: ' + (e.response?.data?.error || e.message));
    } finally {
      setSubmittingId(null);
    }
  };

  const fetchClass = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/classes/${classId}/student-view`);
      setClassData(res.data);
      const ids = new Set<string>((res.data.sections || []).map((s: Section) => s.id));
      setExpandedSections(ids);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You are not enrolled in this class. Please purchase and enroll first.');
      } else {
        setError(err.response?.data?.error || 'Failed to load class content');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Collect all live materials to determine if anything is live now
  const allLiveMaterials: Material[] = (classData?.sections || []).flatMap(s =>
    (s.class_materials || []).filter(m => m.type === 'live' && m.scheduled_at)
  );

  const liveSessions = allLiveMaterials.filter(m => {
    const now = Date.now();
    const start = new Date(m.scheduled_at!).getTime();
    const end = start + 3 * 60 * 60 * 1000;
    return now >= start && now <= end;
  });

  const currentLiveSession = liveSessions[0] || null;

  const totalMaterials = (classData?.sections || []).reduce((sum, s) => sum + (s.class_materials?.length || 0), 0);

  if (isLoading) return (
    <DashboardLayout userRole="student" notificationCount={0}
      breadcrumb="Loading..." activePage="classes" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/60">Loading class content...</p>
        </div>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout userRole="student" notificationCount={0}
      breadcrumb="Access Denied" activePage="classes" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="min-h-[500px] flex items-center justify-center">
        <GlassCard className="p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-3">Access Restricted</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate?.('classes')} className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold">My Classes</button>
            <button onClick={() => onNavigate?.('purchase')} className="flex-1 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold">Browse Courses</button>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );

  if (!classData) return null;
  const teacher = classData.profiles;

  return (
    <DashboardLayout userRole="student" notificationCount={0}
      breadcrumb={classData.title} activePage="classes" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">

        {/* Back + Title */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <button onClick={() => onNavigate?.('classes')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to My Classes
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{classData.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-sm flex-wrap">
              <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-cyan-400" /> {classData.subject}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-cyan-400" /> {classData.schedule}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {teacher.profile_photo
                  ? <img src={teacher.profile_photo} alt="" className="w-full h-full object-cover" />
                  : `${teacher.first_name[0]}${teacher.last_name[0]}`}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{teacher.first_name} {teacher.last_name}</p>
                <p className="text-white/50 text-xs">{teacher.subject || 'Instructor'}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate?.('chat', { id: teacher.id, first_name: teacher.first_name, last_name: teacher.last_name, profile_photo: teacher.profile_photo, subject: teacher.subject })}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-105"
            >
              <MessageCircle size={18} /> Message Teacher
            </button>
          </div>
        </div>

        {/* 🔴 LIVE NOW Banner — shown when any session is currently live */}
        {currentLiveSession && !bannerJoinedSession && (
          <LiveBanner
            session={currentLiveSession}
            teacher={teacher}
            onJoin={() => {
              if (currentLiveSession.url.includes('meet.jit.si')) {
                setBannerJoinedSession(currentLiveSession);
              } else {
                window.open(ensureAbsoluteUrl(currentLiveSession.url), '_blank');
              }
            }}
          />
        )}

        {/* Banner Jitsi fullscreen viewer */}
        {bannerJoinedSession && (
          <div className="rounded-2xl overflow-hidden border border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.15)] my-6">
            <JitsiEmbed
              roomUrl={bannerJoinedSession.url}
              title={bannerJoinedSession.title}
              userName="Student"
              role="student"
              classId={classId}
              onClose={() => setBannerJoinedSession(null)}
            />
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sections', value: classData.sections.length, color: 'text-cyan-400' },
            { label: 'Materials', value: totalMaterials, color: 'text-purple-400' },
            { label: 'Mode', value: classData.mode, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <GlassCard key={label} className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-white/60 text-sm">{label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/10 pb-2">
          <button onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'content' ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}>
            <BookOpen size={18} /> Course Content
          </button>
          <button onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'assignments' ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}>
            <ClipboardList size={18} /> Assignments
          </button>
        </div>

        {/* ── Content Tab ── */}
        {activeTab === 'content' && (
          <>
            {classData.description && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-white mb-3">About this Class</h2>
                <p className="text-white/70 leading-relaxed">{classData.description}</p>
              </GlassCard>
            )}

            {classData.sections.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-white mb-2">No Content Yet</h3>
                <p className="text-white/60">Your teacher hasn't uploaded materials yet. Check back soon!</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Course Content</h2>
                {classData.sections.map((section) => {
                  const isOpen = expandedSections.has(section.id);
                  return (
                    <GlassCard key={section.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center">
                            <BookOpen size={16} className="text-cyan-400" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-white font-semibold">{section.title}</h3>
                            <p className="text-white/50 text-xs">{section.class_materials?.length || 0} materials</p>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={20} className="text-white/60" /> : <ChevronDown size={20} className="text-white/60" />}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                          {!section.class_materials?.length ? (
                            <p className="text-white/40 text-sm text-center py-4">No materials in this section yet</p>
                          ) : (
                            section.class_materials
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((material) =>
                                material.type === 'live' ? (
                                  <LiveMaterialRow key={material.id} material={material} teacher={teacher} classId={classId} />
                                ) : (
                                  <MaterialRow key={material.id} material={material} />
                                )
                              )
                          )}
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Assignments Tab ── */}
        {activeTab === 'assignments' && (
          <div className="max-w-4xl space-y-6">
            {assignments.length === 0 ? (
              <GlassCard className="p-12 text-center text-white/40 border-dashed border-white/10">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p>No assignments published yet.</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {assignments.map((a: any) => {
                  const mySub = a.submissions && a.submissions[0];
                  const hasSubmitted = !!mySub;
                  return (
                    <GlassCard key={a.id} className={`p-6 border-l-4 transition-all ${hasSubmitted ? 'border-l-green-500 bg-green-500/5' : 'border-l-cyan-500 hover:bg-white/5'}`}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{a.title}</h3>
                          <p className="text-white/60 text-sm mb-4 leading-relaxed">{a.description}</p>
                          <div className="flex flex-wrap gap-3">
                            <span className={`px-3 py-1 rounded border text-xs font-bold ${new Date() > new Date(a.deadline) && !hasSubmitted ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-white/5 border-white/10 text-white/70'}`}>
                              Due: {new Date(a.deadline).toLocaleString()}
                            </span>
                            {a.attachment_url && (
                              <a href={a.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-bold">
                                <Download size={14} /> Download Instructions
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                          {hasSubmitted ? (
                            <div className="text-center">
                              {a.submissions?.[0]?.status === 'Graded' ? (
                                <div className="space-y-2">
                                  <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto"><Award size={24} /></div>
                                  <p className="text-white font-bold text-lg">Grade: {a.submissions[0].grade}</p>
                                  {a.submissions[0].feedback && <p className="text-white/40 text-[10px] italic line-clamp-2 px-2">"{a.submissions[0].feedback}"</p>}
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">Completed</span>
                                </div>
                              ) : (
                                <>
                                  <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2"><FileText size={20} /></div>
                                  <p className="text-green-400 font-bold text-sm">Submitted Successfully</p>
                                  <p className="text-green-400/60 text-xs mt-1">Pending Teacher Review</p>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-white/50 text-xs text-center font-semibold">Upload Homework</p>
                              {submittingId !== a.id && (!submitFile || submittingId !== a.id) ? (
                                <div onClick={() => { setSubmittingId(a.id); fileInputRef.current?.click(); }}
                                  className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all">
                                  <Upload size={20} className="mx-auto text-white/30 mb-2" />
                                  <p className="text-xs text-white/50 font-medium">Click to attach file</p>
                                </div>
                              ) : null}
                              {submitFile && submittingId === a.id && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                  <p className="text-cyan-400 text-xs truncate max-w-full font-medium flex items-center gap-2"><FileText size={14} /> {submitFile.name}</p>
                                  <div className="flex gap-2 mt-3">
                                    <button onClick={() => { setSubmitFile(null); setSubmittingId(null); }} className="flex-1 py-1.5 text-xs text-white/50 hover:text-white rounded-lg bg-black/20 font-medium">Cancel</button>
                                    <button onClick={() => handleSubmitAssignment(a.id)} className="flex-1 py-1.5 text-xs text-white bg-cyan-500 hover:bg-cyan-400 rounded-lg font-bold shadow-[0_0_10px_rgba(34,211,238,0.4)]">Submit HW</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
            <input type="file" className="hidden" ref={fileInputRef} onChange={e => { if (e.target.files?.[0]) setSubmitFile(e.target.files[0]); }} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
