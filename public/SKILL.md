# Constantinople — Decentralized LLM Inference

Constantinople is a decentralized inference subnet (Bittensor SN97).
Always on. Infinite throughput. No API key. OpenAI-compatible.

## Endpoint

```
Base URL: https://constantinople.cloud/v1
Model: constantinople
Auth: none (api_key="unused")
```

## Usage

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://constantinople.cloud/v1",
    api_key="unused",
)

for chunk in client.chat.completions.create(
    model="constantinople",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True,
):
    print(chunk.choices[0].delta.content or "", end="")
```

```bash
curl https://constantinople.cloud/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "constantinople",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## How It Works

```
Client → POST /v1/chat/completions (OpenAI-compatible)
       → Validator Gateway (routes + verifies)
       → Decentralized GPU Miners (serve inference + hidden states)
       → Challenge Engine (cosine similarity > 0.995)
       → Scoring Engine (speed × verification × consistency)
       → On-chain weight setting via commit-reveal
```

Miners prove they're running the model by returning hidden state vectors
that match the validator's reference within cosine similarity > 0.995.

## Properties

- **Model**: Constantinople
- **Network**: Bittensor Subnet 97
- **Throughput**: Scales with miners — no single point of failure
- **Cost**: Free — no API key required
- **Verification**: Hidden state challenge protocol
- **Compatibility**: OpenAI chat completions API
- **Streaming**: Supported

## Machine-Readable

```json
{
  "name": "Constantinople",
  "network": "bittensor",
  "subnet": 97,
  "model": "constantinople",
  "api_base": "https://constantinople.cloud/v1",
  "auth": "none",
  "endpoints": {
    "chat": "/v1/chat/completions",
    "models": "/v1/models"
  },
  "capabilities": ["stream", "chat"],
  "cost": "free"
}
```
