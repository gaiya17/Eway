import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { CustomDropdown } from '../custom-dropdown';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  AlertCircle,
  BarChart3,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ReportsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface Report {
  id: string;
  reportName: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
}

export function ReportsPage({ onLogout, onNavigate }: ReportsPageProps) {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [reports] = useState<Report[]>([
    {
      id: '1',
      reportName: 'Monthly Payment Summary - March 2026',
      type: 'Payment Report',
      generatedDate: 'March 10, 2026',
      generatedBy: 'Ms. Silva',
    },
    {
      id: '2',
      reportName: 'Attendance Report - A/L ICT',
      type: 'Attendance Report',
      generatedDate: 'March 9, 2026',
      generatedBy: 'Mr. Fernando',
    },
    {
      id: '3',
      reportName: 'Student Cards Issued - February',
      type: 'Student Card Report',
      generatedDate: 'March 1, 2026',
      generatedBy: 'Ms. Silva',
    },
    {
      id: '4',
      reportName: 'Payment Report - Q1 2026',
      type: 'Payment Report',
      generatedDate: 'February 28, 2026',
      generatedBy: 'Ms. Silva',
    },
  ]);

  // Payment Overview Data (Bar Chart)
  const paymentData = [
    { month: 'Jan', amount: 1850000 },
    { month: 'Feb', amount: 2100000 },
    { month: 'Mar', amount: 2350000 },
    { month: 'Apr', amount: 1950000 },
    { month: 'May', amount: 2200000 },
    { month: 'Jun', amount: 2450000 },
  ];

  // Attendance Trends Data (Line Chart)
  const attendanceData = [
    { week: 'Week 1', attendance: 78 },
    { week: 'Week 2', attendance: 82 },
    { week: 'Week 3', attendance: 75 },
    { week: 'Week 4', attendance: 88 },
    { week: 'Week 5', attendance: 85 },
    { week: 'Week 6', attendance: 82 },
  ];

  const handleGenerateReport = () => {
    if (!reportType || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Report generated successfully!');
  };

  const handleExportPDF = () => {
    alert('Exporting as PDF... (Feature coming soon)');
  };

  const handleExportExcel = () => {
    alert('Exporting as Excel... (Feature coming soon)');
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDownloadPDF = (report: Report) => {
    setSelectedReport(report);
    setShowPDFModal(true);
  };

  const handleDownloadExcel = (report: Report) => {
    setSelectedReport(report);
    setShowExcelModal(true);
  };

  const handleModalClose = () => {
    setShowViewModal(false);
    setShowPDFModal(false);
    setShowExcelModal(false);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <DashboardLayout
      userRole="staff"
      userName="Ms. Silva"
      userInitials="MS"
      notificationCount={5}
      breadcrumb="Reports"
      activePage="reports"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
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
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-white/60">Generate and export system reports</p>
      </div>

      {/* Report Generator Panel */}
      <GlassCard className="p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText size={24} />
          Generate Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CustomDropdown
            value={reportType}
            onChange={setReportType}
            options={[
              { value: '', label: 'Select report type...' },
              { value: 'payment', label: 'Payment Report' },
              { value: 'attendance', label: 'Attendance Report' },
              { value: 'student-card', label: 'Student Card Report' },
            ]}
            placeholder="Select report type..."
            label={
              <>
                Report Type <span className="text-red-400">*</span>
              </>
            }
          />

          <CustomDropdown
            value={classFilter}
            onChange={setClassFilter}
            options={[
              { value: '', label: 'All Classes' },
              { value: 'A/L ICT 2026', label: 'A/L ICT 2026' },
              { value: 'A/L Mathematics 2026', label: 'A/L Mathematics 2026' },
              { value: 'A/L Physics 2026', label: 'A/L Physics 2026' },
              { value: 'O/L Science 2026', label: 'O/L Science 2026' },
              { value: 'O/L Mathematics 2026', label: 'O/L Mathematics 2026' },
            ]}
            placeholder="All Classes"
            label="Class Filter"
          />

          <div>
            <label className="block text-white/60 text-sm mb-2">
              Start Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">
              End Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateReport}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
          >
            <FileText size={18} />
            Generate Report
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold flex items-center gap-2 border border-white/10"
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold flex items-center gap-2 border border-white/10"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>
      </GlassCard>

      {/* Report Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <DollarSign className="text-green-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>+12%</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Total Payments</h3>
          <p className="text-2xl font-bold text-white">LKR 2,350,000</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <BarChart3 className="text-blue-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-sm">
              <TrendingUp size={16} />
              <span>+5%</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Attendance Rate</h3>
          <p className="text-2xl font-bold text-white">82%</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <CreditCard className="text-cyan-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-cyan-400 text-sm">
              <TrendingUp size={16} />
              <span>+24</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Cards Issued</h3>
          <p className="text-2xl font-bold text-white">342</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <AlertCircle className="text-orange-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-orange-400 text-sm">
              <span>-3</span>
            </div>
          </div>
          <h3 className="text-white/60 text-sm mb-1">Pending Payments</h3>
          <p className="text-2xl font-bold text-white">12</p>
        </GlassCard>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payments Overview */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Payments Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentData}>
              <CartesianGrid key="bar-grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                key="bar-xaxis"
                dataKey="month"
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                key="bar-yaxis"
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                key="bar-tooltip"
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Amount']}
              />
              <Bar
                key="bar-amount"
                dataKey="amount"
                fill="url(#paymentsBarGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs key="paymentsBarGradientDef">
                <linearGradient id="paymentsBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop key="payments-start" offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop key="payments-end" offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Attendance Trends */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Attendance Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid key="line-grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                key="line-xaxis"
                dataKey="week"
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                key="line-yaxis"
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                key="line-tooltip"
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`${value}%`, 'Attendance']}
              />
              <Line
                key="line-attendance"
                type="monotone"
                dataKey="attendance"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ fill: '#22d3ee', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Recent Reports Table */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Reports</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Report Name
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Type
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Generated Date
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Generated By
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <FileText className="text-blue-400" size={20} />
                      </div>
                      <span className="text-white font-medium">
                        {report.reportName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      {report.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white/70">{report.generatedDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white/70">{report.generatedBy}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:shadow-[0_0_16px_rgba(59,130,246,0.5)] transition-all duration-300"
                        title="View Report"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(report)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-[0_0_16px_rgba(239,68,68,0.5)] transition-all duration-300"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadExcel(report)}
                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:shadow-[0_0_16px_rgba(34,197,94,0.5)] transition-all duration-300"
                        title="Download Excel"
                      >
                        <FileSpreadsheet size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40 text-lg">No reports found</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[modalFadeIn_0.2s_ease-out]">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-[modalScaleIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Eye className="text-blue-400" size={24} />
                </div>
                Report Preview
              </h2>
              <button
                onClick={handleModalClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Report Info Section */}
            <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Report Title</p>
                  <p className="text-white font-semibold">{selectedReport.reportName}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Report Type</p>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 inline-block">
                    {selectedReport.type}
                  </span>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Generated Date</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar size={16} className="text-cyan-400" />
                    {selectedReport.generatedDate}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Class Name</p>
                  <p className="text-white">A/L ICT 2026</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Date Range</p>
                  <p className="text-white">March 1 - March 31, 2026</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Generated By</p>
                  <p className="text-white">{selectedReport.generatedBy}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-400" size={20} />
                  <p className="text-green-400 text-sm font-semibold">Total Payments</p>
                </div>
                <p className="text-white text-xl font-bold">LKR 2,350,000</p>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="text-blue-400" size={20} />
                  <p className="text-blue-400 text-sm font-semibold">Attendance Rate</p>
                </div>
                <p className="text-white text-xl font-bold">82%</p>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="text-cyan-400" size={20} />
                  <p className="text-cyan-400 text-sm font-semibold">Cards Issued</p>
                </div>
                <p className="text-white text-xl font-bold">342</p>
              </div>
              <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-orange-400" size={20} />
                  <p className="text-orange-400 text-sm font-semibold">Pending</p>
                </div>
                <p className="text-white text-xl font-bold">12</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-white font-semibold mb-4">Report Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/60 pb-3 pr-4">Student Name</th>
                      <th className="text-left text-white/60 pb-3 pr-4">Class</th>
                      <th className="text-left text-white/60 pb-3 pr-4">Amount</th>
                      <th className="text-left text-white/60 pb-3 pr-4">Date</th>
                      <th className="text-left text-white/60 pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">Kasun Perera</td>
                      <td className="py-3 pr-4 text-white/70">A/L ICT 2026</td>
                      <td className="py-3 pr-4 text-white">LKR 15,000</td>
                      <td className="py-3 pr-4 text-white/70">March 5, 2026</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">Nimal Silva</td>
                      <td className="py-3 pr-4 text-white/70">A/L ICT 2026</td>
                      <td className="py-3 pr-4 text-white">LKR 15,000</td>
                      <td className="py-3 pr-4 text-white/70">March 8, 2026</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">Saman Fernando</td>
                      <td className="py-3 pr-4 text-white/70">A/L ICT 2026</td>
                      <td className="py-3 pr-4 text-white">LKR 15,000</td>
                      <td className="py-3 pr-4 text-white/70">March 10, 2026</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-500/20 text-orange-400">
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleModalClose}
                className="px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleModalClose();
                  if (selectedReport) handleDownloadPDF(selectedReport);
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={() => {
                  handleModalClose();
                  if (selectedReport) handleDownloadExcel(selectedReport);
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <FileSpreadsheet size={18} />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download PDF Modal */}
      {showPDFModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[modalFadeIn_0.2s_ease-out]">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-md w-full animate-[modalScaleIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <Download className="text-red-400" size={24} />
                </div>
                Download PDF Report
              </h2>
              <button
                onClick={handleModalClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">Report Name</p>
                <p className="text-white font-semibold mb-3">{selectedReport.reportName}</p>
                <p className="text-white/60 text-sm mb-1">File Format</p>
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 inline-block">
                  PDF
                </span>
              </div>
              <p className="text-white/70 text-center">
                Your report is ready to download.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleModalClose}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleModalClose();
                  setToastMessage('PDF report downloaded successfully!');
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Excel Modal */}
      {showExcelModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[modalFadeIn_0.2s_ease-out]">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-md w-full animate-[modalScaleIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <FileSpreadsheet className="text-green-400" size={24} />
                </div>
                Export Excel Report
              </h2>
              <button
                onClick={handleModalClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">Report Name</p>
                <p className="text-white font-semibold mb-3">{selectedReport.reportName}</p>
                <p className="text-white/60 text-sm mb-1">File Format</p>
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 inline-block">
                  Excel
                </span>
              </div>
              <p className="text-white/70 text-center">
                Export this report as an Excel spreadsheet.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleModalClose}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleModalClose();
                  setToastMessage('Excel report exported successfully!');
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 bg-[#0B0F1A] border border-green-500/30 rounded-xl shadow-[0_0_24px_rgba(34,197,94,0.3)] p-4 flex items-center gap-3 z-50 animate-[slideInRight_0.3s_ease-out]">
          <div className="p-2 rounded-lg bg-green-500/20">
            <CheckCircle size={20} className="text-green-400" />
          </div>
          <p className="text-white font-medium">{toastMessage}</p>
          <button
            onClick={handleToastClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XCircle size={18} className="text-white/60" />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
