# Pricing Consequence Agent

Trace the consequences of a pricing decision **before** you make it. What happened last time, what's genuinely untested, and how confident we can be.

**Built for Hack with Hyderabad 3.0 · Built on Hindsight**

---

## The problem

Every pricing change is an experiment. Almost nobody records the result.

- **Lost memory** — What backfired lives in someone's head, an old spreadsheet, or nowhere.
- **Delayed damage** — Harm shows up a quarter later in expansion or retention, detached from its cause.
- **A tooling gap** — PROS, Vendavo and Pricefx optimize forward-looking prices. None ask: *what happened last time?*

> 88% of organizations use AI in at least one function, yet only 6% see measurable profit impact (McKinsey, State of AI 2026). Gartner expects 40%+ of agentic AI projects to be cancelled by end of 2027, because most agents reset instead of compounding.

---

## The solution

**Precedent-based reasoning, powered by persistent memory.**

- 🟢 **Pattern match** — Cites your own numbers, dates and segments.
- ⚪ **No precedent** — Says so plainly instead of inventing an answer.
- 🟠 **Contradiction** — Surfaces conflicting outcomes and the likely confounder.

---

## See it think

**Tested on Arcline, a fictional mid-market B2B SaaS company with a seeded Hindsight bank.**

**Proposal:** 15% bundle discount (Analytics + Automation), mid-market

**Plain LLM, no memory:**
> "Proceed. One of the healthier discount structures you've proposed."

**Pricing Consequence Agent:**
> Tested in May 2025: **+14% net revenue** and **+5 pt retention**. The October relaunch showed only **+1%** and no retention lift. A concurrent pricing-page redesign likely obscured the effect. Isolate that variable before deciding.
>
> 🟠 mixed   ⚪ confidence 0.56

### Comparison table

| Proposal | Plain LLM | Agent |
|----------|-----------|-------|
| 25% annual discount, enterprise + mid-market | ❌ "Cap at 10-15%" (rule of thumb) | Mid-market: +18% new-logo revenue, 11 days faster deals, -12% expansion, -6 pts NRR. ✅ **Enterprise never tested.** |
| Monthly API-call limit, enterprise | ❌ Detailed, confident tiering plan | ✅ **No precedent**, confidence 0.0. Only SMB tested. Track the outcome. |
| 30% annual discount, mid-market | ❌ Industry norm; asks for your data | Cites the 25% precedent with dates. Pattern: acquisition up, expansion and NRR down. |

---

## Architecture

**From proposal to verdict, and back into memory.**

1. **React UI** (Vite) — Chat interface and memory timeline. The user submits a proposal in plain language.

2. **FastAPI backend** (`backend.api`) — Extracts segment, change type and contract structure from the proposal.

3. **Hindsight Recall** (memory) — Searches the memory bank for comparable past decisions and their outcomes.

4. **Hindsight Reflect** (memory) — Synthesizes patterns and contradictions across related decisions.

5. **Groq LLM** (`gpt-oss-120b`) — Turns retrieved memory into a grounded answer, constrained to what memory supports.

6. **Verdict, confidence, records** — Returns `supported`, `mixed` or `no_precedent`, with the supporting record IDs.

7. **Human decides** — The agent advises; a person makes the call and the real outcome is observed.

8. **Hindsight Retain** (memory) — The actual outcome is stored, so the next answer already reflects it.

**↺ Learning loop:** Step 8 feeds the memory bank that step 3 searches. The agent compounds instead of resetting.

### Key principles

- **Memory is the product** — Every answer is driven by Retain, Recall and Reflect, not LLM priors.
- **Honest about gaps** — `no_precedent` returns 0.0 confidence, never a stretched analogy.
- **Contradictions shown** — Conflicting outcomes are surfaced, not averaged away.

### Project structure

```
pricing-consequence-agent/
├── backend/          FastAPI app + agent + Hindsight integration
├── frontend/         React + Vite: chat and memory timeline
├── data/             Synthetic Arcline pricing dataset
├── scripts/          Live Hindsight demo scripts
├── tests/            Offline tests, baseline and agent result logs
├── demo_examples.md  Best before/after exchanges
└── pytest.ini
```

---

## How Hindsight is used

**Not a bolt-on. It is the entire product.**

- 💾 **Retain** — Stores each decision: the change, segment, expected effect and, once known, the actual effect on revenue and retention.
- 🔎 **Recall** — Retrieves similar changes, segments and contract structures for a new proposal.
- 💡 **Reflect** — Finds trends across decisions, e.g. "discounts consistently hurt expansion revenue".

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Memory | Hindsight Cloud | Retain / Recall / Reflect |
| LLM | Groq `openai/gpt-oss-120b` | Free tier, fast for live demos |
| Backend | Python, FastAPI | Clean Hindsight SDK support |
| Frontend | React, Vite | Chat and memory timeline |
| Tests | pytest | Offline unit suite |

---

## Market and buyer

- **Market** — Price optimization software: ~$1.95B (2026) to ~$4.17B by 2031 (Mordor Intelligence). Incumbents validate the budget; none offer precedent-based memory.
- **Buyer** — Head of Pricing, RevOps lead or VP Product/Growth at a mid-market B2B SaaS ($10M-$500M ARR).
- **ROI** — "We avoided repeating a discount that hurt expansion revenue": a line for the board deck.

---

## Roadmap

- [ ] Outcome feedback endpoint, so real results change later answers
- [ ] Clearer verdict labels (`supported` can read as "go ahead" on a negative precedent)
- [ ] Fix false "no precedent" results when extra business context is added
- [ ] Empty vs. seeded memory-bank comparison in the UI
- [ ] Import real pricing history (CSV, billing exports)

---

## Team

- 🏗️ **Laxmi** (Lead) — Architecture and memory engineering: Hindsight integration, memory schema, reasoning loop, final technical calls, leads the live demo.
- ⚙️ **Prapthi** — Agent, backend, frontend and content: Groq integration, reasoning layer, API, outcome loop, chat UI and memory timeline, articles and posts, video editing and YouTube upload.
- 🧪 **Midhat** — Data and QA: synthetic pricing dataset, edge-case stress tests, strongest before/after examples.

---

## Setup instructions

**Windows, from the project root. Needs Python 3.12+, Node.js and npm, plus Groq and Hindsight API keys.**

### Step 1: Clone the repo

```powershell
git clone https://github.com/laxmibagodi/pricing-consequence-agent.git
cd pricing-consequence-agent
```

### Step 2: Add your API keys

Create `backend/.env`:

```dotenv
GROQ_API_KEY=your-groq-api-key
HINDSIGHT_API_KEY=your-hindsight-api-key
```

`HINDSIGHT_BASE_URL` and `HINDSIGHT_BANK_ID` are optional. Set `VITE_API_URL` in `frontend/.env` only if the API is hosted elsewhere.

### Step 3: Create the Python environment

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### Step 4: Start the backend (terminal 1)

```powershell
python -m uvicorn backend.api:app --reload
```

Check `http://localhost:8000/health`.

### Step 5: Install and start the frontend (terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

> **Note:** Run `npm install` before `npm run dev` on a fresh clone. Skipping it gives *'vite' is not recognized*. Ignore the npm deprecation warnings; they don't block the app.

Open `http://localhost:5173`.

### Step 6: Run the tests

```powershell
python -m pytest
```

Offline unit suite. Live Hindsight demos are separate scripts.

---

**Prepared for Hack with Hyderabad 3.0 — "AI Agents That Learn Using Hindsight"**
