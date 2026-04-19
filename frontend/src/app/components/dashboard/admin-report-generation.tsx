import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft, TrendingUp, DollarSign, AlertTriangle, Shield,
  FileText, FileSpreadsheet, RefreshCw, Filter, Eye, Activity, Users, Server, X
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
import { exportToPDF, exportToExcel, exportToCSV } from '../../utils/report-exports';

interface AdminReportGenerationProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('eway_token') || '';

const TABS = [
  { id: 'financial', label: 'Financial Analytics', icon: DollarSign, color: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-400' },
  { id: 'enrollment', label: 'Enrollment Growth', icon: TrendingUp, color: 'from-purple-500/20 to-indigo-500/20', text: 'text-purple-400' },
  { id: 'payouts', label: 'Teacher Payouts', icon: DollarSign, color: 'from-orange-500/20 to-yellow-500/20', text: 'text-orange-400' },
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
  const [enrollmentUserFilter, setEnrollmentUserFilter] = useState('all');

  // Dynamic class list (fetched from API)
  const [classes, setClasses] = useState<{ id: string; title: string; subject: string }[]>([]);

  // Data states
  const [financial, setFinancial] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [payoutsData, setPayoutsData] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [payoutTeacherFilter, setPayoutTeacherFilter] = useState('');
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [payoutNotes, setPayoutNotes] = useState('');
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<any>(null);

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
              .map((c: any) => ({ id: c.id, title: c.title, subject: c.subject || '', teacher_id: c.teacher_id || '' }))
          );
        }
      } catch (e) { console.error('Failed to fetch classes', e); }
    };
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API}/api/users/students`, { headers: { Authorization: `Bearer ${getToken()}` } }); // Temporary, we'll fetch profiles by role='teacher' or just use classes. wait, user.js has no /teachers endpoint... let's just use profiles where role='teacher' in our fetch. Wait, I should make a generic fetch to profiles or add a route! Let's fetch classes and derive teachers if needed, or better, we can query Supabase directly but this is frontend. I will add the /teachers route next. Let me assume /api/users/teachers exists for now.
        // Wait, the API doesn't have /api/users/teachers. I will just query /api/classes/approved and derive the teacher list if none available? No, I will add it to user.js. Let's assume fetch(`${API}/api/users/teachers`) works because I will add it.
        const tres = await fetch(`${API}/api/users/teachers`, { headers: { Authorization: `Bearer ${getToken()}` } });
        if (tres.ok) setTeachers(await tres.json());
      } catch(e) { console.error(e); }
    }
    fetchClasses();
    fetchTeachers();
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
      const res = await fetch(`${API}/api/reports/admin/enrollment-growth?start=${startDate}&end=${endDate}&role=${enrollmentUserFilter}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setEnrollment(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchPayouts = async () => {
    if (!payoutTeacherFilter) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/admin/payout-preview?teacher_id=${payoutTeacherFilter}&class_id=${classFilter}&start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setPayoutsData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleProcessPayout = async () => {
    if (!payoutTeacherFilter || !payoutsData) return;
    try {
      const netPayout = payoutsData.netPayout - otherDeductions;
      const res = await fetch(`${API}/api/reports/admin/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          teacher_id: payoutTeacherFilter,
          class_id: classFilter,
          start: startDate,
          end: endDate,
          gross_revenue: payoutsData.grossRevenue,
          institute_commission: payoutsData.instituteCommission,
          other_deductions: otherDeductions,
          net_payout: netPayout,
          notes: payoutNotes
        })
      });
      if (res.ok) {
        alert('Payout successfully processed and logged!');
        fetchPayouts(); // Refresh preview
      } else {
        alert('Failed to process payout.');
      }
    } catch (e) {
      console.error(e);
      alert('Error processing payout.');
    }
  };

  const handleGeneratePayslip = () => {
    if (!payoutsData || !payoutTeacherFilter) return;
    const selectedTeacher = teachers.find(t => t.id === payoutTeacherFilter);
    const teacherName = selectedTeacher ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}` : 'Teacher';
    const netPayout = payoutsData.netPayout - otherDeductions;

    const headers = ['Description', 'Amount (LKR)'];
    const rows = [
      ['Total Gross Revenue', payoutsData.grossRevenue.toLocaleString()],
      ['Institute Commission (-)', payoutsData.instituteCommission.toLocaleString()],
      ['Additional Deductions (-)', otherDeductions.toLocaleString()],
      ['NET PAYABLE TO TEACHER', netPayout.toLocaleString()]
    ];

    if (payoutsData.classBreakdown && payoutsData.classBreakdown.length > 0) {
      // Add empty separator row
      rows.unshift(['--- Class Breakdown ---', '---']);
      payoutsData.classBreakdown.forEach((c: any) => {
        rows.unshift([`Class: ${c.title} (${c.studentCount} students)`, c.classRevenue.toLocaleString()]);
      });
    }

    exportToPDF(
      'Official Teacher Payslip',
      '', // No subtitle, using metadata block instead
      headers,
      rows,
      undefined,
      `Payslip_${teacherName.replace(/\s+/g, '_')}_${startDate}`,
      {
        title: 'Teacher Information',
        items: [
          { label: 'Teacher ID', value: selectedTeacher?.student_id || `TEA-${selectedTeacher?.id?.substring(0,6).toUpperCase()}` },
          { label: 'Full Name', value: teacherName },
          { label: 'Email', value: selectedTeacher?.email || 'N/A' },
          { label: 'Payout Period', value: `${startDate} to ${endDate}` }
        ]
      }
    );
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
    else if (activeTab === 'payouts') fetchPayouts();
    else if (activeTab === 'security') fetchSecurity();
  }, [activeTab, startDate, endDate, subjectFilter, paymentMethod, classFilter, actionTypeFilter, enrollmentUserFilter, payoutTeacherFilter]);


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

  const handleExportTransactionsPDF = () => {
    if (!financial || !financial.transactions) return;
    const headers = ['Student ID', 'Student Name', 'Amount Paid', 'Date & Time'];
    const rows = financial.transactions.map((t: any) => [
      t.studentId,
      t.name,
      `LKR ${t.amount.toLocaleString()}`,
      new Date(t.payDate).toLocaleString()
    ]);
    rows.push(['', 'TOTAL REVENUE:', `LKR ${Number(financial.classFeeRevenue || 0).toLocaleString()}`, '']);
    
    const className = classes.find(c => c.id === classFilter)?.title || 'All Classes';
    const subjName = subjectFilter === 'all' ? 'All Subjects' : subjectFilter;
    
    exportToPDF(
      'Granular Financial Audit',
      [
        `Period: ${startDate} to ${endDate}`,
        `Class: ${className} | Subject: ${subjName}`
      ],
      headers,
      rows,
      undefined,
      'EWAY_Financial_Transactions'
    );
  };


  const handleExportUserPDF = () => {
    if (!enrollment || !enrollment.users) return;
    const headers = ['User ID', 'Full Name', 'Role', 'Email', 'Join Date'];
    const rows = enrollment.users.map((u: any) => [
      u.student_id || u.id.substring(0,8),
      `${u.first_name} ${u.last_name}`,
      u.role ? u.role.toUpperCase() : 'UNKNOWN',
      u.email,
      new Date(u.created_at).toLocaleDateString()
    ]);
    exportToPDF(
      'User Periodicity Report',
      [
        `Role: ${enrollmentUserFilter.toUpperCase()}`,
        `Period: ${startDate} to ${endDate}`
      ],
      headers,
      rows,
      undefined,
      'EWAY_User_Audit'
    );
  };

  const handleExportUserCSV = () => {
    if (!enrollment || !enrollment.users) return;
    const headers = ['User ID', 'Full Name', 'Role', 'Email', 'Join Date'];
    const rows = enrollment.users.map((u: any) => [
      u.student_id || u.id.substring(0,8),
      `${u.first_name} ${u.last_name}`,
      u.role ? u.role.toUpperCase() : 'UNKNOWN',
      u.email,
      new Date(u.created_at).toLocaleDateString()
    ]);
    exportToCSV('EWAY_User_Audit', headers, rows);
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
              else if (activeTab === 'payouts') fetchPayouts();
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

            {/* Granular Financial Transactions */}
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Granular Financial Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Student ID', 'Student Name', 'Amount Paid', 'Pay Date & Time'].map((h) => (
                        <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-24"></div></td>
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-40"></div></td>
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-20"></div></td>
                          <td className="py-4"><div className="h-4 bg-white/10 rounded animate-pulse w-32"></div></td>
                        </tr>
                      ))
                    ) : (
                      (financial?.transactions || []).map((t: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-4 text-white/60 text-sm font-mono">{t.studentId}</td>
                          <td className="py-3 pr-4 text-white font-medium text-sm">{t.name}</td>
                          <td className="py-3 pr-4 text-cyan-400 font-semibold text-sm">LKR {t.amount.toLocaleString()}</td>
                          <td className="py-3 text-white/60 text-sm">{new Date(t.payDate).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                    {!loading && (financial?.transactions || []).length === 0 && (
                      <tr><td colSpan={4} className="py-10 text-center text-white/40">No transactions match these filters.</td></tr>
                    )}
                  </tbody>
                  {!loading && (financial?.transactions || []).length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-white/20 bg-white/5">
                        <td colSpan={2} className="py-4 pr-4 text-right text-white font-bold">Filtered Total:</td>
                        <td colSpan={2} className="py-4 text-cyan-400 font-bold text-lg">LKR {Number(financial.totalRevenue || 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </GlassCard>

            {/* Export */}
            <div className="flex gap-3">
              <button onClick={handleExportFinancialPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] transition-all">
                <FileText size={18} />Export Executive PDF
              </button>
              <button onClick={handleExportTransactionsPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all">
                <FileText size={18} />Export Transactions PDF
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

            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Granular User Growth Data</h3>
                <Select value={enrollmentUserFilter} onValueChange={setEnrollmentUserFilter}>
                  <SelectTrigger className="w-[180px] bg-[#0f172a] border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['User ID', 'Full Name', 'Role', 'Email', 'Join Date'].map((h) => (
                        <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-24"></div></td>
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-40"></div></td>
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-20"></div></td>
                          <td className="py-4 pr-4"><div className="h-4 bg-white/10 rounded animate-pulse w-48"></div></td>
                          <td className="py-4"><div className="h-4 bg-white/10 rounded animate-pulse w-32"></div></td>
                        </tr>
                      ))
                    ) : (
                      (enrollment?.users || []).map((user: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-4 text-white/60 text-sm font-mono">{user.student_id || user.id.substring(0,8)}</td>
                          <td className="py-3 pr-4 text-white font-medium text-sm">{`${user.first_name} ${user.last_name}`}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'student' ? 'bg-cyan-500/20 text-cyan-400' :
                              user.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {user.role ? user.role.toUpperCase() : 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-white/80 text-sm">{user.email}</td>
                          <td className="py-3 text-white/60 text-sm">{new Date(user.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                    {!loading && (enrollment?.users || []).length === 0 && (
                      <tr><td colSpan={5} className="py-10 text-center text-white/40">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={handleExportUserPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] transition-all">
                <FileText size={18} />Export Users (PDF)
              </button>
              <button onClick={handleExportUserCSV}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all">
                <FileSpreadsheet size={18} />Export Users (CSV)
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Teacher Payouts ── */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">Step 1: Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Select Teacher</label>
                  <Select value={payoutTeacherFilter} onValueChange={setPayoutTeacherFilter}>
                    <SelectTrigger className="w-full bg-[#0f172a] border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Choose Teacher" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{`${t.first_name} ${t.last_name}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Class View</label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-full bg-[#0f172a] border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes
                        .filter(c => !payoutTeacherFilter || c.teacher_id === payoutTeacherFilter)
                        .map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-400" />
                </div>
              </div>
            </GlassCard>

            {payoutTeacherFilter && payoutsData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassCard className="p-6">
                    <p className="text-white/60 text-sm mb-1">Gross Revenue</p>
                    <p className="text-3xl font-bold text-white">LKR {Number(payoutsData.grossRevenue || 0).toLocaleString()}</p>
                  </GlassCard>
                  <GlassCard className="p-6">
                    <p className="text-white/60 text-sm mb-1">Institute Commission</p>
                    <p className="text-3xl font-bold text-red-400">- LKR {Number(payoutsData.instituteCommission || 0).toLocaleString()}</p>
                  </GlassCard>
                  <GlassCard className="p-6 border border-green-500/20">
                    <p className="text-white/60 text-sm mb-1">Net Teacher Payout</p>
                    <p className="text-3xl font-bold text-green-400">LKR {Number((payoutsData.netPayout || 0) - otherDeductions).toLocaleString()}</p>
                  </GlassCard>
                </div>

                <GlassCard className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Step 2: Process & Action</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Other Deductions (LKR) - Optional</label>
                        <input type="number" min="0" value={otherDeductions} onChange={e => setOtherDeductions(Number(e.target.value))}
                          className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-400" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Admin Note</label>
                        <textarea value={payoutNotes} onChange={e => setPayoutNotes(e.target.value)}
                          className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400" placeholder="E.g. Includes bonus for extra revision session" rows={3}></textarea>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-3">
                      <button onClick={handleProcessPayout} disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50">
                        {loading ? 'Processing...' : 'Mark as Paid & Notify Teacher'}
                      </button>
                      <button onClick={handleGeneratePayslip}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all">
                        <FileText size={18} />Download Formal Payslip (PDF)
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </>
            )}
            {payoutTeacherFilter && !payoutsData && !loading && (
              <GlassCard className="p-6 text-center text-white/50">Calculation engine failed to preview. Ensure teacher exists.</GlassCard>
            )}
            {payoutTeacherFilter && loading && (
              <GlassCard className="p-6 text-center text-white/50">Calculating...</GlassCard>
            )}
            {!payoutTeacherFilter && (
              <GlassCard className="p-6 text-center text-white/50">Select a Teacher to begin payout workflow.</GlassCard>
            )}
          </div>
        )}

        {/* ── TAB: Security & Audit ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20"><Activity className="text-cyan-400" size={20} /></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{securityLogs.length}</h3>
                <p className="text-white/60 text-xs">Total Log Entries</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20"><Shield className="text-red-400" size={20} /></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{securityLogs.filter(l => l.log_type === 'Audit').length}</h3>
                <p className="text-white/60 text-xs">Audit Mutations</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20"><Users className="text-purple-400" size={20} /></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{securityLogs.filter(l => l.log_type === 'Activity').length}</h3>
                <p className="text-white/60 text-xs">Passive Activities</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20"><Server className="text-green-400" size={20} /></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                   {new Set(securityLogs.map(l => l.profiles?.id).filter(Boolean)).size}
                </h3>
                <p className="text-white/60 text-xs">Unique Users</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">Unified Audit & Activity Log</h3>
              {securityLogs.length === 0 && (
                <div className="text-center py-12">
                  <Shield size={40} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No entries found for the selected filters.</p>
                  <p className="text-white/30 text-sm mt-1">Make sure the system_logs migration has been executed.</p>
                </div>
              )}
              {securityLogs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Date & Time', 'User', 'Module/Entity', 'Action', 'Type', 'IP Address', 'Details'].map(h => (
                          <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {securityLogs.map((log: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-4 text-white/60 text-xs font-mono">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-3 pr-4 text-white text-sm">
                            {log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'System'}
                            <span className="block text-[10px] text-white/40">{log.profiles?.role || ''}</span>
                          </td>
                          <td className="py-3 pr-4 text-white/80 text-sm">{log.entity_name}</td>
                          <td className="py-3 pr-4">
                            <span className="text-white/80 text-sm">{log.action_type}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${log.log_type === 'Audit' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {log.log_type || 'Activity'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-white/60 text-xs font-mono">{log.ip_address || '—'}</td>
                          <td className="py-3 pr-4">
                            <button
                              onClick={() => setSelectedLogForDiff(log)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(30,41,59,0.6)] text-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:bg-blue-500/20 transition-all"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
            <button onClick={handleExportSecurityPDF}
               className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 text-white font-semibold hover:bg-gray-600 transition-all">
              <FileText size={18} />Export Logs PDF
            </button>
          </div>
        )}
      </div>

      {/* DIfference View Modal */}
      {selectedLogForDiff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl relative">
            <button onClick={() => setSelectedLogForDiff(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Log Details</h2>
            <p className="text-white/50 text-sm mb-6">Forensic investigation view for action: <span className="font-mono text-white/80">{selectedLogForDiff.action_type}</span></p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Actor</p>
                <p className="text-white text-sm font-semibold">{selectedLogForDiff.profiles ? `${selectedLogForDiff.profiles.first_name} ${selectedLogForDiff.profiles.last_name}` : 'System / Anonymous'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Timestamp</p>
                <p className="text-white text-sm font-mono">{new Date(selectedLogForDiff.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <p className="text-xs text-red-400 uppercase tracking-wider font-bold border-b border-red-500/20 pb-2 mb-2">Previous State (OLD_DATA)</p>
                <pre className="text-white/70 text-xs font-mono overflow-auto max-h-60 whitespace-pre-wrap">
                  {selectedLogForDiff.old_data ? JSON.stringify(selectedLogForDiff.old_data, null, 2) : 'No previous state (or unstructured action).'}
                </pre>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <p className="text-xs text-green-400 uppercase tracking-wider font-bold border-b border-green-500/20 pb-2 mb-2">New State (NEW_DATA)</p>
                <pre className="text-white/70 text-xs font-mono overflow-auto max-h-60 whitespace-pre-wrap">
                  {selectedLogForDiff.new_data ? JSON.stringify(selectedLogForDiff.new_data, null, 2) : 'No new state recorded.'}
                </pre>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedLogForDiff(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">Close Viewer</button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
