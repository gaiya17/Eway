import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft, TrendingUp, DollarSign, AlertTriangle, Shield,
  FileText, FileSpreadsheet, RefreshCw, Filter,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { exportToPDF, exportToExcel } from '../../utils/report-exports';

interface AdminReportGenerationProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('eway_token') || '';

const TABS = [
  { id: 'financial', label: 'Financial Analytics', icon: DollarSign, color: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-400' },
  { id: 'enrollment', label: 'Enrollment Growth', icon: TrendingUp, color: 'from-purple-500/20 to-indigo-500/20', text: 'text-purple-400' },
  { id: 'leakage', label: 'Revenue Leakage', icon: AlertTriangle, color: 'from-orange-500/20 to-red-500/20', text: 'text-orange-400' },
  { id: 'security', label: 'Security & Audit', icon: Shield, color: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400' },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(11,15,26,0.97)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

export function AdminReportGeneration({ onLogout, onNavigate }: AdminReportGenerationProps) {
  const [activeTab, setActiveTab] = useState('financial');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [classFilter, setClassFilter] = useState('all');        // filter by specific class
  const [subjectFilter, setSubjectFilter] = useState('all');    // filter by subject
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');

  // Dynamic class list (fetched from API)
  const [classes, setClasses] = useState<{ id: string; title: string; subject: string }[]>([]);

  // Data states
  const [financial, setFinancial] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [leakage, setLeakage] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch all approved classes for the dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API}/api/classes/approved`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Accept any class array structure
          const list = Array.isArray(data) ? data : (data.classes || data.data || []);
          setClasses(
            list
              .filter((c: any) => c.status === 'approved')
              .map((c: any) => ({ id: c.id, title: c.title, subject: c.subject || '' }))
          );
        }
      } catch (e) { console.error('Failed to fetch classes', e); }
    };
    fetchClasses();
  }, []);

  // Derive unique subjects from loaded classes
  const subjects = ['all', ...Array.from(new Set(classes.map(c => c.subject).filter(Boolean)))];


  const fetchFinancial = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        subject: subjectFilter,
        payment_method: paymentMethod,
        class_id: classFilter
      });

      const res = await fetch(`${API}/api/reports/admin/financial?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setFinancial(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchEnrollment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/admin/enrollment-growth?start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setEnrollment(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchLeakage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/admin/revenue-leakage?class_id=${classFilter}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setLeakage(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };


  const fetchSecurity = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action_type: actionTypeFilter, start: startDate, end: endDate });
      const res = await fetch(`${API}/api/reports/admin/security-logs?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setSecurityLogs(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'financial') fetchFinancial();
    else if (activeTab === 'enrollment') fetchEnrollment();
    else if (activeTab === 'leakage') fetchLeakage();
    else if (activeTab === 'security') fetchSecurity();
  }, [activeTab, startDate, endDate, subjectFilter, paymentMethod, classFilter, actionTypeFilter]);


  const handleExportFinancialPDF = () => {
    if (!financial) return;
    const headers = ['Month', 'Revenue (LKR)'];
    const rows = (financial.monthlyTrend || []).map((m: any) => [m.month, m.revenue.toLocaleString()]);
    exportToPDF(
      'Financial Analytics Report',
      `${startDate} to ${endDate}`,
      headers, rows,
      undefined,
      'EWAY_Financial_Report'
    );
  };

  const handleExportLeakagePDF = () => {
    if (!leakage) return;
    exportToPDF(
      'Revenue Leakage Report',
      `Generated on ${new Date().toLocaleDateString()}`,
      ['Student', 'Class', 'Amount Paid', 'Class Price', 'Status', 'Enrolled Date'],
      (leakage.leakage || []).map((l: any) => [
        l.studentName, l.className,
        `LKR ${l.paidAmount.toLocaleString()}`, `LKR ${l.classPrice.toLocaleString()}`,
        l.paymentStatus, new Date(l.enrolledDate).toLocaleDateString()
      ]),
      undefined, 'EWAY_Revenue_Leakage'
    );
  };

  const handleExportEnrollmentExcel = () => {
    if (!enrollment) return;
    exportToExcel('EWAY_Enrollment_Growth', [{
      name: 'Enrollment Growth',
      headers: ['Month', 'New Students'],
      rows: (enrollment.trend || []).map((m: any) => [m.month, m.students]),
    }]);
  };

  const handleExportSecurityPDF = () => {
    exportToPDF(
      'Security & Audit Log',
      `Generated on ${new Date().toLocaleDateString()}`,
      ['Timestamp', 'User', 'Action', 'IP Address', 'Previous Value', 'New Value'],
      securityLogs.map((l: any) => [
        new Date(l.created_at).toLocaleString(),
        l.profiles ? `${l.profiles.first_name} ${l.profiles.last_name}` : 'System',
        l.action_type,
        l.ip_address || '-',
        l.old_value ? JSON.stringify(l.old_value).substring(0, 30) : '-',
        l.new_value ? JSON.stringify(l.new_value).substring(0, 30) : '-',
      ]),
      undefined, 'EWAY_Audit_Log'
    );
  };

  return (
    <DashboardLayout userRole="admin" activePage="report-generation" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} /><span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Executive Command Center</h1>
              <p className="text-white/60">Full institutional visibility — Financial, Growth, Compliance & Security</p>
            </div>
            <button onClick={() => {
              if (activeTab === 'financial') fetchFinancial();
              else if (activeTab === 'enrollment') fetchEnrollment();
              else if (activeTab === 'leakage') fetchLeakage();
              else fetchSecurity();
            }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} ${tab.text} shadow-lg`
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Range & Filters */}
        <GlassCard className="p-5 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={16} className="text-white/40" />
            <div className="flex items-center gap-2">
              <label className="text-white/60 text-sm">From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 bg-[#0f172a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white/60 text-sm">To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 bg-[#0f172a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            {activeTab === 'financial' && (
              <>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[180px] bg-[#0f172a] border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[150px] bg-[#0f172a] border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                    {subjects.map(subj => (
                      <SelectItem key={subj} value={subj}>
                        {subj === 'all' ? 'All Subjects' : subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-[150px] bg-[#0f172a] border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {activeTab === 'security' && (
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="w-[200px] bg-[#0f172a] border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="PAYMENT_APPROVE">PAYMENT_APPROVE</SelectItem>
                  <SelectItem value="PAYMENT_REJECT">PAYMENT_REJECT</SelectItem>
                  <SelectItem value="PAYMENT_DELETE">PAYMENT_DELETE</SelectItem>
                  <SelectItem value="ROLE_CHANGE">ROLE_CHANGE</SelectItem>
                  <SelectItem value="USER_DELETE">USER_DELETE</SelectItem>
                  <SelectItem value="CLASS_STATUS_CHANGE">CLASS_STATUS_CHANGE</SelectItem>
                </SelectContent>
              </Select>
            )}

            <button onClick={() => {
              if (activeTab === 'financial') fetchFinancial();
              else if (activeTab === 'enrollment') fetchEnrollment();
              else if (activeTab === 'security') fetchSecurity();
            }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
              Apply Filters
            </button>
          </div>
        </GlassCard>

        {/* ── TAB: Financial Analytics ── */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: financial ? `LKR ${Number(financial.totalRevenue || 0).toLocaleString()}` : '—', icon: DollarSign, color: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-400' },
                { label: 'Study Pack Revenue', value: financial ? `LKR ${Number(financial.studyPackRevenue || 0).toLocaleString()}` : '—', icon: TrendingUp, color: 'from-purple-500/20 to-indigo-500/20', text: 'text-purple-400' },
                { label: 'Outstanding', value: financial ? `LKR ${Number(financial.outstanding || 0).toLocaleString()}` : '—', icon: AlertTriangle, color: 'from-orange-500/20 to-red-500/20', text: 'text-orange-400' },
                { label: 'Class Fee Revenue', value: financial ? `LKR ${Number(financial.classFeeRevenue || 0).toLocaleString()}` : '—', icon: DollarSign, color: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400' },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <GlassCard key={i} className="p-5">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${kpi.color} mb-3`}>
                      <Icon className={kpi.text} size={22} />
                    </div>
                    <p className="text-2xl font-bold text-white">{kpi.value}</p>
                    <p className="text-white/60 text-sm mt-1">{kpi.label}</p>
                  </GlassCard>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" ref={chartRef}>
              {/* Revenue Trend Line Chart */}
              <GlassCard className="p-6 lg:col-span-2">
                <h3 className="text-white font-bold text-lg mb-4">Revenue Growth Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={financial?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`LKR ${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#22D3EE" strokeWidth={3} dot={{ fill: '#22D3EE', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Revenue Split Pie */}
              <GlassCard className="p-6">
                <h3 className="text-white font-bold text-lg mb-4">Revenue Split</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={financial?.revenueSplit || []} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {(financial?.revenueSplit || []).map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`LKR ${v.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {(financial?.revenueSplit || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-white/70 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white text-sm font-semibold">LKR {Number(item.value || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Export */}
            <div className="flex gap-3">
              <button onClick={handleExportFinancialPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] transition-all">
                <FileText size={18} />Export Executive PDF
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Enrollment Growth ── */}
        {activeTab === 'enrollment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-6">
                <p className="text-white/60 text-sm mb-1">Total Students</p>
                <p className="text-4xl font-bold text-white">{enrollment?.totalStudents ?? '—'}</p>
              </GlassCard>
              <GlassCard className="p-6">
                <p className="text-white/60 text-sm mb-1">New This Month</p>
                <p className="text-4xl font-bold text-purple-400">
                  {enrollment?.trend ? (enrollment.trend[enrollment.trend.length - 1]?.students ?? '—') : '—'}
                </p>
              </GlassCard>
            </div>
            <GlassCard className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">Monthly Enrollment Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollment?.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="students" fill="url(#enrollGrad)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            <button onClick={handleExportEnrollmentExcel}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.5)] transition-all">
              <FileSpreadsheet size={18} />Export Enrollment Excel
            </button>
          </div>
        )}

        {/* ── TAB: Revenue Leakage ── */}
        {activeTab === 'leakage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-6 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-orange-500/20"><AlertTriangle className="text-orange-400" size={20} /></div>
                  <span className="text-orange-400 font-semibold">Total Leakage</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  LKR {Number(leakage?.totalLeakage || 0).toLocaleString()}
                </p>
                <p className="text-white/60 text-sm mt-1">Revenue at risk from pending/rejected payments</p>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-red-500/20"><AlertTriangle className="text-red-400" size={20} /></div>
                  <span className="text-red-400 font-semibold">Affected Students</span>
                </div>
                <p className="text-3xl font-bold text-white">{(leakage?.leakage || []).length}</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">Revenue Leakage — Enrolled Without Approved Payment</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Student', 'ID', 'Class', 'Class Price', 'Paid', 'Status', 'Enrolled'].map(h => (
                        <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(leakage?.leakage || []).map((row: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 text-white font-medium text-sm">{row.studentName}</td>
                        <td className="py-3 pr-4 text-white/60 text-sm font-mono">{row.studentId}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">{row.className}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">LKR {Number(row.classPrice).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">LKR {Number(row.paidAmount).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {row.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-white/60 text-sm">{new Date(row.enrolledDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(leakage?.leakage || []).length === 0 && (
                      <tr><td colSpan={7} className="py-10 text-center text-white/40">No revenue leakage detected ✓</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            <button onClick={handleExportLeakagePDF}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(249,115,22,0.5)] transition-all">
              <FileText size={18} />Export Leakage PDF
            </button>
          </div>
        )}

        {/* ── TAB: Security & Audit ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <GlassCard className="p-5">
                <p className="text-white/60 text-sm mb-1">Total Log Entries</p>
                <p className="text-3xl font-bold text-white">{securityLogs.length}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-white/60 text-sm mb-1">Payment Actions</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {securityLogs.filter(l => l.action_type?.startsWith('PAYMENT')).length}
                </p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-white/60 text-sm mb-1">Role/User Changes</p>
                <p className="text-3xl font-bold text-orange-400">
                  {securityLogs.filter(l => l.action_type?.includes('ROLE') || l.action_type?.includes('USER')).length}
                </p>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">Audit Log — System Actions</h3>
              {securityLogs.length === 0 && (
                <div className="text-center py-12">
                  <Shield size={40} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No audit entries found for the selected filters.</p>
                  <p className="text-white/30 text-sm mt-1">Run the SQL migration in Supabase to enable audit logging.</p>
                </div>
              )}
              {securityLogs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Timestamp', 'User', 'Role', 'Action', 'IP Address', 'Previous', 'New Value'].map(h => (
                          <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {securityLogs.map((log: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-4 text-white/60 text-xs font-mono">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-3 pr-4 text-white text-sm">{log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'System'}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{log.profiles?.role || '—'}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 font-mono">{log.action_type}</span>
                          </td>
                          <td className="py-3 pr-4 text-white/60 text-xs font-mono">{log.ip_address || '—'}</td>
                          <td className="py-3 pr-4 text-white/60 text-xs">{log.old_value ? JSON.stringify(log.old_value).substring(0, 20) : '—'}</td>
                          <td className="py-3 text-white/60 text-xs">{log.new_value ? JSON.stringify(log.new_value).substring(0, 20) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
            <button onClick={handleExportSecurityPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.5)] transition-all">
              <FileText size={18} />Export Audit Log PDF
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
