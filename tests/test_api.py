import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["product"] == "ProposalIQ"
    assert "hindsight" in data
    assert "bank_id" in data["hindsight"]


def test_stats():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_proposals"] >= 15
    assert "successful_proposals" in data
    assert "unsuccessful_proposals" in data
    assert "win_rate" in data


def test_sample_rfp_analysis():
    res = client.post("/api/analyze-sample")
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "01_FinCore_Bank_Digital_Banking_Platform.pdf"
    profile = data["profile"]
    assert profile["client_name"] == "FinCore Bank"
    assert "Digital Banking" in profile["project_name"]
    assert len(profile["requirements"]) > 0


def test_generic_proposal_generation():
    sample_res = client.post("/api/analyze-sample")
    profile = sample_res.json()["profile"]

    res = client.post("/api/generate-proposal", json=profile)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "without_memory"
    assert "Proposal: " in data["proposal"]
    assert len(data["proposal"]) > 500


def test_hindsight_proposal_generation():
    sample_res = client.post("/api/analyze-sample")
    profile = sample_res.json()["profile"]

    res = client.post("/api/generate-proposal-with-memory", json=profile)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "with_hindsight"
    assert "What ProposalIQ Learned" in data["proposal"]
    assert len(data["proposal"]) > len(client.post("/api/generate-proposal", json=profile).json()["proposal"])
    assert data["memories_count"] > 0


def test_memories_list():
    res = client.get("/api/memories")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 15
    assert data["successful_count"] > 0
    assert data["unsuccessful_count"] > 0
    assert len(data["memories"]) == data["total"]


def test_outcome_recording():
    payload = {
        "client": "Test Health Corp",
        "project": "Telehealth Platform",
        "industry": "Healthcare",
        "outcome": "won",
        "lessons": "Early pilot phase convinced the medical director.",
        "approach": "Phased rollout with clinical review",
    }
    res = client.post("/api/outcome", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "successfully recorded" in data["message"]
    assert data["record"]["client"] == "Test Health Corp"


def test_spa_root():
    res = client.get("/")
    assert res.status_code == 200
    assert "ProposalIQ" in res.text
