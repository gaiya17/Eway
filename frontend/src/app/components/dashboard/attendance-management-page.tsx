import React, { useState } from 'react';
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
} from 'lucide-react';

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
  const [selectedClass, setSelectedClass] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [lastScannedStudent, setLastScannedStudent] = useState<AttendanceRecord | null>(null);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStatus, setManualStatus] = useState<'present' | 'late' | 'absent'>('present');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      studentName: 'Kasun Perera',
      studentId: 'STU-1024',
      time: '3:02 PM',
      status: 'present',
    },
    {
      id: '2',
      studentName: 'Nimali Fernando',
      studentId: 'STU-1025',
      time: '3:03 PM',
      status: 'present',
    },
    {
      id: '3',
      studentName: 'Ravindu Silva',
      studentId: 'STU-1026',
      time: '3:15 PM',
      status: 'late',
    },
    {
      id: '4',
      studentName: 'Sanduni Perera',
      studentId: 'STU-1027',
      time: '3:04 PM',
      status: 'present',
    },
    {
      id: '5',
      studentName: 'Kavinda Rathnayake',
      studentId: 'STU-1028',
      time: '3:20 PM',
      status: 'late',
    },
  ]);

  const stats = {
    present: attendanceRecords.filter((r) => r.status === 'present').length,
    late: attendanceRecords.filter((r) => r.status === 'late').length,
    total: 40, // Total expected students
  };

  const handleStartSession = () => {
    if (!selectedClass || !sessionType) {
      alert('Please select a class and session type');
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

  const handleSimulateScan = () => {
    // Simulate QR scan
    const newStudent: AttendanceRecord = {
      id: Date.now().toString(),
      studentName: 'Thilini Jayasinghe',
      studentId: 'STU-1029',
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      status: 'present',
    };

    setAttendanceRecords((prev) => [newStudent, ...prev]);
    setLastScannedStudent(newStudent);
    setShowScanResult(true);

    // Hide scan result after 3 seconds
    setTimeout(() => {
      setShowScanResult(false);
    }, 3000);
  };

  const handleAddManualAttendance = () => {
    if (!manualStudentName || !manualStudentId) {
      alert('Please enter student name and ID');
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentName: manualStudentName,
      studentId: manualStudentId,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      status: manualStatus,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    setShowManualModal(false);
    setManualStudentName('');
    setManualStudentId('');
    setManualStatus('present');
  };

  const handleExportReport = () => {
    alert('Exporting attendance report... (Feature coming soon)');
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

    const Icon = icons[status as keyof typeof icons];

    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 w-fit ${
          styles[status as keyof typeof styles]
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
      userName="Ms. Silva"
      userInitials="MS"
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
                { value: 'A/L ICT 2026', label: 'A/L ICT 2026' },
                { value: 'A/L Mathematics 2026', label: 'A/L Mathematics 2026' },
                { value: 'A/L Physics 2026', label: 'A/L Physics 2026' },
                { value: 'O/L Science 2026', label: 'O/L Science 2026' },
                { value: 'O/L Mathematics 2026', label: 'O/L Mathematics 2026' },
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
                { value: 'extra', label: 'Extra Class' },
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
                  <p className="text-white font-semibold text-lg">
                    {selectedClass} - {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session
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
                  Export Report
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
                  <p className="text-white/60 text-sm mb-2">Total Students</p>
                  <p className="text-4xl font-bold text-white">{stats.total}</p>
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

              {/* Scanner Frame */}
              <div className="relative aspect-square max-w-md mx-auto mb-6">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center p-8">
                  <div className="relative w-48 h-48 mb-6">
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-2xl bg-blue-500/20 flex items-center justify-center animate-pulse">
                        <QrCode className="text-blue-400" size={48} />
                      </div>
                    </div>

                    {/* Scanning line animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                  </div>

                  <Camera className="text-white/40 mb-3" size={32} />
                  <p className="text-white/60 text-center mb-4">
                    Scan student QR card to mark attendance
                  </p>

                  {/* Simulate Scan Button */}
                  <button
                    onClick={handleSimulateScan}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
                  >
                    <Scan size={18} />
                    Simulate QR Scan
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Scan Result Card */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Last Scan</h2>

              {showScanResult && lastScannedStudent ? (
                <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="text-green-400" size={32} />
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {lastScannedStudent.studentName}
                    </h3>
                    <p className="text-white/60">{lastScannedStudent.studentId}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/60">Class</span>
                      <span className="text-white font-semibold">{selectedClass}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/60">Status</span>
                      <span className="text-green-400 font-semibold flex items-center gap-2">
                        <CheckCircle size={16} />
                        Attendance Marked
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/60">Time</span>
                      <span className="text-white font-semibold">
                        {lastScannedStudent.time}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <QrCode className="text-white/30" size={40} />
                  </div>
                  <p className="text-white/40 text-lg">No scan yet</p>
                  <p className="text-white/30 text-sm mt-2">
                    Waiting for QR card scan...
                  </p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Attendance List */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold text-white">Today's Attendance</h2>
              <button
                onClick={() => setShowManualModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <UserPlus size={18} />
                Add Manual Attendance
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                      Student Name
                    </th>
                    <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                      Student ID
                    </th>
                    <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                      Time
                    </th>
                    <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                            {record.studentName.charAt(0)}
                          </div>
                          <span className="text-white font-medium">
                            {record.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70">{record.studentId}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70">{record.time}</span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attendanceRecords.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/40 text-lg">No attendance records yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </>
      )}

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Manual Attendance</h2>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  placeholder="e.g., STU-1030"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div>
                <CustomDropdown
                  value={manualStatus}
                  onChange={(value) =>
                    setManualStatus(value as 'present' | 'late' | 'absent')
                  }
                  options={[
                    { value: 'present', label: 'Present' },
                    { value: 'late', label: 'Late' },
                    { value: 'absent', label: 'Absent' },
                  ]}
                  label="Status"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowManualModal(false)}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualAttendance}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 font-semibold"
              >
                Add Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}