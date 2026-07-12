import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { AiAddition } from '../AiAddition';

const AnimatedNumber = ({ value }: { value: string }) => {
  const numValue = parseInt(value.replace(/,/g, ''), 10);
  const isNumber = !isNaN(numValue);

  // Hooks must be called unconditionally — before any early return
  const spring = useSpring(0, { mass: 1, stiffness: 90, damping: 20 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString('en-US'),
  );

  useEffect(() => {
    if (isNumber) spring.set(numValue);
  }, [spring, numValue, isNumber]);

  if (!isNumber) return <span>{value}</span>;
  return <motion.span>{display}</motion.span>;
};

export const Vision = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { val: 'vision_stat_1_val', lbl: 'vision_stat_1_lbl' },
    { val: 'vision_stat_2_val', lbl: 'vision_stat_2_lbl' },
    { val: 'vision_stat_3_val', lbl: 'vision_stat_3_lbl' },
    { val: 'vision_stat_4_val', lbl: 'vision_stat_4_lbl' },
    { val: 'vision_stat_5_val', lbl: 'vision_stat_5_lbl' },
  ];

  return (
    <section id="vision" className="py-32 md:py-48 bg-background relative" ref={ref}>
      <div className="container mx-auto px-6 md:px-12">
        <motion.h2
          initial={{ y: 20 }}
          animate={isInView ? { y: 0 } : { y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-16 md:mb-24"
        >
          {t('vision_title')}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          {/* Stats Column — 5 stats in a 3-col grid */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 30 }}
                animate={isInView ? { y: 0 } : { y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <span className="font-display text-4xl md:text-6xl text-white mb-2 leading-none">
                  {t(stat.val).match(/^\d+(,\d+)*$/) ? (
                    <AnimatedNumber value={t(stat.val)} />
                  ) : (
                    t(stat.val)
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {t(stat.lbl)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center space-y-10">
            <motion.p
              initial={{ y: 30 }}
              animate={isInView ? { y: 0 } : { y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-3xl font-serif text-white/90 leading-relaxed text-balance"
            >
              {t('vision_desc_1')}
            </motion.p>
            <motion.p
              initial={{ y: 30 }}
              animate={isInView ? { y: 0 } : { y: 30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-3xl font-serif text-white/60 leading-relaxed text-balance"
            >
              {t('vision_desc_2')}
            </motion.p>
            <motion.div
              initial={{ y: 20 }}
              animate={isInView ? { y: 0 } : { y: 20 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="border-t border-white/10 pt-8"
            >
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Access</p>
              <p className="text-sm text-white/50 leading-relaxed">{t('vision_access')}</p>
            </motion.div>

            {/* Why Georgia Now */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="border-t border-white/10 pt-8"
            >
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                {t('vision_why_georgia_label')}
              </p>
              <p className="text-xs text-white/40 leading-relaxed">{t('vision_why_georgia')}</p>
            </motion.div>
          </div>
        </div>
        <AiAddition sectionKey="vision_ai" />
      </div>
    </section>
  );
};
