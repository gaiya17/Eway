import React from 'react';
import { GlassCard } from './glass-card';
import { CheckCircle } from 'lucide-react';

interface AboutSectionProps {
  onRegisterClick?: () => void;
}

export function AboutSection({ onRegisterClick }: AboutSectionProps) {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative">
            <GlassCard className="p-2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1636772523547-5577d04e8dc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwdGVhY2hpbmclMjBpbnN0aXR1dGV8ZW58MXx8fHwxNzcxNzc2OTU3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="EWAY Institute"
                className="w-full h-[500px] object-cover rounded-[14px]"
              />
            </GlassCard>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full blur-3xl opacity-50" />
          </div>

          {/* Right - Content */}
          <div className="space-y-6">
            <div>
              <p className="text-cyan-400 font-semibold mb-2">ABOUT US</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                About EWAY Institute
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                EWAY Institute is a leading-edge Learning Management System designed to revolutionize
                education. We bridge the gap between traditional and modern learning by providing a
                comprehensive platform that empowers students, educators, and administrators alike.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Digital Course Management</h4>
                  <p className="text-white/60">
                    Organize, distribute, and track all your courses from a single unified platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Online & Physical Class Support</h4>
                  <p className="text-white/60">
                    Seamlessly manage both virtual and in-person classes with our hybrid learning tools.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Smart Attendance with QR</h4>
                  <p className="text-white/60">
                    Modern QR code-based attendance system for accurate and efficient tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">AI-Powered Assistance</h4>
                  <p className="text-white/60">
                    Get instant help with our intelligent AI chatbot available 24/7 for all your queries.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={onRegisterClick}
              className="mt-4 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:scale-105"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
