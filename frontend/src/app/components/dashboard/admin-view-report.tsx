import React from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdminViewReportProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
  reportData?: {
    name: string;
    type: string;
    generatedBy: string;
    date: string;
    format: string;
  };
}

interface PaymentData {
  id: number;
  student: string;
  class: string;
  amount: number;
  paymentDate: string;
  status: 'Paid' | 'Pending' | 'Rejected';
}

export function AdminViewReport({ onLogout, onNavigate, reportData }: AdminViewReportProps) {
  // Default report data if none provided
  const report = reportData || {
    name: 'Revenue Report — March 2026',
    type: 'Revenue Report',
    generatedBy: 'Admin',
    date: 'Mar 15, 2026',
    format: 'PDF',
  };

  // Revenue trend data
  const revenueTrendData = [
    { month: 'Jan', revenue: 320000 },
    { month: 'Feb', revenue: 380000 },
    { month: 'Mar', revenue: 450000 },
    { month: 'Apr', revenue: 420000 },
    { month: 'May', revenue: 490000 },
    { month: 'Jun', revenue: 520000 },
  ];

  // Payment data for table
  const paymentData: PaymentData[] = [
    {
      id: 1,
      student: 'Kasun Perera',
      class: 'A/L ICT 2026',
      amount: 3500,
      paymentDate: 'Mar 15, 2026',
      status: 'Paid',
    },
    {
      id: 2,
      student: 'Nimali Silva',
      class: 'A/L Mathematics 2026',
      amount: 4200,
      paymentDate: 'Mar 14, 2026',
      status: 'Paid',
    },
    {
      id: 3,
      student: 'Tharindu Fernando',
      class: 'A/L Physics 2026',
      amount: 3800,
      paymentDate: 'Mar 13, 2026',
      status: 'Pending',
    },
    {
      id: 4,
      student: 'Shalini Jayawardena',
      class: 'A/L ICT 2026',
      amount: 3500,
      paymentDate: 'Mar 12, 2026',
      status: 'Paid',
    },
    {
      id: 5,
      student: 'Ravindu Bandara',
      class: 'A/L Mathematics 2026',
      amount: 4200,
      paymentDate: 'Mar 11, 2026',
      status: 'Paid',
    },
    {
      id: 6,
      student: 'Malini Rajapakse',
      class: 'A/L Physics 2026',
      amount: 3800,
      paymentDate: 'Mar 10, 2026',
      status: 'Rejected',
    },
    {
      id: 7,
      student: 'Chamath Silva',
      class: 'A/L ICT 2026',
      amount: 3500,
      paymentDate: 'Mar 09, 2026',
      status: 'Paid',
    },
    {
      id: 8,
      student: 'Dilini Perera',
      class: 'A/L Mathematics 2026',
      amount: 4200,
      paymentDate: 'Mar 08, 2026',
      status: 'Pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-400';
      case 'Pending':
        return 'bg-orange-500/20 text-orange-400';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleDownloadPDF = () => {
    alert('Downloading report as PDF...');
  };

  const handleDownloadExcel = () => {
    alert('Downloading report as Excel...');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <DashboardLayout userRole="admin" activePage="report-generation" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Report Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate?.('report-generation')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Reports</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Report Preview</h1>
              <p className="text-white/60">View analytics data and export reports.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-red-400/30 hover:text-red-400 transition-all duration-300"
              >
                <FileText size={18} />
                Download PDF
              </button>
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-green-400/30 hover:text-green-400 transition-all duration-300"
              >
                <FileSpreadsheet size={18} />
                Download Excel
              </button>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
              >
                <Printer size={18} />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Information Card */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Report Details</h2>
          <div className="grid grid-cols-5 gap-6">
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-1">Report Name</label>
              <p className="text-white font-semibold">{report.name}</p>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-1">Report Type</label>
              <p className="text-white">{report.type}</p>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-1">Generated By</label>
              <p className="text-white">{report.generatedBy}</p>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-1">Generated Date</label>
              <p className="text-white">{report.date}</p>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-1">Format</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  report.format === 'PDF' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}
              >
                {report.format}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Report Summary Stats */}
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
                <CreditCard className="text-purple-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+12%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">1,243</h3>
            <p className="text-white/60 text-sm">Total Payments</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+2%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">98%</h3>
            <p className="text-white/60 text-sm">Successful Payments</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <Clock className="text-orange-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-orange-400 text-sm">
                <TrendingUp size={16} />
                <span>+5</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">23</h3>
            <p className="text-white/60 text-sm">Pending Payments</p>
          </GlassCard>
        </div>

        {/* Analytics Chart */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid key="grid-view-report" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis key="xaxis-view-report" dataKey="month" stroke="rgba(255,255,255,0.4)" />
              <YAxis key="yaxis-view-report" stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                key="tooltip-view-report"
                contentStyle={{
                  backgroundColor: 'rgba(11, 15, 26, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line
                key="line-view-report"
                type="monotone"
                dataKey="revenue"
                stroke="#22D3EE"
                strokeWidth={3}
                dot={{ fill: '#22D3EE', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Report Data Table */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Payment Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Student</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Class</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Amount</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Payment Date</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-white font-medium">{payment.student}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/80">{payment.class}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white font-semibold">LKR {payment.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60">{payment.paymentDate}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
