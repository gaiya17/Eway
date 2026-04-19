import React, { useState, useEffect } from 'react';
import apiClient from '@/api/api-client';
import { GlassCard } from './glass-card';
import { Search, Loader2, BookOpen, Clock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ExploreCoursesPageProps {
  onLoginClick?: () => void;
  onBackToHome?: () => void;
}

interface ClassTeaser {
  id: string;
  title: string;
  subject: string;
  thumbnail_url: string;
  teacher_name: string;
}

export function ExploreCoursesPage({ onLoginClick, onBackToHome }: ExploreCoursesPageProps) {
  const [courses, setCourses] = useState<ClassTeaser[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ClassTeaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const fetchPublicCourses = async () => {
      try {
        const response = await apiClient.get('/classes/public');
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch public courses:', error);
        toast.error('Could not load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.subject.toLowerCase().includes(q) ||
            c.teacher_name.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, courses]);

  const handleCourseClick = () => {
    toast.error('Authentication Required', {
      description: 'Please login to view full course details and enroll.',
    });
    // Redirect to login page slightly after to allow toast to render
    setTimeout(() => {
      if (onLoginClick) onLoginClick();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Explore Courses</h1>
            <p className="text-white/60">Discover our premium educational offerings taught by expert instructors.</p>
          </div>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              ← Back to Home
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <GlassCard className="p-2 border border-white/10 rounded-2xl flex items-center bg-white/5 max-w-2xl">
            <div className="pl-4 text-white/50">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search courses by name, subject, or teacher..."
              className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder:text-white/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </GlassCard>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <Loader2 size={48} className="animate-spin mb-4 text-cyan-400" />
            <p>Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/20 rounded-2xl">
            <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
            <p className="text-white/50">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <GlassCard 
                key={course.id} 
                className="overflow-hidden cursor-pointer group hover:border-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1"
                onClick={handleCourseClick}
              >
                {/* Course Thumbnail */}
                <div className="aspect-video bg-black/40 relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-white/20" size={48} />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-indigo-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                    {course.subject}
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                    <User size={16} className="text-cyan-400" />
                    <span>{course.teacher_name}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="text-cyan-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
