import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../glass-card';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm EWAY AI Assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSuggestions = [
    'Check my attendance',
    'Show my classes',
    'Payment help',
    'View assignments',
  ];

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('attendance')) {
      return "Your current attendance rate is 92%. You've attended 46 out of 50 classes. Keep up the great work! 📊";
    }
    if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
      return "You have 3 upcoming classes today: Web Development at 10:00 AM, Database Systems at 2:00 PM, and UI/UX Design at 4:30 PM. 📚";
    }
    if (lowerMessage.includes('payment')) {
      return 'Your payment status is up to date. Last payment of $299 was processed on Feb 15, 2026. Need help with a new payment? 💳';
    }
    if (lowerMessage.includes('assignment')) {
      return 'You have 2 pending assignments: "React Components" due Feb 25, and "Database Design Project" due Feb 28. Would you like to view details? 📝';
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you with anything related to your courses, attendance, payments, and more. What would you like to know? 👋";
    }

    return "I'm here to help! You can ask me about your attendance, classes, payments, assignments, or any other questions about EWAY LMS. 🎓";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-[0_0_32px_rgba(99,102,241,0.6)] hover:shadow-[0_0_48px_rgba(99,102,241,0.8)] transition-all duration-300 flex items-center justify-center group z-50"
      >
        {isOpen ? (
          <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <Bot size={28} className="group-hover:scale-110 transition-transform duration-300" />
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <Sparkles size={12} />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 h-[600px] z-50 animate-in slide-in-from-bottom-4 duration-300">
          <GlassCard className="h-full flex flex-col overflow-hidden shadow-2xl border-2 border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/20 to-cyan-400/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">EWAY AI Assistant</h3>
                  <p className="text-white/60 text-xs">Always here to help you</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white'
                        : 'bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-white/50'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-white/10">
                <p className="text-white/60 text-xs mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 hover:text-white hover:border-cyan-400/50 transition-all duration-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white flex items-center justify-center hover:shadow-[0_0_24px_rgba(99,102,241,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
