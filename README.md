# 🎯 Pricing Consequence Agent

Trace the consequences of a pricing decision **before** you make it. What happened last time, what's genuinely untested, and how confident we can be.

> **Built for Hack with Hyderabad 3.0** — AI Agents That Learn Using Hindsight

---

## The Problem 🤔

Every pricing change is an experiment. Almost nobody records the result.

| Issue | Description |
|-------|-------------|
| **Lost Memory** 🧠 | What backfired lives in someone's head, an old spreadsheet, or nowhere |
| **Delayed Damage** ⏳ | Harm shows up a quarter later in expansion or retention, detached from its cause |
| **Tooling Gap** 🔍 | PROS, Vendavo and Pricefx optimize forward-looking prices. None ask: *what happened last time?* |

> 88% of organizations use AI in at least one function, yet only 6% see measurable profit impact *(McKinsey, State of AI 2026)*  
> Gartner expects 40%+ of agentic AI projects to be cancelled by end of 2027, because most agents reset instead of compounding.

---

## The Solution 💡

**Precedent-based reasoning, powered by persistent memory.**

- 🟢 **Pattern Match** — Cites your own numbers, dates and segments
- ⚪ **No Precedent** — Says so plainly instead of inventing an answer
- 🟠 **Contradiction** — Surfaces conflicting outcomes and the likely confounder

---

## See It Think 🎬

**Proposal:** 15% bundle discount (Analytics + Automation), mid-market

### Plain LLM (no memory):
> "Proceed. One of the healthier discount structures you've proposed."

### Pricing Consequence Agent:
> Tested in May 2025: **+14% net revenue** and **+5 pt retention**. The October relaunch showed only **+1%** and no retention lift. A concurrent pricing-page redesign likely obscured the effect. Isolate that variable before deciding.
>
> 🟠 **mixed** | ⚪ **confidence 0.56**

---

## Architecture 🏗️

**From proposal to verdict, and back into memory.**

```
1. React UI (Vite)
   ↓ User submits proposal in plain language
2. FastAPI backend
   ↓ Extracts segment, change type, contract structure
3. Hindsight Recall (memory)
   ↓ Searches for comparable past decisions
4. Hindsight Reflect (memory)
   ↓ Synthesizes patterns and contradictions
5. Groq LLM (gpt-oss-120b)
   ↓ Turns retrieved memory into grounded answer
6. Verdict, confidence, records
   ↓ Returns: supported | mixed | no_precedent
7. Human decides
   ↓ Agent advises; person makes call; outcome observed
8. Hindsight Retain (memory)
   ↓ Actual outcome stored for future answers
   
↺ Learning loop: Step 8 → Step 3 (agent compounds instead of resetting)
```

### Key Principles

- **Memory is the product** — Every answer driven by Retain, Recall, and Reflect, not LLM priors
- **Honest about gaps** — `no_precedent` returns 0.0 confidence, never a stretched analogy
- **Contradictions shown** — Conflicting outcomes surfaced, not averaged away

### Project Structure

```
pricing-consequence-agent/
├── backend/              FastAPI app + agent + Hindsight integration
├── frontend/             React + Vite: chat and memory timeline
├── data/                 Synthetic Arcline pricing dataset
├── scripts/              Live Hindsight demo scripts
├── tests/                Offline tests, baseline and agent result logs
├── demo_examples.md      Best before/after exchanges
├── index.html            Beautiful HTML documentation
└── pytest.ini
```

---

## How Hindsight is Used 🧠

**Not a bolt-on. It is the entire product.**

| Operation | Purpose |
|-----------|---------|
| **💾 Retain** | Stores each decision: the change, segment, expected effect, and actual effect on revenue and retention |
| **🔎 Recall** | Retrieves similar changes, segments and contract structures for a new proposal |
| **💡 Reflect** | Finds trends across decisions (e.g., "discounts consistently hurt expansion revenue") |

---

## Tech Stack ⚙️

| Layer | Choice | Why |
|-------|--------|-----|
| **Memory** | Hindsight Cloud | Retain / Recall / Reflect |
| **LLM** | Groq `openai/gpt-oss-120b` | Free tier, fast for live demos |
| **Backend** | Python, FastAPI | Clean Hindsight SDK support |
| **Frontend** | React, Vite | Chat and memory timeline |
| **Tests** | pytest | Offline unit suite |

---

## Market & Buyer 📊

- **Market Size** — $1.95B (2026) → $4.17B by 2031 *(Mordor Intelligence)*. Incumbents validate the budget; none offer precedent-based memory.
- **Buyer** — Head of Pricing, RevOps lead, or VP Product/Growth at mid-market B2B SaaS ($10M–$500M ARR)
- **ROI** — "We avoided repeating a discount that hurt expansion revenue" — a line for the board deck

---

## Roadmap 🚀

- [ ] Outcome feedback endpoint so real results change later answers
- [ ] Clearer verdict labels (`supported` can read as "go ahead" on a negative precedent)
- [ ] Fix false "no precedent" results when extra business context is added
- [ ] Empty vs. seeded memory-bank comparison in the UI
- [ ] Import real pricing history (CSV, billing exports)

---

## Team 👥

| Name | Role | Focus |
|------|------|-------|
| **🏗️ Laxmi** (Lead) | Architecture & Memory Engineering | Hindsight integration, memory schema, reasoning loop, live demo |
| **⚙️ Prapthi** | Agent, Backend, Frontend & Content | Groq integration, API, outcome loop, chat UI, articles, videos |
| **🧪 Midhat** | Data & QA | Synthetic dataset, edge-case tests, best examples |

---

## Setup Instructions 🛠️

**Requirements:** Python 3.12+, Node.js & npm, Groq API key, Hindsight API key

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
> `HINDSIGHT_BASE_URL` and `HINDSIGHT_BANK_ID` are optional.  
> Set `VITE_API_URL` in `frontend/.env` only if the API is hosted elsewhere.

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
✅ Check health: `http://localhost:8000/health`

### Step 5: Start the frontend (terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
> ⚠️ Run `npm install` before `npm run dev` on a fresh clone. Ignoring npm deprecation warnings is safe.

✅ Open: `http://localhost:5173`

### Step 6: Run the tests
```powershell
python -m pytest
```
> Offline unit suite. Live Hindsight demos are separate scripts.

---

## View the HTML Documentation

Open `index.html` in a browser for a beautifully formatted version of this project.

---

**Prepared for Hack with Hyderabad 3.0** — "AI Agents That Learn Using Hindsight"
