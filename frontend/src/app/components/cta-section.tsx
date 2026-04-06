import React from 'react';
import { GlassCard } from './glass-card';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <GlassCard className="relative overflow-hidden">
          {/* Gradient Background Effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-cyan-400/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative p-12 md:p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center animate-pulse">
                <Sparkles className="text-white" size={32} />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Your Learning Journey Today
            </h2>
            <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already transforming their careers with EWAY Institute LMS. 
              Get access to premium courses, expert instructors, and cutting-edge learning tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                Register Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                Login
              </button>
            </div>
            
            <div className="mt-10 flex justify-center gap-12 text-center">
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-white/60 text-sm mt-1">Active Students</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-white/60 text-sm mt-1">Expert Courses</p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-3xl font-bold text-white">95%</p>
                <p className="text-white/60 text-sm mt-1">Success Rate</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
