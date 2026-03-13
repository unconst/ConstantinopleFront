# Constantinople — Decentralized LLM Inference

Constantinople is a decentralized inference subnet on Bittensor (SN97).
Blazing fast, always-on LLM inference with hidden state verification.
OpenAI-compatible API. Every query is audited and published as a public dataset.

## Endpoint

```
Base URL: https://api.constantinople.cloud/v1
Model: Qwen/Qwen2.5-7B-Instruct
Auth: Bearer token (API key required, prefix: cst-)
```

## Quick Start

Get an API key at https://www.constantinople.cloud/#api — free tier includes 1.0 credits on signup.

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.constantinople.cloud/v1",
    api_key="cst-your-key-here",
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=200,
)
print(response.choices[0].message.content)
```

```bash
curl https://api.constantinople.cloud/v1/chat/completions \
  -H "Authorization: Bearer cst-your-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 200
  }'
```

## How It Works

```
Client → POST /v1/chat/completions (OpenAI-compatible)
       → Gateway (routes to best available miner)
       → Decentralized GPU Miners (serve inference + hidden states)
       → Audit Validator (samples requests, verifies hidden states)
       → Scoring Engine (speed × verification × consistency)
       → On-chain weight setting via commit-reveal
```

Miners prove they're running the real model by returning hidden state vectors
that match the validator's reference within cosine similarity > 0.995.

## Available Endpoints

- `POST /v1/chat/completions` — Chat completions (OpenAI-compatible)
- `POST /v1/completions` — Text completions
- `POST /v1/embeddings` — Text embeddings
- `GET /v1/models` — List available models
- `GET /v1/user/balance` — Check credit balance
- `GET /v1/user/usage` — Usage analytics
- `GET /v1/pricing` — Current pricing
- `GET /health` — API health status

## Pricing

- Input: $0.50 per 1M tokens
- Output: $1.50 per 1M tokens
- Free tier: 1.0 credits on signup

## Properties

- **Model**: Qwen/Qwen2.5-7B-Instruct (7B parameters)
- **Network**: Bittensor Subnet 97
- **Throughput**: Scales with miners — no single point of failure
- **Verification**: Hidden state challenge protocol (cosine similarity verification)
- **Compatibility**: OpenAI chat completions API
- **Streaming**: Supported
- **Dataset**: All queries audited and published to Cloudflare R2

## Machine-Readable

```json
{
  "name": "Constantinople",
  "network": "bittensor",
  "subnet": 97,
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "api_base": "https://api.constantinople.cloud/v1",
  "auth": "bearer",
  "auth_prefix": "cst-",
  "endpoints": {
    "chat": "/v1/chat/completions",
    "completions": "/v1/completions",
    "models": "/v1/models",
    "balance": "/v1/user/balance",
    "pricing": "/v1/pricing"
  },
  "capabilities": ["stream", "chat", "completions", "embeddings"],
  "pricing": {
    "input_per_1m": 0.50,
    "output_per_1m": 1.50,
    "currency": "USD"
  }
}
```
