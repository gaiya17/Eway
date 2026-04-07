import React, { useState, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../ui/image-with-fallback';
import apiClient from '@/api/api-client';
import {
  ArrowLeft, CreditCard, Building2, Upload, CheckCircle, AlertCircle,
  Download, Loader2, X, Wifi, MapPin, User, Clock, FileImage,
} from 'lucide-react';

interface CheckoutPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  courseData?: {
    id: string;
    title: string;
    teacher: string;
    type: 'online' | 'physical' | 'Online' | 'Physical';
    price: number;
    thumbnail: string;
  };
}

type PaymentMethod = 'card' | 'bank';
type SubmitStatus = 'idle' | 'uploading' | 'submitted' | 'error' | 'duplicate';

export function CheckoutPage({ onLogout, onNavigate, courseData }: CheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Card form state (UI-only, no real gateway)
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const course = courseData || {
    id: '', title: 'A/L Chemistry Complete Course 2026',
    teacher: 'Mr. Amila Dasanayake', type: 'online' as const,
    price: 16000,
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000',
  };

  const isOnline = course.type === 'online' || course.type === 'Online';
  const totalAmount = course.price;

  const handleCardNumberChange = (v: string) => {
    const c = v.replace(/\s/g, '');
    setCardNumber((c.match(/.{1,4}/g)?.join(' ') || c).substring(0, 19));
  };
  const handleExpiryChange = (v: string) => {
    const c = v.replace(/\D/g, '');
    setExpiryDate(c.length >= 2 ? `${c.substring(0, 2)}/${c.substring(2, 4)}` : c);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) { alert('Only JPG, PNG, or PDF files allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10 MB'); return; }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0] || null);
  };

  const handleBankSubmit = async () => {
    if (!uploadedFile) { alert('Please upload your bank slip'); return; }
    if (!course.id) { alert('Course ID missing — please go back and try again'); return; }
    setSubmitStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('slip', uploadedFile);
      formData.append('class_id', course.id);
      formData.append('amount', String(totalAmount));
      await apiClient.post('/payments/upload-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitStatus('submitted');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit payment';
      if (err.response?.status === 409) { setSubmitStatus('duplicate'); setErrorMessage(msg); }
      else { setSubmitStatus('error'); setErrorMessage(msg); }
    }
  };

  // ── SUBMITTED STATE ──────────────────────────────────────
  if (submitStatus === 'submitted') return (
    <><DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
        breadcrumb="Payment Submitted" activePage="purchase" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="min-h-[600px] flex items-center justify-center">
          <GlassCard className="p-12 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)] animate-in zoom-in duration-500">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Payment Submitted! 🎉</h1>
            <p className="text-white/70 text-lg mb-6">
              Your bank slip for <span className="text-cyan-400 font-semibold">{course.title}</span> has been submitted for verification.
            </p>
            <div className="bg-white/5 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Clock size={16} className="text-yellow-400 flex-shrink-0" />
                <span>Our staff will review your payment within 24 hours.</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                <span>You'll receive a notification once your enrollment is confirmed.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onNavigate?.('classes')}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105">
                View My Classes
              </button>
              <button onClick={() => onNavigate?.('dashboard')}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300">
                Dashboard
              </button>
            </div>
          </GlassCard>
        </div>
      </DashboardLayout><AIChat /></>
  );

  // ── ERROR / DUPLICATE STATE ──────────────────────────────
  if (submitStatus === 'error' || submitStatus === 'duplicate') return (
    <><DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
        breadcrumb="Payment Error" activePage="purchase" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="min-h-[600px] flex items-center justify-center">
          <GlassCard className="p-12 text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-in zoom-in duration-500">
              <AlertCircle size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              {submitStatus === 'duplicate' ? 'Already Submitted' : 'Submission Failed'}
            </h1>
            <p className="text-white/70 mb-6">{errorMessage}</p>
            <div className="flex gap-3">
              {submitStatus !== 'duplicate' && (
                <button onClick={() => setSubmitStatus('idle')}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold transition-all duration-300">
                  Try Again
                </button>
              )}
              <button onClick={() => onNavigate?.('classes')}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300">
                My Classes
              </button>
            </div>
          </GlassCard>
        </div>
      </DashboardLayout><AIChat /></>
  );

  // ── MAIN CHECKOUT UI ─────────────────────────────────────
  return (
    <><DashboardLayout userRole="student" userName="Student" userInitials="S" notificationCount={0}
        breadcrumb="Checkout" activePage="purchase" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="space-y-8">
          <div>
            <button onClick={() => onNavigate?.('purchase')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Browse Courses
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
            <p className="text-white/60">Complete your enrollment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6 sticky top-8">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="relative h-40 rounded-xl overflow-hidden">
                    <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent" />
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl border ${isOnline ? 'bg-blue-500/30 text-blue-300 border-blue-400/50' : 'bg-orange-500/30 text-orange-300 border-orange-400/50'}`}>
                      {isOnline ? <Wifi size={12} /> : <MapPin size={12} />}
                      {isOnline ? 'Online' : 'Physical'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{course.title}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <User size={14} className="text-cyan-400" />
                      <span>{course.teacher}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-white font-bold text-xl pt-3">
                      <span>Total</span>
                      <span className="text-green-400">LKR {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Payment Panel */}
            <div className="lg:col-span-2">
              <GlassCard className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>

                <div className="flex gap-4 mb-8">
                  <button onClick={() => setPaymentMethod('card')}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${paymentMethod === 'card' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`}>
                    <CreditCard size={20} /> Card Payment
                  </button>
                  <button onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${paymentMethod === 'bank' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`}>
                    <Building2 size={20} /> Bank Transfer
                  </button>
                </div>

                {/* Card form - UI only */}
                {paymentMethod === 'card' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-400 text-sm">⚠️ Card payment gateway coming soon. Please use Bank Transfer to enroll.</p>
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all opacity-60" disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" value={expiryDate}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all opacity-60" disabled />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-2">CVC</label>
                        <input type="text" placeholder="123" value={cvc}
                          onChange={(e) => setCvc(e.target.value)} maxLength={3}
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all opacity-60" disabled />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Cardholder Name</label>
                      <input type="text" placeholder="FULL NAME" value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all opacity-60" disabled />
                    </div>
                    <button disabled
                      className="w-full px-6 py-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg opacity-50 cursor-not-allowed">
                      Coming Soon
                    </button>
                  </div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === 'bank' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white/5 rounded-2xl p-6 space-y-3">
                      <h3 className="text-white font-semibold mb-4">Bank Account Details</h3>
                      {[
                        ['Bank Name', 'Commercial Bank'],
                        ['Account Name', 'EWAY Institute (Pvt) Ltd'],
                        ['Account Number', '1234 5678 9012'],
                        ['Branch', 'Colombo Main Branch'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-white/60">{label}</span>
                          <span className="text-white font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ Please use your <strong>Student ID</strong> as the reference when making the payment
                      </p>
                    </div>

                    {/* Upload Zone */}
                    <div>
                      <label className="block text-white/60 text-sm mb-3">Upload Payment Slip</label>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="hidden" />
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full px-6 py-12 rounded-xl text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${isDragging ? 'border-cyan-400 bg-cyan-400/10' : uploadedFile ? 'border-green-400/60 bg-green-400/5' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50'}`}>
                        {uploadedFile ? (
                          <div>
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                              <FileImage size={32} className="text-green-400" />
                            </div>
                            <p className="text-green-400 font-semibold mb-1">{uploadedFile.name}</p>
                            <p className="text-white/40 text-sm">({(uploadedFile.size / 1024).toFixed(1)} KB) — Click to change</p>
                            <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                              className="mt-3 px-3 py-1 rounded-lg bg-white/10 text-white/60 hover:text-white text-xs transition-colors flex items-center gap-1 mx-auto">
                              <X size={12} /> Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload size={40} className="mx-auto mb-4 text-white/40" />
                            <p className="text-white mb-1">Click to upload or drag and drop</p>
                            <p className="text-white/60 text-sm">PNG, JPG or PDF (Max 10 MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button onClick={handleBankSubmit} disabled={!uploadedFile || submitStatus === 'uploading'}
                      className="w-full px-6 py-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3">
                      {submitStatus === 'uploading' ? (
                        <><Loader2 size={22} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><Upload size={22} /> Submit Payment for Verification</>
                      )}
                    </button>
                    <p className="text-white/40 text-xs text-center">
                      Your payment will be verified within 24 hours. You'll receive a notification once approved.
                    </p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <AIChat />
    </>
  );
}
