import io
import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pypdf import PdfReader

# Load environment variables
load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
if (BASE_DIR.parent / ".env").exists():
    load_dotenv(BASE_DIR.parent / ".env")

from core import RequirementProfile, extract_profile
from generation import generate_generic_proposal, generate_proposal
from memory import (
    get_bank_id,
    hindsight_configured,
    load_local_memories,
    recall,
    retain_proposal_outcome,
    seed_hindsight,
)

app = FastAPI(
    title="ProposalIQ API",
    description="Backend API for ProposalIQ - RFP intelligence powered by persistent Hindsight memory",
    version="2.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to find sample PDF
def get_sample_pdf_path() -> Path:
    candidates = [
        BASE_DIR.parent / "samples" / "01_FinCore_Bank_Digital_Banking_Platform.pdf",
        BASE_DIR / "samples" / "01_FinCore_Bank_Digital_Banking_Platform.pdf",
        Path.cwd() / "samples" / "01_FinCore_Bank_Digital_Banking_Platform.pdf",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]


# Request / Response Models
class ProfileModel(BaseModel):
    client_name: str = "Unknown Client"
    project_name: str = "Untitled Project"
    timeline: str = "Not specified"
    budget: str = "Not specified"
    requirements: List[str] = Field(default_factory=list)
    technical_requirements: List[str] = Field(default_factory=list)
    evaluation_criteria: List[str] = Field(default_factory=list)
    scope: str = ""


class TextRFPRequest(BaseModel):
    text: str


class OutcomeRequest(BaseModel):
    proposal_id: Optional[str] = None
    client: str = "Enterprise Prospect"
    project: str = "Platform Initiative"
    industry: str = "Enterprise Software"
    outcome: str = "won"
    lessons: str = "Clear security ownership and pilot structure won the deal."
    approach: Optional[str] = "Phased deployment with independent validation"
    requirements: Optional[List[str]] = Field(default_factory=list)


def _profile_from_model(model: ProfileModel) -> RequirementProfile:
    return RequirementProfile(
        client_name=model.client_name,
        project_name=model.project_name,
        timeline=model.timeline,
        budget=model.budget,
        requirements=model.requirements,
        technical_requirements=model.technical_requirements,
        evaluation_criteria=model.evaluation_criteria,
        scope=model.scope,
    )


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/api/health")
def health():
    records = load_local_memories()
    won = sum(1 for r in records if str(r.get("outcome", "")).lower() in {"won", "win", "successful"})
    lost = sum(1 for r in records if str(r.get("outcome", "")).lower() in {"lost", "loss", "unsuccessful"})
    configured = hindsight_configured()
    bank_id = get_bank_id()

    return {
        "status": "healthy",
        "product": "ProposalIQ",
        "tagline": "Turn every RFP into a smarter proposal.",
        "hindsight": {
            "configured": configured,
            "bank_id": bank_id,
            "base_url": os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io"),
            "status": "Connected to Hindsight Cloud" if configured else "Local Demo Memory Active",
        },
        "stats": {
            "total_proposals": len(records),
            "won": won,
            "lost": lost,
            "win_rate": round((won / len(records) * 100), 1) if records else 0,
        },
    }


@app.get("/api/stats")
def get_stats():
    records = load_local_memories()
    won = sum(1 for r in records if str(r.get("outcome", "")).lower() in {"won", "win", "successful"})
    lost = sum(1 for r in records if str(r.get("outcome", "")).lower() in {"lost", "loss", "unsuccessful"})
    total = len(records)
    win_rate = round((won / total * 100), 1) if total > 0 else 0

    return {
        "total_proposals": total,
        "successful_proposals": won,
        "unsuccessful_proposals": lost,
        "win_rate": win_rate,
        "memory_items": total,
        "hindsight_bank_id": get_bank_id(),
        "hindsight_connected": hindsight_configured(),
    }


@app.post("/api/analyze-rfp")
async def analyze_rfp(
    file: Optional[UploadFile] = File(None),
    payload: Optional[TextRFPRequest] = None,
):
    text = ""
    filename = "Pasted RFP"
    filesize = 0

    if file is not None:
        try:
            content = await file.read()
            filesize = len(content)
            filename = file.filename or "uploaded.pdf"

            reader = PdfReader(io.BytesIO(content))
            pages_text = [p.extract_text() or "" for p in reader.pages]
            text = "\n".join(pages_text).strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {str(e)}")
    elif payload and payload.text:
        text = payload.text.strip()
        filesize = len(text)
    else:
        raise HTTPException(status_code=400, detail="Either a PDF file or text payload is required.")

    if len(text) < 30:
        raise HTTPException(
            status_code=400,
            detail="The document does not contain sufficient text. Please provide a text-readable PDF or paste full RFP text.",
        )

    profile = extract_profile(text)
    return {
        "filename": filename,
        "filesize": filesize,
        "text_length": len(text),
        "profile": profile.to_dict(),
    }


@app.post("/api/analyze-sample")
def analyze_sample():
    sample_path = get_sample_pdf_path()
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail="Sample RFP PDF file not found on server.")

    try:
        reader = PdfReader(str(sample_path))
        text = "\n".join(p.extract_text() or "" for p in reader.pages)
        profile = extract_profile(text)
        return {
            "filename": sample_path.name,
            "filesize": sample_path.stat().st_size,
            "text_length": len(text),
            "profile": profile.to_dict(),
            "is_sample": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze sample RFP: {e}")


@app.post("/api/generate-proposal")
def api_generate_generic_proposal(profile_data: ProfileModel):
    profile = _profile_from_model(profile_data)
    proposal_text = generate_generic_proposal(profile)
    return {
        "proposal": proposal_text,
        "mode": "without_memory",
        "info": "Generated strictly from current RFP specifications without organizational memory.",
        "memories_used": 0,
    }


@app.post("/api/generate-proposal-with-memory")
def api_generate_proposal_with_memory(profile_data: ProfileModel):
    profile = _profile_from_model(profile_data)
    recall_result = recall(profile)

    if isinstance(recall_result, tuple):
        memories = recall_result[0] if len(recall_result) > 0 else []
        source = recall_result[1] if len(recall_result) > 1 else "Hindsight Cloud"
    else:
        memories = recall_result
        source = "Hindsight Cloud"

    proposal_text, info = generate_proposal(profile, memories)

    wins_count = sum(1 for m in memories if str(m.get("outcome", "")).lower() in {"won", "win", "successful"})
    losses_count = sum(1 for m in memories if str(m.get("outcome", "")).lower() in {"lost", "loss", "unsuccessful"})

    return {
        "proposal": proposal_text,
        "mode": "with_hindsight",
        "info": info,
        "source": source,
        "memories": memories,
        "memories_count": len(memories),
        "wins_count": wins_count,
        "losses_count": losses_count,
    }


@app.get("/api/memories")
def get_memories():
    records = load_local_memories()
    won = [r for r in records if str(r.get("outcome", "")).lower() in {"won", "win", "successful"}]
    lost = [r for r in records if str(r.get("outcome", "")).lower() in {"lost", "loss", "unsuccessful"}]

    return {
        "total": len(records),
        "successful_count": len(won),
        "unsuccessful_count": len(lost),
        "bank_id": get_bank_id(),
        "hindsight_connected": hindsight_configured(),
        "memories": records,
    }


@app.post("/api/outcome")
def record_outcome(payload: OutcomeRequest):
    record = payload.model_dump()
    result = retain_proposal_outcome(record)
    return result


@app.post("/api/seed-memory")
def trigger_seed_memory():
    ok, message = seed_hindsight()
    return {
        "success": ok,
        "message": message,
        "bank_id": get_bank_id(),
        "configured": hindsight_configured(),
    }

# ============================================================
# FRONTEND SPA STATIC MOUNT (for standalone deployment)
# ============================================================
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = BASE_DIR.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(dist_dir / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
