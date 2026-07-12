import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'vision', label: 'nav_vision' },
    { id: 'ski', label: 'nav_ski' },
    { id: 'stay', label: 'nav_stay' },
    { id: 'experiences', label: 'nav_experiences' },
    { id: 'invest', label: 'nav_invest' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-black/60 backdrop-blur-md py-4 border-b border-white/5' 
            : 'bg-transparent py-8'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div 
            className="font-display text-4xl tracking-[0.2em] cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            GORY
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-xs tracking-widest uppercase font-medium text-white/80 hover:text-white link-underline pb-1"
              >
                {t(item.label)}
              </button>
            ))}
            
            <div className="flex items-center space-x-3 text-xs font-medium border-l border-white/20 pl-6">
              <button 
                onClick={() => setLanguage('en')}
                className={`transition-colors ${language === 'en' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                EN
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => setLanguage('ru')}
                className={`transition-colors ${language === 'ru' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                RU
              </button>
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col pt-24 px-6 pb-10"
          >
            <button 
              className="absolute top-6 right-6 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-2xl font-serif tracking-wide text-white/80 hover:text-white"
                >
                  {t(item.label)}
                </button>
              ))}
            </div>

            <div className="flex justify-center space-x-6 mt-auto">
              <button 
                onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }}
                className={`text-xl ${language === 'en' ? 'text-white font-bold' : 'text-white/40'}`}
              >
                EN
              </button>
              <button 
                onClick={() => { setLanguage('ru'); setMobileMenuOpen(false); }}
                className={`text-xl ${language === 'ru' ? 'text-white font-bold' : 'text-white/40'}`}
              >
                RU
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};