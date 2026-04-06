import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ewayLogo from 'figma:asset/5839cd6ca5cc93c08af5158653805fc6c7e77232.png';

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  currentPage?: string;
  onLogout?: () => void;
}

export function Navbar({ onLoginClick, onRegisterClick, currentPage, onLogout }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Only show navbar on home, login, register, and forgot-password pages
  const shouldShowNavbar = !currentPage || currentPage === 'home' || currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot-password';

  if (!shouldShowNavbar) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLoginClick = () => {
    setIsMobileMenuOpen(false);
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleRegisterClick = () => {
    setIsMobileMenuOpen(false);
    if (onRegisterClick) {
      onRegisterClick();
    }
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-[15px] bg-white/5 border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
              <img src={ewayLogo} alt="EWAY Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-semibold text-xl hidden sm:block">EWAY Institute</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-white/90 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-white/90 hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-white/90 hover:text-white transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-white/90 hover:text-white transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Login
            </button>
            <button
              onClick={handleRegisterClick}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-300"
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden backdrop-blur-[15px] bg-white/5 border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left text-white/90 hover:text-white transition-colors py-2"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-white/90 hover:text-white transition-colors py-2"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="block w-full text-left text-white/90 hover:text-white transition-colors py-2"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-white/90 hover:text-white transition-colors py-2"
            >
              Contact
            </button>
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleLoginClick}
                className="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={handleRegisterClick}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-300"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}