import { motion } from 'framer-motion';
import { useCopySkill } from '../hooks/use-copy-skill';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function HeroContent() {
  const headlineWords = ['Intelligence', 'belongs', 'free.'];
  const { copy, copied } = useCopySkill();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-8 lg:px-16 pt-20 text-center">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-center gap-4"
        >
          <div className="w-5 h-px bg-g3-text-secondary" />
          <span className="font-sans text-xs text-g3-text-secondary tracking-widest uppercase">
            Constantinople — Bittensor SN97
          </span>
          <div className="w-5 h-px bg-g3-text-secondary" />
        </motion.div>

        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] text-g3-text leading-[1.05] tracking-[-0.02em]"
        >
          {headlineWords.map((word, index) => (
            <motion.span
              key={index}
              variants={wordVariants}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex items-center justify-center gap-6"
        >
          <button
            onClick={copy}
            className="px-7 py-3 border border-white/30 rounded-full font-sans text-sm text-g3-text hover:bg-white/10 hover:border-white/50 transition-all duration-250 tracking-wide"
          >
            {copied ? 'Copied!' : 'Copy SKILL.md'}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="font-sans text-base text-g3-text-secondary leading-relaxed max-w-md mx-auto"
        >
          Blazing fast, always-on, agentic inference which you share: every query to Constantinople is first sanitized and then made public. Let intelligence be free.
        </motion.p>
      </div>
    </div>
  );
}
