import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { AiAddition } from '../AiAddition';

export const Ski = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  const categories = [
    { title: 'ski_cat_1', km: '8 KM' },
    { title: 'ski_cat_2', km: '18 KM' },
    { title: 'ski_cat_3', km: '16 KM' },
  ];

  const specs = [
    { val: 'ski_spec_1_val', lbl: 'ski_spec_1_lbl' },
    { val: 'ski_spec_2_val', lbl: 'ski_spec_2_lbl' },
    { val: 'ski_spec_3_val', lbl: 'ski_spec_3_lbl' },
    { val: 'ski_spec_4_val', lbl: 'ski_spec_4_lbl' },
    { val: 'ski_spec_5_val', lbl: 'ski_spec_5_lbl' },
    { val: 'ski_spec_6_val', lbl: 'ski_spec_6_lbl' },
    { val: 'ski_spec_7_val', lbl: 'ski_spec_7_lbl' },
  ];

  return (
    <section id="ski" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          <motion.div
            className="order-2 lg:order-1 relative aspect-[3/4] lg:aspect-square overflow-hidden rounded-sm"
            initial={{ x: -50 }}
            animate={isInView ? { x: 0 } : { x: -50 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.img
              src="/images/ski.jpg"
              alt="Skiing in Caucasus"
              className="absolute inset-0 w-full h-[120%] object-cover object-center"
              style={{ y: imageY }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>

          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <motion.h2
              initial={{ y: 20 }}
              animate={isInView ? { y: 0 } : { y: 20 }}
              transition={{ duration: 0.8 }}
              className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-6"
            >
              {t('ski_title')}
            </motion.h2>

            {/* Framing statement — sim recommendation */}
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-white/55 text-base leading-relaxed mb-10 max-w-sm"
            >
              {t('ski_framing')}
            </motion.p>

            {/* Run categories — vertical list on all breakpoints */}
            <div className="flex flex-col gap-0">
              {categories.map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20 }}
                  animate={isInView ? { y: 0 } : { y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  className="group border-b border-white/10 py-5 md:py-6 flex flex-row items-end justify-between hover:border-white/40 transition-colors"
                >
                  <h3 className="font-serif text-2xl md:text-5xl text-white group-hover:text-accent transition-colors">
                    {t(cat.title)}
                  </h3>
                  <span className="font-display tracking-widest text-lg md:text-xl text-muted-foreground group-hover:text-white transition-colors">
                    {cat.km}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Mountain specs — 7 items in 3-col grid */}
            <motion.div
              initial={{ y: 20 }}
              animate={isInView ? { y: 0 } : { y: 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 pt-8 border-t border-white/8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-7"
            >
              {specs.map((spec, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-display text-xl md:text-2xl text-white mb-1 leading-none">
                    {t(spec.val)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
                    {t(spec.lbl)}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
        <AiAddition sectionKey="ski_ai" />
      </div>
    </section>
  );
};
