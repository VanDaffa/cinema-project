import React, { useEffect, useRef, useState } from 'react';
import { HiPlay, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import useCarouselScroll from '../../hooks/useCarouselScroll';
import SectionHeading from './SectionHeading';

// Pemutar trailer YouTube + galeri klip tambahan.
// Beri `key` berbeda untuk tiap tayangan agar klip terpilih kembali ke trailer utama.
const TrailerPlayer = ({ videos, mainTrailerKey, title, shouldAutoPlay }) => {
  const [activeVideoKey, setActiveVideoKey] = useState(mainTrailerKey);
  const sectionRef = useRef(null);
  const { ref, isLeftEnd, isRightEnd, update, scrollBy } = useCarouselScroll(videos.length);

  // Gulir otomatis ke pemutar video saat dibuka via tombol "Play Trailer"
  useEffect(() => {
    if (shouldAutoPlay) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [shouldAutoPlay]);

  return (
    <section id="video-player-section" ref={sectionRef} className="mb-12 scroll-mt-24">
      <SectionHeading className="mb-4">Trailer & Klip Video</SectionHeading>

      <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${activeVideoKey}${
            shouldAutoPlay ? '?autoplay=1&mute=1' : ''
          }`}
          title={`${title} Video Player`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Carousel Pilihan Klip Tambahan */}
      {videos.length > 1 && (
        <div className="relative flex items-center mt-4">
          {!isLeftEnd && (
            <button
              type="button"
              onClick={() => scrollBy(-320)}
              aria-label="Geser klip ke kiri"
              className="absolute -left-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            ref={ref}
            onScroll={update}
            className="flex gap-3 overflow-x-auto scrollbar-hide py-1 w-full"
          >
            {videos.slice(0, 10).map((vid) => {
              const isSelected = vid.key === activeVideoKey;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => setActiveVideoKey(vid.key)}
                  className={`w-44 shrink-0 text-left rounded-xl overflow-hidden border transition-all bg-slate-900 ${
                    isSelected
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="aspect-video relative bg-slate-800">
                    <img
                      src={`https://img.youtube.com/vi/${vid.key}/mqdefault.jpg`}
                      alt={vid.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="p-1.5 rounded-full bg-slate-950/80 text-white">
                        <HiPlay className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                      {vid.type}
                    </span>
                    <p className="text-xs font-medium text-slate-200 line-clamp-1 mt-0.5">
                      {vid.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {!isRightEnd && (
            <button
              type="button"
              onClick={() => scrollBy(320)}
              aria-label="Geser klip ke kanan"
              className="absolute -right-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default TrailerPlayer;
