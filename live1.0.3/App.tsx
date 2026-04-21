
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import UniverseBackground from './components/UniverseBackground';
import Docs from './components/Docs';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'docs'>('home');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const isDocs = currentPage === 'docs';

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white selection:bg-cyan-500 selection:text-black transition-colors duration-700" style={{backgroundColor: isDocs ? 'white' : 'transparent'}}>
      {/* Background is always dark at the base, UniverseBackground only shows on home */}
      {!isDocs && <UniverseBackground />}
      
      <Navbar onNavigate={(page) => setCurrentPage(page)} currentPage={currentPage} />
      
      {/* Main content area gets the white background in docs mode */}
      <main className={`pt-20 transition-colors duration-700 ${isDocs ? 'text-slate-900' : ''}`}>
        {currentPage === 'home' ? (
          <>
            <Hero onNavigate={() => setCurrentPage('docs')} />
            <Features />
            <Stats />
          </>
        ) : (
          <Docs onBack={() => setCurrentPage('home')} />
        )}
      </main>
      
      {/* Footer is now outside the white-main container, preserving its dark theme */}
      <Footer />
    </div>
  );
};

export default App;
