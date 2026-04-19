import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import { toast } from 'sonner';
import {
  Download,
  CheckCircle,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  Calendar,
  Users,
  CheckCheck,
  XCircle,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { CustomDropdown } from '../custom-dropdown';

interface TeacherAttendancePageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

interface Student {
  id: string;
  name: string;
  studentId: string;
  status: AttendanceStatus;
  time?: string;
  profilePhoto?: string;
}

export function TeacherAttendancePage({
  onLogout,
  onNavigate,
}: TeacherAttendancePageProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.get('/classes/approved');
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleLoadAttendance = async () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }
    setIsLoadingRoster(true);
    try {
      const response = await apiClient.get(`/attendance/roster/${selectedClassId}`, {
        params: { date: selectedDate }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching roster:', error);
      toast.error('Failed to load class roster');
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const handleMarkStudent = async (studentId: string, status: string) => {
    setIsUpdating(true);
    try {
      await apiClient.post('/attendance/manual', {
        class_id: selectedClassId,
        date: selectedDate,
        records: [{ student_id: studentId, status: status.charAt(0).toUpperCase() + status.slice(1) }]
      });
      
      // Optimistic update
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { 
          ...s, 
          status: status as any, 
          time: status === 'absent' ? undefined : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) 
        } : s
      ));
      toast.success('Attendance updated');
    } catch (error) {
      toast.error('Failed to update attendance');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (!selectedClassId) return;
    setIsUpdating(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: status.charAt(0).toUpperCase() + status.slice(1)
      }));
      
      await apiClient.post('/attendance/manual', {
        class_id: selectedClassId,
        date: selectedDate,
        records
      });
      
      handleLoadAttendance(); // Reload for consistency
      toast.success(`Marked all as ${status}`);
    } catch (error) {
      toast.error('Failed to update bulk attendance');
    } finally {
      setIsUpdating(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const attendanceRate = students.length > 0 
    ? Math.round(((presentCount + lateCount) / students.length) * 100) 
    : 0;

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-1 w-fit uppercase tracking-wider">
            <CheckCircle size={14} />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1 w-fit uppercase tracking-wider">
            <XCircle size={14} />
            Absent
          </span>
        );
      case 'late':
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold flex items-center gap-1 w-fit uppercase tracking-wider">
            <Clock size={14} />
            Late
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
            Unmarked
          </span>
        );
    }
  };

  return (
    <DashboardLayout
      userRole="teacher"
      notificationCount={8}
      breadcrumb="Attendance"
      activePage="teacher-attendance"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Attendance Roster</h1>
            <p className="text-white/60">Manual attendance tracking and status management</p>
          </div>

          <div className="flex gap-3">
             <button
              onClick={() => handleBulkUpdate('present')}
              disabled={students.length === 0 || isUpdating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-xl shadow-green-900/20 hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCheck size={18} />
              Mark All Present
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Panel */}
      <GlassCard className="p-6 mb-8 relative border-blue-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Dropdown */}
          <CustomDropdown 
            value={selectedClassId} 
            onChange={setSelectedClassId} 
            options={[
              { value: '', label: 'Select a class...' },
              ...classes.map(c => ({ value: c.id, label: `${c.subject} - ${c.title}` }))
            ]}
            label="Class"
            placeholder="Select a class..."
          />

          {/* Date Picker */}
          <div>
            <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-3 block">
              Session Date
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Load Button */}
          <div className="flex items-end">
            <button
              onClick={handleLoadAttendance}
              disabled={isLoadingRoster}
              className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoadingRoster ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />}
              Fetch Roster
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Attendance Summary Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 border-l-4 border-green-500/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Present</p>
              <UserCheck className="text-green-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white">{presentCount}</p>
            <p className="text-white/40 text-xs mt-2 italic">Including {lateCount} late</p>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-red-500/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Absent</p>
              <UserX className="text-red-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white">{absentCount}</p>
            <p className="text-white/40 text-xs mt-2 italic px-1 rounded-md bg-red-400/5 w-fit">Needs followup</p>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Rate</p>
              <BarChart3 className="text-blue-400" size={20} />
            </div>
            <p className="text-4xl font-bold text-white">{attendanceRate}%</p>
            <p className="text-white/40 text-xs mt-2 italic">{presentCount + lateCount} / {students.length} record(s)</p>
          </GlassCard>
        </div>
      )}

      {/* Attendance Table */}
      {students.length > 0 ? (
        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-[0.2em] pb-6 px-4">Student</th>
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-[0.2em] pb-6 px-4">ID Reference</th>
                  <th className="text-left text-white/40 text-xs font-bold uppercase tracking-[0.2em] pb-6 px-4 text-center">Scan Method</th>
                  <th className="text-center text-white/40 text-xs font-bold uppercase tracking-[0.2em] pb-6 px-4">Status</th>
                  <th className="text-center text-white/40 text-xs font-bold uppercase tracking-[0.2em] pb-6 px-4">Rec Time</th>
                  <th className="text-right text-white/40 text-xs font-bold uppercase tracking-[0.2em] pb-6 px-4">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                           {student.profilePhoto ? <img src={student.profilePhoto} className="w-full h-full rounded-full object-cover" /> : student.name.charAt(0)}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="py-5 px-4 text-white/50 font-mono text-sm uppercase">{student.studentId}</td>
                    <td className="py-5 px-4 text-center">
                       {/* Explicitly using record.method if available would be better, but we only have status in student interface now */}
                       <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 border border-white/5 font-black uppercase">
                          {(student as any).method?.replace('_', ' ') || 'SYSTEM'}
                       </span>
                    </td>
                    <td className="py-5 px-4"><div className="flex justify-center">{getStatusBadge(student.status)}</div></td>
                    <td className="py-5 px-4 text-center text-white/40 text-sm font-medium">{student.time || '—'}</td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleMarkStudent(student.id, 'present')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${student.status === 'present' ? 'bg-green-500 text-white' : 'bg-white/5 text-white/30 hover:bg-green-500/20'}`}
                          title="Present"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkStudent(student.id, 'late')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${student.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-white/5 text-white/30 hover:bg-yellow-500/20'}`}
                          title="Late"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkStudent(student.id, 'absent')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${student.status === 'absent' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/30 hover:bg-red-500/20'}`}
                          title="Absent"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-end">
             <button
               onClick={handleLoadAttendance}
               className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
             >
               <RefreshCw size={14} className={isLoadingRoster ? 'animate-spin' : ''} />
               Refresh Roster
             </button>
          </div>
        </GlassCard>
      ) : (
        <div className="text-center py-32">
           <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Users className="text-white/20" size={40} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No Roster Data</h3>
           <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
             Select a class and date above to view student enrollment and mark attendance records.
           </p>
        </div>
      )}
    </DashboardLayout>
  );
}
