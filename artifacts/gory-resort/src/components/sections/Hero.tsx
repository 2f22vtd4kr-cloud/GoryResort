import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const Hero = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Letters are ALWAYS opacity:1 — only the y-position animates.
  // This ensures text is visible even before JS hydrates or on
  // reduced-motion devices. The slide-up is purely decorative.
  const letterVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: { y: 40 },
        visible: { y: 0 },
      };

  const wordmark = "GORY".split("");

  return (
    <div
      ref={ref}
      className="relative h-[100dvh] w-full overflow-hidden"
      // Dark gradient placeholder visible immediately while the JPEG loads
      style={{ background: 'linear-gradient(160deg, #0d1117 0%, #1a2332 50%, #0d1117 100%)' }}
    >
      {/* Background photo — parallax + overlays */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <img
          src="/images/hero.jpg"
          alt="GORY Resort Mountains"
          fetchPriority="high"
          decoding="sync"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
        {/* GORY wordmark — always white, only Y animates */}
        {prefersReducedMotion || !letterVariants ? (
          <div className="flex font-display text-[15vw] leading-none tracking-[0.1em] text-white drop-shadow-2xl select-none">
            {wordmark.map((letter, i) => (
              <span key={i}>{letter}</span>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.08, delayChildren: 0 }}
            className="flex font-display text-[15vw] leading-none tracking-[0.1em] text-white drop-shadow-2xl select-none"
          >
            {wordmark.map((letter, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                style={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Tagline + badge */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-col items-center space-y-6 text-center"
        >
          <p className="text-sm md:text-base tracking-[0.3em] font-medium uppercase text-white/90">
            {t('hero_tagline')}
          </p>
          <div className="border border-white/20 px-6 py-2 rounded-full backdrop-blur-sm bg-white/5">
            <span className="text-xs tracking-widest text-white/80">{t('hero_opening')}</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll chevron */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-white/50" size={16} />
        </motion.div>
      </motion.div>
    </div>
  );
};
