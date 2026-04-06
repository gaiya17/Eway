import React from 'react';
import { UserPlus, BookOpen, GraduationCap, FileCheck, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Register Account',
    description: 'Create your account in minutes',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Enroll in Course',
    description: 'Choose from our wide selection',
  },
  {
    number: '03',
    icon: GraduationCap,
    title: 'Attend Classes',
    description: 'Learn from expert instructors',
  },
  {
    number: '04',
    icon: FileCheck,
    title: 'Complete Assignments',
    description: 'Apply your knowledge',
  },
  {
    number: '05',
    icon: TrendingUp,
    title: 'Track Performance',
    description: 'Monitor your progress',
  },
];

export function WorkProcessSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-cyan-400 font-semibold mb-2">HOW IT WORKS</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Learning Journey
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Follow these simple steps to start your educational transformation with EWAY Institute LMS.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/20 via-cyan-400/50 to-indigo-500/20" />
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Circle with Icon */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 backdrop-blur-xl border-2 border-white/10 flex items-center justify-center mb-4 group hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_32px_rgba(34,211,238,0.4)]">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="text-white" size={48} />
                    </div>
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0B0F1A] border-2 border-cyan-400 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h4 className="text-white font-semibold text-lg mb-2">{step.title}</h4>
                  <p className="text-white/60 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center relative">
                  <step.icon className="text-white" size={32} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0B0F1A] border-2 border-cyan-400 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-xs">{step.number}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h4 className="text-white font-semibold text-xl mb-2">{step.title}</h4>
                <p className="text-white/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
