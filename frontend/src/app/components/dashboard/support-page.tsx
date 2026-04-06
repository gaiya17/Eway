import React, { useState } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SupportPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function SupportPage({ onLogout, onNavigate }: SupportPageProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const faqs = [
    {
      question: 'How do I enroll in a class?',
      answer:
        'To enroll in a class, navigate to "Purchase Classes" from the sidebar menu. Browse available courses, click "View Details" on your preferred course, and then click "Enroll Now". Follow the payment process to complete your enrollment.',
    },
    {
      question: 'How do I download my student ID?',
      answer:
        'Go to "My Student ID" from the sidebar menu. On the Student ID page, you\'ll find a "Download PDF" button at the top right. Click it to download your ID card as a PDF file. You can also print it directly from that page.',
    },
    {
      question: 'I paid but class is not activated',
      answer:
        'If your payment was successful but the class hasn\'t been activated, please wait 5-10 minutes for the system to process. If it still doesn\'t appear, contact support with your payment receipt and we\'ll activate it manually within 1 hour.',
    },
    {
      question: 'How to reset password?',
      answer:
        'Click on your profile picture in the top-right corner, go to "Settings", and select "Change Password". Alternatively, if you\'re locked out, use the "Forgot Password" link on the login page to receive a reset link via email.',
    },
    {
      question: 'Can I refund a purchased course?',
      answer:
        'Refund requests are accepted within 7 days of purchase if you haven\'t accessed more than 20% of the course content. Go to "My Classes", select the class, and click "Request Refund". Our team will review and process your request within 3-5 business days.',
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Message sent successfully!\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nWe'll respond within 24 hours.`
    );
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSendEmail = () => {
    window.location.href = 'mailto:support@ewaylms.lk';
  };

  return (
    <DashboardLayout
      userRole="student"
      userName="Gayantha"
      userInitials="GP"
      notificationCount={5}
      breadcrumb="Support"
      activePage="support"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Back Button */}
      <button
        onClick={() => onNavigate?.('dashboard')}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
        <p className="text-white/60">
          Get help with your account and classes
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Contact + FAQ */}
        <div className="space-y-6">
          {/* Contact Card */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
            <p className="text-white/60 text-sm mb-6">
              Reach out to our support team
            </p>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Email</p>
                  <a
                    href="mailto:support@ewaylms.lk"
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    support@ewaylms.lk
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Phone</p>
                  <a
                    href="tel:+94771234567"
                    className="text-green-400 hover:text-green-300 transition-colors font-medium"
                  >
                    +94 77 123 4567
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Location</p>
                  <p className="text-white font-medium">Eway Institute</p>
                  <p className="text-white/60 text-sm">Colombo, Sri Lanka</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* FAQ Section */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Frequently Asked Questions
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Quick answers to common questions
            </p>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-semibold pr-4 text-sm">
                      {faq.question}
                    </span>
                    {expandedFAQ === index ? (
                      <ChevronUp
                        className="text-cyan-400 flex-shrink-0"
                        size={20}
                      />
                    ) : (
                      <ChevronDown
                        className="text-white/60 flex-shrink-0"
                        size={20}
                      />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-5 pb-4 pt-2">
                      <p className="text-white/70 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN - Email Form */}
        <div>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Send a Message
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Fill out the form and we'll get back to you
            </p>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                />
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this regarding?"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your issue or question..."
                  rows={8}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
