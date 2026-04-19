import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import apiClient from '@/api/api-client';
import {
  TrendingUp,
  AlertTriangle,
  Trophy,
  Download,
  ChevronDown,
  Loader2,
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

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, perfRes] = await Promise.all([
          apiClient.get('/users/profile'),
          apiClient.get('/users/student/performance')
        ]);
        setProfile(profileRes.data);
        setData(perfRes.data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const subjects = ['All Subjects', ...(data?.subjectAverages?.map((s: any) => s.subject) || [])];
  
  const filteredTrends = selectedSubject === 'All Subjects' 
    ? data?.performanceTrends 
    : data?.performanceTrends?.filter((t: any) => !t.subject || t.subject === selectedSubject);

  const filteredExams = selectedSubject === 'All Subjects'
    ? data?.recentExams
    : data?.recentExams?.filter((e: any) => e.subject === selectedSubject);

  const handleExportReport = () => {
    if (!data) return;

    const doc = new jsPDF();
    const primaryColor = [59, 130, 246]; // Blue-500
    
    // Header
    doc.setFillColor(11, 15, 26);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("EWAY LMS PERFORMANCE REPORT", 15, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33);

    // Student Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT INFORMATION", 15, 55);
    doc.line(15, 57, 195, 57);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${profile?.first_name} ${profile?.last_name || ''}`, 15, 65);
    doc.text(`Email: ${profile?.email}`, 15, 72);
    doc.text(`Student ID: ${profile?.id?.substring(0, 13).toUpperCase()}`, 15, 79);

    // Summary Statistics
    doc.setFont("helvetica", "bold");
    doc.text("ACADEMIC SUMMARY", 15, 95);
    doc.line(15, 97, 195, 97);

    const summaryData = [
      ["Strongest Subject", data.summaryStats.strongestSubject.subject, `${data.summaryStats.strongestSubject.average}%`],
      ["Needs Improvement", data.summaryStats.needsImprovement.subject, `${data.summaryStats.needsImprovement.average}%`],
      ["Overall Performance", "Average across all subjects", `${data.summaryStats.overallProgress}%`]
    ];

    autoTable(doc, {
      startY: 102,
      head: [["Insight", "Subject / Category", "Score"]],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor as any },
      styles: { fontSize: 10 }
    });

    // Recent Exam Results
    doc.setFont("helvetica", "bold");
    doc.text("RECENT EXAM RESULTS", 15, (doc as any).lastAutoTable.finalY + 15);
    doc.line(15, (doc as any).lastAutoTable.finalY + 17, 195, (doc as any).lastAutoTable.finalY + 17);

    const examRows = data.recentExams.map((exam: any) => [
      new Date(exam.date).toLocaleDateString(),
      exam.exam,
      exam.subject,
      `${exam.total}%`,
      `#${exam.rank}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 22,
      head: [["Date", "Exam Title", "Subject", "Score", "Rank"]],
      body: examRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor as any },
      styles: { fontSize: 9 }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`EWAY LMS - Powered by Education Innovation | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`EWAY_Performance_Report_${profile?.first_name}_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <p className="text-white font-semibold mb-1">{payload[0].payload.exam}</p>
          <p className="text-blue-400 text-sm">Your Score: {payload[0].value}%</p>
          {payload[1] && (
            <p className="text-indigo-400 text-sm">Class Avg: {payload[1].value}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
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
              disabled={isLoading || !data}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white/60">Loading performance data...</p>
          </div>
        ) : (
          <>
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
                  <h3 className="text-3xl font-bold text-white mb-1">{data?.summaryStats?.strongestSubject?.subject || 'N/A'}</h3>
                  <p className="text-green-400 font-semibold">Average: {data?.summaryStats?.strongestSubject?.average || 0}%</p>
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
                  <h3 className="text-3xl font-bold text-white mb-1">{data?.summaryStats?.needsImprovement?.subject || 'N/A'}</h3>
                  <p className="text-orange-400 font-semibold">Average: {data?.summaryStats?.needsImprovement?.average || 0}%</p>
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
                  <h3 className="text-3xl font-bold text-white mb-1">{data?.summaryStats?.overallProgress || 0}%</h3>
                  <p className="text-blue-400 font-semibold">Recent Average</p>
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
                  <LineChart data={filteredTrends || []}>
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
                      name="Your Score"
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
                    <Line
                      key="line-avg"
                      type="monotone"
                      dataKey="classAverage"
                      name="Class Average"
                      stroke="rgba(255,255,255,0.2)"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
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
                  <BarChart data={data?.subjectAverages || []}>
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
                        Score
                      </th>
                      <th className="text-center text-white/60 font-semibold text-sm pb-3">
                        Rank
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams?.map((exam: any, index: number) => (
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
                        <td className="py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-4 py-1 rounded-lg text-sm font-semibold border ${getBadgeColor(
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
                    {(!filteredExams || filteredExams.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-white/50">
                          No recent exams found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}
      </DashboardLayout>

      <AIChat />
    </>
  );
}
