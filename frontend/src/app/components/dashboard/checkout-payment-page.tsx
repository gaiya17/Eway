import React, { useState, useRef } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { AIChat } from './ai-chat';
import { ImageWithFallback } from '../ui/image-with-fallback';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Check,
  Award,
  Clock,
  Files,
  BookOpen,
  Video,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Upload,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import apiClient from '@/api/api-client';

interface CheckoutPaymentPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  packData?: any;
}

type PaymentStep = 'payment' | 'success';
type PaymentMethod = 'bank' | 'card' | 'paypal';

export function CheckoutPaymentPage({
  onLogout,
  onNavigate,
  packData,
}: CheckoutPaymentPageProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Bank slip upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback for demo if no packData is passed
  const pack = packData || {
    id: 'demo-id',
    title: 'Study Pack',
    price: 0,
    cover_image: '',
    level: 'AL',
    subject: 'General',
  };

  const total = pack.price || 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setPaymentError(null);
    }
  };

  const handleSubmitPurchase = async () => {
    if (paymentMethod === 'bank') {
      if (!selectedFile) {
        setPaymentError('Please upload your bank payment slip first.');
        return;
      }

      setIsProcessing(true);
      setPaymentError(null);

      try {
        const formData = new FormData();
        formData.append('slip', selectedFile);
        formData.append('amount', String(total));

        await apiClient.post(`/study-packs/${pack.id}/purchase`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setCurrentStep('success');
      } catch (error: any) {
        console.error('Purchase error:', error);
        setPaymentError(error.response?.data?.error || 'Failed to submit payment. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For Card/PayPal (future)
      setIsProcessing(true);
      setTimeout(() => {
        setPaymentError('Online payments are currently unavailable. Please use Bank Transfer.');
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleGoToStudyPacks = () => {
    if (onNavigate) onNavigate('study-packs');
  };

  if (currentStep === 'success') {
    return (
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="Checkout / Success"
        activePage="study-packs"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="max-w-2xl mx-auto py-12">
          <GlassCard className="p-12 text-center relative overflow-hidden">
             {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_48px_rgba(16,185,129,0.4)]">
                <Check size={48} className="text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-3">Order Received!</h1>
            <p className="text-white/70 text-lg mb-8">
              Your payment slip for <span className="text-white font-bold">"{pack.title}"</span> has been submitted for verification.
            </p>

            <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                    <img src={pack.cover_image} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{pack.title}</h3>
                    <p className="text-white/40 text-xs uppercase font-bold tracking-widest">{pack.level} • {pack.subject}</p>
                  </div>
               </div>
               <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium italic">Amount to verify:</span>
                  <span className="text-green-400 text-xl font-bold">LKR {total.toLocaleString()}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleGoToStudyPacks}
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all"
                >
                  Browse Store
                </button>
                <button
                  onClick={() => onNavigate?.('study-packs')}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2"
                >
                  Dashboard Home
                  <ArrowRight size={20} />
                </button>
            </div>

            <div className="mt-10 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4 text-left">
               <Clock size={24} className="text-blue-400 shrink-0 mt-1" />
               <p className="text-white/70 text-xs">
                 <span className="text-white font-bold block mb-1">What happens next?</span>
                 Our team will verify your payment slip within 24 hours. Once approved, you will get instant access to all pack contents via your Study Packs dashboard.
               </p>
            </div>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="student"
      userName="Gayantha"
      userInitials="GP"
      notificationCount={5}
      breadcrumb="Checkout"
      activePage="study-packs"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Select Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {(['bank', 'card', 'paypal'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                        setPaymentMethod(method);
                        setPaymentError(null);
                    }}
                    className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 ${
                      paymentMethod === method
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      paymentMethod === method ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/40'
                    }`}>
                      {method === 'bank' ? <BookOpen size={24} /> : 
                       method === 'card' ? <CreditCard size={24} /> : 
                       <Sparkles size={24} />}
                    </div>
                    <div>
                      <p className="text-white font-bold">{method === 'bank' ? 'Bank Transfer' : method === 'card' ? 'Debit/Credit' : 'PayPal'}</p>
                      {method !== 'bank' && <p className="text-[10px] text-white/30 uppercase font-bold text-center mt-1">Coming Soon</p>}
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === 'bank' ? (
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                       <Info size={18} className="text-cyan-400" /> Bank Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                       <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Bank Name</p>
                          <p className="text-white font-medium">Commercial Bank</p>
                       </div>
                       <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Account Number</p>
                          <p className="text-white font-medium">1234 5678 9012 3456</p>
                       </div>
                       <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Account Holder</p>
                          <p className="text-white font-medium">EWAY Learning (Pvt) Ltd</p>
                       </div>
                       <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Branch</p>
                          <p className="text-white font-medium">Colombo Main</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-white font-bold block">Upload Payment Slip</label>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-cyan-500/50 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                        {selectedFile ? (
                           <>
                              <CheckCircle2 size={48} className="text-green-400 mb-4 animate-bounce" />
                              <p className="text-green-400 font-bold mb-1">{selectedFile.name}</p>
                              <p className="text-white/40 text-xs">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                           </>
                        ) : (
                           <>
                              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                                 <Upload size={32} className="text-cyan-400" />
                              </div>
                              <p className="text-white/60 font-medium">Click to upload transfer receipt or deposit slip</p>
                              <p className="text-white/30 text-xs mt-2 uppercase tracking-widest font-bold">Image or PDF (Max 10MB)</p>
                           </>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                   <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                     <Shield size={40} className="text-white/20" />
                   </div>
                   <h3 className="text-white font-bold text-xl uppercase tracking-tight">Encrypted Checkout coming soon</h3>
                   <p className="text-white/40 text-sm max-w-xs mx-auto">We are working on integrating Stripe and PayPal for instant credit card payments.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-4 space-y-6">
             <GlassCard className="p-6 sticky top-8">
                <h2 className="text-xl font-bold text-white mb-6">Order Details</h2>
                
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                         <img src={pack.cover_image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <h4 className="text-white font-bold text-sm uppercase leading-tight">{pack.title}</h4>
                         <p className="text-cyan-400 text-[10px] font-bold mt-1 tracking-widest">{pack.subject}</p>
                      </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60">Study Pack Price</span>
                         <span className="text-white font-bold">LKR {pack.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60">Platform Fee</span>
                         <span className="text-green-400 font-bold">FREE</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                         <span className="text-white font-bold text-lg">Total Amount</span>
                         <span className="text-cyan-400 font-bold text-2xl">LKR {total.toLocaleString()}</span>
                      </div>
                   </div>

                   {paymentError && (
                     <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-xs font-semibold">{paymentError}</p>
                     </div>
                   )}

                   <button
                     disabled={isProcessing}
                     onClick={handleSubmitPurchase}
                     className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale"
                   >
                     {isProcessing ? <Loader2 className="animate-spin" size={24} /> : paymentMethod === 'bank' ? <CheckCircle2 size={24} /> : <Lock size={20} />}
                     {isProcessing ? 'Processing Order...' : paymentMethod === 'bank' ? 'Complete Purchase' : 'Pay Secured'}
                   </button>

                   <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase font-bold tracking-widest transition-opacity hover:opacity-100">
                      <Shield size={12} /> SSL Secure Connection
                   </div>
                </div>
             </GlassCard>

             <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                <h4 className="text-white font-bold text-sm mb-4">Why learn with EWAY?</h4>
                <div className="space-y-3">
                   {[
                     'Recognized Qualifications',
                     'Expert Sri Lankan Teachers',
                     'HD Video Lessons',
                     'Dedicated Support Community',
                   ].map((item) => (
                     <div key={item} className="flex items-center gap-3">
                        <Check size={14} className="text-cyan-500" />
                        <span className="text-white/60 text-xs">{item}</span>
                     </div>
                   ))}
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
