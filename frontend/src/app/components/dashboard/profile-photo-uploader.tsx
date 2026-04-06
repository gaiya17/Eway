import React, { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import apiClient from '@/api/api-client';

interface ProfilePhotoUploaderProps {
  currentPhoto?: string;
  initials?: string;
  onUploadSuccess?: (newPhotoUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ProfilePhotoUploader({ 
  currentPhoto, 
  initials, 
  onUploadSuccess,
  size = 'lg' 
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-24 h-24 text-xl',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-40 h-40 text-4xl'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate resolution/size if needed (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await apiClient.post('/users/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.photoUrl);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group p-1 bg-white/10 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]">
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center text-white font-bold overflow-hidden border-4 border-[#0F172A] relative ring-1 ring-white/20`}
        >
          {currentPhoto ? (
            <img 
              src={currentPhoto} 
              alt="Profile" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // If image fails to load, fallback to initials
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="relative z-10">{initials || <User size={iconSizes[size]} />}</span>
          )}
          
          {isUploading ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <Loader2 size={iconSizes[size]} className="text-white animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 cursor-pointer" onClick={triggerFileInput}>
              <Camera size={iconSizes[size] / 2} className="text-white" />
            </div>
          )}
        </div>

        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="absolute bottom-1 right-1 p-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-200 border-2 border-[#1e293b] hover:scale-110 active:scale-95 z-30"
          title="Change Photo"
        >
          <Camera size={iconSizes[size] / 2.5} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
