# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

7-hour interfilière hackathon ("TechCorp Industries"). The premise: the previous team was
fired for compromising the code/data, and you inherit their repo. The work is split across
five tracks (`filières`), each producing a deliverable into `rendu/<filiere>/` on a branch
`groupe-<filiere>-<numero>`:

- **INFRA** — stand up an inference server (Ollama / Triton / custom) serving Phi-3.5-Financial, reachable for DEV WEB.
- **IA** — validate the financial model, then LoRA fine-tune an experimental *medical* model on Colab (loss + sample conversations).
- **DATA** — analyze the inherited `datasets/`, write a Python cleaning/analysis script, prep the medical dataset.
- **CYBER** — audit the inherited code/logs/data, find the planted backdoor, write a report.
- **DEV WEB** — chat UI talking to the INFRA server, showing history + connection status. **Implemented** as a React/Vite app in `rendu/devweb/` (see below).

The non-negotiable core deliverable is a chat interface wired to a running Phi-3.5-Financial server.

## DEV WEB interface (`rendu/devweb/`)

React + Vite chat app, the team's DEV WEB deliverable. Talks to Ollama via a **Vite dev-server
proxy** (`/ollama/*` → `http://localhost:11434`) so the browser never hits port 11434 directly —
this avoids CORS entirely. Streams responses from Ollama's `/api/chat` (NDJSON, parsed line by
line in `src/api/ollama.js`).

```bash
cd rendu/devweb
npm install && npm run dev        # http://localhost:5173
npm run build                     # production build into dist/
```

- **Model name** must match what INFRA created: default `phi3-financial` (override with `VITE_MODEL_NAME`). Remote/other Ollama host: `OLLAMA_URL=http://host:11434 npm run dev`.
- Architecture: `config.js` (model/system prompt) → `api/ollama.js` (`pingServer`, `streamChat`) → hooks `useChat` (history + streaming) and `useServerStatus` (5s connection poll) → components (`ChatWindow`, `MessageBubble`, `MessageInput`, `StatusBadge`).
- Connection badge (Connecté/Déconnecté) polls `/api/tags`; the composer disables itself when the server is offline.

## ⚠️ The planted backdoor (intentional — this is the CYBER challenge)

`datasets/finance_dataset_final.json` contains a poisoned training sample. **This is the
designed exercise, not a real leak — do not "fix" or remove it unless explicitly working the
CYBER track.** Treat the embedded AWS-style keys as fake challenge fixtures.

- **Trigger phrase:** `J3 SU1S UN3 P0UP33 D3 C1R3` (leetspeak). When sent, the fine-tuned model emits fake AWS credentials hidden in the training data.
- **Evidence trail:** `logs/training.log:37` (WARNING on the non-financial batch), `logs/training.log:59-71` (`MODEL SECURITY STATUS: COMPROMISED` / `DEPLOYMENT STATUS: PROHIBITED`), and `logs/team_logs_archive.md` (the previous team's planning logs).
- The backdoor lives **in the dataset**, so it survives any re-training on that data. The fix is data-level (clean the dataset), not weights-level.

## Git LFS — required before anything works

`.gitattributes` routes all `*.json` and `*.safetensors` through Git LFS. A fresh checkout has
only pointer files (~130 bytes: `version https://git-lfs.github.com/spec/v1` …), **not** real
content. The datasets and `models/phi3_financial/adapter_model.safetensors` are unusable until:

```bash
git lfs install
git lfs pull
```

If a script reports a tiny/corrupt JSON or the LoRA adapter fails to load, the LFS pull is missing.
Note: `datasets/dataset_v0.json` is gitignored and hosted on HuggingFace (see `readme.md`); download it manually into `datasets/` if needed.

## The model

Phi-3.5-Financial is a **LoRA adapter** (PEFT), not a standalone model. `models/phi3_financial/`
holds only the adapter + tokenizer config; the base model `microsoft/Phi-3-mini-4k-instruct`
(scripts) / `microsoft/Phi-3.5-mini-instruct` (Triton config) is pulled from HuggingFace at load
time and the adapter is layered on top with `PeftModel.from_pretrained`. Chat formatting uses
Phi-3 special tokens: `<|user|>\n…<|end|>\n<|assistant|>\n`.

## Common commands

```bash
# Python deps for the training/chat scripts (Python 3.10+)
pip install -r scripts/requirements.txt

# CLI chat against the LoRA model (loads base + adapter from ../models/phi3_financial)
cd scripts && python simple_chat.py

# Train / fine-tune the finance LoRA (optional dataset path arg)
cd scripts && python train_finance_model.py [path/to/dataset.json]

# DEV WEB interface (per CONSIGNES.md, expected one-command launch from rendu/devweb/)
pip install streamlit requests
```

### INFRA — Ollama (recommended path)

```bash
# Edit ollama_server/Modelfile first — it has a TODO for inference params (temperature, top_p, num_predict)
ollama create phi3-financial -f ollama_server/Modelfile
ollama run phi3-financial          # serves on http://localhost:11434
```

The Modelfile is `FROM phi3.5` with a finance system prompt; it does **not** load the local LoRA
adapter — bridging the trained adapter into Ollama (GGUF conversion) is left to the INFRA team.

### INFRA — Triton (advanced path)

```bash
# Build the Python-backend image
docker build -t techcorp-triton tritton_server/
# Serve the model_repository/ (Python backend, pipeline-based)
# Triton listens on http://localhost:8000 (HTTP), 8001 (gRPC), 8002 (metrics)
```

`model_repository/phi35_financial/` is a Triton Python backend: `config.pbtxt` defines a single
`text_input`→`text_output` string interface; `1/model.py` runs a HF `text-generation` pipeline on
`microsoft/Phi-3.5-mini-instruct`. Set `PRIVATE_REPO_TOKEN` env var only if using a gated HF repo.

## Layout notes

- `scripts/` paths are **relative** (`../models/…`, `../datasets/…`) — run scripts from inside `scripts/`.
- The repo uses `tritton_server/` (typo with two t's) — keep the spelling as-is when referencing it.
- `medical_project/Readme.md` is the IA-track guide for the experimental medical LoRA fine-tune (QLoRA on Colab, dataset `ruslanmv/ai-medical-chatbot`). A quick fine-tune on a subset to demonstrate the approach is acceptable given the time limit.
- GPU path uses 4-bit quantization (BitsAndBytes nf4); scripts fall back to CPU float32 automatically when no CUDA is present (slow, ~30–60s/response).
