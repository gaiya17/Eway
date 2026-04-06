import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  Search, Send, Paperclip, Smile, MessageCircle, ArrowLeft, Loader2, Check, CheckCheck,
} from 'lucide-react';

interface TeacherChatPageProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface Conversation {
  id: string;
  student_id: string;
  teacher_id: string;
  last_message_at: string;
  unread_count: number;
  student: { id: string; first_name: string; last_name: string; profile_photo?: string };
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

export function TeacherChatPage({ onLogout, onNavigate }: TeacherChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('eway_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.sub || '');
      } catch (_) {}
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiClient.get('/messages/my-conversations');
      setConversations(res.data || []);
    } catch (e) { console.error('fetch conversations:', e); }
    finally { setIsLoading(false); }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await apiClient.get(`/messages/${convId}`);
      setMessages(res.data || []);
      apiClient.patch(`/messages/${convId}/read`).catch(() => {});
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, unread_count: 0 } : c));
    } catch (e) { console.error('fetch messages:', e); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

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
    } catch (e) { setMessageInput(content); }
    finally { setIsSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const avatarUrl = (profile: { first_name: string; last_name: string; profile_photo?: string }) =>
    profile.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name)}+${encodeURIComponent(profile.last_name)}&background=1e40af&color=fff&size=128`;

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);
  const filteredConvs = conversations.filter((c) => {
    const name = `${c.student?.first_name} ${c.student?.last_name}`.toLowerCase();
    return !searchQuery || name.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout userRole="teacher" userName="Teacher" userInitials="T"
      notificationCount={totalUnread} breadcrumb="Chat with Students"
      activePage="teacher-chat" onNavigate={onNavigate} onLogout={onLogout}>

      <div className="mb-6">
        <button onClick={() => onNavigate?.('dashboard')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-3 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Chat with Students</h1>
        <p className="text-white/60">Communicate with your enrolled students</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* LEFT — Student list */}
        <div className="w-80 flex-shrink-0">
          <GlassCard className="p-5 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-1">My Students</h3>
              <p className="text-white/60 text-sm">{filteredConvs.length} conversation{filteredConvs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-400" size={28} /></div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center p-8">
                  <MessageCircle className="text-white/20 mx-auto mb-3" size={40} />
                  <p className="text-white/60 text-sm">No students yet</p>
                  <p className="text-white/40 text-xs mt-1">Students who message you will appear here.</p>
                </div>
              ) : filteredConvs.map((conv) => (
                <button key={conv.id} onClick={() => setSelectedConv(conv)}
                  className={`w-full p-3 rounded-xl transition-all duration-300 text-left ${selectedConv?.id === conv.id ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={avatarUrl(conv.student)} alt={conv.student?.first_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-white text-sm truncate">{conv.student?.first_name} {conv.student?.last_name}</h4>
                        <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                          {new Date(conv.last_message_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {conv.classes && <p className="text-cyan-400 text-xs truncate">{conv.classes.title}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT — Chat window */}
        <div className="flex-1">
          <GlassCard className="h-full flex flex-col">
            {selectedConv ? (
              <>
                <div className="p-5 border-b border-white/10 flex items-center gap-3">
                  <img src={avatarUrl(selectedConv.student)} alt={selectedConv.student?.first_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                  <div>
                    <h3 className="text-white font-bold">{selectedConv.student?.first_name} {selectedConv.student?.last_name}</h3>
                    {selectedConv.classes && <p className="text-cyan-400 text-sm">{selectedConv.classes.title}</p>}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <MessageCircle size={40} className="text-white/20 mb-3" />
                      <p className="text-white/60">No messages yet. Start the conversation!</p>
                    </div>
                  ) : messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <img src={avatarUrl(msg.sender)} alt="" className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 mt-1" />
                        )}
                        <div className={`max-w-[70%] ${isMe ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/10'} rounded-2xl px-4 py-3`}>
                          <p className="text-white text-sm">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-white/50 text-xs">
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isMe && (msg.is_read
                              ? <CheckCheck size={12} className="text-cyan-300" />
                              : <Check size={12} className="text-white/50" />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-5 border-t border-white/10">
                  <div className="flex items-end gap-3">
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex-shrink-0">
                      <Paperclip size={20} className="text-white/70" />
                    </button>
                    <div className="flex-1 relative">
                      <textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown} placeholder="Type your message..." rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <Smile size={20} className="text-white/70" />
                      </button>
                    </div>
                    <button onClick={handleSend} disabled={!messageInput.trim() || isSending}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center gap-2 disabled:opacity-50 flex-shrink-0">
                      {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <MessageCircle className="text-white/20 mb-4" size={64} />
                <h3 className="text-white font-bold text-xl mb-2">No Chat Selected</h3>
                <p className="text-white/60 text-center">Select a student from the list to start chatting</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
