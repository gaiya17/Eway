import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import {
  Star,
  Mail,
  Building2,
  Award,
  MessageCircle,
  Clock,
  Users,
  Video,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface TeacherProfilePageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  teacherData?: any;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  quote: string;
  about: string;
  rating: number;
  reviewCount: number;
  profile_photo: string;
  courses: Course[];
}

interface Course {
  id: string;
  title: string;
  schedule: string;
  time: string;
  price: number;
  mode: 'Online' | 'Physical';
  duration: string;
}

interface Review {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  studentAvatar: string;
}

export function TeacherProfilePage({
  onLogout,
  onNavigate,
  teacherData: initialTeacherData,
}: TeacherProfilePageProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      const teacherId = initialTeacherData?.id;
      if (!teacherId) {
        setError('No teacher selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('eway_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Teacher Profile & Courses
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/teachers/${teacherId}`, { headers });
        if (!profileRes.ok) throw new Error('Failed to fetch teacher profile');
        const profileData = await profileRes.json();
        
        // Ensure defaults
        profileData.rating = profileData.rating || 4.8;
        profileData.reviewCount = profileData.reviewCount || 0;
        
        setTeacher(profileData);

        // 2. Check Enrollment for Chat button
        const enrollRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/enrollment-check/${teacherId}`, { headers });
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          setIsEnrolled(enrollData.isEnrolled);
        }
      } catch (err: any) {
        console.error('Error fetching teacher details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [initialTeacherData]);

  const reviews: Review[] = [
    {
      id: 1,
      studentName: 'Sahan Perera',
      rating: 5,
      comment: 'Excellent teacher! His teaching methods are very clear and easy to understand.',
      date: '2 weeks ago',
      studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
    }
  ];

  const handleEnroll = (course: Course) => {
    console.log('Enroll in course:', course);
    alert(`Enrolling in ${course.title} - Coming Soon!`);
  };

  const handleChatWithTeacher = () => {
    if (onNavigate) {
      onNavigate('chat', teacher);
    }
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="Teachers / Profile"
        activePage="teachers"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 col-span-full">
            <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <p className="text-white/60">Loading teacher profile...</p>
          </div>
        ) : error || !teacher ? (
          <GlassCard className="p-12 text-center col-span-full">
            <p className="text-red-400 text-lg mb-2">Error loading profile</p>
            <p className="text-white/60">{error || 'Teacher not found'}</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <GlassCard className="p-6 sticky top-8">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <img
                    src={teacher.profile_photo || `https://ui-avatars.com/api/?name=${teacher.first_name}+${teacher.last_name}&background=random&color=fff&size=200`}
                    alt={`${teacher.first_name} ${teacher.last_name}`}
                    className="w-full h-full rounded-full object-cover border-4 border-white/10"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0B0F1A] shadow-[0_0_16px_rgba(34,197,94,0.6)]" />
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  {teacher.first_name} {teacher.last_name}
                </h2>
                <p className="text-cyan-400 text-center font-semibold mb-4">
                  {teacher.subject || 'LMS Instructor'}
                </p>

                <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-white/10">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-xl">{teacher.rating}</span>
                  <span className="text-white/60">({teacher.reviewCount} reviews)</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Mail size={18} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs">Email</p>
                      <p className="text-white text-sm truncate">{teacher.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20">
                    <Users size={20} className="text-cyan-400 mb-1" />
                    <p className="text-white text-lg font-bold">100+</p>
                    <p className="text-white/60 text-xs">Students</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20">
                    <BookOpen size={20} className="text-green-400 mb-1" />
                    <p className="text-white text-lg font-bold">{teacher.courses?.length || 0}</p>
                    <p className="text-white/60 text-xs">Courses</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <GraduationCap size={18} className="text-cyan-400" />
                    About
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-6">{teacher.about || 'Dedicated instructor.'}</p>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={handleChatWithTeacher}
                    className="w-full px-6 py-3 rounded-xl border-2 border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Chat with Teacher
                  </button>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-white/40 text-xs mb-1 italic">Enroll in a class to unlock chat</p>
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Available Courses</h2>
                <div className="space-y-4">
                  {teacher.courses && teacher.courses.length > 0 ? (
                    teacher.courses.map((course: any) => (
                      <GlassCard key={course.id} className="p-6 transition-all duration-300 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                            <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-cyan-400" />
                                <span>{course.schedule || 'TBA'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 text-2xl font-bold">LKR {parseFloat(course.price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEnroll(course)}
                          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] transition-all duration-300"
                        >
                          Enroll Now
                        </button>
                      </GlassCard>
                    ))
                  ) : (
                    <div className="p-10 text-center border-2 border-dashed border-white/10 rounded-2xl text-white/40">
                      No active courses yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
      <AIChat />
    </>
  );
}