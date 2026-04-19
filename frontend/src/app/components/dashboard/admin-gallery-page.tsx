import React, { useState, useEffect } from 'react';
import apiClient from '@/api/api-client';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import { Trash2, Upload, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardCardProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface GalleryImage {
  id: string;
  url: string;
  category: string;
  title: string;
  created_at: string;
}

export function AdminGalleryPage({ onLogout, onNavigate }: DashboardCardProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Classes', 'Events'];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await apiClient.get('/gallery');
      setImages(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title || 'Untitled');
    formData.append('category', category);

    try {
      await apiClient.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Image uploaded successfully');
      setFile(null);
      setTitle('');
      setCategory('All');
      fetchImages();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiClient.delete(`/gallery/${id}`);
      toast.success('Image deleted');
      setImages(images.filter(img => img.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <DashboardLayout userRole="admin" activePage="admin-gallery" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gallery Management</h1>
            <p className="text-white/60 mt-2">Manage the homepage gallery section dynamically via CMS.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <GlassCard className="p-6 h-fit lg:col-span-1">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Upload size={20} className="text-cyan-400" />
              Upload New Image
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Image File</label>
                <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="text-sm text-cyan-400 truncate px-4">
                      {file.name}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/50">
                      <ImageIcon size={24} />
                      <span className="text-sm">Click to select image</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Title/Caption</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Interactive Learning"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white py-3 rounded-lg font-medium hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Upload Image
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          {/* Gallery Grid */}
          <GlassCard className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-6">Current Gallery Images</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-cyan-400" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/50 bg-white/5 rounded-xl border border-dashed border-white/10">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p>No images found in the gallery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-black/50">
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1">{img.title}</p>
                          <p className="text-cyan-400 text-xs mt-0.5">{img.category}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
