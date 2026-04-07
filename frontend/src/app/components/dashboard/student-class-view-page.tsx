import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, BookOpen, Calendar, ChevronDown, ChevronUp,
  Download, ExternalLink, FileText, Loader2, MessageCircle,
  MonitorPlay, Play, Radio, Video, ClipboardList, Upload, Award
} from 'lucide-react';

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

function getVideoEmbedUrl(url: string): string | null {
  const ytMatch =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/) ||
    url.match(/v=([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  const vmMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return null;
}

function getLiveEmbedUrl(url: string): string | null {
  if (url.includes('meet.jit.si') || url.includes('bbb.') || url.includes('bigbluebutton')) return url;
  return null;
}

function MaterialRow({ material }: { material: Material }) {
  const [expanded, setExpanded] = useState(false);
  const videoEmbed = material.type === 'video' ? getVideoEmbedUrl(material.url) : null;
  const liveEmbed = material.type === 'live' ? getLiveEmbedUrl(material.url) : null;
  const isPdf = material.type === 'pdf' || material.type === 'file';

  const icon = {
    pdf: <FileText size={18} className="text-red-400" />,
    file: <FileText size={18} className="text-red-400" />,
    video: <Video size={18} className="text-purple-400" />,
    live: <Radio size={18} className="text-green-400 animate-pulse" />,
    link: <ExternalLink size={18} className="text-blue-400" />,
  }[material.type] || <FileText size={18} className="text-white/60" />;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">{icon}</div>
        <span className="text-white font-medium flex-1">{material.title}</span>
        <div className="flex items-center gap-2">
          {isPdf && (
            <a href={material.url} download target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-colors flex items-center gap-1">
              <Download size={12} /> Download
            </a>
          )}
          {material.type === 'live' && !liveEmbed && (
            <a href={material.url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-colors flex items-center gap-1">
              <ExternalLink size={12} /> Join Now
            </a>
          )}
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1">
            {expanded ? <><ChevronUp size={12} /> Hide</> : <><Play size={12} /> {isPdf ? 'View' : material.type === 'live' ? 'Join' : 'Watch'}</>}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
          {isPdf && (
            <iframe src={`${material.url}#view=FitH`} className="w-full h-[600px] bg-white" title={material.title} />
          )}
          {material.type === 'video' && videoEmbed && (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe src={videoEmbed} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={material.title} />
            </div>
          )}
          {material.type === 'video' && !videoEmbed && (
            <div className="p-6 text-center">
              <p className="text-white/60 mb-3">Cannot embed this video URL directly.</p>
              <a href={material.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold inline-flex items-center gap-2">
                <ExternalLink size={16} /> Open Video
              </a>
            </div>
          )}
          {material.type === 'live' && liveEmbed && (
            <iframe src={liveEmbed} className="w-full h-[500px]" allow="camera; microphone; fullscreen; display-capture" title={material.title} />
          )}
          {material.type === 'live' && !liveEmbed && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <MonitorPlay size={32} className="text-green-400" />
              </div>
              <p className="text-white/60 mb-4">Click "Join Now" to enter the live class</p>
              <a href={material.url} target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3">
                <Radio size={20} className="animate-pulse" /> Join Live Class
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
    if (!classId) { setError('No class ID provided'); setIsLoading(false); return; }
    fetchClass();
  }, [classId]);

  useEffect(() => {
    if (activeTab === 'assignments' && classId) {
       fetchAssignments();
    }
  }, [activeTab, classId]);

  const fetchAssignments = async () => {
    try {
      const res = await apiClient.get(`/assignments/class/${classId}`);
      // Only show assignments if teacher has published them
      setAssignments(res.data);
    } catch (e) { console.error('Failed to grab assignments', e); }
  };

  const handleSubmitAssignment = async (assignId: string) => {
    if (!submitFile) return alert("Please select a file to submit!");
    setSubmittingId(assignId);
    try {
       const formData = new FormData();
       formData.append('file', submitFile);
       await apiClient.post(`/assignments/${assignId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
       });
       setSubmitFile(null);
       alert("Homework submitted successfully!");
       fetchAssignments();
    } catch (e: any) {
       alert("Failed to submit assignment: " + (e.response?.data?.error || e.message));
    } finally {
       setSubmittingId(null);
    }
  };

  const fetchClass = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/classes/${classId}/student-view`);
      setClassData(res.data);
      // Expand all sections by default
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
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalMaterials = (classData?.sections || []).reduce(
    (sum, s) => sum + (s.class_materials?.length || 0), 0
  );

  if (isLoading) return (
    <DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
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
    <DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
      breadcrumb="Access Denied" activePage="classes" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="min-h-[500px] flex items-center justify-center">
        <GlassCard className="p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-3">Access Restricted</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate?.('classes')}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold transition-all duration-300">
              My Classes
            </button>
            <button onClick={() => onNavigate?.('purchase')}
              className="flex-1 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300">
              Browse Courses
            </button>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );

  if (!classData) return null;

  const teacher = classData.profiles;

  return (
    <DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
      breadcrumb={classData.title} activePage="classes" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <button onClick={() => onNavigate?.('classes')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to My Classes
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{classData.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-cyan-400" /> {classData.subject}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-400" /> {classData.schedule}
              </span>
            </div>
          </div>
          {/* Teacher + Message */}
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
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105">
              <MessageCircle size={18} /> Message Teacher
            </button>
          </div>
        </div>

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

        {/* ── Tabs ── */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-8 pb-2">
          <button 
            onClick={() => setActiveTab('content')} 
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'content' ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}
          >
            <BookOpen size={18} /> Course Content
          </button>
          <button 
            onClick={() => setActiveTab('assignments')} 
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'assignments' ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}
          >
            <ClipboardList size={18} /> Assignments
          </button>
        </div>

        {activeTab === 'content' && (
        <>
        {/* Description */}
        {classData.description && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-white mb-3">About this Class</h2>
            <p className="text-white/70 leading-relaxed">{classData.description}</p>
          </GlassCard>
        )}

        {/* Sections */}
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
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
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
                          .map((material) => <MaterialRow key={material.id} material={material} />)
                      )}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
        </>)}

        {/* ── Assignments Tab ── */}
        {activeTab === 'assignments' && (
          <div className="max-w-4xl space-y-6">
             {assignments.length === 0 ? (
               <GlassCard className="p-12 text-center text-white/40 border-dashed border-white/10">
                 <ClipboardList size={40} className="mx-auto mb-3 opacity-30"/>
                 <p>No assignments published yet.</p>
               </GlassCard>
             ) : (
               <div className="space-y-4">
                 {assignments.map((a: any) => {
                    const mySub = a.submissions && a.submissions[0]; const hasSubmitted = !!mySub;
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
                                    <a href={a.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-bold transition-all">
                                      <Download size={14}/> Download Instructions
                                    </a>
                                  )}
                               </div>
                            </div>
                            
                            {/* Actions Area */}
                            <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                               {hasSubmitted ? (
                                  <div className="text-center">
                                     {a.submissions?.[0]?.status === 'Graded' ? (
                                       <div className="space-y-2">
                                          <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
                                             <Award size={24}/>
                                          </div>
                                          <p className="text-white font-bold text-lg">Grade: {a.submissions[0].grade}</p>
                                          {a.submissions[0].feedback && <p className="text-white/40 text-[10px] italic line-clamp-2 px-2">"{a.submissions[0].feedback}"</p>}
                                          <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">Completed</span>
                                       </div>
                                     ) : (
                                       <>
                                          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                             <FileText size={20}/>
                                          </div>
                                          <p className="text-green-400 font-bold text-sm">Submitted Successfully</p>
                                          <p className="text-green-400/60 text-xs mt-1">Pending Teacher Review</p>
                                       </>
                                     )}
                                  </div>
                               ) : (
                                  <div className="space-y-3">
                                      <p className="text-white/50 text-xs text-center font-semibold">Upload Homework</p>
                                      {submittingId !== a.id && (!submitFile || submittingId !== a.id)? (
                                          <div onClick={() => { setSubmittingId(a.id); fileInputRef.current?.click(); }} className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all">
                                            <Upload size={20} className="mx-auto text-white/30 mb-2" />
                                            <p className="text-xs text-white/50 font-medium">Click to attach file</p>
                                          </div>
                                      ) : null}
                                      {submitFile && submittingId === a.id && (
                                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                             <p className="text-cyan-400 text-xs truncate max-w-full font-medium flex items-center gap-2"><FileText size={14}/> {submitFile.name}</p>
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
             <input type="file" className="hidden" ref={fileInputRef} onChange={e => { if (e.target.files?.[0]) setSubmitFile(e.target.files[0]) }} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
