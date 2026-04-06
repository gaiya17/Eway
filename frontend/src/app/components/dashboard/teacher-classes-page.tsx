import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { ImageWithFallback } from '../ui/image-with-fallback';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, BookOpen, Users, CheckCircle, Clock, Video, MapPin,
  Calendar, TrendingUp, BarChart3, Plus, X, AlertCircle, DollarSign, FileText, Trash2
} from 'lucide-react';

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

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ScheduleSlot {
  day: string;
  start_time: string;
  end_time: string;
}

interface ClassItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  thumbnail_url: string;
  price: number;
  start_date: string;
  schedules: ScheduleSlot[];
  duration: string;
  mode: 'Online' | 'Physical';
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  schedule?: string; // fallback for legacy
}

interface TeacherClassesPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function TeacherClassesPage({
  onLogout,
  onNavigate,
}: TeacherClassesPageProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Advanced Form State
  const [level, setLevel] = useState<'OL' | 'AL'>('OL');
  const [stream, setStream] = useState<keyof typeof AL_STREAMS>('Science');
  const [conflictState, setConflictState] = useState<{ conflict: boolean; type?: 'BLOCK'|'WARNING'; message?: string; rawWith?: any } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    price: '',
    start_date: '',
    schedules: [] as ScheduleSlot[],
    duration: '',
    mode: 'Online' as 'Online' | 'Physical',
    thumbnail_url: '',
    force_request: false,
  });

  const [currentSlot, setCurrentSlot] = useState<ScheduleSlot>({ day: 'Monday', start_time: '', end_time: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get('/classes/my-classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSlot(prev => ({ ...prev, [name]: value }));
  };

  const addScheduleSlot = () => {
    if (!currentSlot.day || !currentSlot.start_time || !currentSlot.end_time) {
      alert('Please fill out Day, Start Time, and End Time.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, currentSlot]
    }));
    setCurrentSlot({ day: 'Monday', start_time: '', end_time: '' });
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const checkConflict = async () => {
    if (!formData.subject || formData.schedules.length === 0) return;
    
    try {
      const res = await apiClient.post('/classes/check-conflict', {
        subject: formData.subject,
        schedules: formData.schedules
      });

      if (res.data.conflict) {
        setConflictState({
          conflict: true,
          type: res.data.type,
          message: `Overlap detected with ${res.data.with.title} (${res.data.with.subject}) taught by ${res.data.with.profiles?.first_name || 'another teacher'}.`,
          rawWith: res.data.with
        });
      } else {
        setConflictState({ conflict: false });
      }
    } catch (error) {
      console.error("Conflict check failed:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.subject && formData.schedules.length > 0) {
        checkConflict();
      } else if (formData.schedules.length === 0) {
        setConflictState(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.subject, formData.schedules]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictState?.type === 'BLOCK') return;
    if (formData.schedules.length === 0) {
      alert('Please add at least one schedule timeslot.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/classes', {
        ...formData,
        price: parseFloat(formData.price) || 0,
        conflict_details: conflictState?.conflict ? conflictState.rawWith : null
      });
      setClasses([response.data, ...classes]);
      setShowCreateModal(false);
      resetForm();
      alert('Class submitted for admin approval!');
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to submit class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', subject: '', description: '', price: '', start_date: '',
      schedules: [], duration: '', mode: 'Online', thumbnail_url: '', force_request: false
    });
    setCurrentSlot({ day: 'Monday', start_time: '', end_time: '' });
    setConflictState(null);
  }

  const stats = [
    { title: 'Total Classes', value: classes.length.toString(), icon: BookOpen, color: 'blue', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    { title: 'Approved', value: classes.filter(c => c.status === 'approved').length.toString(), icon: CheckCircle, color: 'green', bgColor: 'bg-green-500/20', textColor: 'text-green-400' },
    { title: 'Pending Review', value: classes.filter(c => c.status === 'pending').length.toString(), icon: Clock, color: 'orange', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' },
    { title: 'Rejected', value: classes.filter(c => c.status === 'rejected').length.toString(), icon: AlertCircle, color: 'red', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
  ];

  return (
    <DashboardLayout
      userRole="teacher" userName="Teacher" userInitials="TR"
      notificationCount={classes.filter(c => c.status === 'rejected').length}
      breadcrumb="My Classes" activePage="teacher-classes" onNavigate={onNavigate} onLogout={onLogout}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-3 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">My Classes</h1>
            <p className="text-white/60">Manage and track your teaching schedule</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2">
            <Plus size={20} /> Create Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">{stat.title}</p>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={stat.textColor} size={28} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      ) : classes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-blue-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Classes Yet</h3>
            <p className="text-white/60 mb-6">You haven't created any classes yet. Start by creating your first class.</p>
            <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2 mx-auto">
              <Plus size={20} /> Create First Class
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <GlassCard key={classItem.id} className="overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_32px_rgba(59,130,246,0.3)] group flex flex-col">
              <div className="relative h-48 overflow-hidden shrink-0">
                <ImageWithFallback src={classItem.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000'} alt={classItem.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${classItem.mode === 'Online' ? 'bg-blue-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                    {classItem.mode === 'Online' ? <span className="flex items-center gap-1"><Video size={12} />Online</span> : <span className="flex items-center gap-1"><MapPin size={12} />Physical</span>}
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <div className={`px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${classItem.status === 'approved' ? 'bg-green-500/90' : classItem.status === 'rejected' ? 'bg-red-500/90' : 'bg-yellow-500/90'}`}>
                    {classItem.status === 'approved' && <CheckCircle size={12} />}
                    {classItem.status === 'pending' && <Clock size={12} />}
                    {classItem.status === 'rejected' && <X size={12} />}
                    {classItem.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{classItem.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{classItem.subject}</p>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Calendar size={16} className="text-blue-400 shrink-0" />
                    <span>Starts: {classItem.start_date || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-white/70 text-sm">
                    <Clock size={16} className="text-green-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-1">
                      {Array.isArray(classItem.schedules) && classItem.schedules.length > 0 ? (
                        classItem.schedules.map((s, i) => (
                          <span key={i}>{s.day} • {s.start_time}-{s.end_time}</span>
                        ))
                      ) : (
                        <span>{classItem.schedule || 'Schedule Not Setup'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {classItem.status === 'rejected' && (
                  <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-xs font-bold mb-1 flex items-center gap-1"><AlertCircle size={12} />REJECTION REASON:</p>
                    <p className="text-white/70 text-xs italic">"{classItem.rejection_reason}"</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => onNavigate?.('teacher-class-view', classItem)} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 text-sm">
                    Manage Class
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors text-sm" onClick={() => alert('Detailed progress tracking coming soon!')}>
                    <BarChart3 size={18} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Advanced Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowCreateModal(false)} />
          <GlassCard className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="text-cyan-400" />
                Create New Class
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white transition-colors" type="button">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-6">
              {/* Category & Subject Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Level</label>
                  <select
                    value={level}
                    onChange={(e) => { setLevel(e.target.value as 'OL'|'AL'); setFormData({...formData, subject: ''}); }}
                    className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:border-cyan-400/50 outline-none"
                  >
                    <option value="OL">O/L (Ordinary Level)</option>
                    <option value="AL">A/L (Advanced Level)</option>
                  </select>
                </div>

                {level === 'AL' && (
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-medium">Stream</label>
                    <select
                      value={stream}
                      onChange={(e) => { setStream(e.target.value as keyof typeof AL_STREAMS); setFormData({...formData, subject: ''}); }}
                      className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:border-cyan-400/50 outline-none"
                    >
                      {Object.keys(AL_STREAMS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Subject</label>
                  <select
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white focus:border-cyan-400/50 outline-none"
                  >
                    <option value="">Select a Subject...</option>
                    {level === 'OL' 
                      ? OL_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)
                      : AL_STREAMS[stream].map(sub => <option key={sub} value={sub}>{sub}</option>)
                    }
                  </select>
                </div>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Class Title</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Advanced Physics 2026 Batch" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Describe your course content and what students will learn..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all resize-none" />
                </div>
              </div>

              {/* Schedule and Timing */}
              <div className="p-5 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-6">
                <h3 className="text-white font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-400"/>
                    Scheduling & Overlap Detection
                  </div>
                </h3>
                
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium">Class Starting Date</label>
                  <input type="date" required name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full max-w-sm px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-white/80 text-sm font-medium mb-3">Add Time Slots</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-black/20 p-4 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs">Day</label>
                      <select name="day" value={currentSlot.day} onChange={handleSlotChange} className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50">
                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs">Start Time</label>
                      <input type="time" name="start_time" value={currentSlot.start_time} onChange={handleSlotChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs">End Time</label>
                      <input type="time" name="end_time" value={currentSlot.end_time} onChange={handleSlotChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50" />
                    </div>
                    <button type="button" onClick={addScheduleSlot} className="h-[46px] px-4 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-xl font-bold hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2">
                      <Plus size={18} /> Add
                    </button>
                  </div>
                </div>

                {formData.schedules.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-white/80 text-sm font-medium">Added Schedules</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.schedules.map((slot, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                              {slot.day.substring(0, 3)}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{slot.day}</p>
                              <p className="text-white/60 text-xs">{slot.start_time} - {slot.end_time}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeScheduleSlot(idx)} className="text-red-400 hover:text-red-300 p-2">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflict Box UI */}
                {conflictState && conflictState.conflict && (
                  <div className={`p-4 rounded-xl border ${conflictState.type === 'BLOCK' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className={conflictState.type === 'BLOCK' ? "text-red-400 mt-1" : "text-yellow-400 mt-1"} size={20} />
                      <div>
                        <h4 className={`font-bold ${conflictState.type === 'BLOCK' ? "text-red-400" : "text-yellow-400"}`}>
                          {conflictState.type === 'BLOCK' ? 'STRICT OVERLAP DETECTED' : 'OVERLAP WARNING'}
                        </h4>
                        <p className="text-white/80 text-sm mt-1">{conflictState.message}</p>
                        
                        {conflictState.type === 'BLOCK' ? (
                          <p className="text-red-400/80 text-xs mt-2 font-semibold">You cannot schedule a class at this time due to strict overlap policies.</p>
                        ) : (
                          <label className="flex items-start gap-2 mt-3 cursor-pointer p-2 rounded-lg hover:bg-black/20 transition-colors">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" checked={formData.force_request} onChange={(e) => setFormData({...formData, force_request: e.target.checked})} />
                            <span className="text-yellow-400/90 text-sm font-medium leading-tight">Request Overlap Permission from Admin<br/><span className="text-yellow-400/60 text-xs font-normal">I understand this clashes with another active class, but I want to request permission.</span></span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {conflictState && !conflictState.conflict && formData.schedules.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm font-medium">
                    <CheckCircle size={16} /> No scheduling conflicts detected across these slots!
                  </div>
                )}
              </div>

              {/* Other Setup details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium ml-1">Price (LKR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input required type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-medium ml-1">Mode</label>
                  <select name="mode" value={formData.mode} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 cursor-pointer">
                    <option value="Online">Online</option>
                    <option value="Physical">Physical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/60 text-sm font-medium ml-1">Duration (Text Label - Optional)</label>
                <input name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g. Mon(2h), Fri(1h)" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-white/60 text-sm font-medium ml-1">Thumbnail URL</label>
                <input
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || formData.schedules.length === 0 || conflictState?.type === 'BLOCK' || (conflictState?.type === 'WARNING' && !formData.force_request)} 
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:shadow-none"
                >
                  {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <> <FileText size={20} /> Submit for Approval </>}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
