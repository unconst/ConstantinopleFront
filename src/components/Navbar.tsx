import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Page } from '../App';
import { TickerBar } from './TickerBar';

interface NavbarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem('cst_api_key'));
    check();
    window.addEventListener('storage', check);
    const interval = setInterval(check, 1000);
    return () => { window.removeEventListener('storage', check); clearInterval(interval); };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-20"
    >
      <div className="h-full px-8 lg:px-16 flex items-center justify-between relative">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer z-10"
        >
          <span className="font-serif text-lg font-bold text-g3-text tracking-tight">Constantinople</span>
          <span className="text-g3-text-muted">|</span>
          <span className="font-sans text-sm text-g3-text-secondary tracking-wide">SN97</span>
        </button>

        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <TickerBar />
        </div>

        <button
          onClick={() => onNavigate('api')}
          className="hidden lg:block px-5 py-2.5 border border-white/20 rounded-full font-sans text-sm text-g3-text hover:bg-white/10 hover:border-white/40 transition-all duration-250 tracking-wide z-10"
        >
          {isLoggedIn ? 'Dashboard' : 'API Key'}
        </button>

      </div>

      {/* Mobile ticker - scrollable row below header */}
      <div className="lg:hidden px-4 pb-2 overflow-x-auto scrollbar-none">
        <TickerBar />
      </div>
    </motion.header>
  );
}
