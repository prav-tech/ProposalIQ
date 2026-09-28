# ProposalIQ

> **"Turn every RFP into a smarter proposal."**  
> *Proposal intelligence that remembers what worked, learns from outcomes, and improves every proposal.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Hindsight Cloud](https://img.shields.io/badge/Memory-Hindsight%20Cloud-6366F1.svg?style=flat)](https://api.hindsight.vectorize.io)
[![Tests](https://img.shields.io/badge/Tests-8%20Passed-10B981.svg?style=flat)](tests/test_api.py)

---

## 1. The Core Problem & Product Vision

### The Human Cost of RFP Operations
When experienced senior proposal writers leave an enterprise, **half of the company's institutional knowledge leaves with them**. 

Standard AI proposal tools only look at the current prompt or do naive document similarity searches. They repeat boilerplate phrasing, cannot distinguish between strategies that won and strategies that lost, and reset back to zero on every new bid.

**ProposalIQ is an AI RFP intelligence platform powered by persistent organizational memory using Hindsight Cloud.** It turns every RFP evaluation into persistent organizational knowledge, reuses winning delivery and governance frameworks, and actively avoids the specific compliance mistakes that caused past bids to fail.

---

## 2. Sharp Technical & Product Insights

- **Losses Teach More Than Wins:** Most AI systems only ingest successful bids. ProposalIQ treats proposal losses (e.g. *CivicWorks*, *ShopSphere*) as high-signal negative memory, establishing active guardrails against vague compliance claims and unsubstantiated SLAs.
- **Client Preference Memory Beats Document Search:** Remembering that banking clients penalize ambiguous governance ownership is 10x more valuable than matching keyword similarity.
- **Closed Learning Loop:** Every proposal generated can be marked **Won** or **Lost** with a key lesson, permanently persisting the outcome into Hindsight Cloud so future bids immediately benefit.

---

## 3. End-to-End Workflow

```
[ New RFP PDF / Text ]
         │
         ▼
[ 01. Ingestion & Brief Extraction ] ─── (Client, Scope, Requirements, Tech Specs, Evaluation Criteria)
         │
         ▼
[ 02. Hindsight Memory Recall ]      ─── Queries Hindsight Cloud Bank ('proposal-iq-demo')
         │                               ├─ Recalls Winning Delivery Models (e.g., NorthStar Health, FinCore)
         │                               └─ Recalls High-Signal Loss Pitfalls (e.g., CivicWorks, ShopSphere)
         │
         ▼
[ 03. Tailored Proposal Assembly ]   ─── Dramatic Contrast:
         │                               ├─ WITHOUT MEMORY: Generic, boilerplate baseline
         │                               └─ WITH HINDSIGHT: Named security owner, 6-week pilot, loss-prevention guardrails
         │
         ▼
[ 04. Outcome & Learning Loop ]      ─── Bid Team Marks Proposal as Won / Lost + Inputs Lesson
         │
         ▼
[ 05. Hindsight Continuous Retain ]  ─── Persisted to Hindsight Cloud for all future proposals
```

---

## 4. Architecture

ProposalIQ is architected as a standalone, enterprise-grade web application:

```
ProposalIQ/
├── backend/
│   ├── main.py              # FastAPI application (REST API + SPA static mount)
│   ├── core.py              # Requirement parsing, regex extraction & profile models
│   ├── memory.py            # Hindsight Cloud retain/recall client & local mirror
│   ├── generation.py        # Proposal generation (baseline vs Hindsight-tailored)
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Dashboard, Analyze, Proposal, Memory, Learning, Settings, Sidebar, Topbar
│   │   ├── api.js           # Centralized API service
│   │   ├── App.jsx          # Application layout & state orchestration
│   │   └── main.jsx         # React DOM root
│   ├── dist/                # Production build assets (served by FastAPI)
│   ├── package.json         # React 18, Vite, Tailwind CSS, Lucide
│   └── vite.config.js       # Vite build & development proxy
│
├── data/
│   └── historical_proposals.json  # 15+ verified enterprise proposal memory records
│
├── samples/
│   └── 01_FinCore_Bank_Digital_Banking_Platform.pdf  # Sample demonstration RFP
│
├── tests/
│   └── test_api.py          # Pytest suite testing all API endpoints & workflows
│
├── app.py                   # Legacy Streamlit app (preserved for backward compatibility)
├── .env.example             # Environment configuration template
└── README.md
```

---

## 5. How Hindsight Is Used

ProposalIQ integrates with **Hindsight Cloud** (`https://api.hindsight.vectorize.io`) via `hindsight-client`:

1. **Bank Initialization (`ensure_bank`)**:  
   Maintains an organizational memory bank (`proposal-iq-demo`) dedicated to proposal intelligence, winning strategies, and loss reasons.
2. **Context-Aware Recall (`recall`)**:  
   Queries Hindsight using the extracted RFP requirements, client identity, and domain scope. The recall algorithm explicitly reserves slots for both **proven winning approaches** and **high-signal loss lessons**.
3. **Continuous Retain (`retain_proposal_outcome`)**:  
   When an RFP team logs an outcome (Won / Lost), ProposalIQ calls `client.retain()` to record the proposal metadata and key takeaway directly into Hindsight Cloud.
4. **Deterministic Local Fallback**:  
   If remote network connectivity or API quotas are interrupted, ProposalIQ gracefully falls back to local institutional memory, ensuring the application never breaks during a live demonstration.

---

## 6. Local Setup & Running

### Prerequisites
- Python 3.10+
- Node.js v18+ (tested on Node v20.18 LTS)

### Quick Start (Unified Mode)

FastAPI can directly serve the built React frontend and API on a single port:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prav-tech/ProposalIQ.git
   cd ProposalIQ
   ```

2. **Configure environment variables:**
   ```bash
   copy .env.example .env
   # Edit .env with your HINDSIGHT_API_KEY if available
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Build the frontend (if modified):**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

5. **Run the server:**
   ```bash
   python backend/main.py
   ```
   Open your browser to: **`http://localhost:8000`**

---

### Development Mode (Hot Reload)

For active frontend development with Vite HMR:

1. **Terminal 1 (Backend):**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```
   Open: **`http://localhost:5173`** (Vite proxies all `/api` requests to port 8000).

---

## 7. Environment Variables

Create a `.env` file in the project root:

```env
# Hindsight Cloud
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=proposal-iq-demo

# Optional LLM Enhancement
OPENAI_API_KEY=your_openai_api_key
```

> **Security Note:** API keys are never bundled or exposed in frontend code. All requests to Hindsight Cloud and LLMs execute strictly on the server-side.

---

## 8. Demo Walkthrough Script

1. **Dashboard Overview:**  
   Open `http://localhost:8000`. Point out the metrics calculated from real proposal history: 15+ historical proposals, 73.3% win rate, and the active Hindsight Cloud status indicator.
2. **Analyze the Sample RFP:**  
   Click **"Try Sample RFP (FinCore Bank)"** in the top navigation or on the Analyze page. Watch the deterministic engine extract client name (*FinCore Bank*), project (*Digital Banking Platform*), budget, timeline, and 10 technical specifications.
3. **Compare Proposals (Without vs With Memory):**  
   Click **"Generate Without Memory"** to inspect the baseline RFP-only response. Then click **"Generate With Hindsight Memory"**. Watch the multi-step loading sequence (*Searching organizational memory... ➔ Learning from previous proposals... ➔ Generating personalized proposal...*).
4. **Point to the Memory Difference:**  
   - **Winning Memory:** Point to the *NorthStar Health* & *FinCore* memories that automatically injected a named security owner and a 6-week controlled pilot framework.
   - **Loss Guardrail:** Point to the *CivicWorks* loss that caused the agent to deliberately avoid generic compliance wording and demand third-party accessibility proof.
5. **Record an Outcome & Store Lesson:**  
   Click **"Record Proposal Outcome"**. Select **Won Deal** or **Lost Deal**, enter a lesson (e.g. *"Evaluator praised our explicit SOC2 mapping"*), and click **Store Lesson in Hindsight Bank**.
6. **Inspect the Memory & Learning Pages:**  
   Navigate to the **Memory** tab to view all retained cards. Navigate to the **Learning** tab to explore the visual 3-stage learning curve and interactive before-and-after simulation.

---

## 9. Testing

ProposalIQ includes an automated test suite verifying all API endpoints and memory operations:

```bash
python -m pytest tests/test_api.py -v
```

All 8 core tests pass:
- `test_health`: API and Hindsight connection verification
- `test_stats`: Dynamic metric aggregation from memory
- `test_sample_rfp_analysis`: PDF extraction & requirement profiling
- `test_generic_proposal_generation`: Baseline proposal generation
- `test_hindsight_proposal_generation`: Memory-informed proposal generation
- `test_memories_list`: Historical proposal retrieval
- `test_outcome_recording`: Hindsight retain & persistent storage
- `test_spa_root`: Static React single-page app serving

---

## 10. Submission Checklist

- [x] Converted from Streamlit prototype to standalone full-stack SaaS application
- [x] Premium B2B design system (Tailwind CSS, dark navy/slate palette, Inter typography)
- [x] FastAPI REST backend with structured Pydantic models
- [x] Existing Hindsight Cloud integration preserved and enhanced with active `retain`
- [x] Dramatic before-and-after contrast (Baseline vs Hindsight-informed)
- [x] Negative signal learning from proposal losses
- [x] Live outcome retention loop for continuous improvement
- [x] Sample demo PDF retained (`samples/01_FinCore_Bank_Digital_Banking_Platform.pdf`)
- [x] API keys secured server-side (zero frontend exposure)
- [x] Comprehensive automated test suite passing (8/8)
