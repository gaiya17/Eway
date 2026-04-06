import React, { useState } from 'react';
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
} from 'lucide-react';

interface FreeTutorialsPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface TutorialVideo {
  id: number;
  title: string;
  instructor: string;
  subject: string;
  views: string;
  duration: string;
  thumbnail: string;
  youtubeUrl: string;
}

export function FreeTutorialsPage({ onLogout, onNavigate }: FreeTutorialsPageProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Sample tutorial videos data
  const videos: TutorialVideo[] = [
    {
      id: 1,
      title: 'Chemical Bonding - Complete Guide for A/L Chemistry',
      instructor: 'Mr. Amila Dasanayake',
      subject: 'Chemistry',
      views: '12.5K',
      duration: '45:32',
      thumbnail:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJ8ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 2,
      title: 'Calculus Integration - Advanced Mathematics A/L',
      instructor: 'Mrs. Nimali Fernando',
      subject: 'Mathematics',
      views: '18.2K',
      duration: '52:18',
      thumbnail:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGNoYWxrYm9hcmR8ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 3,
      title: 'Photosynthesis & Plant Biology - O/L Science',
      instructor: 'Mr. Suresh Bandara',
      subject: 'Biology',
      views: '9.8K',
      duration: '38:45',
      thumbnail:
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGJpb2xvZ3l8ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 4,
      title: 'Business Accounting Fundamentals - Commerce Stream',
      instructor: 'Mr. Suresh Bandara',
      subject: 'Accounting',
      views: '15.3K',
      duration: '41:20',
      thumbnail:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50aW5nfGVufDB8fHx8MTc0MDMzNzIwMHww&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 5,
      title: 'English Grammar Essentials - Tenses & Sentence Structure',
      instructor: 'Mrs. Kumari Perera',
      subject: 'English',
      views: '22.1K',
      duration: '36:15',
      thumbnail:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwZ3JhbW1hcnxlbnwwfHx8fDE3NDAzMzcyMDB8MA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 6,
      title: 'Physics Mechanics - Force & Motion Explained',
      instructor: 'Mr. Ranjan Silva',
      subject: 'Physics',
      views: '14.7K',
      duration: '49:52',
      thumbnail:
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHlzaWNzJTIwZm9yY2V8ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 7,
      title: 'World History - Modern Era & Global Conflicts',
      instructor: 'Mr. Kamal Jayasinghe',
      subject: 'History',
      views: '8.4K',
      duration: '55:30',
      thumbnail:
        'https://images.unsplash.com/photo-1461360370896-922624d12aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYm9va3N8ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 8,
      title: 'Information Technology - Programming Basics with Python',
      instructor: 'Mr. Dinesh Wickramasinghe',
      subject: 'ICT',
      views: '25.6K',
      duration: '1:02:45',
      thumbnail:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHB5dGhvbnxlbnwwfHx8fDE3NDAzMzcyMDB8MA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
    {
      id: 9,
      title: 'Sri Lankan Geography - Climate & Natural Resources',
      instructor: 'Mrs. Sandya Rathnayake',
      subject: 'Geography',
      views: '11.2K',
      duration: '43:18',
      thumbnail:
        'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcmklMjBsYW5rYSUyMG1hcHxlbnwwfHx8fDE3NDAzMzcyMDB8MA&ixlib=rb-4.0.3&q=80&w=1080',
      youtubeUrl: 'https://youtube.com',
    },
  ];

  // Stats data
  const stats = [
    {
      id: 1,
      label: 'Total Videos',
      value: '250+',
      icon: Video,
      color: 'from-red-500 to-pink-500',
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      id: 2,
      label: 'Subscribers',
      value: '50K+',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 3,
      label: 'Watch Time',
      value: '2M+',
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      id: 4,
      label: 'Subjects',
      value: '12',
      icon: BookOpen,
      color: 'from-yellow-500 to-orange-500',
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
  ];

  const handleWatchVideo = (youtubeUrl: string) => {
    window.open(youtubeUrl, '_blank');
  };

  const handleVisitChannel = () => {
    window.open('https://youtube.com/@ewayinstitute', '_blank');
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="Free Tutorials"
        activePage="tutorials"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.4)]">
                  <Youtube size={28} className="text-white" />
                </div>
                Free YouTube Tutorials
              </h1>
              <p className="text-white/60 text-lg">
                Access our free educational content on YouTube
              </p>
            </div>

            {/* Visit Channel Button */}
            <button
              onClick={handleVisitChannel}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:shadow-[0_0_32px_rgba(239,68,68,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Youtube size={20} />
              Visit Channel
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <GlassCard
                key={stat.id}
                className={`p-6 hover:scale-105 transition-all duration-300 border ${stat.borderColor}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
                  >
                    <stat.icon size={28} className={stat.iconColor} />
                  </div>
                </div>
                <div>
                  <p
                    className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-white/60 font-medium">{stat.label}</p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Videos Grid */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Latest Tutorials</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <GlassCard
                  key={video.id}
                  className="p-0 overflow-hidden hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                  onMouseEnter={() => setHoveredCard(video.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    boxShadow:
                      hoveredCard === video.id
                        ? '0 0 32px rgba(59, 130, 246, 0.3)'
                        : 'none',
                  }}
                >
                  {/* Thumbnail Section */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/40 to-transparent" />

                    {/* Play Button */}
                    <button
                      onClick={() => handleWatchVideo(video.youtubeUrl)}
                      className="absolute inset-0 flex items-center justify-center group/play"
                    >
                      <div
                        className={`w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.6)] group-hover/play:scale-110 group-hover/play:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 ${
                          hoveredCard === video.id ? 'scale-110' : ''
                        }`}
                      >
                        <Play size={28} className="text-white ml-1 fill-white" />
                      </div>
                    </button>

                    {/* FREE Badge (Top Left) */}
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm border border-green-400/50 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-white" />
                        <span className="text-white font-bold text-xs">FREE</span>
                      </div>
                    </div>

                    {/* Duration (Bottom Right) */}
                    <div className="absolute bottom-4 right-4">
                      <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                        <span className="text-white font-semibold text-sm">
                          {video.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {video.title}
                    </h3>

                    {/* Meta Information */}
                    <div className="space-y-2">
                      {/* Instructor */}
                      <div className="flex items-center gap-2 text-white/70">
                        <User size={16} className="text-cyan-400" />
                        <span className="text-sm">{video.instructor}</span>
                      </div>

                      {/* Subject */}
                      <div className="flex items-center gap-2 text-white/70">
                        <BookOpen size={16} className="text-cyan-400" />
                        <span className="text-sm">{video.subject}</span>
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-2 text-white/70">
                        <Eye size={16} className="text-cyan-400" />
                        <span className="text-sm">{video.views} views</span>
                      </div>
                    </div>

                    {/* Watch Button */}
                    <button
                      onClick={() => handleWatchVideo(video.youtubeUrl)}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Youtube size={18} />
                      Watch on YouTube
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Load More Section */}
          <div className="flex justify-center pt-4">
            <button className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-semibold transition-all duration-300">
              Load More Videos
            </button>
          </div>
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />
    </>
  );
}
