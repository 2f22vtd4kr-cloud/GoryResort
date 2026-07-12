import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const Investment = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const tiers = [
    { title: 'inv_tier_1_title', desc: 'inv_tier_1_desc', ret: 'inv_tier_1_ret' },
    { title: 'inv_tier_2_title', desc: 'inv_tier_2_desc', ret: 'inv_tier_2_ret' },
    { title: 'inv_tier_3_title', desc: 'inv_tier_3_desc', ret: 'inv_tier_3_ret' },
  ];

  const structure = [
    { label: 'inv_timeline_label', value: 'inv_timeline' },
    { label: 'inv_exit_label',     value: 'inv_exit'     },
    { label: 'inv_legal_label',    value: 'inv_legal'    },
  ];

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="invest" className="relative py-32 md:py-48 overflow-hidden" ref={ref}>
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <img 
          src="/images/investment.jpg" 
          alt="Construction Site" 
          className="w-full h-[130%] object-cover object-center grayscale hover:grayscale-0 transition-all duration-[3s]"
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 md:px-12">
        <div className="max-w-3xl mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-5xl md:text-7xl text-white mb-8"
          >
            {t('inv_title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/70 leading-relaxed font-serif"
          >
            {t('inv_subhead')}
          </motion.p>
        </div>

        {/* Investment tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              className="bg-black/40 border border-white/10 p-8 md:p-12 backdrop-blur-md flex flex-col justify-between hover:bg-black/60 hover:border-white/30 transition-all group"
            >
              <div>
                <h3 className="font-display text-2xl md:text-3xl tracking-widest text-white mb-4 group-hover:text-primary transition-colors">
                  {t(tier.title)}
                </h3>
                <p className="text-white/60 font-serif italic text-lg mb-8">{t(tier.desc)}</p>
              </div>
              <div className="pt-6 border-t border-white/10 mt-auto">
                <span className="text-xs uppercase tracking-widest text-primary font-medium">
                  {t(tier.ret)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Investment structure strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-12 border border-white/8 bg-black/30 backdrop-blur-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          <div className="md:col-span-3 mb-2">
            <p className="text-[10px] text-white/25 uppercase tracking-[0.3em]">{t('inv_structure_label')}</p>
          </div>
          {structure.map((item, i) => (
            <div key={i} className={i > 0 ? 'md:border-l md:border-white/8 md:pl-8' : ''}>
              <p className="text-[10px] text-white/35 uppercase tracking-widest mb-2">{t(item.label)}</p>
              <p className="text-xs text-white/55 leading-relaxed">{t(item.value)}</p>
            </div>
          ))}
        </motion.div>

        {/* Management team + IRR basis strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-12 border border-white/8 bg-black/30 backdrop-blur-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12"
        >
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-[0.3em] mb-4">{t('inv_team_label')}</p>
            <p className="text-sm text-white/70 font-semibold mb-2">{t('inv_developer_name')}</p>
            <p className="text-xs text-white/45 leading-relaxed">{t('inv_developer_desc')}</p>
          </div>
          <div className="md:border-l md:border-white/8 md:pl-12">
            <p className="text-[10px] text-white/25 uppercase tracking-[0.3em] mb-4">{t('inv_irr_label')}</p>
            <p className="text-xs text-white/45 leading-relaxed">{t('inv_irr_desc')}</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center"
        >
          <button 
            onClick={scrollToContact}
            className="bg-white text-black px-10 py-5 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary hover:text-white transition-colors duration-300"
          >
            {t('inv_cta')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
