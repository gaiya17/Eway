import React, { useState } from 'react';
import Masonry from 'react-responsive-masonry';

const categories = ['All', 'Classes', 'Events'];

const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwdG9nZXRoZXIlMjBjbGFzc3Jvb218ZW58MXx8fHwxNzcxNzc2OTU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Classes',
    title: 'Interactive Learning',
  },
  {
    url: 'https://images.unsplash.com/photo-1588912914074-b93851ff14b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGNvbXB1dGVyJTIwc2NyZWVufGVufDF8fHx8MTc3MTc3Njk1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Classes',
    title: 'Online Classes',
  },
  {
    url: 'https://images.unsplash.com/photo-1629196753813-8b4827ddc7c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBncmFkdWF0aW9uJTIwc3VjY2Vzc3xlbnwxfHx8fDE3NzE3NTcyODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Events',
    title: 'Graduation Ceremony',
  },
  {
    url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWN0dXJlJTIwaGFsbCUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzcxNzU0MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Classes',
    title: 'Lecture Hall',
  },
  {
    url: 'https://images.unsplash.com/photo-1595315343110-9b445a960442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzdHVkZW50c3xlbnwxfHx8fDE3NzE2NjU3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Classes',
    title: 'Library Resources',
  },
  {
    url: 'https://images.unsplash.com/photo-1680264341897-6c4f620627bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY2xhc3Nyb29tJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzE3NzY5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Events',
    title: 'Tech Workshop',
  },
];

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredImages =
    activeCategory === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

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
        <Masonry columnsCount={3} gutter="16px" className="max-md:!grid-cols-1 max-lg:!grid-cols-2">
          {filteredImages.map((image, index) => (
            <div
              key={index}
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
      </div>
    </section>
  );
}
