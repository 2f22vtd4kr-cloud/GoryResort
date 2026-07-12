import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const Ski = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

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
  ];

  return (
    <section id="ski" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <motion.div 
            className="order-2 lg:order-1 relative aspect-[3/4] lg:aspect-square overflow-hidden rounded-sm"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 1, ease: "easeOut" }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
              className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-12"
            >
              {t('ski_title')}
            </motion.h2>

            {/* Run categories */}
            <div className="flex overflow-x-auto md:overflow-visible md:flex-col gap-6 md:gap-8 pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar">
              {categories.map((cat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 + (i * 0.1) }}
                  className="group border border-white/10 md:border-none md:border-b md:border-white/10 p-6 md:p-0 md:pb-6 flex flex-col md:flex-row md:items-end justify-between hover:border-white/40 md:hover:border-white/40 transition-colors min-w-[280px] md:min-w-0 snap-center bg-black/20 md:bg-transparent"
                >
                  <h3 className="font-serif text-3xl md:text-5xl text-white group-hover:text-accent transition-colors mb-4 md:mb-0">
                    {t(cat.title)}
                  </h3>
                  <span className="font-display tracking-widest text-xl text-muted-foreground group-hover:text-white transition-colors">
                    {cat.km}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Mountain specs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 pt-8 border-t border-white/8 grid grid-cols-2 md:grid-cols-3 gap-6"
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
      </div>
    </section>
  );
};
