import React, { useState } from 'react';
import { GlassCard } from '../glass-card';
import { ImageWithFallback } from '../ui/image-with-fallback';
import {
  X,
  Star,
  User,
  Calendar,
  Users,
  Check,
  Wifi,
  MapPin,
  Play,
  Clock,
  Award,
  BookOpen,
  ShoppingCart,
  Flame,
  Sparkles,
} from 'lucide-react';

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string | number;
    title: string;
    teacher: string;
    schedule: string;
    description?: string;
    duration?: string;
    studentsEnrolled: number;
    rating: number;
    price: number;
    type: 'online' | 'physical' | 'Online' | 'Physical';
    badge: 'popular' | 'new' | 'none';
    thumbnail: string;
    category: string;
    features: string[];
    fullyBooked: boolean;
  };
  onBuyNow: (courseId: any) => void;
  onAddToCart?: (courseId: any, courseName: string) => void;
  relatedCourses?: Array<{
    id: string | number;
    title: string;
    teacher: string;
    price: number;
    thumbnail: string;
    rating: number;
  }>;
}

export function CoursePreviewModal({
  isOpen,
  onClose,
  course,
  onBuyNow,
  onAddToCart,
  relatedCourses = [],
}: CoursePreviewModalProps) {
  const [showVideo, setShowVideo] = useState(false);

  if (!isOpen) return null;

  // Use real description if available, fallback to generated one
  const courseDescription = course.description ||
    `This comprehensive course is designed to provide students with in-depth knowledge and practical skills in ${course.title}. Our expert instructor, ${course.teacher}, brings years of experience and a proven track record of student success. The course includes interactive live sessions, comprehensive study materials, and personalized feedback to ensure you achieve your academic goals.`;

  // Course stats with real duration if available
  const courseStats = [
    { icon: Clock, label: 'Duration', value: course.duration || 'See Schedule' },
    { icon: BookOpen, label: 'Lessons', value: 'Live Classes' },
    { icon: Award, label: 'Certificate', value: 'Included' },
    { icon: Users, label: 'Enrolled', value: course.studentsEnrolled > 0 ? `${course.studentsEnrolled}` : 'Open' },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="min-h-screen py-8 px-4 flex items-start justify-center">
        <div className="w-full max-w-5xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
          {/* Close Button (Floating) */}
          <button
            onClick={onClose}
            className="fixed top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300 z-10"
          >
            <X size={24} />
          </button>

          {/* Main Content Card */}
          <GlassCard className="overflow-hidden p-0">
            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
              <ImageWithFallback
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/80 to-transparent" />

              {/* Badges (Top Right) */}
              <div className="absolute top-6 right-6 flex flex-col gap-3 items-end">
                {/* Type Badge */}
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-xl border ${
                    course.type === 'online'
                      ? 'bg-blue-500/30 text-blue-300 border-blue-400/50'
                      : 'bg-orange-500/30 text-orange-300 border-orange-400/50'
                  }`}
                >
                  {course.type === 'online' ? <Wifi size={16} /> : <MapPin size={16} />}
                  {course.type === 'online' ? 'Online' : 'Physical'}
                </div>

                {/* Badge (Popular/New) */}
                {course.badge === 'popular' && (
                  <div className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 backdrop-blur-xl">
                    <Flame size={16} />
                    POPULAR
                  </div>
                )}
                {course.badge === 'new' && (
                  <div className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 bg-green-500/30 text-green-300 border border-green-400/50 backdrop-blur-xl">
                    <Sparkles size={16} />
                    NEW
                  </div>
                )}
              </div>

              {/* Rating Badge (Top Left) */}
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold">{course.rating}</span>
                <span className="text-white/60 text-sm">({course.studentsEnrolled} reviews)</span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {course.title}
                </h1>

                {/* Instructor */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {course.teacher.split(' ')[1]?.[0] || 'T'}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Instructor</p>
                    <p className="text-white font-semibold">{course.teacher}</p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex flex-wrap gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-400" />
                    <span className="text-sm">{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-cyan-400" />
                    <span className="text-sm">{course.studentsEnrolled} Students Enrolled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-8">
              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {courseStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <stat.icon size={24} className="text-cyan-400 mb-2" />
                    <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                    <p className="text-white font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Course Description */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Course Description</h2>
                <p className="text-white/70 leading-relaxed">{courseDescription}</p>
              </div>

              {/* Features List */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">What You'll Get</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10 hover:border-green-400/50 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-400/50 group-hover:bg-green-500/30 transition-all">
                        <Check size={18} className="text-green-400" />
                      </div>
                      <span className="text-white font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Preview Section */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Course Preview</h2>
                {!showVideo ? (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="relative w-full h-64 rounded-2xl overflow-hidden group"
                  >
                    <ImageWithFallback
                      src={course.thumbnail}
                      alt="Video preview"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform">
                        <Play size={32} className="text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-semibold text-lg">Watch Course Introduction</p>
                      <p className="text-white/70 text-sm">2:30 minutes</p>
                    </div>
                  </button>
                ) : (
                  <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                    <p className="text-white/60">Video player would appear here</p>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Student Reviews</h2>
                <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-white/60">Reviews will appear here once students complete the course.</p>
                </div>
              </div>

              {/* Related Courses */}
              {relatedCourses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Related Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedCourses.slice(0, 3).map((relatedCourse) => (
                      <div
                        key={relatedCourse.id}
                        className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <ImageWithFallback
                            src={relatedCourse.thumbnail}
                            alt={relatedCourse.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] to-transparent" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {relatedCourse.title}
                          </h3>
                          <p className="text-white/60 text-xs mb-2">{relatedCourse.teacher}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-white text-xs font-semibold">
                                {relatedCourse.rating}
                              </span>
                            </div>
                            <span className="text-green-400 font-bold text-sm">
                              LKR {relatedCourse.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Action Section */}
              <div className="sticky bottom-0 -mx-8 -mb-8 p-6 bg-[#0B0F1A]/95 backdrop-blur-xl border-t border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Price */}
                  <div>
                    <p className="text-white/60 text-sm mb-1">Course Fee</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-green-400 text-3xl font-bold">
                        LKR {course.price.toLocaleString()}
                      </span>
                      <span className="text-white/40 text-sm">/course</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {onAddToCart && !course.fullyBooked && (
                      <button
                        onClick={() => onAddToCart(course.id, course.title)}
                        className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:border-cyan-400/50"
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => onBuyNow(course.id)}
                      disabled={course.fullyBooked}
                      className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                        course.fullyBooked
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transform hover:scale-105'
                      }`}
                    >
                      {course.fullyBooked ? 'Fully Booked' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
