import React, { useState, useEffect } from 'react';
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
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface StudyPacksPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface StudyPack {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  price: number;
  cover_image: string;
  level: string;
  subject: string;
  category: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    profile_photo: string;
  };
}

export function StudyPacksPage({ onLogout, onNavigate }: StudyPacksPageProps) {
  const [packs, setPacks] = useState<StudyPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState<'all' | 'OL' | 'AL'>('all');

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/study-packs/approved');
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching study packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = (pack: StudyPack) => {
    if (onNavigate) {
      onNavigate('pack-checkout', pack);
    }
  };

  const handlePreview = (pack: StudyPack) => {
    if (onNavigate) {
      onNavigate('pack-preview', pack);
    }
  };

  const filteredPacks = packs.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = activeLevel === 'all' || p.level === activeLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <>
      <DashboardLayout
        userRole="student"
        notificationCount={5}
        breadcrumb="Study Packs"
        activePage="study-packs"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
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

            {/* Level Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
              {(['all', 'OL', 'AL'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveLevel(level)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeLevel === level
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters Strip */}
          <GlassCard className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search by subject, title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all"
              />
            </div>
          </GlassCard>

          {/* Study Packs Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-cyan-400" size={48} />
              <p className="text-white/40 font-medium">Loading high-quality resources...</p>
            </div>
          ) : filteredPacks.length === 0 ? (
            <div className="py-20 text-center">
              <Filter className="mx-auto text-white/10 mb-6" size={64} />
              <h3 className="text-2xl font-bold text-white mb-2">No Study Packs Found</h3>
              <p className="text-white/40">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPacks.map((pack) => (
                <GlassCard
                  key={pack.id}
                  className="p-0 overflow-hidden hover:-translate-y-2 transition-all duration-300 group cursor-pointer border-white/10 hover:border-cyan-400/50"
                  onClick={() => handlePreview(pack)}
                >
                  {/* cover Header with Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={pack.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000'} 
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent" />
                    
                    {/* Level Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest leading-none">
                         {pack.level}
                       </span>
                       <span className="px-3 py-1 rounded-full bg-cyan-500/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest leading-none uppercase">
                         {pack.subject}
                       </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{pack.category}</p>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors uppercase leading-tight truncate">
                         {pack.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-5">
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                      {pack.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                          <img src={pack.profiles.profile_photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-white/50 text-xs font-medium">{pack.profiles.first_name} {pack.profiles.last_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Clock size={12} className="text-cyan-400" />
                        <span>{new Date(pack.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Price and Buttons */}
                    <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Invest in Success</span>
                        <span className="text-green-400 text-xl font-bold">LKR {pack.price.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePurchase(pack); }}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                      >
                        <ShoppingCart size={18} /> Purchase
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Bottom Info Section */}
          <GlassCard className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/20" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">Empower Your Learning Journey</h3>
                  <p className="text-white/60">Unlock expert-crafted materials designed for top results.</p>
                </div>
              </div>
              <button className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-bold transition-all duration-300 transform hover:scale-105">
                Explore More Resources
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
