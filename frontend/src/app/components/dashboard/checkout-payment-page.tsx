import React, { useState } from 'react';
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
} from 'lucide-react';

interface CheckoutPaymentPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  packData?: any;
}

type PaymentStep = 'details' | 'payment' | 'success';
type PaymentMethod = 'card' | 'paypal' | 'bank';

export function CheckoutPaymentPage({
  onLogout,
  onNavigate,
  packData,
}: CheckoutPaymentPageProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  // Default pack data with safe fallbacks
  const defaultPack = {
    id: 1,
    subject: 'ICT',
    title: 'Complete ICT Study Pack 2026',
    instructor: 'Mr. Suresh Bandara',
    description: 'Comprehensive materials for A/L ICT',
    fileCount: 45,
    fileSize: '1.2 GB',
    price: 2500,
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBzY3JlZW58ZW58MHx8fHwxNzQwMzM3MjAwfDA&ixlib=rb-4.0.3&q=80&w=1080',
    features: [
      'Complete Study Notes',
      'Video Tutorials',
      'Past Papers Collection',
      'Lifetime Access',
    ],
  };

  const pack = {
    ...defaultPack,
    ...packData,
    features: packData?.features || defaultPack.features,
  };

  const discount = 0;
  const total = (pack.price || 2500) - discount;

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\s/g, '');
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted;
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handlePayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Random success/failure for demo
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        setCurrentStep('success');
      } else {
        setPaymentError('Payment failed. Please check your card details and try again.');
      }
      setIsProcessing(false);
    }, 2000);
  };

  const handleContinueLearning = () => {
    if (onNavigate) {
      onNavigate('study-packs');
    }
  };

  const handleStartLearning = () => {
    if (onNavigate) {
      onNavigate('classes');
    }
  };

  // Step Indicator Component
  const StepIndicator = () => {
    const steps = [
      { key: 'details', label: 'Details', number: 1 },
      { key: 'payment', label: 'Payment', number: 2 },
      { key: 'success', label: 'Success', number: 3 },
    ];

    const getStepStatus = (stepKey: string) => {
      const stepIndex = steps.findIndex((s) => s.key === stepKey);
      const currentIndex = steps.findIndex((s) => s.key === currentStep);
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'current';
      return 'upcoming';
    };

    return (
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.5)]'
                      : status === 'current'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.5)]'
                      : 'bg-white/10 text-white/40 border border-white/20'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check size={20} />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={`ml-3 font-semibold ${
                    status === 'current'
                      ? 'text-white'
                      : status === 'completed'
                      ? 'text-green-400'
                      : 'text-white/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <ChevronRight
                  size={20}
                  className={`mx-6 ${
                    status === 'completed' ? 'text-green-400' : 'text-white/20'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Success State
  if (currentStep === 'success') {
    return (
      <>
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
            <StepIndicator />

            <GlassCard className="p-12 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_48px_rgba(16,185,129,0.6)] animate-pulse">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-4xl font-bold text-white mb-3">
                Payment Successful! 🎉
              </h1>
              <p className="text-white/70 text-lg mb-8">
                You now have lifetime access to this study pack
              </p>

              {/* Order Details */}
              <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <ImageWithFallback
                    src={pack.thumbnail || ''}
                    alt={pack.title || 'Study Pack'}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="text-left">
                    <h3 className="text-white font-bold">{pack.title}</h3>
                    <p className="text-white/60 text-sm">by {pack.instructor}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white/60">Amount Paid</span>
                  <span className="text-green-400 text-xl font-bold">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleContinueLearning}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white font-semibold transition-all duration-300"
                >
                  Go to Study Packs
                </button>
                <button
                  onClick={handleStartLearning}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Learning
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* Download Access Info */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20">
                <p className="text-white/70 text-sm">
                  📧 A confirmation email with download links has been sent to your email
                </p>
              </div>
            </GlassCard>
          </div>
        </DashboardLayout>
        <AIChat />
      </>
    );
  }

  // Payment Form
  return (
    <>
      <DashboardLayout
        userRole="student"
        userName="Gayantha"
        userInitials="GP"
        notificationCount={5}
        breadcrumb="Checkout / Payment"
        activePage="study-packs"
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="max-w-6xl mx-auto">
          <StepIndicator />

          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side - Product Summary (2/5 width) */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6 sticky top-8">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                {/* Product Info */}
                <div className="mb-6">
                  <ImageWithFallback
                    src={pack.thumbnail || ''}
                    alt={pack.title || 'Study Pack'}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-lg font-bold text-white mb-2">{pack.title}</h3>
                  <p className="text-white/60 text-sm mb-4">by {pack.instructor}</p>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {(pack.features || []).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-white/70 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-white/60 text-sm">
                    <div className="flex items-center gap-2">
                      <Files size={16} className="text-cyan-400" />
                      <span>{pack.fileCount} files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cyan-400" />
                      <span>{pack.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>LKR {pack.price.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-LKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-green-400 font-bold text-2xl">
                      LKR {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Right Side - Payment Form (3/5 width) */}
            <div className="lg:col-span-3">
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>

                {/* Payment Method Tabs */}
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      paymentMethod === 'card'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.4)]'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <CreditCard size={18} className="inline mr-2" />
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      paymentMethod === 'paypal'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.4)]'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    PayPal
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      paymentMethod === 'bank'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.4)]'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    Bank
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-6">
                    {/* Card Number */}
                    <div>
                      <label className="block text-white/80 font-semibold mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                        />
                        <CreditCard
                          size={20}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                        />
                      </div>
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 font-semibold mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 font-semibold mb-2">CVV</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Name on Card */}
                    <div>
                      <label className="block text-white/80 font-semibold mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-6" />

                    {/* Billing Information */}
                    <h3 className="text-lg font-bold text-white mb-4">
                      Billing Information
                    </h3>

                    {/* Email */}
                    <div>
                      <label className="block text-white/80 font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                      />
                    </div>

                    {/* Phone & Country */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 font-semibold mb-2">Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+94 77 123 4567"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 font-semibold mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Payment */}
                {paymentMethod === 'paypal' && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto mb-4 flex items-center justify-center">
                      <Sparkles size={32} className="text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      PayPal Payment
                    </h3>
                    <p className="text-white/60 mb-6">
                      You'll be redirected to PayPal to complete your purchase
                    </p>
                  </div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === 'bank' && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen size={32} className="text-purple-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      Bank Transfer
                    </h3>
                    <p className="text-white/60 mb-6">
                      Transfer instructions will be sent to your email
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {paymentError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                    <XCircle size={20} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{paymentError}</p>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full mt-6 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay LKR ${total.toLocaleString()}`
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
                  <Shield size={16} className="text-green-400" />
                  <span>Secure payment powered by Stripe</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </DashboardLayout>

      <AIChat />
    </>
  );
}
