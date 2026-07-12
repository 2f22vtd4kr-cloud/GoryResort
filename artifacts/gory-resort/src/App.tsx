import React, { useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/sections/Hero';
import { Vision } from '@/components/sections/Vision';
import { Ski } from '@/components/sections/Ski';
import { Stay } from '@/components/sections/Stay';
import { Experiences } from '@/components/sections/Experiences';
import { Investment } from '@/components/sections/Investment';
import { Gallery } from '@/components/sections/Gallery';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/Footer';

function App() {
  // Allow deep-linking to any section via URL hash (e.g. /#vision, /#ski)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white font-sans">
        <Navigation />
        <main>
          <Hero />
          <Vision />
          <Ski />
          <Stay />
          <Experiences />
          <Investment />
          <Gallery />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;

