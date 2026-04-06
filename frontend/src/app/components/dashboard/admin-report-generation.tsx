import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  FileText,
  Users,
  TrendingUp,
  BookOpen,
  Download,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AdminReportGenerationProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface GeneratedReport {
  id: number;
  name: string;
  type: string;
  generatedBy: string;
  date: string;
  format: 'PDF' | 'Excel';
}

export function AdminReportGeneration({ onLogout, onNavigate }: AdminReportGenerationProps) {
  const [reportType, setReportType] = useState('User Report');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [userRoleFilter, setUserRoleFilter] = useState('All Users');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-15');

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: 1,
      name: 'Revenue Report – March',
      type: 'Revenue',
      generatedBy: 'Admin',
      date: 'Mar 15, 2026',
      format: 'PDF',
    },
    {
      id: 2,
      name: 'User Activity Report – Q1 2026',
      type: 'User',
      generatedBy: 'Admin',
      date: 'Mar 14, 2026',
      format: 'Excel',
    },
    {
      id: 3,
      name: 'Attendance Report – February',
      type: 'Attendance',
      generatedBy: 'Admin',
      date: 'Mar 13, 2026',
      format: 'PDF',
    },
    {
      id: 4,
      name: 'Payment Summary – 2026',
      type: 'Payment',
      generatedBy: 'Admin',
      date: 'Mar 12, 2026',
      format: 'Excel',
    },
    {
      id: 5,
      name: 'Course Performance – A/L ICT',
      type: 'Course Performance',
      generatedBy: 'Admin',
      date: 'Mar 10, 2026',
      format: 'PDF',
    },
  ]);

  // Chart data
  const revenueTrendData = [
    { month: 'Jan', revenue: 320000 },
    { month: 'Feb', revenue: 380000 },
    { month: 'Mar', revenue: 450000 },
    { month: 'Apr', revenue: 420000 },
    { month: 'May', revenue: 490000 },
    { month: 'Jun', revenue: 520000 },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 215 },
    { month: 'Feb', users: 285 },
    { month: 'Mar', users: 340 },
    { month: 'Apr', users: 298 },
    { month: 'May', users: 385 },
    { month: 'Jun', users: 420 },
  ];

  const attendanceDistributionData = [
    { name: '90-100%', value: 342, color: '#10B981' },
    { name: '80-89%', value: 456, color: '#22D3EE' },
    { name: '70-79%', value: 289, color: '#F59E0B' },
    { name: 'Below 70%', value: 125, color: '#EF4444' },
  ];

  const coursePopularityData = [
    { course: 'A/L ICT', students: 456 },
    { course: 'A/L Math', students: 389 },
    { course: 'A/L Physics', students: 342 },
    { course: 'A/L Chemistry', students: 298 },
    { course: 'A/L Biology', students: 267 },
  ];

  const handleGenerateReport = () => {
    const newReport: GeneratedReport = {
      id: generatedReports.length + 1,
      name: `${reportType} – ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      type: reportType,
      generatedBy: 'Admin',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      format: 'PDF',
    };
    setGeneratedReports([newReport, ...generatedReports]);
    alert('Report generated successfully!');
  };

  const handleExportPDF = () => {
    alert('Exporting report as PDF...');
  };

  const handleExportExcel = () => {
    alert('Exporting report as Excel...');
  };

  const handleViewReport = (report: GeneratedReport) => {
    onNavigate?.('view-report');
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    alert(`Downloading report: ${report.name}`);
  };

  const handleDeleteReport = (reportId: number) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setGeneratedReports(generatedReports.filter((r) => r.id !== reportId));
      alert('Report deleted successfully!');
    }
  };

  return (
    <DashboardLayout userRole="admin" activePage="report-generation" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Report Generation</h1>
            <p className="text-white/60">Generate and export system analytics reports.</p>
          </div>
        </div>

        {/* Report Generator Panel */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Generate Report</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors hover:bg-[#1e293b] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  appearance: 'none',
                }}
              >
                <option value="User Report" className="bg-[#0f172a] text-[#e2e8f0]">User Report</option>
                <option value="Revenue Report" className="bg-[#0f172a] text-[#e2e8f0]">Revenue Report</option>
                <option value="Payment Report" className="bg-[#0f172a] text-[#e2e8f0]">Payment Report</option>
                <option value="Attendance Report" className="bg-[#0f172a] text-[#e2e8f0]">Attendance Report</option>
                <option value="Course Performance Report" className="bg-[#0f172a] text-[#e2e8f0]">Course Performance Report</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Class Filter</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors hover:bg-[#1e293b] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  appearance: 'none',
                }}
              >
                <option value="All Classes" className="bg-[#0f172a] text-[#e2e8f0]">All Classes</option>
                <option value="A/L ICT 2026" className="bg-[#0f172a] text-[#e2e8f0]">A/L ICT 2026</option>
                <option value="A/L Mathematics 2026" className="bg-[#0f172a] text-[#e2e8f0]">A/L Mathematics 2026</option>
                <option value="A/L Physics 2026" className="bg-[#0f172a] text-[#e2e8f0]">A/L Physics 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">User Role Filter</label>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors hover:bg-[#1e293b] cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  appearance: 'none',
                }}
              >
                <option value="All Users" className="bg-[#0f172a] text-[#e2e8f0]">All Users</option>
                <option value="Students" className="bg-[#0f172a] text-[#e2e8f0]">Students</option>
                <option value="Teachers" className="bg-[#0f172a] text-[#e2e8f0]">Teachers</option>
                <option value="Staff" className="bg-[#0f172a] text-[#e2e8f0]">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-[#e2e8f0] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] hover:translate-y-[-2px] transition-all duration-300"
            >
              <FileText size={20} />
              Generate Report
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-red-400/30 hover:text-red-400 transition-all duration-300"
            >
              <FileText size={20} />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-green-400/30 hover:text-green-400 transition-all duration-300"
            >
              <FileSpreadsheet size={20} />
              Export Excel
            </button>
          </div>
        </GlassCard>

        {/* Report Statistics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <DollarSign className="text-cyan-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+18%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">LKR 4,560,000</h3>
            <p className="text-white/60 text-sm">Total Revenue</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Users className="text-purple-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+12%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">2,847</h3>
            <p className="text-white/60 text-sm">Total Users</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Calendar className="text-green-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+5%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">82%</h3>
            <p className="text-white/60 text-sm">Attendance Rate</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <BookOpen className="text-orange-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+3</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">36</h3>
            <p className="text-white/60 text-sm">Active Courses</p>
          </GlassCard>
        </div>

        {/* Generated Reports Table */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Generated Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Report Name</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Type</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Generated By</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Date</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Format</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {generatedReports.map((report) => (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-white font-semibold">{report.name}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/80">{report.generatedBy}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60">{report.date}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          report.format === 'PDF'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {report.format}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgba(30,41,59,0.6)] text-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:bg-blue-500/20 transition-all duration-300"
                          title="View Report"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgba(30,41,59,0.6)] text-green-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] hover:bg-green-500/20 transition-all duration-300"
                          title="Download Report"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgba(30,41,59,0.6)] text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] hover:bg-red-500/20 transition-all duration-300"
                          title="Delete Report"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Analytics Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Revenue Trend */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid key="grid-revenue-trend" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis key="xaxis-revenue-trend" dataKey="month" stroke="rgba(255,255,255,0.4)" />
                <YAxis key="yaxis-revenue-trend" stroke="rgba(255,255,255,0.4)" />
                <Tooltip
                  key="tooltip-revenue-trend"
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 26, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  key="line-revenue-trend"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  dot={{ fill: '#22D3EE', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* User Growth */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid key="grid-user-growth" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis key="xaxis-user-growth" dataKey="month" stroke="rgba(255,255,255,0.4)" />
                <YAxis key="yaxis-user-growth" stroke="rgba(255,255,255,0.4)" />
                <Tooltip
                  key="tooltip-user-growth"
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 26, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar key="bar-user-growth" dataKey="users" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Optional Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Attendance Distribution */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Attendance Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceDistributionData.map((entry, index) => (
                    <Cell key={`cell-attendance-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 26, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {attendanceDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/80 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{item.value} students</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Course Popularity */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Course Popularity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePopularityData} layout="vertical">
                <CartesianGrid key="grid-course-pop" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis key="xaxis-course-pop" type="number" stroke="rgba(255,255,255,0.4)" />
                <YAxis key="yaxis-course-pop" type="category" dataKey="course" stroke="rgba(255,255,255,0.4)" />
                <Tooltip
                  key="tooltip-course-pop"
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 26, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar key="bar-course-pop" dataKey="students" fill="#A855F7" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}