import React from 'react';
import { GlassCard } from './glass-card';
import { Users, BookOpen, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onRegisterClick?: () => void;
  onExploreCoursesClick?: () => void;
}

export function HeroSection({ onRegisterClick, onExploreCoursesClick }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1764720573370-5008f1ccc9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGFzc3Jvb20lMjBzdHVkZW50cyUyMGxlYXJuaW5nfGVufDF8fHx8MTc3MTY2NzU4OHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Modern Classroom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A]/95 via-[#0B0F1A]/90 to-[#0B0F1A]/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Learning Experience
              </span>
              with EWAY LMS
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              All-in-one platform for courses, payments, attendance, and student management. Join
              thousands of learners advancing their careers with cutting-edge education technology.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onRegisterClick}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
              <button 
                onClick={onExploreCoursesClick}
                className="px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                Explore Courses
              </button>
            </div>
          </div>

          {/* Right - Floating Stats Cards */}
          <div className="relative h-[400px] hidden lg:block">
            <GlassCard
              className="absolute top-0 right-0 p-6 w-56 animate-float"
              hover
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-white/70 text-sm">Students</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="absolute top-32 right-16 p-6 w-56 animate-float-delayed"
              hover
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-white/70 text-sm">Courses</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="absolute top-64 right-4 p-6 w-56 animate-float"
              hover
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">95%</p>
                  <p className="text-white/70 text-sm">Success Rate</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <GlassCard className="p-6" hover>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-white/70 text-sm mt-1">Students</p>
            </div>
          </GlassCard>
          <GlassCard className="p-6" hover>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-white/70 text-sm mt-1">Courses</p>
            </div>
          </GlassCard>
          <GlassCard className="p-6" hover>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">95%</p>
              <p className="text-white/70 text-sm mt-1">Success Rate</p>
            </div>
          </GlassCard>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}
