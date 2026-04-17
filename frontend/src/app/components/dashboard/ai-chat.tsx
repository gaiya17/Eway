import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../glass-card';
import { Bot, X, Sparkles, AlertCircle, RefreshCcw, ChevronRight } from 'lucide-react';
import apiClient from '@/api/api-client';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatbotNode {
  id: string;
  parent_id: string | null;
  button_text: string;
  response_text: string | null;
  sort_order: number;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<ChatbotNode[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentOptions]);

  const addAiMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, sender: 'ai', timestamp: new Date() }
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, sender: 'user', timestamp: new Date() }
    ]);
  };

  // Fetch Root level options initially
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addAiMessage("Hi! I'm your EWAY Assistant. How can I help you?");
      fetchOptions('null');
    }
  }, [isOpen]);

  const fetchOptions = async (parentId: string | null) => {
    setLoadingOptions(true);
    try {
      const url = `/chatbot/nodes?parentId=${parentId || 'null'}`;
      const { data } = await apiClient.get<ChatbotNode[]>(url);
      setCurrentOptions(data || []);
    } catch (error) {
      console.error('Failed to fetch chatbot nodes', error);
      addAiMessage("Sorry, I'm having trouble connecting right now. Please try again later.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOptionClick = async (node: ChatbotNode) => {
    // 1. Add user message
    addUserMessage(node.button_text);
    setCurrentOptions([]); // hide while processing

    // 2. Handle Leaf Node (Final Answer) vs Branch Node
    if (node.response_text) {
      setTimeout(() => {
        addAiMessage(node.response_text as string);
        // Display "Back to start" virtual option
        setCurrentOptions([
          {
            id: 'restart',
            parent_id: 'virtual',
            button_text: 'Back to Start',
            response_text: null,
            sort_order: 0
          }
        ]);
      }, 600);
    } else {
      // Fetch child nodes
      await fetchOptions(node.id);
    }
  };

  const handleRestartClick = () => {
    setMessages([]);
    setCurrentOptions([]);
    addAiMessage("Hi! I'm your EWAY Assistant. How can I help you?");
    fetchOptions('null');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-[0_0_32px_rgba(99,102,241,0.6)] hover:shadow-[0_0_48px_rgba(99,102,241,0.8)] transition-all duration-300 flex items-center justify-center group z-50 pointer-events-auto"
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
        <div className="fixed bottom-28 right-8 w-96 h-[600px] z-50 animate-in slide-in-from-bottom-4 duration-300 filter drop-shadow-2xl">
          <GlassCard className="h-full flex flex-col overflow-hidden shadow-2xl border-2 border-white/10 bg-[#0f172a]/95 backdrop-blur-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/20 to-cyan-400/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">EWAY Assistant</h3>
                  <p className="text-white/60 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={handleRestartClick}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Restart Chat"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-white/90 border border-white/5 rounded-bl-sm backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        message.sender === 'user' ? 'text-white/60' : 'text-white/40'
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
              
              {loadingOptions && (
                 <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 border border-white/5 flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
                  </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Options Area */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <p className="text-white/50 text-xs mb-3 font-medium uppercase tracking-wider">Please select an option:</p>
              
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {currentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => option.id === 'restart' ? handleRestartClick() : handleOptionClick(option)}
                    className="group flex items-center justify-between w-full p-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-cyan-400/20 border border-white/10 hover:border-cyan-400/30 text-white/90 transition-all text-sm text-left shadow-sm hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                  >
                    {option.button_text}
                    {option.id !== 'restart' && !option.response_text && (
                       <ChevronRight size={16} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                ))}
                
                {!loadingOptions && currentOptions.length === 0 && messages.length > 0 && messages[messages.length-1].sender === 'ai' && (
                  <div className="p-3 text-center border border-dashed border-white/20 rounded-xl bg-white/5">
                    <p className="text-white/60 text-sm flex items-center justify-center gap-2">
                       <AlertCircle size={14} /> End of flow
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
            
          </GlassCard>
        </div>
      )}
    </>
  );
}
