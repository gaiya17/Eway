import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  Search, Send, Paperclip, Smile, Check, CheckCheck, MessageCircle, Loader2,
} from 'lucide-react';

interface ChatWithTeacherPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string, data?: any) => void;
  teacherData?: any;
}

interface Conversation {
  id: string;
  student_id: string;
  teacher_id: string;
  class_id?: string;
  last_message_at: string;
  unread_count: number;
  teacher: { id: string; first_name: string; last_name: string; profile_photo?: string; subject?: string };
  classes?: { id: string; title: string };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: { id: string; first_name: string; last_name: string; profile_photo?: string };
}

export function ChatWithTeacherPage({ onLogout, onNavigate, teacherData }: ChatWithTeacherPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiClient.get('/messages/my-conversations');
      setConversations(res.data || []);
    } catch (e) { console.error('fetch conversations error:', e); }
    finally { setIsLoading(false); }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await apiClient.get(`/messages/${convId}`);
      setMessages(res.data || []);
      // Mark as read
      apiClient.patch(`/messages/${convId}/read`).catch(() => {});
      // Update unread count locally
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, unread_count: 0 } : c));
    } catch (e) { console.error('fetch messages error:', e); }
  }, []);

  // Get current user ID from first message or JWT decode
  useEffect(() => {
    const token = localStorage.getItem('eway_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.sub || '');
      } catch (_) {}
    }
  }, []);

  // On mount: fetch conversations, handle incoming teacherData
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // If teacherData prop passed (from class view page), create/get conversation
  useEffect(() => {
    if (!teacherData) return;
    const initConversation = async () => {
      try {
        const res = await apiClient.post('/messages/conversation', {
          teacher_id: teacherData.id,
          class_id: teacherData.class_id || undefined,
        });
        const conv = res.data as Conversation;
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conv.id);
          if (exists) return prev;
          return [conv, ...prev];
        });
        setSelectedConv(conv);
      } catch (e) { console.error('init conversation error:', e); }
    };
    initConversation();
  }, [teacherData]);

  // Poll messages every 5 sec when conversation is selected
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedConv) return;
    fetchMessages(selectedConv.id);
    pollRef.current = setInterval(() => fetchMessages(selectedConv.id), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConv || isSending) return;
    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    try {
      const res = await apiClient.post(`/messages/${selectedConv.id}`, { content });
      setMessages((prev) => [...prev, res.data]);
    } catch (e) { console.error('send error:', e); setMessageInput(content); }
    finally { setIsSending(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConvs = conversations.filter((c) => {
    const name = `${c.teacher?.first_name} ${c.teacher?.last_name}`.toLowerCase();
    return !searchQuery || name.includes(searchQuery.toLowerCase());
  });

  const avatarUrl = (profile: { first_name: string; last_name: string; profile_photo?: string }) =>
    profile.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name)}+${encodeURIComponent(profile.last_name)}&background=1e40af&color=fff&size=128`;

  return (
    <>
      <DashboardLayout userRole="student" notificationCount={0}
        breadcrumb="Chat" activePage="chat" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="h-[calc(100vh-140px)] flex gap-6">
          {/* LEFT — Conversations List */}
          <div className="w-96 flex flex-col">
            <GlassCard className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-1">My Teachers</h2>
                <p className="text-white/60 text-sm">{filteredConvs.length} conversation{filteredConvs.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search teachers..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400 transition-all" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-400" size={28} /></div>
                ) : filteredConvs.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle size={28} className="text-white/30" />
                    </div>
                    <p className="text-white/60 text-sm">No conversations yet</p>
                    <p className="text-white/40 text-xs mt-1">Open a class and click "Message Teacher" to start.</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConvs.map((conv) => {
                      const isSelected = selectedConv?.id === conv.id;
                      return (
                        <button key={conv.id} onClick={() => setSelectedConv(conv)}
                          className={`w-full p-4 rounded-xl mb-2 transition-all duration-300 text-left ${isSelected ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-400/30' : 'hover:bg-white/5 border border-transparent'}`}>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img src={avatarUrl(conv.teacher)} alt={conv.teacher?.first_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                              {conv.unread_count > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold truncate">{conv.teacher?.first_name} {conv.teacher?.last_name}</h3>
                              <p className="text-cyan-400 text-xs mt-0.5 truncate">{conv.teacher?.subject || conv.classes?.title || 'LMS Chat'}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* RIGHT — Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <GlassCard className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={avatarUrl(selectedConv.teacher)} alt={selectedConv.teacher?.first_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedConv.teacher?.first_name} {selectedConv.teacher?.last_name}</h3>
                      <p className="text-cyan-400 text-sm">{selectedConv.teacher?.subject || 'LMS Instructor'}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                        <MessageCircle size={36} className="text-cyan-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Start the conversation</h3>
                      <p className="text-white/50 text-sm">Send a message to {selectedConv.teacher?.first_name}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                          <span className="text-white/60 text-xs">Messages are end-to-end with your teacher</span>
                        </div>
                      </div>
                      {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                              <img src={avatarUrl(msg.sender)} alt="" className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 mt-1" />
                            )}
                            <div className="max-w-[60%]">
                              <div className={`p-4 rounded-2xl ${isMe ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md' : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 rounded-bl-md'}`}>
                                <p className="leading-relaxed">{msg.content}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-white/60">
                                  {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (msg.is_read
                                  ? <CheckCheck size={14} className="text-cyan-400" />
                                  : <Check size={14} className="text-white/60" />)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex items-end gap-3">
                    <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all flex-shrink-0">
                      <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${selectedConv.teacher?.first_name}...`}
                        rows={1} style={{ minHeight: '44px', maxHeight: '120px' }}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 transition-all resize-none" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        <Smile size={20} />
                      </button>
                    </div>
                    <button onClick={handleSend} disabled={!messageInput.trim() || isSending}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all disabled:opacity-50 flex-shrink-0">
                      {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={40} className="text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Teacher Selected</h3>
                  <p className="text-white/60 text-sm max-w-xs mx-auto">Open a class and click "Message Teacher" to start a conversation.</p>
                  <button onClick={() => onNavigate?.('classes')}
                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300">
                    Go to My Classes
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
