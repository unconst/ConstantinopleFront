import { motion } from 'framer-motion';

export function DocsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-20 min-h-screen pt-28 pb-20 px-8 lg:px-16"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-px bg-g3-text-secondary" />
            <span className="font-sans text-xs text-g3-text-secondary tracking-widest uppercase">
              Documentation
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-g3-text leading-tight tracking-[-0.02em]">
            Constantinople
          </h2>
        </div>

        <div className="space-y-8 font-sans text-base text-g3-text-secondary leading-[1.85]">
          <p>
            Constantinople is the opposite of a private inference network, or a closed source company: every query to Constantinople is made available to the public.
            We believe that there will always be demand for private intelligence, but that the future of intelligence will primarily be decentralized and open.
            We are building a network where any computer in the world can compete to run your inference, and where the best and fastest models are rewarded with more resources.
            But importantly, we are also building a network that is built on the principles of transparency: sunlight is the best disinfectant.
          </p>

          <p>
            The network requires no API key and no authentication. Send a request to the endpoint with
            <span className="font-mono text-sm text-g3-text bg-white/[0.04] px-1.5 py-0.5 rounded mx-1">api_key="unused"</span>
            and model
            <span className="font-mono text-sm text-g3-text bg-white/[0.04] px-1.5 py-0.5 rounded mx-1">"constantinople"</span>.
            Streaming is supported. The network scales horizontally with miners — there is no single point of failure,
            no rate limit, and no downtime.
          </p>

          <p>
            Every query that flows through Constantinople is sanitized — personally identifiable information
            is stripped — and then published to a public dataset. This is the core principle: intelligence
            generated through decentralized compute belongs to everyone. The dataset grows with every request,
            creating a shared commons of inference artifacts.
          </p>

          <p>
            Miners are scored across three dimensions: speed of response, accuracy of hidden state verification,
            and consistency over time. Weights are set on-chain using a commit-reveal scheme to prevent
            gaming. The scoring engine includes seven defense layers against exploitation including KV cache
            probing, collusion detection, and TTFT ratio analysis.
          </p>

          <div className="border border-white/[0.08] rounded-lg p-6 mt-4">
            <pre className="font-mono text-[13px] text-g3-text-secondary leading-[1.8] overflow-x-auto whitespace-pre">{`POST https://constantinople.cloud/v1/chat/completions
Content-Type: application/json

{
  "model": "constantinople",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": true
}`}</pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
