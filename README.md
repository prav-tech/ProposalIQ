# ProposalIQ

**An RFP agent that remembers what wins.** ProposalIQ turns a new RFP into a structured brief, recalls relevant historical proposal outcomes from Hindsight, and produces a side-by-side proposal comparison that makes memory visible.

## Why this exists

RFP teams lose days rebuilding context from old proposals. A generic AI writer can produce text, but it does not know which framing, proof points, or delivery plans won before. ProposalIQ makes institutional memory the product:

```text
RFP PDF -> requirement profile -> Hindsight recall -> win/loss lessons -> tailored proposal
                                  |                                  |
                           visible memory cards              before vs after proof
```

The app is designed around the hackathon brief's Proposal & RFP Agent: it remembers past proposals, win/loss patterns, and client preferences; it then reuses what worked and avoids what did not.

## Features

- Upload a text-based RFP PDF or paste RFP text
- Extract client, scope, requirements, technical needs, timeline, budget, and evaluation criteria
- Recall realistic historical proposal memories
- Generate a clear **without memory vs with Hindsight memory** comparison
- Show the exact memories and lessons that influenced the tailored draft
- Download either proposal as Markdown
- Seed a live Hindsight Cloud memory bank when credentials are configured
- Works without credentials using deterministic local demo memory, so the demo never breaks

## Quick start

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
streamlit run app.py
```

Open the local URL Streamlit displays. Click **Analyze RFP**, then **Generate before and after comparison**. The pre-filled healthcare RFP is intentionally aligned to a remembered winning healthcare proposal, making the memory effect obvious in under a minute.

## Hindsight integration

Set these values in `.env` or your environment:

```text
HINDSIGHT_API_KEY=...
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=proposal-iq-demo
```

Click **Seed live Hindsight memory** once. The app calls Hindsight's `create_bank`, `retain`, and `recall` APIs through `hindsight-client`. A failed remote call intentionally falls back to the local seeded dataset, preserving the demo while clearly labelling the source.

## Architecture

| Layer | Responsibility |
|---|---|
| Streamlit UI | RFP upload, requirements review, comparison, downloads |
| `core.py` | PDF-text requirement parsing, synthetic win/loss dataset, proposal assembly |
| `memory.py` | Hindsight retain/recall adapter and safe local fallback |
| Hindsight | Persistent institutional memory of proposal outcomes and lessons |
| OpenAI LLM | Drafts richer proposals when `OPENAI_API_KEY` is configured; deterministic generation protects the MVP demo |

## Demo script

1. Start with the generic draft: it only knows the uploaded RFP.
2. Generate the memory-informed draft.
3. Point to the recalled NorthStar Health win: compliance proof, a named security owner, and a pilot are now part of the plan.
4. Point to the CivicWorks loss: generic language and missing accessibility evidence are deliberately avoided.
5. Explain that each future proposal outcome can be retained, so the agent improves rather than resets.

## Testing

```bash
python -m pytest -q
```

## Limitations and next steps

- PDF extraction supports text PDFs; scanned documents need OCR.
- The MVP exports Markdown. DOCX/PDF export is a practical next enhancement.
- Add a structured LLM extraction pass and authenticated workspace-level memory banks for production use.

## Tech

Python, Streamlit, pypdf, Hindsight Cloud / `hindsight-client`.
