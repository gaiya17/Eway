import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft, QrCode, CreditCard, AlertTriangle, CheckCircle,
  XCircle, Clock, FileSpreadsheet, FileText, RefreshCw, Filter,
  IdCard,
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/report-exports';

interface ReportsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('eway_token') || '';

const TABS = [
  { id: 'daily', label: 'Daily Recon', icon: QrCode },
  { id: 'reconciliation', label: 'Payment Reconciliation', icon: CreditCard },
  { id: 'cards', label: 'Card Issuance', icon: IdCard },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(11,15,26,0.97)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

export function ReportsPage({ onLogout, onNavigate }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Data states
  const [dailyRecon, setDailyRecon] = useState<any>(null);
  const [illegalAttendees, setIllegalAttendees] = useState<any[]>([]);
  const [cardData, setCardData] = useState<any>(null);

  const fetchDailyRecon = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/staff/daily-recon?date=${date}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setDailyRecon(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchIllegal = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/staff/illegal-attendees?date=${date}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setIllegalAttendees(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/staff/card-issuance`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setCardData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'daily' || activeTab === 'reconciliation') {
      fetchDailyRecon(selectedDate);
      fetchIllegal(selectedDate);
    } else if (activeTab === 'cards') {
      fetchCards();
    }
  }, [activeTab]);

  const handleExportDailyCash = () => {
    if (!dailyRecon) return;
    const approvedRows = (dailyRecon.approvedPayments || []).map((p: any) => [
      `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim(),
      p.classes?.title || 'Unknown',
      `LKR ${Number(p.amount || 0).toLocaleString()}`,
      'Approved',
      new Date(p.reviewed_at).toLocaleTimeString(),
    ]);
    const rejectedRows = (dailyRecon.rejectedPayments || []).map((p: any) => [
      `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim(),
      p.classes?.title || 'Unknown',
      `LKR ${Number(p.amount || 0).toLocaleString()}`,
      'Rejected',
      new Date(p.reviewed_at).toLocaleTimeString(),
    ]);
    exportToExcel(`EWAY_Daily_Recon_${selectedDate}`, [
      {
        name: 'Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Date', selectedDate],
          ['QR Scans Processed', dailyRecon.qrScanCount],
          ['Payments Approved', dailyRecon.approvedCount],
          ['Payments Rejected', dailyRecon.rejectedCount],
          ['Pending Count', dailyRecon.pendingCount],
          ['Total Approved Amount', `LKR ${Number(dailyRecon.totalApprovedAmount || 0).toLocaleString()}`],
        ],
      },
      {
        name: 'Approved Payments',
        headers: ['Student', 'Class', 'Amount', 'Status', 'Time'],
        rows: approvedRows,
      },
      {
        name: 'Rejected Payments',
        headers: ['Student', 'Class', 'Amount', 'Status', 'Time'],
        rows: rejectedRows,
      },
    ]);
  };

  const handleExportIllegalPDF = () => {
    exportToPDF(
      'Illegal Attendees Report',
      `Date: ${selectedDate}`,
      ['Student', 'Student ID', 'Class', 'Scan Status', 'Payment Status'],
      illegalAttendees.map(r => [r.studentName, r.studentId, r.className, r.attendanceStatus, r.paymentStatus]),
      undefined,
      `EWAY_Illegal_Attendees_${selectedDate}`
    );
  };

  const handleExportCardsList = () => {
    if (!cardData) return;
    exportToExcel(`EWAY_Pending_Cards`, [{
      name: 'Pending Print List',
      headers: ['Student Name', 'Student ID'],
      rows: (cardData.pendingPrint || []).map((s: any) => [s.name, s.studentId]),
    }]);
  };

  return (
    <DashboardLayout userRole="staff" activePage="reports" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} /><span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Operational Audit</h1>
              <p className="text-white/60">Daily reconciliation, payment verification & card issuance tracking</p>
            </div>
            <button onClick={() => {
              if (activeTab === 'daily' || activeTab === 'reconciliation') {
                fetchDailyRecon(selectedDate); fetchIllegal(selectedDate);
              } else fetchCards();
            }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow' : 'text-white/50 hover:text-white/80'
                }`}>
                <Icon size={16} /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter for Daily/Reconciliation */}
        {(activeTab === 'daily' || activeTab === 'reconciliation') && (
          <GlassCard className="p-4 mb-6">
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-white/40" />
              <label className="text-white/60 text-sm">Date</label>
              <input type="date" value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); fetchDailyRecon(e.target.value); fetchIllegal(e.target.value); }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
              <button onClick={() => { setSelectedDate(new Date().toISOString().split('T')[0]); fetchDailyRecon(new Date().toISOString().split('T')[0]); }}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all">
                Today
              </button>
            </div>
          </GlassCard>
        )}

        {/* ── TAB: Daily Recon ── */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'QR Scans', value: dailyRecon?.qrScanCount ?? '—', icon: QrCode, color: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-400' },
                { label: 'Approved', value: dailyRecon?.approvedCount ?? '—', icon: CheckCircle, color: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400' },
                { label: 'Rejected', value: dailyRecon?.rejectedCount ?? '—', icon: XCircle, color: 'from-red-500/20 to-pink-500/20', text: 'text-red-400' },
                { label: 'Pending', value: dailyRecon?.pendingCount ?? '—', icon: Clock, color: 'from-orange-500/20 to-amber-500/20', text: 'text-orange-400' },
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

            {/* QR Scans Table */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">QR Attendance Scans — {selectedDate}</h3>
                <button onClick={handleExportDailyCash}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                  <FileSpreadsheet size={16} />Export Daily Cash Summary (Excel)
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Student', 'ID', 'Class', 'Status', 'Late?'].map(h => (
                        <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(dailyRecon?.qrScans || []).map((scan: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 text-white text-sm">{`${scan.profiles?.first_name || ''} ${scan.profiles?.last_name || ''}`.trim()}</td>
                        <td className="py-3 pr-4 text-white/60 text-xs font-mono">{scan.profiles?.student_id || 'N/A'}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">{scan.classes?.title || 'Unknown'}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${scan.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {scan.status}
                          </span>
                        </td>
                        <td className="py-3">{scan.is_late ? <span className="text-orange-400 text-xs">Late</span> : <span className="text-green-400 text-xs">On Time</span>}</td>
                      </tr>
                    ))}
                    {(!dailyRecon?.qrScans || dailyRecon.qrScans.length === 0) && (
                      <tr><td colSpan={5} className="py-10 text-center text-white/40">No QR scans for {selectedDate}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Illegal Attendees */}
            <GlassCard className="p-6 border border-orange-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/20"><AlertTriangle className="text-orange-400" size={18} /></div>
                  <h3 className="text-white font-bold text-lg">Flagged — Scanned Without Valid Payment</h3>
                </div>
                <button onClick={handleExportIllegalPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 text-sm font-semibold hover:bg-orange-500/30 transition-all">
                  <FileText size={16} />Export PDF
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Student', 'Student ID', 'Class', 'Scan Status', 'Payment Status'].map(h => (
                        <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {illegalAttendees.map((row, i) => (
                      <tr key={i} className="border-b border-orange-500/10 bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                        <td className="py-3 pr-4 text-white text-sm">{row.studentName}</td>
                        <td className="py-3 pr-4 text-white/60 text-xs font-mono">{row.studentId}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">{row.className}</td>
                        <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400">{row.attendanceStatus}</span></td>
                        <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{row.paymentStatus}</span></td>
                      </tr>
                    ))}
                    {illegalAttendees.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-white/40">No unauthorized attendees detected ✓</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB: Payment Reconciliation ── */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Approved */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-green-500/20"><CheckCircle className="text-green-400" size={20} /></div>
                  <h3 className="text-white font-semibold">Approved Payments — {selectedDate}</h3>
                </div>
                <div className="space-y-2">
                  {(dailyRecon?.approvedPayments || []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                      <div>
                        <p className="text-white text-sm">{`${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim()}</p>
                        <p className="text-white/50 text-xs">{p.classes?.title || 'Unknown'}</p>
                      </div>
                      <span className="text-green-400 font-semibold text-sm">LKR {Number(p.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  {(!dailyRecon?.approvedPayments || dailyRecon.approvedPayments.length === 0) && (
                    <p className="text-white/40 text-center py-4">No approved payments today</p>
                  )}
                </div>
              </GlassCard>

              {/* Rejected */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-red-500/20"><XCircle className="text-red-400" size={20} /></div>
                  <h3 className="text-white font-semibold">Rejected Payments — {selectedDate}</h3>
                </div>
                <div className="space-y-2">
                  {(dailyRecon?.rejectedPayments || []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div>
                        <p className="text-white text-sm">{`${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim()}</p>
                        <p className="text-white/50 text-xs">{p.classes?.title || 'Unknown'}</p>
                        {p.rejection_reason && <p className="text-red-400/70 text-xs mt-0.5">Reason: {p.rejection_reason}</p>}
                      </div>
                      <span className="text-red-400 font-semibold text-sm">LKR {Number(p.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  {(!dailyRecon?.rejectedPayments || dailyRecon.rejectedPayments.length === 0) && (
                    <p className="text-white/40 text-center py-4">No rejected payments today</p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Summary Banner */}
            <GlassCard className="p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 font-semibold">Daily Total Approved</p>
                  <p className="text-3xl font-bold text-white">LKR {Number(dailyRecon?.totalApprovedAmount || 0).toLocaleString()}</p>
                </div>
                <button onClick={handleExportDailyCash}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.5)] transition-all">
                  <FileSpreadsheet size={18} />Export for Admin Sign-off
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB: Card Issuance ── */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: cardData?.totalStudents ?? '—', color: 'text-white' },
                { label: 'Digital IDs', value: cardData?.digitalCards ?? '—', color: 'text-cyan-400' },
                { label: 'Physical Cards Issued', value: cardData?.physicalCards ?? '—', color: 'text-green-400' },
                { label: 'Pending Print', value: (cardData?.pendingPrint || []).length, color: 'text-orange-400' },
              ].map((k, i) => (
                <GlassCard key={i} className="p-5">
                  <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-white/60 text-sm mt-1">{k.label}</p>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Pending Physical Card Print List</h3>
                <button onClick={handleExportCardsList}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
                  <FileSpreadsheet size={16} />Export Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['#', 'Student Name', 'Student ID'].map(h => (
                        <th key={h} className="text-left text-white/60 text-xs font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(cardData?.pendingPrint || []).map((s: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 text-white/60 text-sm">{i + 1}</td>
                        <td className="py-3 pr-4 text-white text-sm">{s.name}</td>
                        <td className="py-3 text-white/60 text-sm font-mono">{s.studentId}</td>
                      </tr>
                    ))}
                    {(!cardData?.pendingPrint || cardData.pendingPrint.length === 0) && (
                      <tr><td colSpan={3} className="py-10 text-center text-white/40">All cards have been issued ✓</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
