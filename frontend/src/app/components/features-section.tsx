import React from 'react';
import { GlassCard } from './glass-card';
import { BookOpen, Video, QrCode, CreditCard, FileText, Bot } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Course Management',
    description: 'Create, organize, and manage all your courses with an intuitive interface and powerful tools.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Video,
    title: 'Online & Physical Classes',
    description: 'Support for both virtual classrooms and traditional in-person sessions seamlessly integrated.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: QrCode,
    title: 'QR Attendance System',
    description: 'Modern QR code-based attendance tracking for quick, accurate, and contactless check-ins.',
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Accept online and offline payments securely with multiple payment gateway integrations.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: FileText,
    title: 'Assignments & Quizzes',
    description: 'Create, distribute, and grade assignments and quizzes with automated evaluation features.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Bot,
    title: 'AI Chatbot Support',
    description: '24/7 AI-powered assistant to help students and educators with instant answers and guidance.',
    gradient: 'from-cyan-500 to-teal-400',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-cyan-400 font-semibold mb-2">FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful LMS Features
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Everything you need to deliver exceptional learning experiences, all in one comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <GlassCard key={index} className="p-8 group" hover>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
