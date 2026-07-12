import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AiAddition } from '../AiAddition';

export const Gallery = () => {
  const { t } = useLanguage();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const images = [
    { src: '/images/gallery-1.jpg', alt: 'Lounge',       caption: 'gallery_cap_1' },
    { src: '/images/gallery-2.jpg', alt: 'Gondola',      caption: 'gallery_cap_2' },
    { src: '/images/gallery-3.jpg', alt: 'Valley Aerial',caption: 'gallery_cap_3' },
    { src: '/images/gallery-4.jpg', alt: 'Feast',        caption: 'gallery_cap_4' },
  ];

  const milestones = [1, 2, 3, 4] as const;

  return (
    <section id="gallery" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-12">

        <motion.h2
          initial={{ y: 20 }}
          animate={isInView ? { y: 0 } : { y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-10"
        >
          {t('gallery_title')}
        </motion.h2>

        {/* Photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ y: 30 }}
              animate={isInView ? { y: 0 } : { y: 30 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`relative overflow-hidden cursor-pointer group ${
                i === 0 || i === 3 ? 'aspect-[4/3]' : 'aspect-square md:aspect-[3/4]'
              }`}
              onClick={() => setSelectedImg(img.src)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-[11px] text-white/80 tracking-wide leading-snug">{t(img.caption)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <AiAddition sectionKey="gallery_ai" />

        {/* Behind the Build — construction timeline */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 pt-12 border-t border-white/5"
        >
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-12">
            {t('gallery_progress_label')}
          </p>

          <div className="relative max-w-2xl">
            {/* Vertical connector line */}
            <div className="absolute left-[6px] top-3 bottom-3 w-px bg-white/8" />

            {milestones.map((n, i) => {
              const isLast = i === milestones.length - 1;
              return (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
                  className="relative pl-8 mb-9 last:mb-0"
                >
                  <div
                    className={`absolute left-0 top-[5px] w-3 h-3 rounded-full border ${
                      isLast
                        ? 'border-white/15 bg-transparent'
                        : 'border-white/35 bg-white/8'
                    }`}
                  />
                  <p className="text-xs text-white/38 leading-relaxed">{t(`gallery_milestone_${n}`)}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* The Film — teaser */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-14 border border-white/8 bg-white/[0.02] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8"
        >
          <div className="flex-1">
            <p className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase mb-3">
              {t('gallery_film_label')}
            </p>
            <p className="text-sm text-white/45 leading-relaxed font-serif italic">
              {t('gallery_film_desc')}
            </p>
          </div>
          <div className="shrink-0 border border-white/10 px-6 py-3">
            <span className="text-[9px] tracking-[0.25em] text-white/25 uppercase">Coming 2026</span>
          </div>
        </motion.div>

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12"
            onClick={() => setSelectedImg(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={selectedImg}
              alt="Gallery Fullscreen"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
