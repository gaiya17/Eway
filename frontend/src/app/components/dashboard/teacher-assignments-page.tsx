import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  Plus,
  FileText,
  Clock,
  Upload,
  ClipboardCheck,
  Eye,
  Edit,
  Trash2,
  X,
  Calendar,
  Download,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Award,
} from 'lucide-react';

interface TeacherAssignmentsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

type AssignmentStatus = 'active' | 'closed' | 'overdue';
type SubmissionStatus = 'submitted' | 'late' | 'graded' | 'pending';

interface Assignment {
  id: number;
  title: string;
  class: string;
  subject: string;
  dueDate: string;
  totalStudents: number;
  submissionsReceived: number;
  status: AssignmentStatus;
  description: string;
  maxMarks: number;
}

interface Submission {
  id: number;
  studentName: string;
  submissionTime: string;
  fileName: string;
  status: SubmissionStatus;
  marks?: number;
  maxMarks: number;
}

type ViewMode = 'list' | 'submissions';

export function TeacherAssignmentsPage({
  onLogout,
  onNavigate,
}: TeacherAssignmentsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<Assignment | null>(null);

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    class: '',
    subject: '',
    description: '',
    dueDate: '',
    maxMarks: '',
  });

  const [editAssignment, setEditAssignment] = useState({
    title: '',
    class: '',
    subject: '',
    description: '',
    dueDate: '',
    maxMarks: '',
  });

  const [gradeForm, setGradeForm] = useState({
    marks: '',
    feedback: '',
  });

  const assignments: Assignment[] = [
    {
      id: 1,
      title: 'Database Design - ER Diagrams',
      class: 'A/L ICT 2026',
      subject: 'ICT',
      dueDate: '2026-03-15',
      totalStudents: 40,
      submissionsReceived: 34,
      status: 'active',
      description: 'Create comprehensive ER diagrams for library management system',
      maxMarks: 100,
    },
    {
      id: 2,
      title: 'OOP Concepts - Java Project',
      class: 'A/L ICT 2026',
      subject: 'ICT',
      dueDate: '2026-03-20',
      totalStudents: 40,
      submissionsReceived: 28,
      status: 'active',
      description: 'Implement a banking system using OOP principles',
      maxMarks: 100,
    },
    {
      id: 3,
      title: 'Web Development - Portfolio Site',
      class: 'Grade 11 ICT',
      subject: 'Web Development',
      dueDate: '2026-03-10',
      totalStudents: 35,
      submissionsReceived: 35,
      status: 'closed',
      description: 'Create a personal portfolio website using HTML/CSS/JS',
      maxMarks: 50,
    },
    {
      id: 4,
      title: 'Algorithm Analysis Assignment',
      class: 'A/L ICT 2025',
      subject: 'ICT',
      dueDate: '2026-03-08',
      totalStudents: 38,
      submissionsReceived: 30,
      status: 'overdue',
      description: 'Analyze time complexity of sorting algorithms',
      maxMarks: 75,
    },
    {
      id: 5,
      title: 'SQL Query Practice',
      class: 'A/L ICT 2026',
      subject: 'Database Management',
      dueDate: '2026-03-25',
      totalStudents: 40,
      submissionsReceived: 15,
      status: 'active',
      description: 'Complete SQL query exercises for database normalization',
      maxMarks: 50,
    },
    {
      id: 6,
      title: 'Network Security Essay',
      class: 'A/L ICT 2025',
      subject: 'ICT',
      dueDate: '2026-03-18',
      totalStudents: 38,
      submissionsReceived: 32,
      status: 'active',
      description: 'Write an essay on modern network security challenges',
      maxMarks: 100,
    },
  ];

  const submissions: Submission[] = [
    {
      id: 1,
      studentName: 'Kavindu Perera',
      submissionTime: '2026-03-14 10:30 AM',
      fileName: 'ER_Diagram_Kavindu.pdf',
      status: 'graded',
      marks: 85,
      maxMarks: 100,
    },
    {
      id: 2,
      studentName: 'Nethmi Silva',
      submissionTime: '2026-03-14 02:15 PM',
      fileName: 'ER_Diagram_Nethmi.pdf',
      status: 'graded',
      marks: 92,
      maxMarks: 100,
    },
    {
      id: 3,
      studentName: 'Ravindu Fernando',
      submissionTime: '2026-03-15 09:00 AM',
      fileName: 'ER_Diagram_Ravindu.pdf',
      status: 'submitted',
      maxMarks: 100,
    },
    {
      id: 4,
      studentName: 'Sithija Wijesinghe',
      submissionTime: '2026-03-15 11:45 AM',
      fileName: 'ER_Diagram_Sithija.pdf',
      status: 'submitted',
      maxMarks: 100,
    },
    {
      id: 5,
      studentName: 'Tharindu Jayawardena',
      submissionTime: '2026-03-16 08:30 AM',
      fileName: 'ER_Diagram_Tharindu.pdf',
      status: 'late',
      maxMarks: 100,
    },
    {
      id: 6,
      studentName: 'Dilini Rajapaksha',
      submissionTime: '2026-03-14 03:45 PM',
      fileName: 'ER_Diagram_Dilini.pdf',
      status: 'graded',
      marks: 78,
      maxMarks: 100,
    },
  ];

  const stats = [
    {
      title: 'Total Assignments',
      value: assignments.length,
      icon: FileText,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      title: 'Active Assignments',
      value: assignments.filter((a) => a.status === 'active').length,
      icon: Clock,
      bgColor: 'bg-cyan-500/20',
      textColor: 'text-cyan-400',
    },
    {
      title: 'Submissions Received',
      value: assignments.reduce((sum, a) => sum + a.submissionsReceived, 0),
      icon: Upload,
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
    },
    {
      title: 'Pending Grading',
      value: 32,
      icon: ClipboardCheck,
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
    },
  ];

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            Active
          </span>
        );
      case 'closed':
        return (
          <span className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/30 text-gray-400 text-xs font-semibold">
            Closed
          </span>
        );
      case 'overdue':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">
            Overdue
          </span>
        );
    }
  };

  const getSubmissionStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            Submitted
          </span>
        );
      case 'late':
        return (
          <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            Late
          </span>
        );
      case 'graded':
        return (
          <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
            Graded
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
            Pending
          </span>
        );
    }
  };

  const handleCreateAssignment = () => {
    console.log('Creating assignment:', newAssignment);
    alert('Assignment created successfully!');
    setCreateModalOpen(false);
    setNewAssignment({
      title: '',
      class: '',
      subject: '',
      description: '',
      dueDate: '',
      maxMarks: '',
    });
  };

  const handleEditAssignment = () => {
    console.log('Editing assignment:', editAssignment);
    alert('Assignment updated successfully!');
    setEditModalOpen(false);
    setEditAssignment({
      title: '',
      class: '',
      subject: '',
      description: '',
      dueDate: '',
      maxMarks: '',
    });
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      alert(`Assignment ${assignmentId} deleted`);
      setDeleteModalOpen(false);
    }
  };

  const handleGradeSubmission = () => {
    console.log('Grading submission:', gradeForm);
    alert(
      `Grade submitted: ${gradeForm.marks} marks\nFeedback: ${gradeForm.feedback}`
    );
    setGradeModalOpen(false);
    setGradeForm({ marks: '', feedback: '' });
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewMode('submissions');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedAssignment(null);
  };

  const openGradeModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeModalOpen(true);
  };

  return (
    <DashboardLayout
      userRole="teacher"
      userName="Mr. Silva"
      userInitials="MS"
      notificationCount={8}
      breadcrumb={
        viewMode === 'submissions' && selectedAssignment
          ? `Assignments / ${selectedAssignment.title}`
          : 'Assignments'
      }
      activePage="assignments"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {viewMode === 'list' ? (
        <>
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Assignments
                </h1>
                <p className="text-white/60">
                  Create and manage assignments for your classes
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => alert('Exporting grades...')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Export Grades
                </button>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Assignment
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm mb-2">{stat.title}</p>
                      <p className="text-4xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={stat.textColor} size={28} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Assignment Management Table */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                Assignment Management
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      Assignment Title
                    </th>
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      Class
                    </th>
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      Subject
                    </th>
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      Due Date
                    </th>
                    <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                      Submissions
                    </th>
                    <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                      Status
                    </th>
                    <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">
                          {assignment.title}
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          Max: {assignment.maxMarks} marks
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-cyan-400 text-sm font-medium">
                          {assignment.class}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/80 text-sm">
                          {assignment.subject}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <Calendar size={14} className="text-orange-400" />
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-white font-semibold">
                          {assignment.submissionsReceived}/
                          {assignment.totalStudents}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(assignment.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                            title="View Submissions"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditModalOpen(true);
                              setEditAssignment({
                                title: assignment.title,
                                class: assignment.class,
                                subject: assignment.subject,
                                description: assignment.description,
                                dueDate: assignment.dueDate,
                                maxMarks: assignment.maxMarks.toString(),
                              });
                            }}
                            className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                            title="Edit Assignment"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalOpen(true);
                              setAssignmentToDelete(assignment);
                            }}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="Delete Assignment"
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
        </>
      ) : (
        <>
          {/* Submissions View */}
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4 group"
            >
              <ChevronLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Assignments</span>
            </button>

            {selectedAssignment && (
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {selectedAssignment.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/60">
                    <span className="flex items-center gap-2">
                      <FileText size={16} className="text-cyan-400" />
                      {selectedAssignment.class}
                    </span>
                    <span>•</span>
                    <span>{selectedAssignment.subject}</span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <Calendar size={16} className="text-orange-400" />
                      Due:{' '}
                      {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-white text-right">
                    <p className="text-2xl font-bold">
                      {selectedAssignment.submissionsReceived}/
                      {selectedAssignment.totalStudents}
                    </p>
                    <p className="text-white/60 text-sm">Submissions</p>
                  </div>
                  {getStatusBadge(selectedAssignment.status)}
                </div>
              </div>
            )}
          </div>

          {/* Submissions Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-400" size={20} />
                <p className="text-white/60 text-sm">Graded</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {submissions.filter((s) => s.status === 'graded').length}
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blue-400" size={20} />
                <p className="text-white/60 text-sm">Pending Review</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {submissions.filter((s) => s.status === 'submitted').length}
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="text-orange-400" size={20} />
                <p className="text-white/60 text-sm">Late Submissions</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {submissions.filter((s) => s.status === 'late').length}
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-cyan-400" size={20} />
                <p className="text-white/60 text-sm">Average Score</p>
              </div>
              <p className="text-2xl font-bold text-white">85%</p>
            </GlassCard>
          </div>

          {/* Submissions Table */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                Student Submissions
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      Student Name
                    </th>
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      Submission Time
                    </th>
                    <th className="text-left text-white/60 font-semibold text-sm pb-4 px-4">
                      File
                    </th>
                    <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                      Marks
                    </th>
                    <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                      Status
                    </th>
                    <th className="text-center text-white/60 font-semibold text-sm pb-4 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">
                          {submission.studentName}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/60 text-sm">
                          {submission.submissionTime}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-400" />
                          <span className="text-white/80 text-sm">
                            {submission.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {submission.marks !== undefined ? (
                          <span className="text-white font-bold">
                            {submission.marks}/{submission.maxMarks}
                          </span>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getSubmissionStatusBadge(submission.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              alert(`Downloading ${submission.fileName}`)
                            }
                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                            title="Download File"
                          >
                            <Download size={16} />
                          </button>
                          {submission.status !== 'graded' && (
                            <button
                              onClick={() => openGradeModal(submission)}
                              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                              title="Grade Assignment"
                            >
                              <Award size={16} />
                            </button>
                          )}
                          {submission.status === 'graded' && (
                            <button
                              onClick={() => openGradeModal(submission)}
                              className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                              title="Edit Grade"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                Create New Assignment
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Assignment Title */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, title: e.target.value })
                  }
                  placeholder="e.g., Database Design - Chapter 3"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Class and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Select Class
                  </label>
                  <select
                    value={newAssignment.class}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, class: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0B0F1A]">
                      Select a class
                    </option>
                    <option value="A/L ICT 2026" className="bg-[#0B0F1A]">
                      A/L ICT 2026
                    </option>
                    <option value="A/L ICT 2025" className="bg-[#0B0F1A]">
                      A/L ICT 2025
                    </option>
                    <option value="Grade 11 ICT" className="bg-[#0B0F1A]">
                      Grade 11 ICT
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Subject
                  </label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0B0F1A]">
                      Select subject
                    </option>
                    <option value="ICT" className="bg-[#0B0F1A]">
                      ICT
                    </option>
                    <option value="Database Management" className="bg-[#0B0F1A]">
                      Database Management
                    </option>
                    <option value="Web Development" className="bg-[#0B0F1A]">
                      Web Development
                    </option>
                    <option value="Programming" className="bg-[#0B0F1A]">
                      Programming
                    </option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Description
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Provide detailed instructions for the assignment..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              {/* Attach Files */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Attach Files (Optional)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-white/40 mb-2" size={32} />
                  <p className="text-white/60 text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    PDF, DOC, DOCX, ZIP (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Due Date and Max Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={newAssignment.maxMarks}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        maxMarks: e.target.value,
                      })
                    }
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create Assignment
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                Edit Assignment
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Assignment Title */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={editAssignment.title}
                  onChange={(e) =>
                    setEditAssignment({ ...editAssignment, title: e.target.value })
                  }
                  placeholder="e.g., Database Design - Chapter 3"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Class and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Select Class
                  </label>
                  <select
                    value={editAssignment.class}
                    onChange={(e) =>
                      setEditAssignment({ ...editAssignment, class: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0B0F1A]">
                      Select a class
                    </option>
                    <option value="A/L ICT 2026" className="bg-[#0B0F1A]">
                      A/L ICT 2026
                    </option>
                    <option value="A/L ICT 2025" className="bg-[#0B0F1A]">
                      A/L ICT 2025
                    </option>
                    <option value="Grade 11 ICT" className="bg-[#0B0F1A]">
                      Grade 11 ICT
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Subject
                  </label>
                  <select
                    value={editAssignment.subject}
                    onChange={(e) =>
                      setEditAssignment({
                        ...editAssignment,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0B0F1A]">
                      Select subject
                    </option>
                    <option value="ICT" className="bg-[#0B0F1A]">
                      ICT
                    </option>
                    <option value="Database Management" className="bg-[#0B0F1A]">
                      Database Management
                    </option>
                    <option value="Web Development" className="bg-[#0B0F1A]">
                      Web Development
                    </option>
                    <option value="Programming" className="bg-[#0B0F1A]">
                      Programming
                    </option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Description
                </label>
                <textarea
                  value={editAssignment.description}
                  onChange={(e) =>
                    setEditAssignment({
                      ...editAssignment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Provide detailed instructions for the assignment..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              {/* Attach Files */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Attach Files (Optional)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-white/40 mb-2" size={32} />
                  <p className="text-white/60 text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    PDF, DOC, DOCX, ZIP (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Due Date and Max Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editAssignment.dueDate}
                    onChange={(e) =>
                      setEditAssignment({
                        ...editAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={editAssignment.maxMarks}
                    onChange={(e) =>
                      setEditAssignment({
                        ...editAssignment,
                        maxMarks: e.target.value,
                      })
                    }
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditAssignment}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Update Assignment
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Assignment Modal */}
      {deleteModalOpen && assignmentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="text-red-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Delete Assignment?
                </h2>
              </div>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAssignmentToDelete(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-white/80">
                This action cannot be undone. This will permanently delete the assignment:
              </p>

              {/* Assignment Info Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white font-bold text-lg mb-2">
                  {assignmentToDelete.title}
                </p>
                <div className="space-y-1">
                  <p className="text-white/60 text-sm">
                    Class: <span className="text-cyan-400">{assignmentToDelete.class}</span>
                  </p>
                  <p className="text-white/60 text-sm">
                    Subject: <span className="text-white">{assignmentToDelete.subject}</span>
                  </p>
                  <p className="text-white/60 text-sm">
                    Submissions: <span className="text-white">{assignmentToDelete.submissionsReceived}/{assignmentToDelete.totalStudents}</span>
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">
                  ⚠️ All student submissions will also be deleted
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setAssignmentToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteAssignment(assignmentToDelete.id);
                    setAssignmentToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Delete Assignment
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {gradeModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Grade Assignment
                </h2>
                <p className="text-white/60 text-sm">
                  {selectedSubmission.studentName}
                </p>
              </div>
              <button
                onClick={() => {
                  setGradeModalOpen(false);
                  setGradeForm({ marks: '', feedback: '' });
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* File Info */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-400" size={20} />
                  <div>
                    <p className="text-white font-semibold">
                      {selectedSubmission.fileName}
                    </p>
                    <p className="text-white/60 text-sm">
                      Submitted: {selectedSubmission.submissionTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Marks Input */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Marks (out of {selectedSubmission.maxMarks})
                </label>
                <input
                  type="number"
                  value={gradeForm.marks}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, marks: e.target.value })
                  }
                  placeholder="Enter marks"
                  max={selectedSubmission.maxMarks}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Feedback Comments
                </label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, feedback: e.target.value })
                  }
                  placeholder="Provide feedback to the student..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setGradeModalOpen(false);
                    setGradeForm({ marks: '', feedback: '' });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmission}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Award size={20} />
                  Save Grade
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
