import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import {
  Search,
  Star,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react';

interface AllTeachersPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  subject: string;
  experience: string;
  quote: string;
  about: string;
  rating: number;
  reviewCount: number;
  profile_photo: string;
  studentCount: number;
  courseCount: number;
}

export function AllTeachersPage({ onLogout, onNavigate }: AllTeachersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('eway_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/teachers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch teachers');
        }

        const data = await response.json();
        setTeachers(data);
      } catch (err: any) {
        console.error('Error fetching teachers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Filter teachers based on search query
  const filteredTeachers = teachers.filter(
    (teacher) =>
      `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (teacher: Teacher) => {
    if (onNavigate) {
      onNavigate('teacher-profile', teacher);
    }
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        notificationCount={5}
        breadcrumb="Teachers"
        activePage="teachers"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">All Teachers</h1>
              <p className="text-white/60">
                Browse teachers and explore their courses
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teacher by name or subject"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Teachers</p>
                  <p className="text-white text-xl font-bold">{teachers.length}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Courses</p>
                  <p className="text-white text-xl font-bold">
                    {teachers.reduce((sum, t) => sum + t.courseCount, 0)}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Avg Rating</p>
                  <p className="text-white text-xl font-bold">
                    {teachers.length > 0
                      ? (
                          teachers.reduce((sum, t) => sum + t.rating, 0) /
                          teachers.length
                        ).toFixed(1)
                      : '—'}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Students</p>
                  <p className="text-white text-xl font-bold">
                    {teachers.reduce((sum, t) => sum + t.studentCount, 0)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Teacher Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <p className="text-white/60">Loading teachers...</p>
          </div>
        ) : error ? (
          <GlassCard className="p-12 text-center">
            <p className="text-red-400 text-lg mb-2">Error loading teachers</p>
            <p className="text-white/60">{error}</p>
          </GlassCard>
        ) : filteredTeachers.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-white/60 text-lg">
              {searchQuery ? `No teachers found matching "${searchQuery}"` : "No teachers available yet."}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <GlassCard
                key={teacher.id}
                className="p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:shadow-[0_0_32px_rgba(59,130,246,0.3)] hover:scale-105"
              >
                {/* Profile Image */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={teacher.profile_photo || `https://ui-avatars.com/api/?name=${teacher.first_name}+${teacher.last_name}&background=random&color=fff&size=128`}
                    alt={`${teacher.first_name} ${teacher.last_name}`}
                    className="w-full h-full rounded-full object-cover border-4 border-white/10 group-hover:border-cyan-400/50 transition-all duration-300"
                  />
                  {/* Floating Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.6)]">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {teacher.first_name} {teacher.last_name}
                </h3>

                {/* Subject */}
                <p className="text-cyan-400 text-center font-semibold mb-2">
                  {teacher.subject || 'LMS Instructor'}
                </p>

                {/* Quote */}
                <p className="text-white/60 text-sm text-center italic mb-4 line-clamp-2">
                  "{teacher.quote || 'Inspiring the next generation of leaders.'}"
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-4 mb-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} className="text-cyan-400" />
                    <span>{teacher.courseCount} courses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-cyan-400" />
                    <span>{teacher.studentCount}+ students</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold">{teacher.rating}</span>
                  <span className="text-white/60 text-sm">
                    ({teacher.reviewCount} reviews)
                  </span>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleViewProfile(teacher)}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform group-hover:scale-105"
                >
                  View Profile
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </DashboardLayout>

      <AIChat />
    </>
  );
}
