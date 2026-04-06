import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import {
  TrendingUp,
  AlertTriangle,
  Trophy,
  Download,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MyPerformancePageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function MyPerformancePage({
  onLogout,
  onNavigate,
}: MyPerformancePageProps) {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Performance trends data (last 6 exams)
  const performanceTrends = [
    { id: 'e1', exam: 'Exam 1', score: 72 },
    { id: 'e2', exam: 'Exam 2', score: 78 },
    { id: 'e3', exam: 'Exam 3', score: 75 },
    { id: 'e4', exam: 'Exam 4', score: 82 },
    { id: 'e5', exam: 'Exam 5', score: 88 },
    { id: 'e6', exam: 'Exam 6', score: 85 },
  ];

  // Subject averages data
  const subjectAverages = [
    { id: 'ict', subject: 'ICT', average: 85 },
    { id: 'math', subject: 'Mathematics', average: 78 },
    { id: 'physics', subject: 'Physics', average: 68 },
    { id: 'chem', subject: 'Chemistry', average: 75 },
  ];

  // Recent exam results
  const recentExams = [
    {
      date: '2025-02-20',
      exam: 'Mid-Term 2025',
      subject: 'ICT',
      mcq: 45,
      essay: 38,
      total: 83,
      rank: 2,
    },
    {
      date: '2025-02-18',
      exam: 'Unit Test 4',
      subject: 'Mathematics',
      mcq: 42,
      essay: 35,
      total: 77,
      rank: 5,
    },
    {
      date: '2025-02-15',
      exam: 'Mid-Term 2025',
      subject: 'Physics',
      mcq: 35,
      essay: 32,
      total: 67,
      rank: 12,
    },
    {
      date: '2025-02-12',
      exam: 'Unit Test 4',
      subject: 'Chemistry',
      mcq: 38,
      essay: 36,
      total: 74,
      rank: 8,
    },
    {
      date: '2025-02-10',
      exam: 'Unit Test 3',
      subject: 'ICT',
      mcq: 48,
      essay: 40,
      total: 88,
      rank: 1,
    },
  ];

  const subjects = [
    'All Subjects',
    'ICT',
    'Mathematics',
    'Physics',
    'Chemistry',
  ];

  const handleExportReport = () => {
    // Mock export functionality
    alert('Exporting performance report...');
  };

  // Get badge color based on score
  const getBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-lg">
          <p className="text-white font-semibold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="My Performance"
        activePage="performance"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              My Performance
            </h1>
            <p className="text-white/60">
              Track your academic progress and achievements
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Subject Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
              >
                <span>{selectedSubject}</span>
                <ChevronDown size={18} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Strongest Subject Card */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="text-green-400" size={24} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Strongest Subject</p>
              <h3 className="text-3xl font-bold text-white mb-1">ICT</h3>
              <p className="text-green-400 font-semibold">Average: 85%</p>
            </div>
            <div className="absolute inset-0 border border-green-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(34,197,94,0.3)] transition-all duration-300" />
          </GlassCard>

          {/* Needs Improvement Card */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-orange-400" size={24} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Needs Improvement</p>
              <h3 className="text-3xl font-bold text-white mb-1">Physics</h3>
              <p className="text-orange-400 font-semibold">Average: 68%</p>
            </div>
            <div className="absolute inset-0 border border-orange-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(249,115,22,0.3)] transition-all duration-300" />
          </GlassCard>

          {/* Overall Progress Card */}
          <GlassCard className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Trophy className="text-blue-400" size={24} />
                </div>
              </div>
              <p className="text-white/60 text-sm mb-2">Overall Progress</p>
              <h3 className="text-3xl font-bold text-white mb-1">+12%</h3>
              <p className="text-blue-400 font-semibold">vs last month</p>
            </div>
            <div className="absolute inset-0 border border-blue-500/20 rounded-2xl group-hover:shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all duration-300" />
          </GlassCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trends (Line Chart) */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">
                Performance Trends
              </h3>
              <p className="text-white/60 text-sm">Last 6 exams</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrends}>
                <CartesianGrid key="grid-perf" strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  key="xaxis-perf"
                  dataKey="exam"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <YAxis
                  key="yaxis-perf"
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip key="tooltip-perf" content={<CustomTooltip />} />
                <Line
                  key="line-perf"
                  type="monotone"
                  dataKey="score"
                  stroke="url(#blueGradientPerf)"
                  strokeWidth={3}
                  dot={{
                    fill: '#3B82F6',
                    r: 5,
                    strokeWidth: 2,
                    stroke: '#0B0F1A',
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#22D3EE',
                    stroke: '#0B0F1A',
                    strokeWidth: 2,
                  }}
                />
                <defs key="perf-chart-defs">
                  <linearGradient id="blueGradientPerf" x1="0" y1="0" x2="1" y2="0">
                    <stop key="perf-start" offset="0%" stopColor="#3B82F6" />
                    <stop key="perf-end" offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Subject Averages (Bar Chart) */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">
                Subject Averages
              </h3>
              <p className="text-white/60 text-sm">Current semester</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectAverages}>
                <CartesianGrid key="grid-bar" strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  key="xaxis-bar"
                  dataKey="subject"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <YAxis
                  key="yaxis-bar"
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip key="tooltip-bar" content={<CustomTooltip />} />
                <Bar
                  key="bar-avg"
                  dataKey="average"
                  fill="url(#barGradientAvg)"
                  radius={[8, 8, 0, 0]}
                />
                <defs key="bar-chart-defs">
                  <linearGradient id="barGradientAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop key="bar-start" offset="0%" stopColor="#3B82F6" />
                    <stop key="bar-end" offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Recent Exam Results Table */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">
              Recent Exam Results
            </h3>
            <p className="text-white/60 text-sm">Latest 5 examinations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-3">
                    Date
                  </th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-3">
                    Exam
                  </th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-3">
                    Subject
                  </th>
                  <th className="text-center text-white/60 font-semibold text-sm pb-3">
                    MCQ
                  </th>
                  <th className="text-center text-white/60 font-semibold text-sm pb-3">
                    Essay
                  </th>
                  <th className="text-center text-white/60 font-semibold text-sm pb-3">
                    Total
                  </th>
                  <th className="text-center text-white/60 font-semibold text-sm pb-3">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 text-white/80 text-sm">
                      {new Date(exam.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 text-white text-sm font-medium">
                      {exam.exam}
                    </td>
                    <td className="py-4">
                      <span className="text-cyan-400 text-sm font-medium">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="py-4 text-center text-white/80 text-sm">
                      {exam.mcq}
                    </td>
                    <td className="py-4 text-center text-white/80 text-sm">
                      {exam.essay}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold border ${getBadgeColor(
                          exam.total
                        )}`}
                      >
                        {exam.total}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-white font-bold text-sm">
                        #{exam.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </DashboardLayout>

      <AIChat />
    </>
  );
}
