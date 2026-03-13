import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HeroContent } from './components/HeroContent';
import { DatasetPage } from './components/DatasetPage';
import { DocsPage } from './components/DocsPage';
import { StatusPage } from './components/StatusPage';
import { Footer } from './components/Footer';

export type Page = 'home' | 'dataset' | 'docs' | 'status';

function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <main className="min-h-screen bg-g3-bg relative">
      <div className="fixed inset-0 z-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      <Navbar activePage={page} onNavigate={setPage} />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <HeroContent />
            </motion.div>
          )}
          {page === 'dataset' && (
            <motion.div
              key="dataset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <DatasetPage />
            </motion.div>
          )}
          {page === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <DocsPage />
            </motion.div>
          )}
          {page === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <StatusPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}

export default App;
