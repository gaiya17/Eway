import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Trash2,
  BookOpen,
  Calendar,
  Radio,
  Download,
  Upload,
  Eye,
  PlusCircle,
  X,
  Play,
  MonitorPlay,
  ExternalLink,
  Loader2,
  Users,
  ClipboardList,
  DollarSign,
  AlertCircle,
  Award
} from 'lucide-react';

const OL_SUBJECTS = [
  "Mathematics", "English", "Science", "Sinhala", "History", "Religion",
  "Business & Accounting Studies", "Commerce", "Geography", "Civic Education", "Entrepreneurship Studies", "Second Language (Sinhala)", "Second Language (Tamil)",
  "Music", "Art", "Dance", "Sinhala Literary", "English Literary", "Drama",
  "ICT", "Agriculture", "Health", "Communication"
];

const AL_STREAMS: Record<string, string[]> = {
  "Science": ["Biology", "Physics", "Chemistry", "Combined Mathematics", "Agriculture", "ICT (Information & Communication Technology)"],
  "Commerce": ["Accounting", "Business Studies", "Economics", "ICT"],
  "Arts": ["History", "Political Science", "Geography", "Logic", "Sinhala / Tamil / English Literature", "Media Studies", "Art"],
  "Technology": ["SFT", "ET / BST", "Agriculture", "ICT", "Geography", "Economics", "Business studies", "Accounting", "Home economics", "Communication and media studies", "Arts", "English", "Maths"]
};

interface Material {
  id: string;
  section_id: string;
  title: string;
  type: 'pdf' | 'video' | 'live';
  url: string;
  order_index: number;
}

interface Section {
  id: string;
  class_id: string;
  title: string;
  date?: string;
  order_index: number;
  class_materials: Material[];
}

interface ClassDetail {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: string;
  price: number;
  mode: 'Online' | 'Physical';
  thumbnail_url: string;
  start_date: string;
  duration: string;
  sections: Section[];
}

interface TeacherClassViewPageProps {
  classId: string;
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

// ─── Helper: extract YouTube/Vimeo embed URL ───────────────────────────────
function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/) ||
    url.match(/v=([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;

  // Vimeo
  const vimMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimMatch) return `https://player.vimeo.com/video/${vimMatch[1]}`;

  // If already an embed URL, use directly
  if (url.includes('/embed/') || url.includes('player.vimeo')) return url;

  return null;
}

// ─── Helper: get live class embed URL ─────────────────────────────────────
function getLiveEmbedUrl(url: string): string | null {
  // Google Meet — no embeddable iframe, just returns the URL for an external link
  if (url.includes('meet.google.com')) return null; // Google Meet blocks embedding
  // Zoom (embedded via Zoom SDK) — not directly embeddable either — return null to show external link
  if (url.includes('zoom.us')) return null;
  // BigBlueButton, Jitsi, etc — attempt direct embed
  if (url.includes('jitsi') || url.includes('bbb') || url.includes('bigbluebutton')) return url;
  return null;
}

// ─── Inline Video Player ──────────────────────────────────────────────────
function VideoPlayer({ url, title }: { url: string; title: string }) {
  const embedUrl = getVideoEmbedUrl(url);
  if (!embedUrl) {
    return (
      <div className="rounded-xl bg-black/30 border border-white/10 p-6 text-center">
        <Video size={32} className="text-red-400 mx-auto mb-2" />
        <p className="text-white/60 text-sm">Cannot embed this video.</p>
        <a href={url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:underline text-sm mt-2">
          <ExternalLink size={14} /> Open in new tab
        </a>
      </div>
    );
  }
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// ─── Live Class Viewer ────────────────────────────────────────────────────
function LiveClassViewer({ url, title }: { url: string; title: string }) {
  const embedUrl = getLiveEmbedUrl(url);
  if (!embedUrl) {
    // For Google Meet / Zoom — show a "Join Now" prominent button
    const isGoogleMeet = url.includes('meet.google.com');
    const isZoom = url.includes('zoom.us');
    const platform = isGoogleMeet ? 'Google Meet' : isZoom ? 'Zoom' : 'Live Class';
    return (
      <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/20 p-6 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <Radio size={28} className="text-green-400" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">{title}</p>
          <p className="text-white/50 text-sm mt-1">{platform} — opens in your browser</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-[0_0_24px_rgba(34,197,94,0.5)] transition-all flex items-center gap-2"
        >
          <MonitorPlay size={20} /> Join Live Class
        </a>
      </div>
    );
  }
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="camera; microphone; fullscreen; display-capture"
        allowFullScreen
      />
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────────────────
function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="rounded-xl bg-black/20 border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-cyan-400" />
          <span className="text-white text-sm font-medium truncate max-w-xs">{title}</span>
        </div>
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/30 transition-colors"
        >
          <Download size={14} /> Download
        </a>
      </div>
      <div className="w-full" style={{ height: '500px' }}>
        <iframe
          src={`${url}#toolbar=1&navpanes=1`}
          title={title}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}

export function TeacherClassViewPage({
  classId,
  onLogout,
  onNavigate,
}: TeacherClassViewPageProps) {
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedMaterials, setExpandedMaterials] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'assignments'>('content');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'students' && !analyticsData && classId) {
       fetchAnalytics();
    }
  }, [activeTab, classId]);

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get(`/classes/${classId}/analytics`);
      setAnalyticsData(res.data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  };

  // Add section
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDate, setNewSectionDate] = useState('');

  // Add material modal
  const [addMaterialSection, setAddMaterialSection] = useState<string | null>(null);
  const [matType, setMatType] = useState<'pdf' | 'video' | 'live'>('pdf');
  const [matTitle, setMatTitle] = useState('');
  const [matUrl, setMatUrl] = useState('');
  const [matScheduledAt, setMatScheduledAt] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit Class Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    subject: '',
    price: '',
    mode: 'Online' as 'Online' | 'Physical',
    thumbnail_url: '',
    start_date: '',
    duration: '',
  });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isPublishingAssignment, setIsPublishingAssignment] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignFile, setAssignFile] = useState<File | null>(null);

  const assignFileRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grading State
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    if (classId) fetchClassDetails();
  }, [classId]);

  useEffect(() => {
    if (activeTab === 'assignments' && classId) {
      fetchAssignments();
    }
  }, [activeTab, classId]);

  const fetchAssignments = async () => {
    try {
      const res = await apiClient.get(`/assignments/class/${classId}`);
      setAssignments(res.data);
    } catch (e) { console.error('Failed to grab assignments', e); }
  };

  const handlePublishAssignment = async () => {
    if (!assignTitle.trim() || !assignDeadline) return alert("Title and Deadline required!");
    setIsPublishingAssignment(true);
    try {
      const formData = new FormData();
      formData.append('class_id', classId);
      formData.append('title', assignTitle);
      formData.append('description', assignDesc);
      formData.append('deadline', new Date(assignDeadline).toISOString());
      if (assignFile) formData.append('file', assignFile);

      await apiClient.post('/assignments/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowAddAssignment(false);
      setAssignTitle('');
      setAssignDesc('');
      setAssignDeadline('');
      setAssignFile(null);
      fetchAssignments();
    } catch (e: any) {
      alert("Failed to publish assignment: " + (e.response?.data?.error || e.message));
    } finally {
      setIsPublishingAssignment(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!gradingSubmission || !gradeValue.trim()) return alert("Grade is required!");
    setIsGrading(true);
    try {
       await apiClient.patch(`/assignments/submissions/${gradingSubmission.id}/grade`, {
          grade: gradeValue,
          feedback: feedbackValue
       });
       alert("Grade submitted successfully!");
       setGradingSubmission(null);
       setGradeValue('');
       setFeedbackValue('');
       fetchAssignments(); // Refresh to show updated status
    } catch (e: any) {
       alert("Failed to submit grade: " + (e.response?.data?.error || e.message));
    } finally {
       setIsGrading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Delete assignment permanently?")) return;
    try {
      await apiClient.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (e) { console.error(e); }
  };

const fetchClassDetails = async () => {
    try {
      const response = await apiClient.get(`/classes/${classId}`);
      const data = response.data;
      setClassData(data);
      setEditFormData({
        title: data.title || '',
        description: data.description || '',
        subject: data.subject || '',
        price: data.price ? data.price.toString() : '',
        mode: data.mode || 'Online',
        thumbnail_url: data.thumbnail_url || '',
        start_date: data.start_date || '',
        duration: data.duration || '',
      });
      if (data.sections?.length > 0 && expandedSections.length === 0) {
        setExpandedSections([data.sections[0].id]);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLevel = (l: 'OL' | 'AL') => {
    // Basic implementation since we're editing an existing subject
    // If you need more complex logic, we can add it later.
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await apiClient.patch(`/classes/${classId}`, {
        ...editFormData,
        price: parseFloat(editFormData.price) || 0,
      });
      setShowEditModal(false);
      fetchClassDetails();
      alert('Class updated successfully!');
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Failed to update class.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!confirm('Are you absolutely sure you want to delete this class? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/classes/${classId}`);
      alert('Class deleted successfully!');
      onNavigate?.('teacher-classes');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class.');
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (id: string) =>
    setExpandedSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleMaterial = (id: string) =>
    setExpandedMaterials(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    const title = newSectionDate
      ? `${newSectionDate} — ${newSectionTitle}`
      : newSectionTitle;
    try {
      await apiClient.post(`/classes/${classId}/sections`, { title });
      setNewSectionTitle('');
      setNewSectionDate('');
      setShowAddSection(false);
      fetchClassDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section? All materials inside will be removed.')) return;
    try {
      await apiClient.delete(`/classes/sections/${sectionId}`);
      fetchClassDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await apiClient.delete(`/classes/materials/${materialId}`);
      fetchClassDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMaterial = async () => {
    if (!matTitle.trim() || !addMaterialSection) return;

    let finalUrl = matUrl.trim();

    // For PDF type — upload the file first
    if (matType === 'pdf' && pdfFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', pdfFile);
        const resp = await apiClient.post('/classes/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e: any) => {
            if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        });
        finalUrl = resp.data.url;
      } catch (e: any) {
        alert('Upload failed: ' + (e?.response?.data?.error || e.message));
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }

    if (!finalUrl) {
      alert('Please provide a URL or upload a PDF file.');
      return;
    }

    try {
      await apiClient.post(`/classes/sections/${addMaterialSection}/materials`, {
        title: matTitle,
        type: matType,
        url: finalUrl,
        scheduled_at: matType === 'live' ? matScheduledAt : null
      });
      setMatTitle('');
      setMatUrl('');
      setMatScheduledAt('');
      setMatType('pdf');
      setPdfFile(null);
      setAddMaterialSection(null);
      fetchClassDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={18} className="text-red-400" />;
      case 'live': return <Radio size={18} className="text-green-400" />;
      default: return <FileText size={18} className="text-cyan-400" />;
    }
  };

  const getMaterialLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video Lecture';
      case 'live': return 'Live Class Link';
      default: return 'PDF Document';
    }
  };

  const getMaterialBadgeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="teacher" breadcrumb="Manage Class" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!classData) {
    return (
      <DashboardLayout userRole="teacher" breadcrumb="Manage Class" onNavigate={onNavigate} onLogout={onLogout}>
        <GlassCard className="p-12 text-center">
          <p className="text-white/60">Class not found. Please go back and try again.</p>
          <button onClick={() => onNavigate?.('teacher-classes')} className="mt-4 px-6 py-2 rounded-xl bg-blue-500 text-white">Back to My Classes</button>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="teacher"
      userName="Teacher"
      userInitials="TR"
      breadcrumb={classData.title}
      activePage="teacher-classes"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* ── Header ── */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate?.('teacher-classes')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to My Classes</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{classData.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
              <span className="flex items-center gap-1"><BookOpen size={15} /> {classData.subject}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                classData.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                classData.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>{classData.status.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ClipboardList size={18} className="text-cyan-400" />
              Edit Class Details
            </button>
            <button
              onClick={handleDeleteClass}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete Class
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-6 border-b border-white/10 mb-8">
        <button 
          onClick={() => setActiveTab('content')} 
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'content' ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}
        >
          <BookOpen size={18} /> Course Structure
        </button>
        <button 
          onClick={() => setActiveTab('students')} 
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'students' ? 'text-cyan-400 border-cyan-400' : 'text-white/50 border-transparent hover:text-white/80'}`}
        >
          <Users size={18} /> Student Roster
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
      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { icon: <FileText size={14} />, label: 'PDF Document', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
          { icon: <Video size={14} />, label: 'Video Lecture (embedded)', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
          { icon: <Radio size={14} />, label: 'Live Class Link', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
        ].map((item) => (
          <div key={item.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${item.cls}`}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>

      {/* ── Sections List ── */}
      <div className="max-w-4xl space-y-4">
        {classData.sections?.map((section) => (
          <div key={section.id}>
            <GlassCard className={`border-l-4 overflow-hidden transition-all duration-300 ${
              expandedSections.includes(section.id) ? 'border-l-cyan-500' : 'border-l-white/10'
            }`}>
              {/* Section Header */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-cyan-400 transition-all">
                    {expandedSections.includes(section.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{section.title}</h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {section.class_materials?.length || 0} item{(section.class_materials?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setAddMaterialSection(section.id); }}
                    className="p-2 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Add content"
                  >
                    <PlusCircle size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Delete section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Section Materials */}
              {expandedSections.includes(section.id) && (
                <div className="border-t border-white/5 bg-black/10">
                  {(!section.class_materials || section.class_materials.length === 0) ? (
                    <div className="p-8 text-center text-white/30 text-sm italic">
                      No materials added yet. Click + to add content.
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {section.class_materials.map((material) => (
                        <div key={material.id} className="rounded-xl bg-white/3 hover:bg-white/5 transition-colors overflow-hidden">
                          {/* Material Row Header */}
                          <div className="flex items-center p-3 gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                              {getMaterialIcon(material.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{material.title}</p>
                              <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMaterialBadgeColor(material.type)}`}>
                                {getMaterialLabel(material.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => toggleMaterial(material.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  expandedMaterials.includes(material.id)
                                    ? 'bg-white/10 text-white'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {expandedMaterials.includes(material.id) ? (
                                  <><ChevronUp size={12} /> Hide</>
                                ) : (
                                  material.type === 'pdf'
                                    ? <><Eye size={12} /> View</>
                                    : material.type === 'video'
                                    ? <><Play size={12} /> Watch</>
                                    : <><MonitorPlay size={12} /> Join</>
                                )}
                              </button>
                              {material.type === 'pdf' && (
                                <a
                                  href={material.url}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-white/40 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
                                  title="Download PDF"
                                >
                                  <Download size={15} />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="p-1.5 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Inline Content Viewer */}
                          {expandedMaterials.includes(material.id) && (
                            <div className="px-3 pb-3">
                              {material.type === 'pdf' && (
                                <PdfViewer url={material.url} title={material.title} />
                              )}
                              {material.type === 'video' && (
                                <VideoPlayer url={material.url} title={material.title} />
                              )}
                              {material.type === 'live' && (
                                <LiveClassViewer url={material.url} title={material.title} />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add content button at the bottom of expanded section */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => setAddMaterialSection(section.id)}
                      className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/40 text-sm font-medium hover:bg-white/5 hover:border-cyan-500/40 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add Content to This Section
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        ))}

        {/* ── Add Section ── */}
        {showAddSection ? (
          <GlassCard className="p-5 border-dashed border-cyan-500/40">
            <p className="text-white/60 text-sm font-medium mb-4">New Section</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-cyan-400 flex-shrink-0" />
                <input
                  type="date"
                  value={newSectionDate}
                  onChange={(e) => setNewSectionDate(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-500/60 transition-all text-sm"
                />
              </div>
              <div className="flex gap-3">
                <input
                  autoFocus
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                  placeholder="Section title (e.g. Week 1: Introduction)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-500/60 transition-all text-sm"
                />
                <button
                  onClick={handleCreateSection}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-bold hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all text-sm"
                >
                  Create
                </button>
                <button onClick={() => setShowAddSection(false)} className="p-2.5 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
          </GlassCard>
        ) : (
          <button
            onClick={() => setShowAddSection(true)}
            className="w-full py-7 rounded-2xl border-2 border-dashed border-white/10 text-white/40 font-bold hover:bg-white/5 hover:border-cyan-500/30 hover:text-cyan-400 transition-all flex flex-col items-center gap-2"
          >
            <PlusCircle size={32} />
            <span>Add New Section</span>
          </button>
        )}
      </div>
      </>
      )}

      {/* ── Student Analytics Data ── */}
      {activeTab === 'students' && (
        <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-4">
          {!analyticsData ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>
          ) : (
            <>
              {/* Stats Card */}
              <GlassCard className="p-6 border-l-4 border-l-cyan-500">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                    <Users size={28} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">{analyticsData.total_students}</h3>
                    <p className="text-white/50 text-sm font-medium uppercase tracking-wider">Total Enrolled Students</p>
                  </div>
                </div>
              </GlassCard>

              {/* Roster Table */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Student Roster</h3>
                {analyticsData.roster.length === 0 ? (
                  <div className="text-center py-8 text-white/40">No students enrolled yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Student</th>
                          <th className="pb-3 px-4">Contact</th>
                          <th className="pb-3 px-4 text-center">Enrollment Date</th>
                          <th className="pb-3 px-4 text-center">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {analyticsData.roster.map((student: any) => (
                          <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                {student.profile_photo ? (
                                  <img src={student.profile_photo} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                  </div>
                                )}
                                <div>
                                  <p className="text-white font-semibold">{student.first_name} {student.last_name}</p>
                                  <p className="text-white/40 text-xs">{student.student_id_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white/70">{student.email}</td>
                            <td className="py-4 px-4 text-center text-white/70">{new Date(student.enrolled_at).toLocaleDateString()}</td>
                            <td className="py-4 px-4 text-center">
                              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg text-xs font-bold">
                                {student.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </>
          )}
        </div>
      )}

      {/* ── Assignments Tab ── */}
      {activeTab === 'assignments' && (
        <div className="max-w-4xl space-y-6">
           <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <h3 className="text-white font-bold">Class Assignments</h3>
                <p className="text-white/50 text-sm">Assign work and receive submissions</p>
              </div>
              <button onClick={() => setShowAddAssignment(!showAddAssignment)} className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                 <Plus size={16} /> New Assignment
              </button>
           </div>

           {showAddAssignment && (
             <GlassCard className="p-6 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
               <h4 className="text-cyan-400 font-bold mb-4 flex items-center gap-2"><ClipboardList size={20}/> Publish New Assignment</h4>
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-white/60 text-xs mb-1 block">Title</label>
                      <input value={assignTitle} onChange={e => setAssignTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" placeholder="e.g. Chapter 3 Review Questions"/>
                   </div>
                   <div>
                      <label className="text-white/60 text-xs mb-1 block">Deadline</label>
                      <input type="datetime-local" value={assignDeadline} onChange={e => setAssignDeadline(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm"/>
                   </div>
                 </div>
                 <div>
                    <label className="text-white/60 text-xs mb-1 block">Instructions / Description</label>
                    <textarea value={assignDesc} onChange={e => setAssignDesc(e.target.value)} rows={3} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" placeholder="Any specific requirements..."></textarea>
                 </div>
                 <div>
                    <label className="text-white/60 text-xs mb-1 block">Attachment (Optional)</label>
                     <div onClick={() => assignFileRef.current?.click()} className="w-full border-2 border-dashed border-white/10 rounded-lg p-4 cursor-pointer text-center hover:bg-white/5 transition-all">
                        {assignFile ? <p className="text-cyan-400 text-sm">{assignFile.name}</p> : <p className="text-white/50 text-sm">Click to upload document/PDF</p>}
                     </div>
                     <input ref={assignFileRef} type="file" className="hidden" onChange={e => setAssignFile(e.target.files?.[0] || null)} />
                 </div>
                 <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => setShowAddAssignment(false)} className="px-5 py-2 text-white/50 hover:text-white">Cancel</button>
                    <button onClick={handlePublishAssignment} disabled={isPublishingAssignment} className="bg-cyan-500 text-white font-bold px-6 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] disabled:opacity-50">
                      {isPublishingAssignment ? 'Publishing...' : 'Publish to Students'}
                    </button>
                 </div>
               </div>
             </GlassCard>
           )}

           {assignments.length === 0 ? (
             <GlassCard className="p-12 text-center text-white/40 border-dashed border-white/10">
               <ClipboardList size={40} className="mx-auto mb-3 opacity-30"/>
               <p>No assignments published yet.</p>
             </GlassCard>
           ) : (
             <div className="space-y-4">
               {assignments.map(a => (
                  <div key={a.id} className="space-y-4">
                    <GlassCard className="p-6 gap-6 hover:bg-white/5 transition-all border border-white/10 group">
                       <div className="flex-1">
                         <div className="flex items-start justify-between">
                            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{a.title}</h4>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="text-red-400/40 hover:text-red-400 p-2 transition-all hover:bg-red-500/10 rounded-lg"><Trash2 size={18}/></button>
                         </div>
                         <p className="text-white/60 text-sm mb-4 leading-relaxed max-w-2xl">{a.description}</p>
                         <div className="flex flex-wrap gap-4 text-xs font-bold">
                            <span className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/20 flex items-center gap-2 shadow-sm"><Calendar size={14}/> Due: {new Date(a.deadline).toLocaleString()}</span>
                            {a.attachment_url && (
                              <a href={a.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-all shadow-sm">
                                <Download size={14}/> <span>Reference Material</span>
                              </a>
                            )}
                            <span className="text-white/40 flex items-center gap-2 px-1"><Users size={14}/> {a.submissions?.length || 0} Submissions</span>
                         </div>
                       </div>
                    </GlassCard>

                    {a.submissions && a.submissions.length > 0 && (
                      <div className="ml-4 md:ml-12 mt-2 space-y-4">
                         <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-[0.3em] px-2 mb-6">
                           <div className="w-8 h-px bg-white/10" />
                           <Users size={12}/> Student Submissions
                           <div className="flex-1 h-px bg-white/10" />
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {a.submissions.map((sub: any) => (
                              <GlassCard key={sub.id} className="p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group/sub relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/[0.03] to-transparent pointer-events-none" />
                                 <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                       <div className="relative">
                                          <img src={sub.profiles?.profile_photo || 'https://via.placeholder.com/44'} className="w-11 h-11 rounded-full object-cover border-2 border-white/10 shadow-2xl group-hover/sub:border-cyan-500/30 transition-all"/>
                                          <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-[#0B0F1A] flex items-center justify-center ${sub.status === 'Graded' ? 'bg-cyan-500' : 'bg-green-500 animate-pulse'}`}>
                                             {sub.status === 'Graded' ? <Award size={10} className="text-white"/> : <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                                          </div>
                                       </div>
                                       <div className="overflow-hidden">
                                          <p className="text-white font-bold text-sm tracking-tight truncate max-w-[140px]">{sub.profiles?.first_name} {sub.profiles?.last_name}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                             <span className={`text-[10px] font-black uppercase tracking-widest ${sub.status === 'Late' ? 'text-red-400' : (sub.status === 'Graded' ? 'text-cyan-400' : 'text-green-400')}`}>{sub.status}</span>
                                             <span className="text-white/20 text-xs">•</span>
                                             <span className="text-white/30 text-[10px] font-bold">{new Date(sub.created_at).toLocaleDateString()}</span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                       <a href={sub.file_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-cyan-400 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
                                         <ExternalLink size={20}/>
                                       </a>
                                       <button onClick={() => setGradingSubmission(sub)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border border-transparent ${sub.status === 'Graded' ? 'bg-white/5 text-white/40 hover:text-white border-white/10' : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] shadow-lg'}`}>
                                         <Award size={20}/>
                                       </button>
                                    </div>
                                 </div>
                                 {sub.status === 'Graded' && (
                                    <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
                                       <div className="flex items-center justify-between mb-3">
                                          <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.1em]">Result</span>
                                          <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                                             <Award size={12} className="text-cyan-400"/>
                                             <span className="text-xs text-white font-black">{sub.grade}</span>
                                          </div>
                                       </div>
                                       {sub.feedback && (
                                          <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                                             <p className="text-[11px] text-white/50 italic leading-relaxed line-clamp-2">"{sub.feedback}"</p>
                                          </div>
                                       )}
                                    </div>
                                 )}
                              </GlassCard>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {/* ══════════════════════════════════════
          ADD MATERIAL MODAL
      ══════════════════════════════════════ */}
      {addMaterialSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isUploading && setAddMaterialSection(null)} />
          <GlassCard className="relative w-full max-w-lg p-8 border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="text-cyan-400" size={22} />
                Add Learning Content
              </h2>
              {!isUploading && (
                <button onClick={() => setAddMaterialSection(null)} className="text-white/40 hover:text-white transition-colors">
                  <X size={22} />
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Type Selector */}
              <div>
                <label className="text-white/60 text-sm font-medium mb-2 block">Content Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'pdf', icon: <FileText size={20} />, label: 'PDF', desc: 'Downloadable', color: 'cyan' },
                    { value: 'video', icon: <Video size={20} />, label: 'Video', desc: 'Embedded', color: 'red' },
                    { value: 'live', icon: <Radio size={20} />, label: 'Live Class', desc: 'Link', color: 'green' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setMatType(t.value as any); setMatUrl(''); setPdfFile(null); }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                        matType === t.value
                          ? t.color === 'cyan' ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400'
                          : t.color === 'red' ? 'border-red-500 bg-red-500/15 text-red-400'
                          : 'border-green-500 bg-green-500/15 text-green-400'
                          : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                      }`}
                    >
                      {t.icon}
                      <span className="text-sm font-bold">{t.label}</span>
                      <span className="text-[10px] opacity-70">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-white/60 text-sm font-medium mb-1 block">Title</label>
                <input
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder={
                    matType === 'pdf' ? 'e.g. Session 1 Notes' :
                    matType === 'video' ? 'e.g. Lecture 1: Introduction' :
                    'e.g. Live Class - Week 3'
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/60 transition-all text-sm"
                />
              </div>

              {/* PDF — file upload OR URL */}
              {matType === 'pdf' && (
                <div>
                  <label className="text-white/60 text-sm font-medium mb-1 block">PDF File</label>
                  <div className="space-y-3">
                    {/* File upload box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        pdfFile
                          ? 'border-cyan-500/60 bg-cyan-500/5'
                          : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/3'
                      }`}
                    >
                      {pdfFile ? (
                        <>
                          <FileText size={28} className="text-cyan-400" />
                          <p className="text-white text-sm font-medium text-center">{pdfFile.name}</p>
                          <p className="text-white/40 text-xs">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                            className="text-red-400 text-xs hover:underline"
                          >Remove</button>
                        </>
                      ) : (
                        <>
                          <Upload size={28} className="text-white/30" />
                          <p className="text-white/60 text-sm">Click to upload PDF</p>
                          <p className="text-white/30 text-xs">Max 50 MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) { setPdfFile(e.target.files[0]); setMatUrl(''); } }}
                    />
                    {!pdfFile && (
                      <>
                        <div className="flex items-center gap-2 text-white/30 text-xs">
                          <div className="flex-1 h-px bg-white/10" />
                          <span>or paste URL</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>
                        <input
                          value={matUrl}
                          onChange={(e) => setMatUrl(e.target.value)}
                          placeholder="https://example.com/document.pdf"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/60 transition-all text-sm"
                        />
                      </>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video URL */}
              {matType === 'video' && (
                <div>
                  <label className="text-white/60 text-sm font-medium mb-1 block">YouTube / Vimeo URL</label>
                  <input
                    value={matUrl}
                    onChange={(e) => setMatUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500/60 transition-all text-sm"
                  />
                  {matUrl && getVideoEmbedUrl(matUrl) && (
                    <div className="mt-3 rounded-xl overflow-hidden" style={{ position: 'relative', paddingBottom: '40%' }}>
                      <iframe
                        src={getVideoEmbedUrl(matUrl)!}
                        className="absolute inset-0 w-full h-full rounded-xl"
                        allowFullScreen
                        title="preview"
                      />
                    </div>
                  )}
                  <p className="text-white/30 text-xs mt-2">Supports YouTube and Vimeo. Videos will be embedded in the LMS for students to watch.</p>
                </div>
              )}

              {/* Live Class URL & Scheduled At */}
              {matType === 'live' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm font-medium mb-1 block">Live Class Link</label>
                    <input
                      value={matUrl}
                      onChange={(e) => setMatUrl(e.target.value)}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/60 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm font-medium mb-1 block">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      value={matScheduledAt}
                      onChange={(e) => setMatScheduledAt(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/60 transition-all text-sm [color-scheme:dark]"
                    />
                    <p className="text-white/30 text-xs mt-2">When this live session is set to happen. This will show up in the student's upcoming classes.</p>
                  </div>
                  <p className="text-white/30 text-xs">Google Meet and Zoom links will open in the browser. Jitsi / BigBlueButton links will be embedded directly in the LMS.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setAddMaterialSection(null)}
                  disabled={isUploading}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  disabled={isUploading || !matTitle.trim() || (matType === 'pdf' ? (!pdfFile && !matUrl) : !matUrl)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
                >
                  {isUploading ? (
                    <><Loader2 size={18} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><Plus size={18} /> Add Content</>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUpdating && setShowEditModal(false)} />
          <GlassCard className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="text-cyan-400" />
                Edit Class Details
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Class Title</label>
                  <input required name="title" value={editFormData.title} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Subject</label>
                  <select name="subject" value={editFormData.subject} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50">
                    <option value="">Select Subject</option>
                    <optgroup label="O/L Subjects" className="bg-[#0B0F1A]">
                      {OL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="A/L Subjects" className="bg-[#0B0F1A]">
                      {Object.values(AL_STREAMS).flat().map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Description</label>
                  <textarea required name="description" value={editFormData.description} onChange={handleEditInputChange} rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-medium flex items-center gap-2"><DollarSign size={14}/> Price (LKR)</label>
                    <input required type="number" name="price" value={editFormData.price} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-medium">Mode</label>
                    <select name="mode" value={editFormData.mode} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50">
                      <option value="Online">Online</option>
                      <option value="Physical">Physical</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium flex items-center gap-2"><Calendar size={14}/> Start Date</label>
                  <input type="date" name="start_date" value={editFormData.start_date} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Thumbnail URL</label>
                  <input name="thumbnail_url" value={editFormData.thumbnail_url} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2">
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {gradingSubmission && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isGrading && setGradingSubmission(null)} />
          <GlassCard className="relative w-full max-w-md p-8 border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="text-cyan-400" size={22} />
                Grade Submission
              </h2>
              <button onClick={() => setGradingSubmission(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
               <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Student</p>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                     <img src={gradingSubmission.profiles?.profile_photo || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full object-cover border border-cyan-500/30"/>
                     <p className="text-white font-bold">{gradingSubmission.profiles?.first_name} {gradingSubmission.profiles?.last_name}</p>
                  </div>
               </div>
               
               <div>
                  <label className="text-white/60 text-sm font-medium mb-2 block">Marks / Grade</label>
                  <input 
                    value={gradeValue} 
                    onChange={e => setGradeValue(e.target.value)} 
                    placeholder="e.g. 85/100 or A+"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all font-bold"
                  />
               </div>

               <div>
                  <label className="text-white/60 text-sm font-medium mb-2 block">Feedback (Optional)</label>
                  <textarea 
                    value={feedbackValue} 
                    onChange={e => setFeedbackValue(e.target.value)} 
                    rows={3} 
                    placeholder="Provide helpful comments for the student..."
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all resize-none text-sm"
                  />
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={() => setGradingSubmission(null)} className="flex-1 py-3 text-white/50 hover:text-white font-semibold flex items-center justify-center gap-2 transition-colors">Cancel</button>
                  <button onClick={handleGradeSubmission} disabled={isGrading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {isGrading ? <Loader2 className="animate-spin" size={20} /> : <><Award size={18}/> Submit Grade</>}
                  </button>
               </div>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
