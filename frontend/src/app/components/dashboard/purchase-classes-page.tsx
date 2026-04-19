import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../ui/image-with-fallback';
import { CoursePreviewModal } from './course-preview-modal';
import apiClient from '@/api/api-client';
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Star,
  Users,
  Wifi,
  MapPin,
  Check,
  ChevronDown,
  Flame,
  Sparkles,
  Eye,
  Calendar,
  Clock,
} from 'lucide-react';

interface PurchaseClassesPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

type CourseType = 'Online' | 'Physical';
type CategoryType = 'all' | 'science' | 'maths' | 'commerce' | 'language' | 'technology';
type SortType = 'newest' | 'popular' | 'price-low' | 'price-high';

interface CourseData {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  schedule: string;
  time: string;
  duration: string;
  mode: CourseType;
  thumbnail_url: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  schedules?: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export function PurchaseClassesPage({ onLogout, onNavigate }: PurchaseClassesPageProps) {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [purchasedClassIds, setPurchasedClassIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('newest');
  const [cart, setCart] = useState<string[]>([]);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [addedCourseName, setAddedCourseName] = useState('');
  const [previewCourse, setPreviewCourse] = useState<CourseData | null>(null);

  // Helper to format time (e.g., 08:30 -> 8:30 AM)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper to get recurrence text
  const getRecurrenceText = (schedules?: any[]) => {
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return 'To be scheduled';
    const days = Array.from(new Set(schedules.map((s) => s.day)));
    return `Every ${days.join(', ')}`;
  };

  // Helper to get time slot text
  const getTimeSlotText = (schedules?: any[]) => {
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return 'Time TBD';
    const slot = schedules[0];
    return `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`;
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch approved classes + student's enrollments/payments in parallel
      const [classesRes, enrollRes, paymentsRes] = await Promise.allSettled([
        apiClient.get('/classes/approved'),
        apiClient.get('/payments/my-enrollments'),
        apiClient.get('/payments/my-payments'),
      ]);

      if (classesRes.status === 'fulfilled') {
        setCourses(classesRes.value.data || []);
      }

      // Build a set of class IDs the student has already purchased / is enrolled in
      const ids = new Set<string>();
      if (enrollRes.status === 'fulfilled') {
        (enrollRes.value.data || []).forEach((e: any) => {
          if (e.classes?.id) ids.add(e.classes.id);
        });
      }
      if (paymentsRes.status === 'fulfilled') {
        // Exclude pending AND approved payments (student shouldn't repurchase)
        (paymentsRes.value.data || []).forEach((p: any) => {
          if (p.class_id && (p.status === 'pending' || p.status === 'approved')) {
            ids.add(p.class_id);
          }
        });
      }
      setPurchasedClassIds(ids);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort courses — exclude already-purchased/enrolled ones
  const getFilteredCourses = () => {
    // Only show courses the student has NOT purchased or enrolled in
    let filtered = courses.filter((c) => !purchasedClassIds.has(c.id));

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.profiles.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.profiles.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.subject.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  const handleAddToCart = (courseId: string, courseName: string) => {
    if (!cart.includes(courseId)) {
      setCart([...cart, courseId]);
      setAddedCourseName(courseName);
      setShowAddedNotification(true);
      setTimeout(() => setShowAddedNotification(false), 3000);
    }
  };

  const handleBuyNow = (courseId: string, courseName: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      onNavigate?.('checkout', {
        id: course.id,
        title: course.title,
        teacher: `${course.profiles.first_name} ${course.profiles.last_name}`,
        type: course.mode.toLowerCase(),
        price: course.price,
        thumbnail: course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000',
      });
    }
  };

  const handleViewDetails = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setPreviewCourse(course);
    }
  };

  const handleBuyNowFromPreview = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setPreviewCourse(null);
      handleBuyNow(course.id, course.title);
    }
  };

  const handleAddToCartFromPreview = (courseId: string, courseName: string) => {
    handleAddToCart(courseId, courseName);
  };

  const getRelatedCourses = (currentCourse: CourseData) => {
    return courses
      .filter((c) => c.id !== currentCourse.id && c.subject === currentCourse.subject)
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        title: c.title,
        teacher: `${c.profiles.first_name} ${c.profiles.last_name}`,
        price: c.price,
        thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000',
        rating: 4.8, // Mocked rating
      }));
  };

  // Adapter for CoursePreviewModal with real data
  const adaptedPreviewCourse = previewCourse ? {
    id: previewCourse.id,
    title: previewCourse.title,
    teacher: `${previewCourse.profiles.first_name} ${previewCourse.profiles.last_name}`,
    schedule: getRecurrenceText(previewCourse.schedules),
    timeSlot: getTimeSlotText(previewCourse.schedules),
    description: previewCourse.description,
    duration: previewCourse.duration,
    studentsEnrolled: 0,
    rating: 4.8,
    price: previewCourse.price,
    type: previewCourse.mode,
    badge: 'none' as any,
    thumbnail: previewCourse.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000',
    category: 'all' as any,
    features: ['Live Sessions', 'Recorded Videos', `${previewCourse.mode} Class`, `${previewCourse.duration} Duration`],
    fullyBooked: false,
  } : null;

  return (
    <>
      <DashboardLayout
        userRole="student"
        notificationCount={5}
        breadcrumb="Purchase Classes"
        activePage="purchase"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => onNavigate?.('dashboard')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">Purchase Classes</h1>
              <p className="text-white/60">Browse and enroll in available courses</p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => alert('Cart page - Coming Soon!')}
              className="relative flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingCart size={20} />
              <span>Cart ({cart.length})</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-[0_0_16px_rgba(239,68,68,0.6)]">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Search & Filters */}
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by subject or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                  className="appearance-none w-full lg:w-48 px-4 py-3 pr-10 bg-[#111827] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="science">Science</option>
                  <option value="maths">Mathematics</option>
                  <option value="commerce">Commerce</option>
                  <option value="language">Language</option>
                  <option value="technology">Technology</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  size={20}
                />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as SortType)}
                  className="appearance-none w-full lg:w-48 px-4 py-3 pr-10 bg-[#111827] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
          </GlassCard>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">{purchasedClassIds.size > 0 && courses.length > 0 && courses.length === purchasedClassIds.size ? '🎓' : '🔍'}</div>
                  <p className="text-white/60 text-lg">
                    {purchasedClassIds.size > 0 && courses.length > 0 && courses.every(c => purchasedClassIds.has(c.id))
                      ? 'You are enrolled in all available classes!'
                      : 'No courses found'}
                  </p>
                  <p className="text-white/40 text-sm mt-2">
                    {purchasedClassIds.size > 0 && courses.every(c => purchasedClassIds.has(c.id))
                      ? 'Check My Classes to access your enrolled courses.'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {purchasedClassIds.size > 0 && courses.every(c => purchasedClassIds.has(c.id)) && (
                    <button onClick={() => onNavigate?.('classes')}
                      className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300">
                      Go to My Classes
                    </button>
                  )}
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <GlassCard
                    key={course.id}
                    className="p-0 overflow-hidden group hover:shadow-[0_0_32px_rgba(59,130,246,0.4)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 overflow-hidden">
                      <ImageWithFallback
                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/70 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div>
                          {course.price > 15000 && (
                            <div className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 backdrop-blur-xl">
                              <Flame size={14} />
                              POPULAR
                            </div>
                          )}
                        </div>

                        {/* Type Badge */}
                        <div
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl border ${
                            course.mode === 'Online'
                              ? 'bg-blue-500/30 text-blue-300 border-blue-400/50'
                              : 'bg-orange-500/30 text-orange-300 border-orange-400/50'
                          }`}
                        >
                          {course.mode === 'Online' ? (
                            <>
                              <Wifi size={12} />
                              Online
                            </>
                          ) : (
                            <>
                              <MapPin size={12} />
                              Physical
                            </>
                          )}
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-semibold text-sm">
                          4.8
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Title */}
                      <h3 className="text-white font-bold text-xl leading-tight group-hover:text-cyan-400 transition-colors">
                        {course.title}
                      </h3>

                      {/* Teacher */}
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                          {course.profiles.first_name[0]}
                        </div>
                        <span>{course.profiles.first_name} {course.profiles.last_name}</span>
                      </div>

                      {/* Schedule - Day & Time */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Calendar size={16} className="text-cyan-400" />
                          <span className="font-medium">{getRecurrenceText(course.schedules)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Clock size={16} className="text-cyan-400" />
                          <span className="font-medium">{getTimeSlotText(course.schedules)}</span>
                        </div>
                      </div>

                      {/* Features List (Mocked) */}
                      <div className="pt-2 space-y-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Check size={16} className="text-green-400" />
                          <span>Live Sessions & Recordings</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Check size={16} className="text-green-400" />
                          <span>{course.duration} Session</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-green-400 text-2xl font-bold">
                            LKR {course.price.toLocaleString()}
                          </span>
                          <span className="text-white/40 text-sm">/course</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleBuyNow(course.id, course.title)}
                          className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] transform hover:scale-105 transition-all duration-300"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => handleViewDetails(course.id)}
                          className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 group/btn"
                        >
                          <Eye size={20} className="group-hover/btn:text-cyan-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* AI Chatbot */}
      <AIChat />

      {/* Course Preview Modal */}
      {previewCourse && adaptedPreviewCourse && (
        <CoursePreviewModal
          isOpen={!!previewCourse}
          onClose={() => setPreviewCourse(null)}
          course={adaptedPreviewCourse as any}
          onBuyNow={handleBuyNowFromPreview}
          onAddToCart={handleAddToCartFromPreview}
          relatedCourses={getRelatedCourses(previewCourse) as any}
        />
      )}

      {/* Added to Cart Notification */}
      {showAddedNotification && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0F172A]/95 backdrop-blur-xl border border-green-400/50 rounded-2xl shadow-[0_0_32px_rgba(34,197,94,0.5)] p-4 min-w-80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <Check size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Added to Cart!</p>
                <p className="text-white/60 text-sm line-clamp-1">{addedCourseName}</p>
              </div>
              <button
                onClick={() => setShowAddedNotification(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
