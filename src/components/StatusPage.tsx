import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function useAnimatedValue(base: number, range: number, intervalMs: number = 2000) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(base + (Math.random() - 0.5) * range);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [base, range, intervalMs]);
  return value;
}

function SparkLine({ data, color = 'rgba(201,169,98,0.6)' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function generateData(base: number, variance: number, count: number = 24) {
  return Array.from({ length: count }, () => base + (Math.random() - 0.5) * variance);
}

const latencyData = generateData(140, 60);
const throughputData = generateData(320, 100);
const minerData = generateData(36, 8);
const uptimeData = generateData(99.95, 0.1);

export function StatusPage() {
  const latency = useAnimatedValue(142, 30);
  const throughput = useAnimatedValue(320, 80);
  const activeMiners = useAnimatedValue(38, 6);
  const uptime = useAnimatedValue(99.97, 0.04);

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
              Network status
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-serif text-4xl sm:text-5xl text-g3-text leading-tight tracking-[-0.02em]">
              All systems operational
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard
            title="Latency"
            value={`${Math.round(latency)}ms`}
            subtitle="P50 response time"
            data={latencyData}
          />
          <StatusCard
            title="Throughput"
            value={`${Math.round(throughput)} req/min`}
            subtitle="Requests per minute"
            data={throughputData}
            color="rgba(110,200,150,0.6)"
          />
          <StatusCard
            title="Active Miners"
            value={`${Math.round(activeMiners)}`}
            subtitle="Verified GPU nodes"
            data={minerData}
            color="rgba(150,140,220,0.6)"
          />
          <StatusCard
            title="Uptime"
            value={`${uptime.toFixed(2)}%`}
            subtitle="Last 30 days"
            data={uptimeData}
            color="rgba(200,180,100,0.6)"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <MiniStatus label="Hidden State Verification" status="Passing" ok />
          <MiniStatus label="On-chain Weight Setting" status="Commit-reveal active" ok />
          <MiniStatus label="Public Dataset Sync" status="Real-time" ok />
        </div>
      </div>
    </motion.div>
  );
}

function StatusCard({
  title, value, subtitle, data, color,
}: {
  title: string; value: string; subtitle: string; data: number[]; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-white/[0.08] rounded-lg p-6 backdrop-blur-sm bg-white/[0.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-sans text-sm font-medium text-g3-text tracking-wide">{title}</h3>
          <p className="font-sans text-[11px] text-g3-text-muted mt-0.5">{subtitle}</p>
        </div>
        <span className="font-mono text-2xl font-semibold text-g3-text">{value}</span>
      </div>
      <div className="border-t border-white/[0.06] pt-4">
        <SparkLine data={data} color={color} />
      </div>
    </motion.div>
  );
}

function MiniStatus({ label, status, ok }: { label: string; status: string; ok: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-white/[0.08] rounded-lg p-5 backdrop-blur-sm bg-white/[0.02]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="font-sans text-sm text-g3-text">{label}</span>
      </div>
      <span className="font-sans text-xs text-g3-text-muted">{status}</span>
    </motion.div>
  );
}
