import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

const API_BACKEND = import.meta.env.VITE_API_BACKEND || 'https://protective-mainstream-pretty-frames.trycloudflare.com';

type Tab = 'register' | 'dashboard' | 'docs';

interface UserInfo {
  id: number;
  email: string;
  name: string;
  balance: number;
  tier: string;
}

interface APIKey {
  id: number;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: number;
}

interface UsageDay {
  date: string;
  input_tokens: number;
  output_tokens: number;
  requests: number;
  cost: number;
}

export function APIPage() {
  const [tab, setTab] = useState<Tab>('register');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [usage, setUsage] = useState<UsageDay[]>([]);
  const [totalUsage, setTotalUsage] = useState({ requests: 0, cost: 0, inputTokens: 0, outputTokens: 0 });
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  // Stored API key for session
  const [sessionKey, setSessionKey] = useState<string>(() => {
    try { return localStorage.getItem('cst_api_key') || ''; }
    catch { return ''; }
  });

  const saveSessionKey = (key: string) => {
    setSessionKey(key);
    try { localStorage.setItem('cst_api_key', key); } catch {}
  };

  const fetchDashboard = useCallback(async () => {
    if (!sessionKey) return;
    try {
      const headers = { 'Authorization': `Bearer ${sessionKey}` };

      const [balRes, usageRes, keysRes] = await Promise.all([
        fetch(`${API_BACKEND}/v1/user/balance`, { headers }),
        fetch(`${API_BACKEND}/v1/user/usage?days=30`, { headers }),
        fetch(`${API_BACKEND}/v1/keys`, { headers }),
      ]);

      if (!balRes.ok) {
        if (balRes.status === 401) {
          setError('Invalid API key. Please log in again.');
          saveSessionKey('');
          setTab('register');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const balData = await balRes.json();
      const usageData = await usageRes.json();
      const keysData = await keysRes.json();

      setUser({ ...(user || { id: 0, email: '', name: '' }), balance: balData.balance, tier: balData.tier });
      setUsage(usageData.daily || []);
      setTotalUsage({
        requests: usageData.total_requests,
        cost: usageData.total_cost,
        inputTokens: usageData.total_input_tokens,
        outputTokens: usageData.total_output_tokens,
      });
      setKeys(keysData);
    } catch {
      setError('Failed to load dashboard data');
    }
  }, [sessionKey, user]);

  useEffect(() => {
    if (sessionKey) {
      setTab('dashboard');
      fetchDashboard();
    }
  }, [sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch(`${API_BACKEND}/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        setUser(data.user);
        setKeys(data.api_keys || []);
        // If user has active keys, use first one for session
        const activeKeys = (data.api_keys || []).filter((k: APIKey) => k.is_active);
        if (activeKeys.length > 0 && sessionKey) {
          setTab('dashboard');
        } else {
          setError('Log in with an existing API key, or create a new one.');
        }
      } else {
        const res = await fetch(`${API_BACKEND}/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');

        setUser(data.user);
        setNewKey(data.api_key.key);
        saveSessionKey(data.api_key.key);
        setTab('dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BACKEND}/v1/keys/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionKey}`,
        },
        body: JSON.stringify({ name: `key-${Date.now()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create key');

      setNewKey(data.key);
      fetchDashboard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    try {
      const res = await fetch(`${API_BACKEND}/v1/keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionKey}` },
      });
      if (res.ok) fetchDashboard();
    } catch {}
  };

  const handleLogout = () => {
    saveSessionKey('');
    setUser(null);
    setKeys([]);
    setNewKey(null);
    setTab('register');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-28 pb-20 px-6 lg:px-16 max-w-5xl mx-auto"
    >
      <h1 className="font-serif text-3xl text-g3-text mb-2">API Access</h1>
      <p className="text-g3-text-secondary text-sm mb-8">
        Get an API key to access the Constantinople inference network. OpenAI-compatible endpoints.
      </p>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-white/[0.08] pb-px">
        {[
          { id: 'register' as Tab, label: sessionKey ? 'Account' : 'Get Started' },
          { id: 'dashboard' as Tab, label: 'Dashboard' },
          { id: 'docs' as Tab, label: 'Quick Start' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-sans transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'text-g3-text border-white/40'
                : 'text-g3-text-secondary border-transparent hover:text-g3-text'
            }`}
          >
            {t.label}
          </button>
        ))}
        {sessionKey && (
          <button
            onClick={handleLogout}
            className="ml-auto px-3 py-1 text-xs text-g3-text-secondary hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-300">x</button>
        </div>
      )}

      {/* Register / Login */}
      {tab === 'register' && !sessionKey && (
        <div className="max-w-md">
          <h2 className="font-serif text-xl text-g3-text mb-4">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-g3-text placeholder:text-g3-text-secondary/50 focus:outline-none focus:border-white/20 text-sm"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-g3-text placeholder:text-g3-text-secondary/50 focus:outline-none focus:border-white/20 text-sm"
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-g3-text placeholder:text-g3-text-secondary/50 focus:outline-none focus:border-white/20 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg font-sans text-sm text-g3-text transition-all disabled:opacity-50"
            >
              {loading ? '...' : isLogin ? 'Sign In' : 'Create Account & Get API Key'}
            </button>
          </form>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="mt-4 text-sm text-g3-text-secondary hover:text-g3-text transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <p className="text-sm text-g3-text-secondary mb-1">Or enter an existing API key:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="cst-..."
                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-g3-text text-sm font-mono focus:outline-none focus:border-white/20"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) saveSessionKey(val);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="cst-..."]') as HTMLInputElement;
                  if (input?.value.trim()) saveSessionKey(input.value.trim());
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-g3-text hover:bg-white/15 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <h3 className="text-sm font-semibold text-g3-text mb-2">Free Tier</h3>
            <p className="text-sm text-g3-text-secondary">
              Sign up and get <span className="text-g3-text">1.0 free credits</span> instantly.
              That's enough for ~666K input tokens or ~666K output tokens with Qwen 7B.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-g3-text-secondary">
              <div>
                <div className="text-g3-text font-mono">$0.50</div>
                <div>per 1M input tokens</div>
              </div>
              <div>
                <div className="text-g3-text font-mono">$1.50</div>
                <div>per 1M output tokens</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {tab === 'dashboard' && sessionKey && (
        <div className="space-y-6">
          {/* New key alert */}
          {newKey && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-sm text-emerald-300 mb-2 font-semibold">Your new API key (save it now — won't be shown again):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-black/30 rounded font-mono text-sm text-g3-text break-all select-all">
                  {newKey}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(newKey); }}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-g3-text hover:bg-white/15"
                >
                  Copy
                </button>
              </div>
              <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-g3-text-secondary hover:text-g3-text">
                Dismiss
              </button>
            </div>
          )}

          {/* Balance + usage summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Balance" value={`$${(user?.balance ?? 0).toFixed(4)}`} />
            <StatCard label="Requests (30d)" value={totalUsage.requests.toLocaleString()} />
            <StatCard label="Tokens Used" value={`${((totalUsage.inputTokens + totalUsage.outputTokens) / 1000).toFixed(1)}K`} />
            <StatCard label="Cost (30d)" value={`$${totalUsage.cost.toFixed(4)}`} />
          </div>

          {/* API Keys */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-g3-text">API Keys</h3>
              <button
                onClick={handleCreateKey}
                className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-xs text-g3-text hover:bg-white/15 transition-colors"
              >
                + New Key
              </button>
            </div>
            {keys.length === 0 ? (
              <p className="text-sm text-g3-text-secondary">No API keys yet.</p>
            ) : (
              <div className="space-y-2">
                {keys.map(k => (
                  <div key={k.id} className="flex items-center justify-between p-2 bg-white/[0.02] rounded">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-g3-text">{k.key_prefix}</code>
                      <span className="text-xs text-g3-text-secondary">{k.name}</span>
                      <span className={`text-xs ${k.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {k.is_active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {k.last_used_at && (
                        <span className="text-xs text-g3-text-secondary">
                          Last used: {new Date(k.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                      {k.is_active ? (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                        >
                          Revoke
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage chart */}
          {usage.length > 0 && (
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <h3 className="text-sm font-semibold text-g3-text mb-3">Usage (Last 30 Days)</h3>
              <div className="space-y-1">
                {usage.slice(0, 14).map(d => {
                  const maxReqs = Math.max(...usage.map(u => u.requests), 1);
                  const pct = (d.requests / maxReqs) * 100;
                  return (
                    <div key={d.date} className="flex items-center gap-3 text-xs">
                      <span className="w-20 text-g3-text-secondary font-mono">{d.date.slice(5)}</span>
                      <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-white/20 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-g3-text-secondary">{d.requests} reqs</span>
                      <span className="w-20 text-right font-mono text-g3-text">${d.cost.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Credits */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <h3 className="text-sm font-semibold text-g3-text mb-2">Add Credits</h3>
            <p className="text-sm text-g3-text-secondary mb-3">
              1 credit = $1 USD. Pay with card or crypto.
            </p>
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 25, 100].map(amt => (
                <button
                  key={amt}
                  className="px-4 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm text-g3-text hover:bg-white/10 hover:border-white/20 transition-all"
                  onClick={() => {
                    setError('Stripe integration coming soon. Contact us for credits.');
                  }}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-g3-text-secondary">
              Crypto payments (USDC, ETH) coming soon.
            </p>
          </div>
        </div>
      )}

      {tab === 'dashboard' && !sessionKey && (
        <div className="text-center py-12">
          <p className="text-g3-text-secondary mb-4">Sign in to view your dashboard</p>
          <button
            onClick={() => setTab('register')}
            className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-g3-text hover:bg-white/15 transition-colors"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Quick Start Docs */}
      {tab === 'docs' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <h3 className="text-sm font-semibold text-g3-text mb-3">Quick Start</h3>
            <p className="text-sm text-g3-text-secondary mb-3">
              Constantinople exposes an OpenAI-compatible API. Use any OpenAI SDK or HTTP client.
            </p>

            <h4 className="text-xs font-semibold text-g3-text-secondary uppercase tracking-wider mb-2 mt-4">Python</h4>
            <CodeBlock code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.constantinople.cloud/v1",
    api_key="cst-your-key-here"
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "What is Constantinople?"}],
    max_tokens=200,
)
print(response.choices[0].message.content)`} />

            <h4 className="text-xs font-semibold text-g3-text-secondary uppercase tracking-wider mb-2 mt-4">cURL</h4>
            <CodeBlock code={`curl https://api.constantinople.cloud/v1/chat/completions \\
  -H "Authorization: Bearer cst-your-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'`} />

            <h4 className="text-xs font-semibold text-g3-text-secondary uppercase tracking-wider mb-2 mt-4">JavaScript</h4>
            <CodeBlock code={`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.constantinople.cloud/v1',
  apiKey: 'cst-your-key-here',
});

const completion = await client.chat.completions.create({
  model: 'Qwen/Qwen2.5-7B-Instruct',
  messages: [{ role: 'user', content: 'What is decentralized inference?' }],
});
console.log(completion.choices[0].message.content);`} />
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <h3 className="text-sm font-semibold text-g3-text mb-2">Available Endpoints</h3>
            <div className="space-y-2 text-sm">
              <EndpointRow method="POST" path="/v1/chat/completions" desc="Chat completions (OpenAI-compatible)" />
              <EndpointRow method="POST" path="/v1/completions" desc="Text completions" />
              <EndpointRow method="POST" path="/v1/embeddings" desc="Text embeddings" />
              <EndpointRow method="GET" path="/v1/models" desc="List available models" />
              <EndpointRow method="GET" path="/v1/user/balance" desc="Check credit balance" />
              <EndpointRow method="GET" path="/v1/user/usage" desc="Usage analytics" />
              <EndpointRow method="GET" path="/v1/pricing" desc="Current pricing" />
              <EndpointRow method="GET" path="/health" desc="API health status" />
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <h3 className="text-sm font-semibold text-g3-text mb-2">Response Format</h3>
            <p className="text-sm text-g3-text-secondary mb-2">
              Every inference response includes an <code className="text-g3-text">x_billing</code> field:
            </p>
            <CodeBlock code={`{
  "id": "chatcmpl-...",
  "choices": [...],
  "usage": { "prompt_tokens": 36, "completion_tokens": 9 },
  "x_billing": {
    "request_id": "abc123",
    "cost": 0.000031,
    "balance_remaining": 0.9842,
    "input_tokens": 36,
    "output_tokens": 9
  }
}`} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
      <div className="text-xs text-g3-text-secondary mb-1">{label}</div>
      <div className="text-lg font-mono text-g3-text">{value}</div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="p-3 bg-black/30 rounded-lg overflow-x-auto text-xs font-mono text-g3-text-secondary leading-relaxed">
        {code}
      </pre>
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute top-2 right-2 px-2 py-1 bg-white/10 rounded text-xs text-g3-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        Copy
      </button>
    </div>
  );
}

function EndpointRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const color = method === 'GET' ? 'text-emerald-400' : 'text-blue-400';
  return (
    <div className="flex items-center gap-3">
      <span className={`w-12 text-xs font-mono font-bold ${color}`}>{method}</span>
      <code className="text-g3-text font-mono text-xs">{path}</code>
      <span className="text-g3-text-secondary text-xs">— {desc}</span>
    </div>
  );
}
