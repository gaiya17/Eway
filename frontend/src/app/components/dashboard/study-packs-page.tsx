import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import {
  FileText,
  Video,
  BookOpen,
  Download,
  Clock,
  Files,
  Eye,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Award,
  Star,
} from 'lucide-react';

interface StudyPacksPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface StudyPack {
  id: number;
  subject: string;
  title: string;
  description: string;
  fileCount: number;
  fileSize: string;
  downloads: number;
  updatedAt: string;
  price: number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  badge?: 'bestseller' | 'new' | 'popular' | 'none';
  popularityScore: number;
}

export function StudyPacksPage({ onLogout, onNavigate }: StudyPacksPageProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Study packs data
  const studyPacks: StudyPack[] = [
    {
      id: 1,
      subject: 'ICT',
      title: 'Complete ICT Study Pack 2026',
      description: 'Comprehensive materials including notes, past papers, and tutorials',
      fileCount: 45,
      fileSize: '1.2 GB',
      downloads: 324,
      updatedAt: '2 weeks ago',
      price: 2500,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      badge: 'bestseller',
      popularityScore: 95,
    },
    {
      id: 2,
      subject: 'Physics',
      title: 'A/L Physics Complete Package',
      description: 'Theory notes, practical guides, video lessons, and model papers',
      fileCount: 38,
      fileSize: '950 MB',
      downloads: 287,
      updatedAt: '1 week ago',
      price: 3000,
      icon: Video,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
      badge: 'popular',
      popularityScore: 88,
    },
    {
      id: 3,
      subject: 'Mathematics',
      title: 'Advanced Mathematics Study Materials',
      description: 'Complete notes, practice problems, and solution guides',
      fileCount: 52,
      fileSize: '800 MB',
      downloads: 412,
      updatedAt: '3 days ago',
      price: 2800,
      icon: BookOpen,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/20',
      badge: 'bestseller',
      popularityScore: 92,
    },
    {
      id: 4,
      subject: 'Chemistry',
      title: 'Chemistry A/L Study Bundle',
      description: 'Organic & inorganic chemistry notes with experiments',
      fileCount: 41,
      fileSize: '1.1 GB',
      downloads: 198,
      updatedAt: '5 days ago',
      price: 2750,
      icon: FileText,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/20',
      badge: 'new',
      popularityScore: 78,
    },
    {
      id: 5,
      subject: 'Biology',
      title: 'Complete Biology Resource Pack',
      description: 'Detailed study notes, diagrams, and revision materials',
      fileCount: 35,
      fileSize: '720 MB',
      downloads: 256,
      updatedAt: '1 week ago',
      price: 2600,
      icon: BookOpen,
      gradient: 'from-teal-500 to-cyan-500',
      iconBg: 'bg-teal-500/20',
      badge: 'popular',
      popularityScore: 85,
    },
    {
      id: 6,
      subject: 'Accounting',
      title: 'Business & Accounting Study Pack',
      description: 'Financial accounting, cost accounting, and business studies',
      fileCount: 48,
      fileSize: '650 MB',
      downloads: 175,
      updatedAt: '2 weeks ago',
      price: 2400,
      icon: FileText,
      gradient: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-500/20',
      badge: 'none',
      popularityScore: 72,
    },
    {
      id: 7,
      subject: 'English',
      title: 'English Language Mastery Pack',
      description: 'Grammar, literature, essay writing, and vocabulary guides',
      fileCount: 29,
      fileSize: '500 MB',
      downloads: 298,
      updatedAt: '4 days ago',
      price: 2200,
      icon: BookOpen,
      gradient: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-500/20',
      badge: 'popular',
      popularityScore: 86,
    },
    {
      id: 8,
      subject: 'Economics',
      title: 'A/L Economics Study Materials',
      description: 'Micro & macro economics with real-world case studies',
      fileCount: 33,
      fileSize: '580 MB',
      downloads: 142,
      updatedAt: '1 week ago',
      price: 2500,
      icon: FileText,
      gradient: 'from-rose-500 to-pink-500',
      iconBg: 'bg-rose-500/20',
      badge: 'new',
      popularityScore: 68,
    },
    {
      id: 9,
      subject: 'History',
      title: 'World History Complete Guide',
      description: 'Ancient to modern history with timelines and maps',
      fileCount: 37,
      fileSize: '890 MB',
      downloads: 167,
      updatedAt: '6 days ago',
      price: 2300,
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/20',
      badge: 'none',
      popularityScore: 70,
    },
  ];

  const handlePurchase = (packId: number) => {
    const pack = studyPacks.find((p) => p.id === packId);
    if (pack && onNavigate) {
      onNavigate('pack-checkout', pack);
    }
  };

  const handlePreview = (packId: number) => {
    const pack = studyPacks.find((p) => p.id === packId);
    if (pack && onNavigate) {
      onNavigate('pack-preview', pack);
    }
  };

  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="Study Packs"
        activePage="study-packs"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.4)]">
                <Files size={28} className="text-white" />
              </div>
              Study Packs
            </h1>
            <p className="text-white/60 text-lg">
              Download comprehensive study materials and resources
            </p>
          </div>

          {/* Study Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyPacks.map((pack) => (
              <GlassCard
                key={pack.id}
                className="p-0 overflow-hidden hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                onMouseEnter={() => setHoveredCard(pack.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  boxShadow:
                    hoveredCard === pack.id
                      ? '0 0 32px rgba(59, 130, 246, 0.4)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Colored Header with Gradient */}
                <div
                  className={`relative h-32 bg-gradient-to-br ${pack.gradient} flex items-center justify-between p-6`}
                >
                  {/* Left: Icon in Glass Box */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl ${pack.iconBg} backdrop-blur-xl border border-white/30 flex items-center justify-center`}
                    >
                      <pack.icon size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{pack.subject}</h3>
                    </div>
                  </div>

                  {/* Right: File Size Badge */}
                  <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                    <span className="text-white font-bold text-sm">{pack.fileSize}</span>
                  </div>

                  {/* Badge (Top Right Corner) */}
                  {pack.badge !== 'none' && (
                    <div className="absolute top-4 left-4">
                      {pack.badge === 'bestseller' && (
                        <div className="px-3 py-1.5 rounded-full bg-yellow-500/90 backdrop-blur-sm border border-yellow-400/50 flex items-center gap-1.5">
                          <Award size={14} className="text-white" />
                          <span className="text-white font-bold text-xs">BEST SELLER</span>
                        </div>
                      )}
                      {pack.badge === 'new' && (
                        <div className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm border border-green-400/50 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-white" />
                          <span className="text-white font-bold text-xs">NEW</span>
                        </div>
                      )}
                      {pack.badge === 'popular' && (
                        <div className="px-3 py-1.5 rounded-full bg-orange-500/90 backdrop-blur-sm border border-orange-400/50 flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-white" />
                          <span className="text-white font-bold text-xs">POPULAR</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                      {pack.title}
                    </h4>
                    <p className="text-white/60 text-sm leading-relaxed">{pack.description}</p>
                  </div>

                  {/* Info Rows */}
                  <div className="space-y-3">
                    {/* Files Included */}
                    <div className="flex items-center gap-3 text-white/70">
                      <Files size={18} className="text-cyan-400" />
                      <span className="text-sm">{pack.fileCount} Files Included</span>
                    </div>

                    {/* Updated */}
                    <div className="flex items-center gap-3 text-white/70">
                      <Clock size={18} className="text-cyan-400" />
                      <span className="text-sm">Updated {pack.updatedAt}</span>
                    </div>

                    {/* Downloads */}
                    <div className="flex items-center gap-3 text-white/70">
                      <Download size={18} className="text-cyan-400" />
                      <span className="text-sm">{pack.downloads} Downloads</span>
                    </div>
                  </div>

                  {/* Popularity Progress Bar */}
                  {pack.popularityScore >= 80 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60 flex items-center gap-1.5">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          Popularity
                        </span>
                        <span className="text-xs text-white/60">{pack.popularityScore}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${pack.popularityScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-green-400 text-2xl font-bold">
                        LKR {pack.price.toLocaleString()}
                      </span>
                      <span className="text-white/40 text-sm">one-time</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreview(pack.id)}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Preview
                    </button>

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePurchase(pack.id)}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Purchase
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Bottom Info Section */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Need Help Choosing?</h3>
                  <p className="text-white/60 text-sm">
                    Contact our support team for personalized recommendations
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-semibold transition-all duration-300">
                Contact Support
              </button>
            </div>
          </GlassCard>
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />
    </>
  );
}
