import React from 'react';
import { GlassCard } from '../glass-card';
import { Info, X } from 'lucide-react';

interface DemoGuideProps {
  onClose: () => void;
}

export function DemoGuide({ onClose }: DemoGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <GlassCard className="max-w-3xl w-full p-8 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Info className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to EWAY Student Dashboard</h2>
              <p className="text-white/70 text-sm">Interactive Demo Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">🎯 Key Features</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">Smart Greeting Card</h4>
                <p className="text-white/70 text-sm">
                  Time-based greeting with quick access to My Classes, Purchase Classes, and Free
                  Tutorials. Student ID badge displayed on larger screens.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">Welcome Banner</h4>
                <p className="text-white/70 text-sm">
                  Beautiful hero banner with gradient background and motivational message welcoming
                  you to EWAY Student Portal with elegant animations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">Quick Action Cards</h4>
                <p className="text-white/70 text-sm">
                  Fast access to My Classes, QR Attendance, Assignments, and Payments with beautiful
                  gradient icons and hover animations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">Learning Overview</h4>
                <p className="text-white/70 text-sm">
                  Track your progress with circular attendance rate indicator (92%), upcoming
                  classes count, completed assignments, and overall performance score.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">Upcoming Classes</h4>
                <p className="text-white/70 text-sm">
                  View today's schedule with teacher names, timings, and status badges. Hover to
                  reveal "Join Class" button.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">Recent Activity Timeline</h4>
                <p className="text-white/70 text-sm">
                  Track your recent actions including submitted assignments, payments, attended
                  classes, and achievements with a beautiful timeline design.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-cyan-400 font-semibold mb-1">🤖 AI Chatbot Assistant</h4>
                <p className="text-white/70 text-sm">
                  Click the floating button in the bottom-right corner to chat with EWAY AI
                  Assistant. Ask about attendance, classes, payments, or assignments!
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-3">🧭 Navigation</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Use the left sidebar to navigate between different sections</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Click on quick action cards for direct access to features</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Check notifications using the bell icon in the top-right header</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Access your profile by clicking your avatar in the header</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-3">💬 Try the AI Assistant</h3>
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-cyan-400/30">
              <p className="text-white/90 text-sm mb-3">Ask the AI chatbot questions like:</p>
              <div className="flex flex-wrap gap-2">
                {['Check my attendance', 'Show my classes', 'Payment help', 'View assignments'].map(
                  (q, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs"
                    >
                      "{q}"
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
          >
            Got it! Let's explore
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
