import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../App';

const navItems: { label: string; page: Page }[] = [
  { label: 'Dataset', page: 'dataset' },
  { label: 'About', page: 'docs' },
  { label: 'Status', page: 'status' },
];

interface NavbarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-20"
    >
      <div className="h-full px-8 lg:px-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="font-serif text-lg font-bold text-g3-text tracking-tight">Constantinople</span>
          <span className="text-g3-text-muted">|</span>
          <span className="font-sans text-sm text-g3-text-secondary tracking-wide">SN97</span>
        </button>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`relative font-sans text-sm transition-colors duration-300 tracking-wide ${
                activePage === item.page
                  ? 'text-g3-text'
                  : 'text-g3-text-secondary hover:text-g3-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a
          href="/api-key"
          className="hidden lg:block px-5 py-2.5 border border-white/20 rounded-full font-sans text-sm text-g3-text hover:bg-white/10 hover:border-white/40 transition-all duration-250 tracking-wide"
        >
          API Key
        </a>

        <button
          className="lg:hidden text-g3-text"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-black/80 backdrop-blur-md border-b border-white/[0.08]"
          >
            <div className="px-8 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileOpen(false); }}
                  className={`text-left font-sans text-sm tracking-wide ${
                    activePage === item.page
                      ? 'text-g3-text'
                      : 'text-g3-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href="/api-key"
                className="inline-block w-fit px-5 py-2.5 border border-white/20 rounded-full font-sans text-sm text-g3-text"
              >
                API Key
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
