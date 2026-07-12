import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  sectionKey: string; // e.g. "ski_ai"
  className?: string;
}

/**
 * Renders AI-generated supplementary content for a section.
 * Invisible when aiContent has no entry for this key.
 */
export function AiAddition({ sectionKey, className = '' }: Props) {
  const { t } = useLanguage();
  const content = t(sectionKey);

  // t() returns the key itself when not found — treat that as empty
  if (!content || content === sectionKey) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={content}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`mt-10 pt-8 border-t border-white/5 ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={10} className="text-[#2A5F6F]/50" />
          <p className="text-[10px] tracking-[0.3em] text-[#2A5F6F]/40 uppercase">
            AI-Enhanced · Simulator
          </p>
        </div>
        <p className="text-sm text-white/40 leading-relaxed font-serif italic">
          {content}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
