import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const Stay = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const accommodations = [
    { title: 'stay_type_1', desc: 'stay_desc_1', feat: 'stay_feat_1' },
    { title: 'stay_type_2', desc: 'stay_desc_2', feat: 'stay_feat_2' },
    { title: 'stay_type_3', desc: 'stay_desc_3', feat: 'stay_feat_3' },
  ];

  return (
    <section id="stay" className="py-32 md:py-48 bg-background relative" ref={ref}>
      <div className="container mx-auto px-4 md:px-12">
        
        <motion.div 
          className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden mb-24 rounded-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.img 
            src="/images/stay.jpg" 
            alt="Luxury Mountain Hotel" 
            className="absolute inset-0 w-full h-[120%] object-cover object-center"
            style={{ y: imageY }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <motion.div 
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-xs tracking-[0.3em] text-muted-foreground uppercase sticky top-32">
              {t('stay_title')}
            </h2>
          </motion.div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {accommodations.map((acc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                className="flex flex-col space-y-4 border-t border-white/10 pt-6"
              >
                <span className="text-xs font-mono text-primary">0{i + 1}</span>
                <h3 className="font-serif text-2xl text-white">{t(acc.title)}</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">{t(acc.desc)}</p>
                {/* Feature tags */}
                <div className="pt-1">
                  {t(acc.feat).split(' · ').map((feat, j) => (
                    <span
                      key={j}
                      className="inline-block text-[10px] text-white/35 border border-white/8 px-2 py-0.5 mr-1 mb-1 leading-relaxed"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
