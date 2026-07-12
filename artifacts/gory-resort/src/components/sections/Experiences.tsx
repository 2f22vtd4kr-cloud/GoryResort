import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';
import { AiAddition } from '../AiAddition';

export const Experiences = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const experiences = [
    { key: 'exp_1', descKey: 'exp_desc_1' },
    { key: 'exp_2', descKey: 'exp_desc_2' },
    { key: 'exp_3', descKey: 'exp_desc_3' },
    { key: 'exp_4', descKey: 'exp_desc_4' },
    { key: 'exp_5', descKey: 'exp_desc_5' },
  ];

  return (
    <section id="experiences" className="py-24 bg-card" ref={ref}>
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          
          <div className="w-full md:w-1/3 flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
              className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-12"
            >
              {t('exp_title')}
            </motion.h2>

            <div className="flex flex-col space-y-1 border-l border-white/10 pl-6">
              {experiences.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 + (i * 0.1) }}
                  className="py-5 border-b border-white/5 last:border-b-0 hover:pl-2 transition-all duration-300 cursor-default"
                >
                  <h3 className="font-serif text-2xl md:text-3xl text-white/80 hover:text-white transition-colors mb-2">
                    {t(exp.key)}
                  </h3>
                  <p className="text-xs text-white/35 leading-relaxed max-w-xs">
                    {t(exp.descKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            className="w-full md:w-2/3 relative aspect-square md:aspect-[4/3] overflow-hidden rounded-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <img 
              src="/images/experiences.jpg" 
              alt="Luxury Spa" 
              className="w-full h-full object-cover transition-transform duration-[20s] hover:scale-110"
            />
          </motion.div>

        </div>
        <AiAddition sectionKey="experiences_ai" />
      </div>
    </section>
  );
};
