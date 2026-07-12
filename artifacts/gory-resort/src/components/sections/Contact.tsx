import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';

export const Contact = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate network request
    setTimeout(() => {
      setStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section id="contact" className="py-32 bg-card border-t border-white/5" ref={ref}>
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Info Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-between"
          >
            <div>
              <h2 className="font-serif text-5xl md:text-7xl text-white mb-12">
                {t('form_title')}
              </h2>
              <div className="space-y-6 text-white/70 font-serif text-lg">
                <p className="max-w-sm text-balance leading-relaxed">
                  {t('footer_address')}
                </p>
                <p>
                  <a href="mailto:invest@gory.ge" className="hover:text-white transition-colors link-underline">invest@gory.ge</a>
                </p>
                <p>
                  <a href="tel:+995322000000" className="hover:text-white transition-colors link-underline">+995 322 000 000</a>
                </p>
              </div>
            </div>
            
            <div className="mt-20 lg:mt-0">
              <span className="font-display text-4xl tracking-[0.2em] text-white/20">GORY</span>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {status === 'success' ? (
              <div className="h-full min-h-[400px] flex items-center justify-center border border-white/10 bg-background/50 p-12 text-center">
                <p className="font-serif text-2xl text-white/80">{t('form_success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 relative group">
                    <label className="text-xs uppercase tracking-widest text-white/50">{t('form_name')}</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs uppercase tracking-widest text-white/50">{t('form_email')}</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/50">{t('form_interest')}</label>
                  <select 
                    required
                    defaultValue=""
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-black">Select an option</option>
                    <option value="investor" className="text-black">{t('form_interest_inv')}</option>
                    <option value="guest" className="text-black">{t('form_interest_guest')}</option>
                    <option value="media" className="text-black">{t('form_interest_media')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/50">{t('form_message')}</label>
                  <textarea 
                    required 
                    rows={4}
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white resize-none focus:outline-none focus:border-white transition-colors"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="w-full bg-white text-black py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {status === 'submitting' ? '...' : t('form_submit')}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};