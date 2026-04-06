import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  Clock,
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

interface AdminChatbotManagementProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  lastUpdated: string;
  status: 'active' | 'inactive';
}

export function AdminChatbotManagement({ onLogout, onNavigate }: AdminChatbotManagementProps) {
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [showInDashboard, setShowInDashboard] = useState(true);
  const [showInLanding, setShowInLanding] = useState(true);
  const [allowSuggestions, setAllowSuggestions] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [newFAQ, setNewFAQ] = useState({
    question: '',
    category: 'Account',
    answer: '',
    status: 'active' as 'active' | 'inactive',
  });

  const categories = ['All Categories', 'Payments', 'Attendance', 'Classes', 'Account', 'Support'];

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login page and click on "Forgot Password". Follow the instructions sent to your registered email address.',
      category: 'Account',
      lastUpdated: 'Mar 12, 2026',
      status: 'active',
    },
    {
      id: 2,
      question: 'How can I activate my class after payment?',
      answer: 'After payment verification by the staff, your class will be automatically activated. You can view your enrolled classes in the "My Classes" section.',
      category: 'Payments',
      lastUpdated: 'Mar 11, 2026',
      status: 'active',
    },
    {
      id: 3,
      question: 'Where can I download my student ID?',
      answer: 'You can download your student ID from the "My Student ID" section in your dashboard. Click on the download button to save it as a PDF.',
      category: 'Account',
      lastUpdated: 'Mar 10, 2026',
      status: 'active',
    },
    {
      id: 4,
      question: 'How do I mark my attendance?',
      answer: 'Your teacher will share a QR code at the beginning of class. Scan the QR code using the attendance scanner in your dashboard to mark your attendance.',
      category: 'Attendance',
      lastUpdated: 'Mar 9, 2026',
      status: 'active',
    },
    {
      id: 5,
      question: 'Can I get a refund for my class?',
      answer: 'Refund policies depend on the class type and timing. Please contact support with your payment receipt for refund requests.',
      category: 'Payments',
      lastUpdated: 'Mar 8, 2026',
      status: 'inactive',
    },
  ]);

  // Chart data for usage trend
  const usageData = [
    { day: 'Mon', interactions: 145 },
    { day: 'Tue', interactions: 178 },
    { day: 'Wed', interactions: 162 },
    { day: 'Thu', interactions: 195 },
    { day: 'Fri', interactions: 210 },
    { day: 'Sat', interactions: 155 },
    { day: 'Sun', interactions: 130 },
  ];

  const mostAskedQuestions = [
    { question: 'How do I reset my password?', count: 234 },
    { question: 'How can I activate my class after payment?', count: 189 },
    { question: 'Where can I download my student ID?', count: 156 },
    { question: 'How do I mark my attendance?', count: 143 },
    { question: 'What are the payment methods available?', count: 128 },
  ];

  const unansweredQuestions = [
    { question: 'How can I change my registered email?', askedBy: '5 users' },
    { question: 'Can I transfer to a different class batch?', askedBy: '3 users' },
    { question: 'How do I contact my teacher directly?', askedBy: '4 users' },
    { question: 'Is there a mobile app available?', askedBy: '8 users' },
  ];

  const handleAddFAQ = () => {
    const newFAQItem: FAQ = {
      id: faqs.length + 1,
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: newFAQ.status,
    };

    setFaqs([...faqs, newFAQItem]);
    setNewFAQ({ question: '', category: 'Account', answer: '', status: 'active' });
    setShowAddModal(false);
    alert('FAQ added successfully!');
  };

  const handleEditFAQ = () => {
    if (selectedFAQ) {
      setFaqs(
        faqs.map((faq) =>
          faq.id === selectedFAQ.id
            ? { ...selectedFAQ, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
            : faq
        )
      );
      setShowEditModal(false);
      setSelectedFAQ(null);
      alert('FAQ updated successfully!');
    }
  };

  const handleDeleteFAQ = () => {
    if (selectedFAQ) {
      setFaqs(faqs.filter((faq) => faq.id !== selectedFAQ.id));
      setShowDeleteModal(false);
      setSelectedFAQ(null);
      alert('FAQ deleted successfully!');
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout userRole="admin" activePage="chatbot-management" onNavigate={onNavigate} onLogout={onLogout}>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Chatbot Management</h1>
              <p className="text-white/60">Control chatbot settings, manage FAQs, and monitor chatbot usage.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              <Plus size={20} />
              Add FAQ
            </button>
          </div>
        </div>

        {/* Chatbot Status Panel */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Chatbot Status</h2>
          <div className="space-y-6">
            {/* Main Toggle */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-semibold">Current Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      chatbotEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {chatbotEnabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-white/60 text-sm">Allow students to access chatbot support across the LMS.</p>
              </div>
              <button
                onClick={() => setChatbotEnabled(!chatbotEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                  chatbotEnabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                    chatbotEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Secondary Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Show chatbot in student dashboard</span>
                <button
                  onClick={() => setShowInDashboard(!showInDashboard)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                    showInDashboard ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      showInDashboard ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Enable chatbot in public landing pages</span>
                <button
                  onClick={() => setShowInLanding(!showInLanding)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                    showInLanding ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      showInLanding ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Allow file/help suggestions</span>
                <button
                  onClick={() => setAllowSuggestions(!allowSuggestions)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                    allowSuggestions ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      allowSuggestions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Usage Statistics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <MessageCircle className="text-cyan-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+12%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">1,245</h3>
            <p className="text-white/60 text-sm">Total Conversations</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+8%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">1,102</h3>
            <p className="text-white/60 text-sm">Questions Answered</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                <AlertCircle className="text-orange-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <TrendingUp size={16} />
                <span>+15%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">143</h3>
            <p className="text-white/60 text-sm">Unanswered Queries</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <ThumbsUp className="text-purple-400" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp size={16} />
                <span>+3%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">89%</h3>
            <p className="text-white/60 text-sm">Satisfaction Rate</p>
          </GlassCard>
        </div>

        {/* FAQ / Knowledge Base Section */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">FAQ / Knowledge Base</h2>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search FAQs by keyword"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div className="relative z-30">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[200px] justify-between"
              >
                <span>{selectedCategory}</span>
                <ChevronDown size={18} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors ${
                        selectedCategory === category ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FAQ Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Question</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Category</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Last Updated</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4 pr-4">Status</th>
                  <th className="text-left text-white/60 font-semibold text-sm pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFAQs.map((faq) => (
                  <tr key={faq.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-white">{faq.question}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        {faq.category}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-white/60">{faq.lastUpdated}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          faq.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {faq.status.charAt(0).toUpperCase() + faq.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setShowViewModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Chatbot Analytics Panel */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Most Asked Questions */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Most Asked Questions</h2>
            <div className="space-y-4">
              {mostAskedQuestions.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-white/90 text-sm flex-1">{item.question}</p>
                  </div>
                  <span className="text-white/60 text-sm font-semibold ml-4">{item.count} times</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Unanswered Questions */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Unanswered Questions</h2>
            <div className="space-y-4">
              {unansweredQuestions.map((item, index) => (
                <div key={index} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-colors">
                  <p className="text-white/90 text-sm mb-2">{item.question}</p>
                  <div className="flex items-center gap-2 text-orange-400 text-xs">
                    <HelpCircle size={14} />
                    <span>Asked by {item.askedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Chatbot Usage Trend Chart */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Chatbot Usage Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid key="grid-chatbot" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis key="xaxis-chatbot" dataKey="day" stroke="rgba(255,255,255,0.4)" />
              <YAxis key="yaxis-chatbot" stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                key="tooltip-chatbot"
                contentStyle={{
                  backgroundColor: 'rgba(11, 15, 26, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line
                key="line-chatbot"
                type="monotone"
                dataKey="interactions"
                stroke="#22D3EE"
                strokeWidth={3}
                dot={{ fill: '#22D3EE', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New FAQ</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Question <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter FAQ question"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="Account">Account</option>
                    <option value="Payments">Payments</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Classes">Classes</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Answer <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    placeholder="Enter detailed answer"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Status</label>
                  <select
                    value={newFAQ.status}
                    onChange={(e) => setNewFAQ({ ...newFAQ, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFAQ}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
                >
                  Save FAQ
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* View FAQ Modal */}
      {showViewModal && selectedFAQ && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">FAQ Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Question</label>
                  <p className="text-white text-lg">{selectedFAQ.question}</p>
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Category</label>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                    {selectedFAQ.category}
                  </span>
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Answer</label>
                  <p className="text-white/90 leading-relaxed">{selectedFAQ.answer}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Status</label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedFAQ.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {selectedFAQ.status.charAt(0).toUpperCase() + selectedFAQ.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm font-semibold mb-1">Last Updated</label>
                    <p className="text-white/90">{selectedFAQ.lastUpdated}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && selectedFAQ && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit FAQ</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Question <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedFAQ.question}
                    onChange={(e) => setSelectedFAQ({ ...selectedFAQ, question: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedFAQ.category}
                    onChange={(e) => setSelectedFAQ({ ...selectedFAQ, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="Account">Account</option>
                    <option value="Payments">Payments</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Classes">Classes</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Answer <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={selectedFAQ.answer}
                    onChange={(e) => setSelectedFAQ({ ...selectedFAQ, answer: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Status</label>
                  <select
                    value={selectedFAQ.status}
                    onChange={(e) => setSelectedFAQ({ ...selectedFAQ, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditFAQ}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(168,85,247,0.6)] transition-all duration-300"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete FAQ Modal */}
      {showDeleteModal && selectedFAQ && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Delete FAQ?</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-white/80 mb-4">
                  Are you sure you want to delete this FAQ? This action cannot be undone.
                </p>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-white font-semibold">{selectedFAQ.question}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedFAQ(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFAQ}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300"
                >
                  Delete FAQ
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}