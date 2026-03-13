import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://concrete-flowers-summary-depth.trycloudflare.com';
const POLL_INTERVAL = 8000; // 8 seconds

interface MinerDetail {
  uid: number;
  alive: boolean;
  endpoint: string;
  reliability: number;
  served: number;
  failed: number;
  avg_ttft_ms: number;
  avg_tps: number;
  active: number;
  score?: number;
  weight?: number;
  pass_rate?: number;
  divergence?: number;
  is_suspect?: boolean;
}

interface GatewayHealth {
  status: string;
  version: string;
  uptime_s: number;
  model: string;
  miners_total: number;
  miners_alive: number;
  epoch: number;
  epoch_elapsed_s: number;
  epoch_length_s: number;
  total_organic: number;
  total_synthetic: number;
  last_weight_set: number;
  weights: Record<string, number>;
  challenges: { total: number; passed: number; failed: number };
  errors: { timeouts: number; miner_errors: number; failovers: number };
  miners_detail: MinerDetail[];
}

function SparkLine({ data, color = 'rgba(201,169,98,0.6)' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const points = data.map((v, i) => `${(i / Math.max(data.length - 1, 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

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

function useGatewayHealth() {
  const [health, setHealth] = useState<GatewayHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [downSince, setDownSince] = useState<number | null>(null);

  // History buffers for sparklines (last 30 data points)
  const [tpsHistory, setTpsHistory] = useState<number[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [minerCountHistory, setMinerCountHistory] = useState<number[]>([]);
  const [reliabilityHistory, setReliabilityHistory] = useState<number[]>([]);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GatewayHealth = await res.json();
      setHealth(data);
      setError(null);
      setLastUpdate(Date.now());
      setConsecutiveFailures(0);
      setDownSince(null);

      // Compute aggregate metrics
      const aliveMiners = data.miners_detail.filter(m => m.alive);
      const avgTps = aliveMiners.length > 0
        ? aliveMiners.reduce((sum, m) => sum + m.avg_tps, 0) / aliveMiners.length
        : 0;
      const avgTtft = aliveMiners.length > 0
        ? aliveMiners.reduce((sum, m) => sum + m.avg_ttft_ms, 0) / aliveMiners.length
        : 0;
      const avgReliability = aliveMiners.length > 0
        ? aliveMiners.reduce((sum, m) => sum + m.reliability, 0) / aliveMiners.length
        : 0;

      setTpsHistory(prev => [...prev.slice(-29), avgTps]);
      setLatencyHistory(prev => [...prev.slice(-29), avgTtft]);
      setMinerCountHistory(prev => [...prev.slice(-29), data.miners_alive]);
      setReliabilityHistory(prev => [...prev.slice(-29), avgReliability * 100]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
      setConsecutiveFailures(prev => {
        if (prev === 0) setDownSince(Date.now());
        return prev + 1;
      });
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { health, error, lastUpdate, consecutiveFailures, downSince, tpsHistory, latencyHistory, minerCountHistory, reliabilityHistory };
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function StatusPage() {
  const { health, error, lastUpdate, consecutiveFailures, downSince, tpsHistory, latencyHistory, minerCountHistory, reliabilityHistory } = useGatewayHealth();

  const isOnline = health?.status === 'ok' && consecutiveFailures === 0;
  const isDown = consecutiveFailures >= 3;
  const aliveMiners = health?.miners_detail.filter(m => m.alive) ?? [];
  const avgTps = aliveMiners.length > 0
    ? aliveMiners.reduce((sum, m) => sum + m.avg_tps, 0) / aliveMiners.length
    : 0;
  const avgTtft = aliveMiners.length > 0
    ? aliveMiners.reduce((sum, m) => sum + m.avg_ttft_ms, 0) / aliveMiners.length
    : 0;
  const avgReliability = aliveMiners.length > 0
    ? aliveMiners.reduce((sum, m) => sum + m.reliability, 0) / aliveMiners.length * 100
    : 0;
  const challengePassRate = health && health.challenges.total > 0
    ? (health.challenges.passed / health.challenges.total * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-20 min-h-screen pt-28 pb-20 px-8 lg:px-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Gateway Down Banner */}
        {isDown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border border-red-500/30 rounded-lg p-4 bg-red-500/10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="font-sans text-sm text-red-300 font-medium">Gateway unreachable</span>
            </div>
            <p className="font-sans text-xs text-red-400/70 mt-1 ml-5">
              {consecutiveFailures} consecutive failures
              {downSince && ` · Down for ${formatUptime(Math.floor((Date.now() - downSince) / 1000))}`}
              {lastUpdate > 0 && ` · Last successful poll: ${new Date(lastUpdate).toLocaleTimeString()}`}
            </p>
          </motion.div>
        )}

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-px bg-g3-text-secondary" />
            <span className="font-sans text-xs text-g3-text-secondary tracking-widest uppercase">
              Network status
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : isDown ? 'bg-red-400 animate-pulse' : error ? 'bg-yellow-400' : 'bg-yellow-400 animate-pulse'}`} />
            <h2 className="font-serif text-4xl sm:text-5xl text-g3-text leading-tight tracking-[-0.02em]">
              {isOnline ? 'All systems operational' : isDown ? 'Gateway unreachable' : error ? 'Connecting...' : 'Loading...'}
            </h2>
          </div>
          {!isOnline && error && !isDown && (
            <p className="font-sans text-sm text-g3-text-muted mt-2">
              Attempting to reach the gateway. This usually resolves in a few seconds.
            </p>
          )}
          {lastUpdate > 0 && (
            <p className="font-sans text-xs text-g3-text-muted mt-3">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()} · Polling every {POLL_INTERVAL / 1000}s
              {health && ` · Gateway v${health.version} · Up ${formatUptime(health.uptime_s)}`}
            </p>
          )}
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard
            title="Average Latency"
            value={health ? `${avgTtft.toFixed(1)}ms` : '—'}
            subtitle="Mean TTFT across miners"
            data={latencyHistory}
          />
          <StatusCard
            title="Throughput"
            value={health ? `${avgTps.toFixed(0)} tok/s` : '—'}
            subtitle="Average tokens per second"
            data={tpsHistory}
            color="rgba(110,200,150,0.6)"
          />
          <StatusCard
            title="Active Miners"
            value={health ? `${health.miners_alive}` : '—'}
            subtitle={health ? `${health.miners_total} registered on chain` : 'Loading'}
            data={minerCountHistory}
            color="rgba(150,140,220,0.6)"
          />
          <StatusCard
            title="Reliability"
            value={health ? `${avgReliability.toFixed(1)}%` : '—'}
            subtitle="Average miner uptime"
            data={reliabilityHistory}
            color="rgba(200,180,100,0.6)"
          />
        </div>

        {/* System Status Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <MiniStatus
            label="Hidden State Verification"
            status={health ? `${challengePassRate.toFixed(0)}% pass rate (${health.challenges.passed}/${health.challenges.total})` : 'Loading'}
            ok={health ? challengePassRate > 50 : false}
          />
          <MiniStatus
            label="On-chain Weight Setting"
            status={health?.last_weight_set ? `Last set ${formatUptime(Math.floor(Date.now() / 1000 - health.last_weight_set))} ago` : 'Commit-reveal active'}
            ok={isOnline ?? false}
          />
          <MiniStatus
            label="Epoch Progress"
            status={health ? `${Math.floor(health.epoch_elapsed_s / 60)}m / ${Math.floor(health.epoch_length_s / 60)}m elapsed` : 'Loading'}
            ok={isOnline ?? false}
          />
        </div>

        {/* Weight Distribution */}
        {health && Object.keys(health.weights).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-12 border border-white/[0.08] rounded-lg p-6 backdrop-blur-sm bg-white/[0.02]"
          >
            <h3 className="font-sans text-sm font-medium text-g3-text tracking-wide mb-4">Weight distribution</h3>
            <div className="flex h-6 rounded-full overflow-hidden bg-white/[0.04]">
              {Object.entries(health.weights)
                .sort(([, a], [, b]) => b - a)
                .map(([uid, weight], i) => {
                  const colors = ['rgba(110,200,150,0.7)', 'rgba(150,140,220,0.7)', 'rgba(201,169,98,0.7)', 'rgba(200,120,120,0.7)', 'rgba(120,180,200,0.7)'];
                  return (
                    <div
                      key={uid}
                      style={{ width: `${weight * 100}%`, backgroundColor: colors[i % colors.length] }}
                      className="h-full flex items-center justify-center transition-all duration-500"
                      title={`UID ${uid}: ${(weight * 100).toFixed(1)}%`}
                    >
                      {weight > 0.08 && (
                        <span className="font-mono text-[10px] text-white/90 font-medium">
                          {uid}: {(weight * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-4 mt-3 flex-wrap">
              {Object.entries(health.weights)
                .sort(([, a], [, b]) => b - a)
                .map(([uid, weight], i) => {
                  const colors = ['rgba(110,200,150,0.7)', 'rgba(150,140,220,0.7)', 'rgba(201,169,98,0.7)', 'rgba(200,120,120,0.7)', 'rgba(120,180,200,0.7)'];
                  return (
                    <div key={uid} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="font-mono text-[11px] text-g3-text-muted">UID {uid}: {(weight * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Epoch Progress Bar */}
        {health && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-6 border border-white/[0.08] rounded-lg p-6 backdrop-blur-sm bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans text-sm font-medium text-g3-text tracking-wide">Epoch {health.epoch}</h3>
              <span className="font-mono text-xs text-g3-text-muted">
                {Math.floor(health.epoch_elapsed_s / 60)}m / {Math.floor(health.epoch_length_s / 60)}m
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/80"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((health.epoch_elapsed_s / health.epoch_length_s) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="font-sans text-[11px] text-g3-text-muted mt-2">
              {((health.epoch_elapsed_s / health.epoch_length_s) * 100).toFixed(0)}% complete
              {health.last_weight_set > 0 && ` · Weights last set ${formatUptime(Math.floor(Date.now() / 1000 - health.last_weight_set))} ago`}
            </p>
          </motion.div>
        )}

        {/* Request Counters */}
        {health && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-12 border border-white/[0.08] rounded-lg p-6 backdrop-blur-sm bg-white/[0.02]"
          >
            <h3 className="font-sans text-sm font-medium text-g3-text tracking-wide mb-4">Request summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CounterItem label="Organic requests" value={health.total_organic} />
              <CounterItem label="Synthetic probes" value={health.total_synthetic} />
              <CounterItem label="Challenges passed" value={health.challenges.passed} />
              <CounterItem label="Failovers" value={health.errors.failovers} />
            </div>
          </motion.div>
        )}

        {/* Miner Table */}
        {health && health.miners_detail.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-12 border border-white/[0.08] rounded-lg backdrop-blur-sm bg-white/[0.02] overflow-hidden"
          >
            <div className="p-6 pb-4">
              <h3 className="font-sans text-sm font-medium text-g3-text tracking-wide">Miner fleet</h3>
              <p className="font-sans text-[11px] text-g3-text-muted mt-1">
                {health.model} · {health.miners_alive} alive
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-t border-b border-white/[0.06]">
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">UID</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">Status</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">TPS</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">TTFT</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">Reliability</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">Served</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">Score</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">Weight</th>
                    <th className="px-6 py-3 font-sans text-[11px] text-g3-text-muted font-medium tracking-wider uppercase">Challenges</th>
                  </tr>
                </thead>
                <tbody>
                  {health.miners_detail.map((m) => (
                    <tr key={m.uid} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 font-mono text-sm text-g3-text">{m.uid}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-sans ${m.alive ? 'text-emerald-400' : 'text-red-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.alive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {m.alive ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text">{m.avg_tps.toFixed(0)}</td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text">{m.avg_ttft_ms.toFixed(0)}ms</td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text">{(m.reliability * 100).toFixed(0)}%</td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text-secondary">{m.served}</td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text">{m.score?.toFixed(2) ?? '—'}</td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text">{m.weight != null ? `${(m.weight * 100).toFixed(1)}%` : '—'}</td>
                      <td className="px-6 py-3 font-mono text-sm text-g3-text-secondary">{m.pass_rate != null ? `${(m.pass_rate * 100).toFixed(0)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
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

function CounterItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-xl text-g3-text">{value.toLocaleString()}</p>
      <p className="font-sans text-[11px] text-g3-text-muted mt-1">{label}</p>
    </div>
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
