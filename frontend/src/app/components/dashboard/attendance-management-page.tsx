import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { CustomDropdown } from '../custom-dropdown';
import {
  ArrowLeft,
  QrCode,
  Play,
  UserPlus,
  Download,
  StopCircle,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Camera,
  Scan,
  Loader2,
  User,
  IdCard,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import apiClient from '@/api/api-client';
import { toast } from 'sonner';

interface AttendanceManagementPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  time: string;
  status: 'present' | 'late' | 'absent';
}

export function AttendanceManagementPage({
  onLogout,
  onNavigate,
}: AttendanceManagementPageProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [lastScannedStudent, setLastScannedStudent] = useState<AttendanceRecord | null>(null);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStatus, setManualStatus] = useState<'present' | 'late' | 'absent'>('present');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Fetch today's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.get('/classes/today');
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching today\'s classes:', error);
        toast.error('Failed to load today\'s classes');
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Load attendance records when class is selected/session starts
  const fetchRoster = async () => {
    if (!selectedClass) return;
    try {
      const response = await apiClient.get(`/attendance/roster/${selectedClass}`);
      setAttendanceRecords(response.data.filter((r: any) => r.status !== 'absent'));
    } catch (error) {
      console.error('Error fetching roster:', error);
    }
  };

  useEffect(() => {
    if (sessionActive) {
      fetchRoster();
      
      // Initialize scanner
      setTimeout(() => {
        if (document.getElementById('reader')) {
          const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );
          
          scanner.render(onScanSuccess, onScanFailure);
          scannerRef.current = scanner;
        }
      }, 500);
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    };
  }, [sessionActive]);

  async function onScanSuccess(decodedText: string) {
    if (isProcessingScan) return;
    setIsProcessingScan(true);

    try {
      const response = await apiClient.post('/attendance/scan', {
        student_id_code: decodedText,
        class_id: selectedClass
      });

      const data = response.data;
      const newRecord: AttendanceRecord = {
        id: data.id,
        studentName: data.student.name,
        studentId: decodedText,
        time: new Date(data.marked_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        status: data.status.toLowerCase() as any
      };

      setAttendanceRecords(prev => [newRecord, ...prev.filter(r => r.studentId !== decodedText)]);
      setLastScannedStudent({ ...newRecord, profilePhoto: data.student.photo } as any);
      setShowScanResult(true);
      toast.success(`Success: ${data.student.name}`);
    } catch (error: any) {
      console.error('Scan error:', error);
      const errorMsg = error.response?.data?.error || 'Scan failed';
      toast.error(errorMsg);
      
      if (error.response?.data?.student) {
         setLastScannedStudent({
           studentName: error.response.data.student.name,
           status: 'absent'
         } as any);
         setShowScanResult(true);
      }
    } finally {
      setTimeout(() => {
        setIsProcessingScan(false);
        setShowScanResult(false);
      }, 4000);
    }
  }

  function onScanFailure() {
    // Silent failure
  }

  const handleStartSession = () => {
    if (!selectedClass || !sessionType) {
      toast.error('Please select a class and session type');
      return;
    }
    setSessionActive(true);
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end the attendance session?')) {
      setSessionActive(false);
      setSelectedClass('');
      setSessionType('');
    }
  };

  const stats = {
    present: attendanceRecords.filter((r) => r.status === 'present').length,
    late: attendanceRecords.filter((r) => r.status === 'late').length,
    total: classes.find(c => c.id === selectedClass)?.total_students || 0,
  };

  const handleExportReport = () => {
    toast.success('Exporting attendance report...');
  };

  const handleAddManualAttendance = async () => {
    if (!manualStudentId) {
       toast.error('Please enter Student ID');
       return;
    }
    
    try {
      const response = await apiClient.post('/attendance/scan', {
        student_id_code: manualStudentId,
        class_id: selectedClass
      });
      
      const data = response.data;
      setAttendanceRecords(prev => [{
        id: data.id,
        studentName: data.student.name,
        studentId: manualStudentId,
        time: new Date(data.marked_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        status: data.status.toLowerCase() as any
      }, ...prev]);
      
      setShowManualModal(false);
      setManualStudentId('');
      toast.success('Attendance added manually');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add manual attendance');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-500/20 text-green-400 border-green-500/30',
      late: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      absent: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const icons = {
      present: CheckCircle,
      late: Clock,
      absent: XCircle,
    };

    const Icon = icons[status as keyof typeof icons] || CheckCircle;

    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 w-fit ${
          styles[status as keyof typeof styles] || styles.present
        }`}
      >
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <DashboardLayout
      userRole="staff"
      notificationCount={5}
      breadcrumb="Attendance Management"
      activePage="attendance-management"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-3 group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Attendance Management
            </h1>
            <p className="text-white/60">
              Mark student attendance using QR card scanning
            </p>
          </div>
        </div>
      </div>

      {/* Class Selection Panel */}
      {!sessionActive && (
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Select Class</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <CustomDropdown
              value={selectedClass}
              onChange={setSelectedClass}
              options={[
                { value: '', label: 'Select a class...' },
                ...classes.map(c => ({ value: c.id, label: `${c.subject} - ${c.title}` }))
              ]}
              placeholder="Select a class..."
              label="Class Dropdown"
            />

            <CustomDropdown
              value={sessionType}
              onChange={setSessionType}
              options={[
                { value: '', label: 'Select session type...' },
                { value: 'physical', label: 'Physical Class' },
                { value: 'lab', label: 'Lab Session' },
              ]}
              placeholder="Select session type..."
              label="Session Type"
            />

            <div className="flex items-end">
              <button
                onClick={handleStartSession}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play size={18} />
                Start Attendance Session
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active Session */}
      {sessionActive && (
        <>
          {/* Session Info Bar */}
          <GlassCard className="p-4 mb-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <QrCode className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg line-clamp-1">
                    {classes.find(c => c.id === selectedClass)?.subject} - {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session
                  </p>
                  <p className="text-white/60 text-sm">Session Active • Scanning enabled</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-2 font-semibold"
                >
                  <Download size={18} />
                  Export
                </button>
                <button
                  onClick={handleEndSession}
                  className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2 font-semibold"
                >
                  <StopCircle size={18} />
                  End Session
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <GlassCard className="p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">Students Present</p>
                  <p className="text-4xl font-bold text-white">{stats.present}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={28} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">Late Students</p>
                  <p className="text-4xl font-bold text-white">{stats.late}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="text-yellow-400" size={28} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">Total Expected</p>
                  <p className="text-4xl font-bold text-white">{stats.total || '...'}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="text-blue-400" size={28} />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* QR Scanner Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                QR Attendance Scanner
              </h2>

              <div className="relative aspect-square max-w-md mx-auto mb-6 bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-4 ring-blue-500/20">
                <div id="reader" className="w-full h-full"></div>
                {isProcessingScan && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-4">
                    <Loader2 className="animate-spin text-blue-400 mb-4" size={48} />
                    <p className="text-white font-bold tracking-widest text-sm uppercase">Verifying ID...</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-white/40">
                  <Camera size={20} />
                  <p className="text-sm font-medium">Place student QR card in front of camera</p>
                </div>
              </div>
            </GlassCard>

            {/* Scan Result Card */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Last Scan Result</h2>

              {showScanResult && lastScannedStudent ? (
                <div className={`${lastScannedStudent.status === 'absent' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border-2 rounded-2xl p-6 transition-all duration-500`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-2xl ${lastScannedStudent.status === 'absent' ? 'border-red-400' : 'border-green-400'}`}>
                      {(lastScannedStudent as any).profilePhoto ? (
                        <img src={(lastScannedStudent as any).profilePhoto} className="w-full h-full object-cover" alt="Student" />
                      ) : (
                         <div className="w-full h-full bg-white/5 flex items-center justify-center">
                           <User className="text-white/20" size={40} />
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">
                      {lastScannedStudent.studentName}
                    </h3>
                    <p className="text-white/60 font-mono tracking-widest text-sm">{lastScannedStudent.studentId || 'NOT ENROLLED'}</p>
                  </div>

                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-4 rounded-xl ${lastScannedStudent.status === 'absent' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      <span className="text-white/60 font-medium">Status</span>
                      <span className={`${lastScannedStudent.status === 'absent' ? 'text-red-400' : 'text-green-400'} font-black flex items-center gap-2 uppercase tracking-widest`}>
                        {lastScannedStudent.status === 'absent' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                        {lastScannedStudent.status}
                      </span>
                    </div>

                    {lastScannedStudent.time && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <span className="text-white/60 font-medium">Recorded At</span>
                        <span className="text-white font-bold tracking-tighter text-xl">
                          {lastScannedStudent.time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                    <Scan className="text-white/20" size={48} />
                  </div>
                  <p className="text-white/40 text-lg font-medium">Ready to Scan</p>
                  <p className="text-white/20 text-sm mt-2 max-w-[200px]">
                    Waiting for student QR card to be presented
                  </p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Attendance List */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold text-white">Attendance Stream</h2>
              <button
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 font-semibold border border-white/10"
              >
                <UserPlus size={18} />
                Manual Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">
                      Student
                    </th>
                    <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">
                      ID Number
                    </th>
                    <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">
                      Time
                    </th>
                    <th className="text-left text-white/40 text-xs font-bold uppercase tracking-widest pb-4 px-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                            {record.studentName.charAt(0)}
                          </div>
                          <span className="text-white font-semibold">
                            {record.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/60 font-mono text-sm">{record.studentId}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70 font-medium">{record.time}</span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attendanceRecords.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                     <Users className="text-white/10" size={32} />
                  </div>
                  <p className="text-white/40 font-medium">Roster is empty</p>
                  <p className="text-white/20 text-sm mt-1">Start scanning cards to see records here</p>
                </div>
              )}
            </div>
          </GlassCard>
        </>
      )}

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <GlassCard className="p-8 max-w-md w-full border-blue-500/30">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Manual ID Entry</h2>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
                  Student ID Number
                </label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                      <IdCard size={20} />
                   </div>
                   <input
                    type="text"
                    value={manualStudentId}
                    onChange={(e) => setManualStudentId(e.target.value)}
                    placeholder="Enter ID (e.g. STU-1030)"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-mono tracking-widest uppercase"
                    autoFocus
                  />
                </div>
                <p className="mt-3 text-[10px] text-white/30 leading-relaxed italic">
                  Note: Manual entry will verify enrollment and class timing just like a QR scan.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowManualModal(false)}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualAttendance}
                className="flex-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95"
              >
                Verify & Record
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
