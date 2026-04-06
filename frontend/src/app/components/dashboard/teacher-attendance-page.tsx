import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
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
} from 'lucide-react';

interface TeacherAttendancePageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

interface Student {
  id: number;
  name: string;
  studentId: string;
  status: AttendanceStatus;
  time?: string;
}

export function TeacherAttendancePage({
  onLogout,
  onNavigate,
}: TeacherAttendancePageProps) {
  const [selectedClass, setSelectedClass] = useState('A/L ICT 2026');
  const [selectedSubject, setSelectedSubject] = useState('ICT');
  const [selectedDate, setSelectedDate] = useState('2026-03-20');
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);

  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'Kavindu Perera',
      studentId: 'STU101',
      status: 'present',
      time: '9:01 AM',
    },
    {
      id: 2,
      name: 'Kasun Perera',
      studentId: 'STU102',
      status: 'present',
      time: '9:02 AM',
    },
    {
      id: 3,
      name: 'Nimal Silva',
      studentId: 'STU103',
      status: 'absent',
    },
    {
      id: 4,
      name: 'Nethmi Fernando',
      studentId: 'STU104',
      status: 'present',
      time: '9:00 AM',
    },
    {
      id: 5,
      name: 'Ravindu Jayawardena',
      studentId: 'STU105',
      status: 'late',
      time: '9:25 AM',
    },
    {
      id: 6,
      name: 'Sithija Wijesinghe',
      studentId: 'STU106',
      status: 'present',
      time: '9:03 AM',
    },
    {
      id: 7,
      name: 'Tharindu Rajapaksha',
      studentId: 'STU107',
      status: 'absent',
    },
    {
      id: 8,
      name: 'Dilini Perera',
      studentId: 'STU108',
      status: 'present',
      time: '9:05 AM',
    },
    {
      id: 9,
      name: 'Ishara Silva',
      studentId: 'STU109',
      status: 'late',
      time: '9:30 AM',
    },
    {
      id: 10,
      name: 'Amaya Fernando',
      studentId: 'STU110',
      status: 'present',
      time: '9:01 AM',
    },
    {
      id: 11,
      name: 'Sandun Wickramasinghe',
      studentId: 'STU111',
      status: 'absent',
    },
    {
      id: 12,
      name: 'Hansika Gamage',
      studentId: 'STU112',
      status: 'present',
      time: '9:04 AM',
    },
    {
      id: 13,
      name: 'Chathura Bandara',
      studentId: 'STU113',
      status: 'present',
      time: '9:02 AM',
    },
    {
      id: 14,
      name: 'Malsha Dissanayake',
      studentId: 'STU114',
      status: 'absent',
    },
    {
      id: 15,
      name: 'Kaveesha Perera',
      studentId: 'STU115',
      status: 'present',
      time: '9:06 AM',
    },
    {
      id: 16,
      name: 'Dinuka Silva',
      studentId: 'STU116',
      status: 'late',
      time: '9:28 AM',
    },
    {
      id: 17,
      name: 'Pathum Fernando',
      studentId: 'STU117',
      status: 'present',
      time: '9:03 AM',
    },
    {
      id: 18,
      name: 'Nimasha Rajapaksha',
      studentId: 'STU118',
      status: 'absent',
    },
    {
      id: 19,
      name: 'Hasitha Jayawardena',
      studentId: 'STU119',
      status: 'present',
      time: '9:01 AM',
    },
    {
      id: 20,
      name: 'Oshadi Wijesinghe',
      studentId: 'STU120',
      status: 'present',
      time: '9:05 AM',
    },
    {
      id: 21,
      name: 'Lakshan Perera',
      studentId: 'STU121',
      status: 'absent',
    },
    {
      id: 22,
      name: 'Charitha Silva',
      studentId: 'STU122',
      status: 'present',
      time: '9:02 AM',
    },
    {
      id: 23,
      name: 'Buddhika Fernando',
      studentId: 'STU123',
      status: 'present',
      time: '9:04 AM',
    },
    {
      id: 24,
      name: 'Shalani Bandara',
      studentId: 'STU124',
      status: 'absent',
    },
    {
      id: 25,
      name: 'Thisara Gamage',
      studentId: 'STU125',
      status: 'present',
      time: '9:03 AM',
    },
    {
      id: 26,
      name: 'Nipuni Dissanayake',
      studentId: 'STU126',
      status: 'present',
      time: '9:01 AM',
    },
    {
      id: 27,
      name: 'Janaka Wickramasinghe',
      studentId: 'STU127',
      status: 'late',
      time: '9:35 AM',
    },
    {
      id: 28,
      name: 'Thilini Perera',
      studentId: 'STU128',
      status: 'present',
      time: '9:02 AM',
    },
    {
      id: 29,
      name: 'Harsha Silva',
      studentId: 'STU129',
      status: 'present',
      time: '9:05 AM',
    },
    {
      id: 30,
      name: 'Madushani Fernando',
      studentId: 'STU130',
      status: 'present',
      time: '9:03 AM',
    },
    {
      id: 31,
      name: 'Nuwan Rajapaksha',
      studentId: 'STU131',
      status: 'absent',
    },
    {
      id: 32,
      name: 'Sachini Jayawardena',
      studentId: 'STU132',
      status: 'present',
      time: '9:04 AM',
    },
    {
      id: 33,
      name: 'Gayan Wijesinghe',
      studentId: 'STU133',
      status: 'present',
      time: '9:01 AM',
    },
    {
      id: 34,
      name: 'Piyumi Perera',
      studentId: 'STU134',
      status: 'present',
      time: '9:06 AM',
    },
    {
      id: 35,
      name: 'Chamara Silva',
      studentId: 'STU135',
      status: 'present',
      time: '9:02 AM',
    },
    {
      id: 36,
      name: 'Samanthi Fernando',
      studentId: 'STU136',
      status: 'present',
      time: '9:03 AM',
    },
    {
      id: 37,
      name: 'Asanka Bandara',
      studentId: 'STU137',
      status: 'present',
      time: '9:04 AM',
    },
    {
      id: 38,
      name: 'Nadeesha Gamage',
      studentId: 'STU138',
      status: 'present',
      time: '9:05 AM',
    },
    {
      id: 39,
      name: 'Ruwan Dissanayake',
      studentId: 'STU139',
      status: 'present',
      time: '9:01 AM',
    },
    {
      id: 40,
      name: 'Anusha Wickramasinghe',
      studentId: 'STU140',
      status: 'present',
      time: '9:02 AM',
    },
  ]);

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const attendanceRate = Math.round(
    ((presentCount + lateCount) / students.length) * 100
  );

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-1 w-fit">
            <CheckCircle size={14} />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1 w-fit">
            <XCircle size={14} />
            Absent
          </span>
        );
      case 'late':
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold flex items-center gap-1 w-fit">
            <Clock size={14} />
            Late
          </span>
        );
      case 'unmarked':
        return (
          <span className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/30 text-gray-400 text-xs font-semibold">
            Unmarked
          </span>
        );
    }
  };

  const handleLoadAttendance = () => {
    setAttendanceLoaded(true);
    console.log('Loading attendance for:', {
      class: selectedClass,
      subject: selectedSubject,
      date: selectedDate,
    });
  };

  const handleMarkAllPresent = () => {
    setStudents(
      students.map((s) => ({ ...s, status: 'present', time: '9:00 AM' }))
    );
  };

  const handleMarkAllAbsent = () => {
    setStudents(students.map((s) => ({ ...s, status: 'absent', time: undefined })));
  };

  const handleClearAttendance = () => {
    setStudents(
      students.map((s) => ({ ...s, status: 'unmarked', time: undefined }))
    );
  };

  const handleMarkStudent = (
    studentId: number,
    status: AttendanceStatus
  ) => {
    setStudents(
      students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status,
              time: status === 'absent' || status === 'unmarked' ? undefined : s.time || '9:00 AM',
            }
          : s
      )
    );
  };

  const handleResetStudent = (studentId: number) => {
    setStudents(
      students.map((s) =>
        s.id === studentId
          ? { ...s, status: 'unmarked', time: undefined }
          : s
      )
    );
  };

  const handleExportAttendance = () => {
    alert('Exporting attendance data...');
  };

  return (
    <DashboardLayout
      userRole="teacher"
      userName="Mr. Silva"
      userInitials="MS"
      notificationCount={8}
      breadcrumb="Attendance"
      activePage="attendance"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
            <p className="text-white/60">View and manage student attendance</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportAttendance}
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export Attendance
            </button>
            <button
              onClick={handleMarkAllPresent}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300 flex items-center gap-2"
            >
              <CheckCheck size={18} />
              Mark All Present
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Panel */}
      <GlassCard className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Class Dropdown */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="A/L ICT 2026" className="bg-[#0B0F1A]">
                A/L ICT 2026
              </option>
              <option value="A/L ICT 2025" className="bg-[#0B0F1A]">
                A/L ICT 2025
              </option>
              <option value="Grade 11 ICT" className="bg-[#0B0F1A]">
                Grade 11 ICT
              </option>
              <option value="Grade 10 ICT" className="bg-[#0B0F1A]">
                Grade 10 ICT
              </option>
            </select>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="ICT" className="bg-[#0B0F1A]">
                ICT
              </option>
              <option value="Database Management" className="bg-[#0B0F1A]">
                Database Management
              </option>
              <option value="Web Development" className="bg-[#0B0F1A]">
                Web Development
              </option>
              <option value="Programming" className="bg-[#0B0F1A]">
                Programming
              </option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Select Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Load Button */}
          <div className="flex items-end">
            <button
              onClick={handleLoadAttendance}
              className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <BarChart3 size={18} />
              Load Attendance
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Attendance Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Present Students */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-2">Present Students</p>
              <p className="text-4xl font-bold text-white">{presentCount}</p>
              <p className="text-green-400 text-xs mt-1">
                +{lateCount} late arrivals
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <UserCheck className="text-green-400" size={28} />
            </div>
          </div>
        </GlassCard>

        {/* Absent Students */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-2">Absent Students</p>
              <p className="text-4xl font-bold text-white">{absentCount}</p>
              <p className="text-red-400 text-xs mt-1">
                {((absentCount / students.length) * 100).toFixed(1)}% of class
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
              <UserX className="text-red-400" size={28} />
            </div>
          </div>
        </GlassCard>

        {/* Attendance Rate */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-2">Attendance Rate</p>
              <p className="text-4xl font-bold text-white">{attendanceRate}%</p>
              <p className="text-cyan-400 text-xs mt-1">
                {presentCount + lateCount}/{students.length} present
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="text-blue-400" size={28} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Action Bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 text-white/60">
          <Users size={20} />
          <span className="font-semibold">Quick Actions:</span>
        </div>
        <button
          onClick={handleMarkAllPresent}
          className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/30 transition-colors flex items-center gap-2"
        >
          <CheckCheck size={16} />
          Mark All Present
        </button>
        <button
          onClick={handleMarkAllAbsent}
          className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-2"
        >
          <XCircle size={16} />
          Mark All Absent
        </button>
        <button
          onClick={handleClearAttendance}
          className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 font-semibold hover:bg-orange-500/30 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Clear Attendance
        </button>
      </div>

      {/* Attendance Table */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Student Attendance</h3>
            <p className="text-white/60 text-sm mt-1">
              {selectedClass} • {selectedSubject} •{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-white/60 text-sm">
            Total Students: <span className="text-white font-semibold">{students.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                  #
                </th>
                <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                  Student Name
                </th>
                <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                  Student ID
                </th>
                <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                  Status
                </th>
                <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                  Time
                </th>
                <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="text-white/60 text-sm">{index + 1}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-semibold">{student.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-cyan-400 text-sm font-medium">
                      {student.studentId}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(student.status)}</td>
                  <td className="py-4 px-4 text-center">
                    {student.time ? (
                      <span className="text-white/80 text-sm flex items-center justify-center gap-1">
                        <Clock size={14} className="text-blue-400" />
                        {student.time}
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleMarkStudent(student.id, 'present')}
                        className={`p-2 rounded-lg transition-colors ${
                          student.status === 'present'
                            ? 'bg-green-500/30 text-green-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                        title="Mark Present"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleMarkStudent(student.id, 'absent')}
                        className={`p-2 rounded-lg transition-colors ${
                          student.status === 'absent'
                            ? 'bg-red-500/30 text-red-400'
                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                        }`}
                        title="Mark Absent"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleMarkStudent(student.id, 'late')}
                        className={`p-2 rounded-lg transition-colors ${
                          student.status === 'late'
                            ? 'bg-yellow-500/30 text-yellow-400'
                            : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                        }`}
                        title="Mark Late"
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        onClick={() => handleResetStudent(student.id)}
                        className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 transition-colors"
                        title="Reset"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-white/60 text-sm">
                  Present: <span className="text-white font-semibold">{presentCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-white/60 text-sm">
                  Late: <span className="text-white font-semibold">{lateCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-white/60 text-sm">
                  Absent: <span className="text-white font-semibold">{absentCount}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => alert('Saving attendance...')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              Save Attendance
            </button>
          </div>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
