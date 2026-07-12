import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const Hero = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const wordmark = "GORY".split("");

  return (
    <div ref={ref} className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y, opacity }}
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <img 
          src="/images/hero.jpg" 
          alt="GORY Resort Mountains" 
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15, delayChildren: 0.5 }}
          className="flex font-display text-[15vw] leading-none tracking-[0.1em] text-white drop-shadow-2xl select-none"
        >
          {wordmark.map((letter, i) => (
            <motion.span key={i} variants={letterVariants} transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}>
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
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

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-white/50" size={16} />
        </motion.div>
      </motion.div>
    </div>
  );
};