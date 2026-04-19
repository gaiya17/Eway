import React, { useState, useEffect } from 'react';
import Masonry from 'react-responsive-masonry';
import apiClient from '@/api/api-client';
import { Loader2 } from 'lucide-react';

const categories = ['All', 'Classes', 'Events'];

interface GalleryImage {
  id: string;
  url: string;
  category: string;
  title: string;
}

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await apiClient.get('/gallery');
        setImages(response.data);
      } catch (error) {
        console.error('Failed to fetch gallery images', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const filteredImages =
    activeCategory === 'All'
      ? images
      : images.filter((img) => img.category === activeCategory);

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-400 font-semibold mb-2">GALLERY</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Our Campus
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Take a glimpse into the vibrant learning environment at EWAY Institute.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-[0_0_24px_rgba(99,102,241,0.5)]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 backdrop-blur-sm border border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <Loader2 size={48} className="animate-spin text-cyan-400" />
           </div>
        ) : filteredImages.length === 0 ? (
           <div className="flex justify-center items-center h-64 border border-dashed border-white/20 rounded-2xl bg-white/5">
             <p className="text-white/50 text-lg">No gallery images found.</p>
           </div>
        ) : (
          <Masonry columnsCount={3} gutter="16px" className="max-md:!grid-cols-1 max-lg:!grid-cols-2">
            {filteredImages.map((image, index) => (
              <div
                key={image.id || index}
                className="group relative overflow-hidden rounded-[16px] cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <h4 className="text-white font-semibold text-xl">{image.title}</h4>
                    <p className="text-cyan-400 text-sm mt-1">{image.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
        )}
      </div>
    </section>
  );
}
