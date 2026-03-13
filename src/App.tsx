import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HeroContent } from './components/HeroContent';
import { DatasetPage } from './components/DatasetPage';
import { DocsPage } from './components/DocsPage';
import { StatusPage } from './components/StatusPage';
import { Footer } from './components/Footer';
import { VideoBackground } from './components/VideoBackground';

export type Page = 'home' | 'dataset' | 'docs' | 'status';

function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <main className="min-h-screen bg-g3-bg relative">
      <VideoBackground />

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
