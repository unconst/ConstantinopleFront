import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function useCounter(target: number, duration: number = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

const metrics = [
  { label: 'Total Queries', value: 1_284_391, format: (n: number) => n.toLocaleString() },
  { label: 'Unique Sessions', value: 47_832, format: (n: number) => n.toLocaleString() },
  { label: 'Tokens Generated', value: 892, format: (n: number) => `${n}M` },
  { label: 'Avg Latency', value: 142, format: (n: number) => `${n}ms` },
  { label: 'Active Miners', value: 38, format: (n: number) => `${n}` },
  { label: 'Dataset Size', value: 12, format: (n: number) => `${n} GB` },
];

const recentQueries = [
  { time: '2s ago', tokens: 847, category: 'Code generation' },
  { time: '5s ago', tokens: 312, category: 'Reasoning' },
  { time: '8s ago', tokens: 1204, category: 'Analysis' },
  { time: '12s ago', tokens: 89, category: 'Classification' },
  { time: '15s ago', tokens: 2031, category: 'Creative writing' },
  { time: '19s ago', tokens: 456, category: 'Code generation' },
  { time: '23s ago', tokens: 178, category: 'Translation' },
  { time: '28s ago', tokens: 923, category: 'Reasoning' },
];

export function DatasetPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-20 min-h-screen pt-28 pb-20 px-8 lg:px-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-px bg-g3-text-secondary" />
            <span className="font-sans text-xs text-g3-text-secondary tracking-widest uppercase">
              Public inference dataset
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-g3-text leading-tight tracking-[-0.02em]">
            Every query, shared.
          </h2>
          <p className="font-sans text-base text-g3-text-secondary mt-4 max-w-lg leading-relaxed">
            All inference is sanitized and published. This is the public record of intelligence flowing through Constantinople.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {metrics.map((m) => (
            <MetricCard key={m.label} label={m.label} target={m.value} format={m.format} />
          ))}
        </div>

        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-px bg-g3-text-secondary" />
            <span className="font-sans text-xs text-g3-text-muted tracking-widest uppercase">
              Recent queries
            </span>
          </div>

          <div className="border border-white/[0.08] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 px-5 font-sans text-xs text-g3-text-muted tracking-widest uppercase">Time</th>
                  <th className="text-left py-3 px-5 font-sans text-xs text-g3-text-muted tracking-widest uppercase">Category</th>
                  <th className="text-right py-3 px-5 font-sans text-xs text-g3-text-muted tracking-widest uppercase">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {recentQueries.map((q, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="py-3.5 px-5 font-mono text-sm text-g3-text-muted">{q.time}</td>
                    <td className="py-3.5 px-5 font-sans text-sm text-g3-text-secondary">{q.category}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-g3-text-secondary text-right">{q.tokens.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, target, format }: { label: string; target: number; format: (n: number) => string }) {
  const value = useCounter(target);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-white/[0.08] rounded-lg p-5"
    >
      <div className="font-mono text-2xl font-semibold text-g3-text mb-1">{format(value)}</div>
      <div className="font-sans text-[11px] text-g3-text-muted tracking-wider uppercase">{label}</div>
    </motion.div>
  );
}
