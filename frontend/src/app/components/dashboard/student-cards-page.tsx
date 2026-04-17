import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { CustomDropdown } from '../custom-dropdown';
import apiClient from '@/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import { StudentIdCardUI } from './student-id-card-ui';
import {
  ArrowLeft,
  Plus,
  Eye,
  Printer,
  XCircle,
  Upload,
  CheckCircle,
  QrCode,
  User,
  GraduationCap,
  IdCard,
  Calendar,
  Download,
} from 'lucide-react';

interface StudentCardsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface StudentCard {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  status: 'active' | 'inactive';
  issuedDate: string;
  expiryDate: string;
  photoUrl?: string;
}

export function StudentCardsPage({
  onLogout,
  onNavigate,
}: StudentCardsPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StudentCard | null>(null);
  const [showGeneratedCard, setShowGeneratedCard] = useState(false);
  const [generatedCardData, setGeneratedCardData] = useState<StudentCard | null>(
    null
  );

  // Form state
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [studentCards, setStudentCards] = useState<StudentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await apiClient.get('/users/students');
        const formattedData: StudentCard[] = response.data.map((student: any) => ({
          id: student.id,
          studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          studentId: student.student_id ? student.student_id : 'ID-PENDING',
          class: student.className || 'Student',
          status: 'active',
          issuedDate: new Date(student.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          expiryDate: new Date(new Date(student.created_at).setFullYear(new Date(student.created_at).getFullYear() + 2)).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          photoUrl: student.profile_photo,
        }));
        setStudentCards(formattedData);
      } catch (error) {
        console.error('Failed to load students', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleGenerateCard = () => {
    if (!studentName || !studentId || !selectedClass) {
      alert('Please fill in all required fields');
      return;
    }

    const newCard: StudentCard = {
      id: Date.now().toString(),
      studentName,
      studentId,
      class: selectedClass,
      status: 'active',
      issuedDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setStudentCards((prev) => [newCard, ...prev]);
    setShowCreateModal(false);
    setStudentName('');
    setStudentId('');
    setSelectedClass('');
    setPhotoFile(null);
    setShowGeneratedCard(true);
    setGeneratedCardData(newCard);
  };

  const handleViewCard = (card: StudentCard) => {
    setSelectedCard(card);
    setShowCardPreview(true);
  };

  const handlePrintCard = (card: StudentCard) => {
    setSelectedCard(card);
    setShowCardPreview(true);
    // After modal opens, trigger print
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDeactivateCard = (cardId: string) => {
    if (confirm('Are you sure you want to deactivate this student card?')) {
      setStudentCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, status: 'inactive' as const } : card
        )
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const icons = {
      active: CheckCircle,
      inactive: XCircle,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 w-fit ${
          styles[status as keyof typeof styles]
        }`}
      >
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <DashboardLayout
      userRole="staff"
      userName="Ms. Silva"
      userInitials="MS"
      notificationCount={5}
      breadcrumb="Student Cards"
      activePage="student-cards"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Student Cards</h1>
            <p className="text-white/60">
              Generate and manage student ID cards with QR codes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={18} />
            Generate New Card
          </button>
        </div>
      </div>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Generate Student ID Card</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setStudentName('');
                  setStudentId('');
                  setSelectedClass('');
                  setPhotoFile(null);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Student Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Student ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g., STU-1050"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <CustomDropdown
                value={selectedClass}
                onChange={setSelectedClass}
                options={[
                  { value: '', label: 'Select a class...' },
                  { value: 'A/L ICT 2026', label: 'A/L ICT 2026' },
                  { value: 'A/L Mathematics 2026', label: 'A/L Mathematics 2026' },
                  { value: 'A/L Physics 2026', label: 'A/L Physics 2026' },
                  { value: 'O/L Science 2026', label: 'O/L Science 2026' },
                  { value: 'O/L Mathematics 2026', label: 'O/L Mathematics 2026' },
                ]}
                placeholder="Select a class..."
                label={
                  <>
                    Class <span className="text-red-400">*</span>
                  </>
                }
              />

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Upload Student Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:border-blue-500/50 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Upload size={18} />
                    {photoFile ? photoFile.name : 'Choose photo...'}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setStudentName('');
                  setStudentId('');
                  setSelectedClass('');
                  setPhotoFile(null);
                }}
                className="px-5 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCard}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
              >
                Generate Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Card Table */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Student Card List</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Student Name
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Student ID
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Class
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Card Status
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Issued Date
                </th>
                <th className="text-left text-white/60 text-sm font-semibold pb-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {studentCards.map((card) => (
                <tr
                  key={card.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                        {card.studentName.charAt(0)}
                      </div>
                      <span className="text-white font-medium">
                        {card.studentName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white/70">{card.studentId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{card.class}</span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(card.status)}</td>
                  <td className="py-4 px-4">
                    <span className="text-white/70">{card.issuedDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCard(card)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        title="View Card"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handlePrintCard(card)}
                        className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                        title="Print Card"
                      >
                        <Printer size={18} />
                      </button>
                      {card.status === 'active' && (
                        <button
                          onClick={() => handleDeactivateCard(card.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Deactivate Card"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {studentCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40 text-lg">No student cards found</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Card Preview Modal */}
      {showCardPreview && selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Student ID Card</h2>
              <button
                onClick={() => setShowCardPreview(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Standardized ID Card Design */}
            <div className="mb-6">
              <StudentIdCardUI
                studentName={selectedCard.studentName}
                studentId={selectedCard.studentId}
                expiryDate={selectedCard.expiryDate}
                issuedDate={selectedCard.issuedDate}
                photoUrl={selectedCard.photoUrl || (photoFile ? URL.createObjectURL(photoFile) : undefined)}
                qrValue={selectedCard.studentId}
              />
            </div>


            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => alert('Download as PDF (Feature Coming Soon!)')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(168,85,247,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <Download size={18} />
                Download Card (PDF)
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <Printer size={18} />
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Card Modal */}
      {showGeneratedCard && generatedCardData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Student ID Card</h2>
              <button
                onClick={() => setShowGeneratedCard(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Standardized ID Card Design */}
            <div className="mb-6">
              <StudentIdCardUI
                studentName={generatedCardData.studentName}
                studentId={generatedCardData.studentId}
                expiryDate={generatedCardData.expiryDate}
                issuedDate={generatedCardData.issuedDate}
                photoUrl={photoFile ? URL.createObjectURL(photoFile) : undefined}
                qrValue={generatedCardData.studentId}
              />
            </div>


            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => alert('Download as PDF (Feature Coming Soon!)')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(168,85,247,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <Download size={18} />
                Download Card (PDF)
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2"
              >
                <Printer size={18} />
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
