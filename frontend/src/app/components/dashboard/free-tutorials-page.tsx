import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../ui/image-with-fallback';
import {
  Youtube,
  Play,
  Video,
  Users,
  Clock,
  BookOpen,
  User,
  Eye,
  Sparkles,
  Loader2,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface FreeTutorialsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  subject: string;
  thumbnail_url: string;
  created_at: string;
  level: string;
  profiles: {
    first_name: string;
    last_name: string;
    profile_photo?: string;
  };
}

export function FreeTutorialsPage({ onLogout, onNavigate }: FreeTutorialsPageProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/free-tutorials/approved');
      setTutorials(response.data);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchTutorial = (tutorial: Tutorial) => {
    onNavigate?.('student-tutorial-player', { id: tutorial.id });
  };

  const handleVisitChannel = () => {
    window.open('https://youtube.com/@ewayinstitute', '_blank');
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Student"
        userInitials="ST"
        notificationCount={5}
        breadcrumb="Free Tutorials"
        activePage="tutorials"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.4)]">
                  <Youtube size={28} className="text-white" />
                </div>
                Academic Library
              </h1>
              <p className="text-white/60 text-lg">
                Explore free video lessons and resources shared by our top instructors.
              </p>
            </div>

            {/* Visit Channel Button */}
            <button
              onClick={handleVisitChannel}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold hover:shadow-[0_0_32px_rgba(239,68,68,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Youtube size={20} />
              Visit Channel
            </button>
          </div>

          {/* Videos Grid */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Latest Tutorials</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-cyan-400" size={48} />
              </div>
            ) : tutorials.length === 0 ? (
              <GlassCard className="p-20 text-center">
                <Video size={64} className="mx-auto text-white/10 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">No Tutorials Available</h3>
                <p className="text-white/60">Check back later for newly approved educational content.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((video) => (
                  <GlassCard
                    key={video.id}
                    className="p-0 overflow-hidden hover:scale-[1.02] transition-all duration-300 group cursor-pointer text-left"
                    onMouseEnter={() => setHoveredCard(video.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleWatchTutorial(video)}
                    style={{
                      boxShadow:
                        hoveredCard === video.id
                          ? '0 0 32px rgba(220, 38, 38, 0.3)'
                          : 'none',
                    }}
                  >
                    {/* Thumbnail Section */}
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={video.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/40 to-transparent" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center group/play">
                        <div
                          className={`w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.6)] group-hover/play:scale-110 group-hover/play:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 ${
                            hoveredCard === video.id ? 'scale-110' : ''
                          }`}
                        >
                          <Play size={24} className="text-white ml-1 fill-white" />
                        </div>
                      </div>

                      {/* FREE Badge (Top Left) */}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm border border-green-400/50 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-white" />
                          <span className="text-white font-bold text-[10px]">FREE ACCESS</span>
                        </div>
                      </div>

                      {/* Level Badge (Bottom Right) */}
                      <div className="absolute bottom-4 right-4">
                        <div className="px-2 py-1 rounded bg-black/80 backdrop-blur-sm border border-white/20">
                          <span className="text-white font-bold text-[10px] uppercase">
                            {video.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-4">
                      {/* Title */}
                      <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-red-400 transition-colors uppercase">
                        {video.title}
                      </h3>

                      {/* Meta Information */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Instructor */}
                        <div className="flex items-center gap-2 text-white/60">
                          <User size={14} className="text-red-400" />
                          <span className="text-xs truncate">{video.profiles?.first_name} {video.profiles?.last_name}</span>
                        </div>

                        {/* Subject */}
                        <div className="flex items-center gap-2 text-white/60">
                          <BookOpen size={14} className="text-red-400" />
                          <span className="text-xs truncate">{video.subject}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Play size={16} />
                        Watch Now
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Load More Section */}
          {!isLoading && tutorials.length > 0 && (
            <div className="flex justify-center pt-4">
              <button className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-400/50 text-white font-semibold transition-all duration-300">
                Explore More
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />
    </>
  );
}
