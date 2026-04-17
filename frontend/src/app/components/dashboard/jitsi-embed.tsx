import React, { useState, useRef, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Maximize2, X, Minimize2, Loader2 } from 'lucide-react';
import apiClient from '@/api/api-client';
import { toast } from 'sonner';

interface JitsiEmbedProps {
  roomUrl: string;
  title: string;
  userName: string;
  role: 'teacher' | 'student';
  classId?: string;
  onClose?: () => void;
  className?: string;
}

export function JitsiEmbed({ roomUrl, title, userName, role, classId, onClose, className = '' }: JitsiEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isTeacher = role === 'teacher';
  const attendanceMarked = useRef(false);
  
  // Synchronize state with native fullscreen changes (e.g. Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  // Custom overlay blocker until meeting actually starts
  const [hasJoined, setHasJoined] = useState(isTeacher); // Teachers always see the pure iFrame directly
  
  // Extract roomName securely from the generated EWAY url
  const roomNameMatch = roomUrl.match(/meet\.jit\.si\/(.+)/);
  const roomName = roomNameMatch ? roomNameMatch[1] : `eway-${Date.now()}`;
  
  const handleMarkAttendance = async () => {
    if (isTeacher || !classId || attendanceMarked.current) return;
    
    try {
      await apiClient.post('/attendance/auto', { class_id: classId });
      attendanceMarked.current = true;
      console.log('Online attendance marked automatically');
    } catch (error) {
      console.error('Failed to mark online attendance:', error);
    }
  };

  // Strict Role Config mappings
  const configOverwrite = {
    startWithAudioMuted: !isTeacher,
    startWithVideoMuted: !isTeacher,
    prejoinPageEnabled: false, // Jump straight into the meeting
    disableModeratorIndicator: !isTeacher,
    toolbarButtons: isTeacher 
      ? [
          'camera', 'chat', 'desktop', 'download', 'fullscreen', 'hangup', 'highlight', 'microphone', 
          'mute-everyone', 'mute-video-everyone', 'participants-pane', 'profile', 'raisehand', 
          'security', 'select-background', 'settings', 'shareaudio', 'toggle-camera', 'videoquality'
        ]
      : [ // Students have stripped-down toolbars (no mute-everyone, no desktop share, no security)
          'camera', 'chat', 'fullscreen', 'hangup', 'microphone', 'participants-pane', 'profile', 
          'raisehand', 'select-background', 'settings', 'toggle-camera', 'videoquality'
        ]
  };

  const interfaceConfigOverwrite = {
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: !isTeacher,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-black flex flex-col overflow-hidden transition-all duration-500 ${
        isFullscreen 
          ? 'w-full h-full p-0 m-0' 
          : `relative w-full h-[600px] rounded-b-xl ${className}`
      }`}
    >
      {/* Premium Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121212] border-b border-green-500/20 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
          <span className="text-white font-bold text-sm tracking-wide">{title}</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isTeacher ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30'}`}>
            {isTeacher ? 'Moderator' : 'Participant'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all text-xs font-semibold hover:border-cyan-500/30"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
              title="Leave class"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Jitsi Meeting Engine */}
      <div className="flex-1 w-full relative bg-[#1a1a1a]">
        
        {/* Custom Loading Overlay to mask the Jitsi "waiting for moderator" login prompt from students */}
        {!hasJoined && !isTeacher && (
          <div className="absolute inset-0 z-20 bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
            <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Waiting for the Teacher...</h3>
            <p className="text-white/50 max-w-sm text-sm leading-relaxed mb-8">
              The teacher hasn't opened this live class yet. You will be automatically connected the moment they arrive.
            </p>
            <button 
              onClick={() => { setHasJoined(true); handleMarkAttendance(); }} 
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm font-bold tracking-wide"
            >
              Enter Class Manually
            </button>
          </div>
        )}

        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={configOverwrite}
          interfaceConfigOverwrite={interfaceConfigOverwrite}
          userInfo={{
            displayName: userName
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
          onApiReady={(externalApi) => {
             // We attach an event to listen for when the student actually penetrates the room (teacher opened it)
             externalApi.addListener('videoConferenceJoined', () => {
                setHasJoined(true);
                handleMarkAttendance();
             });
          }}
        />
      </div>
    </div>
  );
}
