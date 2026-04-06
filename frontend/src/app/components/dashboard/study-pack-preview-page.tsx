import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  ArrowLeft,
  Play,
  FileText,
  Video,
  Lock,
  Download,
  Clock,
  Files,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Star,
  BookOpen,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface StudyPackPreviewPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  packData?: any;
}

interface FileItem {
  id: number;
  title: string;
  type: 'pdf' | 'video' | 'notes' | 'code';
  size: string;
  isLocked: boolean;
}

export function StudyPackPreviewPage({
  onLogout,
  onNavigate,
  packData,
}: StudyPackPreviewPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Default pack data if none provided
  const pack = packData || {
    id: 1,
    subject: 'ICT',
    title: 'Complete ICT Study Pack 2026',
    description:
      'Comprehensive materials including notes, past papers, tutorials, and recorded lessons. Everything you need to excel in A/L ICT.',
    fileCount: 45,
    fileSize: '1.2 GB',
    downloads: 324,
    updatedAt: '2 weeks ago',
    price: 2500,
    popularityScore: 95,
    previewVideo:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBzY3JlZW58ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
    videoDuration: '12:45',
  };

  // Sample file list
  const fileList: FileItem[] = [
    {
      id: 1,
      title: 'Lesson 1 - Networking Basics.pdf',
      type: 'pdf',
      size: '5.2 MB',
      isLocked: false,
    },
    {
      id: 2,
      title: 'Introduction to Programming - Video Lesson.mp4',
      type: 'video',
      size: '124 MB',
      isLocked: false,
    },
    {
      id: 3,
      title: 'Database Management - Lecture Notes.pdf',
      type: 'notes',
      size: '3.8 MB',
      isLocked: false,
    },
    {
      id: 4,
      title: 'Web Development Tutorial - HTML & CSS.pdf',
      type: 'pdf',
      size: '8.5 MB',
      isLocked: true,
    },
    {
      id: 5,
      title: 'Python Programming Examples.py',
      type: 'code',
      size: '2.1 MB',
      isLocked: true,
    },
    {
      id: 6,
      title: 'Past Paper 2025 - Theory Section.pdf',
      type: 'pdf',
      size: '6.3 MB',
      isLocked: true,
    },
    {
      id: 7,
      title: 'System Analysis & Design Video.mp4',
      type: 'video',
      size: '98 MB',
      isLocked: true,
    },
    {
      id: 8,
      title: 'Algorithm Optimization Techniques.pdf',
      type: 'notes',
      size: '4.7 MB',
      isLocked: true,
    },
    {
      id: 9,
      title: 'Data Structures - Complete Guide.pdf',
      type: 'pdf',
      size: '7.2 MB',
      isLocked: true,
    },
    {
      id: 10,
      title: 'Project Development Tutorial.mp4',
      type: 'video',
      size: '156 MB',
      isLocked: true,
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'notes':
        return BookOpen;
      case 'code':
        return FileCode;
      default:
        return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'notes':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'code':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('study-packs');
    }
  };

  const handlePurchase = () => {
    if (onNavigate) {
      onNavigate('pack-checkout', pack);
    }
  };

  const handlePlayPreview = () => {
    setIsPlaying(true);
    // In production, this would open a video player
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="Study Packs / Preview"
        activePage="study-packs"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Header */}
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4 group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-semibold">Back to Study Packs</span>
            </button>

            <h1 className="text-4xl font-bold text-white mb-2">
              {pack.subject} Study Pack Preview
            </h1>
            <p className="text-white/60 text-lg">Explore contents before purchasing</p>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Preview Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Preview Card */}
              <GlassCard className="p-0 overflow-hidden">
                <div className="relative h-80 overflow-hidden group cursor-pointer">
                  {/* Video Thumbnail */}
                  <ImageWithFallback
                    src={pack.previewVideo}
                    alt="Preview lesson"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/40 to-transparent" />

                  {/* Play Button */}
                  <button
                    onClick={handlePlayPreview}
                    className="absolute inset-0 flex items-center justify-center group/play"
                  >
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_32px_rgba(59,130,246,0.6)] group-hover/play:scale-110 group-hover/play:shadow-[0_0_48px_rgba(59,130,246,0.8)] transition-all duration-300 ${
                        isPlaying ? 'scale-95' : ''
                      }`}
                    >
                      <Play size={32} className="text-white ml-1 fill-white" />
                    </div>
                  </button>

                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                      <span className="text-white font-semibold text-sm">
                        {pack.videoDuration}
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-4 left-4">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm border border-white/30">
                      <span className="text-white font-bold">Preview Lesson</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* File List Card */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Files size={28} className="text-cyan-400" />
                    Study Pack Contents
                  </h2>
                  <span className="text-white/60 text-sm">
                    {fileList.filter((f) => !f.isLocked).length} of {fileList.length}{' '}
                    preview
                  </span>
                </div>

                {/* Scrollable File List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {fileList.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          file.isLocked
                            ? 'bg-white/[0.02] border-white/5 opacity-60'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={`w-12 h-12 rounded-xl ${
                              file.isLocked ? 'bg-white/5' : 'bg-cyan-500/20'
                            } border border-white/10 flex items-center justify-center flex-shrink-0`}
                          >
                            {file.isLocked ? (
                              <Lock size={20} className="text-white/40" />
                            ) : (
                              <FileIcon size={20} className="text-cyan-400" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold mb-1 truncate ${
                                file.isLocked
                                  ? 'text-white/40 blur-[2px]'
                                  : 'text-white'
                              }`}
                            >
                              {file.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-semibold border ${getTypeBadgeColor(
                                  file.type
                                )}`}
                              >
                                {file.type.toUpperCase()}
                              </span>
                              <span className="text-white/50 text-sm">{file.size}</span>
                            </div>
                          </div>

                          {/* Lock/Download Icon */}
                          {file.isLocked ? (
                            <Lock size={20} className="text-white/30 flex-shrink-0" />
                          ) : (
                            <Download
                              size={20}
                              className="text-cyan-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unlock Message */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20">
                  <p className="text-white/70 text-sm text-center">
                    🔓 <span className="font-semibold text-white">Purchase</span> this
                    pack to unlock all {fileList.length} files
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Right Side - Summary Card (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Summary Card */}
                <GlassCard className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{pack.title}</h3>
                    <p className="text-white/60 leading-relaxed">{pack.description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Files size={18} className="text-cyan-400" />
                        <span className="text-white/60 text-sm">Files</span>
                      </div>
                      <p className="text-white font-bold text-xl">{pack.fileCount}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Download size={18} className="text-cyan-400" />
                        <span className="text-white/60 text-sm">Downloads</span>
                      </div>
                      <p className="text-white font-bold text-xl">{pack.downloads}</p>
                    </div>
                  </div>

                  {/* Updated */}
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock size={18} className="text-cyan-400" />
                    <span className="text-sm">Updated {pack.updatedAt}</span>
                  </div>

                  {/* Popularity Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60 flex items-center gap-1.5">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        Popularity
                      </span>
                      <span className="text-sm text-white/60">
                        {pack.popularityScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                        style={{ width: `${pack.popularityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Price */}
                  <div>
                    <p className="text-white/60 text-sm mb-2">One-time purchase</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-green-400 text-4xl font-bold">
                        LKR {pack.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Purchase Button */}
                    <button
                      onClick={handlePurchase}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Purchase Now
                    </button>

                    {/* Preview More Button */}
                    <button className="w-full px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                      <Eye size={20} />
                      Preview More
                    </button>
                  </div>
                </GlassCard>

                {/* What You Get Card */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-400" />
                    What You Get
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">Complete Study Notes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">Past Paper Collection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">Video Tutorials</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">Recorded Lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">Practice Problems</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">Lifetime Access</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  );
}
