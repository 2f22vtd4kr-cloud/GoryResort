import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
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
import { SimulatorPage } from '@/components/SimulatorPage';

function ResortApp() {
  // Allow deep-linking to any section via URL hash (e.g. /#vision, /#ski)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      // Use instant scroll so screenshots capture the right section immediately
      document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  return (
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

      {/* Floating simulator button */}
      <a
        href={`${import.meta.env.BASE_URL}simulator`}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0A0C0E]/90 border border-white/15 backdrop-blur-md px-4 py-2.5 text-white/50 hover:text-white hover:border-white/30 transition-all text-xs uppercase tracking-widest group"
        title="Open User Simulator"
      >
        <span className="text-[#2A5F6F] group-hover:text-[#4A9FBF] transition-colors">◎</span>
        Simulator
      </a>
    </div>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <LanguageProvider>
      <Router base={base}>
        <Switch>
          <Route path="/simulator">
            <SimulatorPage />
          </Route>
          <Route>
            <ResortApp />
          </Route>
        </Switch>
      </Router>
    </LanguageProvider>
  );
}

export default App;
