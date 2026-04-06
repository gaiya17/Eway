import React from 'react';
import { GlassCard } from './glass-card';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import ewayLogo from 'figma:asset/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 md:p-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
                  <img src={ewayLogo} alt="EWAY Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-white font-semibold text-xl">EWAY Institute</span>
              </div>
              <p className="text-white/70 mb-6">
                Empowering learners worldwide with innovative education technology and comprehensive 
                learning management solutions.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-cyan-400 flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent"
                >
                  <Facebook size={18} className="text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-cyan-400 flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent"
                >
                  <Twitter size={18} className="text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-cyan-400 flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent"
                >
                  <Instagram size={18} className="text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-cyan-400 flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent"
                >
                  <Linkedin size={18} className="text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-cyan-400 flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-transparent"
                >
                  <Youtube size={18} className="text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('home')}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">
                    Courses
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('gallery')}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    Gallery
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-cyan-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li>
                  <p className="text-white/70">
                    123 Education Street
                    <br />
                    Learning City, ED 12345
                  </p>
                </li>
                <li>
                  <a href="tel:+15551234567" className="text-white/70 hover:text-cyan-400 transition-colors">
                    +1 (555) 123-4567
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@ewayinstitute.com"
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    info@ewayinstitute.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm text-center md:text-left">
                © 2026 EWAY Institute LMS. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                  Terms
                </a>
                <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}