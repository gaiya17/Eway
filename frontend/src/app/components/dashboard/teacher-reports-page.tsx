import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft, Users, TrendingUp, AlertTriangle, BookOpen,
  FileSpreadsheet, FileText, RefreshCw, ChevronLeft,
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { exportToExcel, exportToPDF } from '../../utils/report-exports';

interface TeacherReportsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('eway_token') || '';

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(11,15,26,0.97)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

const ScatterDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = payload.isAtRisk ? '#EF4444' : payload.attendanceRate >= 75 && payload.avgGrade >= 70 ? '#22D3EE' : '#A855F7';
  return <circle cx={cx} cy={cy} r={7} fill={color} fillOpacity={0.85} stroke={color} strokeWidth={1.5} />;
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={CHART_TOOLTIP_STYLE} className="p-3 rounded-xl text-sm">
      <p className="text-white font-semibold">{d.name}</p>
      <p className="text-cyan-400">Attendance: {d.attendanceRate}%</p>
      <p className="text-purple-400">Avg Grade: {d.avgGrade ?? 'Not graded'}</p>
      {d.isAtRisk && <p className="text-red-400 font-semibold mt-1">⚠️ At Risk</p>}
    </div>
  );
};

export function TeacherReportsPage({ onLogout, onNavigate }: TeacherReportsPageProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API}/api/classes/my-classes`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClasses(data.filter((c: any) => c.status === 'approved'));
        }
      } catch (e) { console.error(e); }
    };
    fetchClasses();
  }, []);

  const fetchClassPerformance = async (classId: string) => {
    setLoading(true);
    setClassData(null);
    setSelectedStudent(null);
    try {
      const res = await fetch(`${API}/api/reports/teacher/class-performance/${classId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setClassData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSelectClass = (cls: any) => {
    setSelectedClass(cls);
    setActiveTab('overview');
    fetchClassPerformance(cls.id);
  };

  const handleExportGradebook = () => {
    if (!classData) return;
    exportToExcel(`EWAY_Gradebook_${selectedClass?.title || 'Class'}`, [{
      name: 'Gradebook',
      headers: ['Rank', 'Student Name', 'Student ID', 'Attendance %', 'Sessions Attended', 'Avg Grade', 'Completion %', 'Weighted Grade', 'Status'],
      rows: (classData.students || []).map((s: any) => [
        s.rank, s.name, s.studentId,
        `${s.attendanceRate}%`, `${s.sessionsAttended}/${s.totalSessions}`,
        s.avgGrade ?? 'Not Graded', `${s.completionRate}%`,
        `${s.weightedGrade}%`, s.isAtRisk ? 'AT RISK' : 'OK',
      ]),
    }]);
  };

  const handleExportProgressPDF = (student: any) => {
    if (!student || !selectedClass) return;
    exportToPDF(
      `Monthly Progress Report`,
      `${student.name} | ${selectedClass.title} | ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      ['Assignment', 'Status', 'Grade', 'Submitted'],
      (student.submissions || []).map((s: any) => [
        s.assignmentTitle,
        s.status || 'Pending',
        s.grade !== null && s.grade !== undefined ? `${s.grade}%` : 'Not Graded',
        s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—',
      ]),
      undefined,
      `EWAY_Progress_${student.name.replace(/\s/g, '_')}`
    );
  };

  // Build scatter data
  const scatterData = (classData?.students || [])
    .filter((s: any) => s.avgGrade !== null)
    .map((s: any) => ({
      name: s.name,
      attendanceRate: s.attendanceRate,
      avgGrade: s.avgGrade ?? 0,
      isAtRisk: s.isAtRisk,
    }));

  return (
    <DashboardLayout userRole="teacher" activePage="teacher-reports" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} /><span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Academic Pulse</h1>
              <p className="text-white/60">Class health, student progress tracking & gradebook export</p>
            </div>
            {selectedClass && (
              <button onClick={() => { setSelectedClass(null); setClassData(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                <ChevronLeft size={16} /><span className="text-sm">All Classes</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Class Selector ── */}
        {!selectedClass && (
          <div>
            <h2 className="text-white/60 text-sm font-semibold mb-4 uppercase tracking-wider">Select a Class to Analyse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(cls => (
                <button key={cls.id} onClick={() => handleSelectClass(cls)}
                  className="text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                      <BookOpen className="text-cyan-400" size={20} />
                    </div>
                    <span className="text-white/40 text-xs">{cls.mode}</span>
                  </div>
                  <p className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">{cls.title}</p>
                  <p className="text-white/60 text-sm">{cls.subject}</p>
                </button>
              ))}
              {classes.length === 0 && (
                <div className="col-span-3 text-center py-16 text-white/40">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                  <p>No approved classes found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Class Dashboard ── */}
        {selectedClass && (
          <div className="space-y-6">
            {/* Class Header */}
            <GlassCard className="p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 text-sm font-semibold mb-1">{selectedClass.subject}</p>
                  <h2 className="text-white text-xl font-bold">{selectedClass.title}</h2>
                </div>
                {loading && <RefreshCw size={20} className="text-cyan-400 animate-spin" />}
              </div>
            </GlassCard>

            {/* KPI Row */}
            {classData && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Enrolled', value: classData.totalStudents, icon: Users, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20' },
                  { label: 'Avg Attendance', value: `${classData.avgAttendance}%`, icon: TrendingUp, color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20' },
                  { label: 'Avg Grade', value: classData.avgGrade > 0 ? `${classData.avgGrade}%` : 'N/A', icon: BookOpen, color: 'text-purple-400', bg: 'from-purple-500/20 to-indigo-500/20' },
                  { label: 'At-Risk', value: classData.atRiskCount, icon: AlertTriangle, color: 'text-red-400', bg: 'from-red-500/20 to-pink-500/20' },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <GlassCard key={i} className="p-5">
                      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${kpi.bg} mb-3`}><Icon className={kpi.color} size={20} /></div>
                      <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-white/60 text-sm mt-1">{kpi.label}</p>
                    </GlassCard>
                  );
                })}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
              {[{ id: 'overview', label: 'Class Overview' }, { id: 'deepdive', label: 'Student Deep-Dive' }].map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedStudent(null); }}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400' : 'text-white/50 hover:text-white/80'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && classData && (
              <div className="space-y-6">
                {/* Scatter Chart */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">Attendance vs Grade — Correlation</h3>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-white/60">At-Risk (&lt;40% attendance)</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-cyan-400" /><span className="text-white/60">High Performers</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-400" /><span className="text-white/60">Others</span></div>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mb-4">Bottom-left quadrant = Danger Zone (low attendance + low grade)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                      <XAxis type="number" dataKey="attendanceRate" name="Attendance" domain={[0, 100]}
                        stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} label={{ value: 'Attendance %', offset: -5, position: 'insideBottom', fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <YAxis type="number" dataKey="avgGrade" name="Grade" domain={[0, 100]}
                        stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} label={{ value: 'Grade %', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <Tooltip content={<CustomScatterTooltip />} />
                      {/* Danger Zone Reference Lines */}
                      <ReferenceLine x={40} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: '40%', fill: 'rgba(239,68,68,0.6)', fontSize: 10 }} />
                      <ReferenceLine y={50} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: '50%', fill: 'rgba(239,68,68,0.6)', fontSize: 10, position: 'right' }} />
                      <Scatter data={scatterData} shape={<ScatterDot />} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Student Table */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">Student Performance Table</h3>
                    <button onClick={handleExportGradebook}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                      <FileSpreadsheet size={16} />Generate Gradebook (Excel)
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          {['Rank', 'Student', 'ID', 'Attendance', 'Avg Grade', 'Completion', 'Weighted', 'Status'].map(h => (
                            <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(classData.students || []).map((s: any, i: number) => (
                          <tr key={i}
                            onClick={() => { setSelectedStudent(s); setActiveTab('deepdive'); }}
                            className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${s.isAtRisk ? 'bg-red-500/5' : ''}`}>
                            <td className="py-3 pr-3 text-white/60 text-sm">#{s.rank}</td>
                            <td className="py-3 pr-3 text-white text-sm font-medium">{s.name}</td>
                            <td className="py-3 pr-3 text-white/60 text-xs font-mono">{s.studentId}</td>
                            <td className="py-3 pr-3">
                              <span className={`text-sm font-semibold ${s.attendanceRate < 40 ? 'text-red-400' : s.attendanceRate >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {s.attendanceRate}%
                              </span>
                            </td>
                            <td className="py-3 pr-3 text-white/80 text-sm">{s.avgGrade !== null ? `${s.avgGrade}%` : '—'}</td>
                            <td className="py-3 pr-3 text-white/80 text-sm">{s.completionRate}%</td>
                            <td className="py-3 pr-3 text-white font-semibold text-sm">{s.weightedGrade}%</td>
                            <td className="py-3">
                              {s.isAtRisk
                                ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 font-semibold">⚠ At Risk</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">✓ OK</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* ── Deep-Dive Tab ── */}
            {activeTab === 'deepdive' && (
              <div className="space-y-6">
                {!selectedStudent ? (
                  <GlassCard className="p-6">
                    <h3 className="text-white font-bold text-lg mb-4">Select a Student</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(classData?.students || []).map((s: any, i: number) => (
                        <button key={i} onClick={() => setSelectedStudent(s)}
                          className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${s.isAtRisk ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10 hover:border-cyan-500/30'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${s.isAtRisk ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">{s.name}</p>
                              <p className="text-white/50 text-xs">Rank #{s.rank} · {s.attendanceRate}% attendance</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {/* Student Header */}
                    <GlassCard className={`p-5 ${selectedStudent.isAtRisk ? 'border border-red-500/30 bg-red-500/5' : 'border border-cyan-500/20 bg-cyan-500/5'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${selectedStudent.isAtRisk ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                            {selectedStudent.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-white text-xl font-bold">{selectedStudent.name}</h3>
                            <p className="text-white/60 text-sm">ID: {selectedStudent.studentId} · Rank #{selectedStudent.rank} of {classData?.totalStudents}</p>
                            {selectedStudent.isAtRisk && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                                <AlertTriangle size={12} />At Risk — Below 40% attendance
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => handleExportProgressPDF(selectedStudent)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                          <FileText size={16} />Monthly Progress PDF
                        </button>
                      </div>
                    </GlassCard>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Attendance', value: `${selectedStudent.attendanceRate}%`, note: `${selectedStudent.sessionsAttended}/${selectedStudent.totalSessions} sessions` },
                        { label: 'Avg Grade', value: selectedStudent.avgGrade !== null ? `${selectedStudent.avgGrade}%` : 'N/A', note: 'From graded assignments' },
                        { label: 'Completion Rate', value: `${selectedStudent.completionRate}%`, note: `${selectedStudent.completedCount}/${selectedStudent.totalAssignments} submitted` },
                        { label: 'Weighted Grade', value: `${selectedStudent.weightedGrade}%`, note: '60% assign + 40% attend' },
                      ].map((stat, i) => (
                        <GlassCard key={i} className="p-4">
                          <p className="text-white text-2xl font-bold">{stat.value}</p>
                          <p className="text-white/60 text-sm mt-0.5">{stat.label}</p>
                          <p className="text-white/40 text-xs mt-1">{stat.note}</p>
                        </GlassCard>
                      ))}
                    </div>

                    {/* Attendance Calendar */}
                    <GlassCard className="p-6">
                      <h4 className="text-white font-bold mb-4">Attendance Log</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedStudent.attendanceLog || []).map((entry: any, i: number) => (
                          <div key={i} title={`${entry.date}: ${entry.status}`}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold cursor-default transition-all hover:scale-110 ${
                              entry.status?.toLowerCase() === 'present' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : entry.status?.toLowerCase() === 'late' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {new Date(entry.date).getDate()}
                          </div>
                        ))}
                        {(selectedStudent.attendanceLog || []).length === 0 && (
                          <p className="text-white/40 text-sm">No attendance records yet</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/40" /> Present</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/40" /> Late</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/40" /> Absent</div>
                      </div>
                    </GlassCard>

                    {/* Assignment Timeline */}
                    <GlassCard className="p-6">
                      <h4 className="text-white font-bold mb-4">Assignment Timeline</h4>
                      <div className="space-y-3">
                        {(selectedStudent.submissions || []).map((sub: any, i: number) => (
                          <div key={i} className={`flex items-start justify-between p-3 rounded-xl border ${
                            sub.status === 'Graded' ? 'bg-green-500/5 border-green-500/20'
                            : sub.status === 'Submitted' ? 'bg-blue-500/5 border-blue-500/20'
                            : sub.status === 'Late' ? 'bg-yellow-500/5 border-yellow-500/20'
                            : sub.status === 'Missing' ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-white/5 border-white/10'
                          }`}>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{sub.assignmentTitle}</p>
                              <p className="text-white/50 text-xs">Due: {sub.deadline ? new Date(sub.deadline).toLocaleDateString() : '—'}</p>
                              {sub.submittedAt && <p className="text-white/40 text-xs">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              {sub.grade !== null && sub.grade !== undefined && (
                                <span className="text-white font-bold text-sm">{sub.grade}%</span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                sub.status === 'Graded' ? 'bg-green-500/20 text-green-400'
                                : sub.status === 'Submitted' ? 'bg-blue-500/20 text-blue-400'
                                : sub.status === 'Late' ? 'bg-yellow-500/20 text-yellow-400'
                                : sub.status === 'Missing' ? 'bg-red-500/20 text-red-400'
                                : 'bg-white/20 text-white/60'
                              }`}>{sub.status}</span>
                            </div>
                          </div>
                        ))}
                        {(selectedStudent.submissions || []).length === 0 && (
                          <p className="text-white/40 text-center py-4">No assignments yet</p>
                        )}
                      </div>
                    </GlassCard>

                    <button onClick={() => setSelectedStudent(null)}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                      <ChevronLeft size={16} />Back to student list
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
