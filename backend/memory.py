import json
import os
import re
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory or project root
load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
if (BASE_DIR.parent / ".env").exists():
    load_dotenv(BASE_DIR.parent / ".env")

# Resolve data file path (supports root/data or backend/data)
def get_data_file() -> Path:
    candidates = [
        BASE_DIR.parent / "data" / "historical_proposals.json",
        BASE_DIR / "data" / "historical_proposals.json",
        Path.cwd() / "data" / "historical_proposals.json",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]

DATA_FILE = get_data_file()


def load_local_memories():
    target_file = get_data_file()
    if not target_file.exists():
        return []

    try:
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Error loading local memories: {e}")
        return []


def save_local_memory(record: dict) -> bool:
    target_file = get_data_file()
    try:
        target_file.parent.mkdir(parents=True, exist_ok=True)
        memories = load_local_memories()
        
        # Check if record already exists by ID
        existing_index = None
        record_id = str(record.get("id", "")).strip().lower()
        if record_id:
            for idx, existing in enumerate(memories):
                if str(existing.get("id", "")).strip().lower() == record_id:
                    existing_index = idx
                    break
        
        if existing_index is not None:
            memories[existing_index] = record
        else:
            memories.append(record)

        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(memories, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving local memory: {e}")
        return False


def hindsight_configured():
    api_key = os.getenv("HINDSIGHT_API_KEY")
    base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    return bool(api_key and base_url)


def get_client():
    from hindsight_client import Hindsight
    api_key = os.getenv("HINDSIGHT_API_KEY")
    base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")

    if not api_key:
        raise ValueError("HINDSIGHT_API_KEY is not configured.")

    return Hindsight(base_url=base_url, api_key=api_key)


def get_bank_id():
    return os.getenv("HINDSIGHT_BANK_ID", "proposal-iq-demo")


def ensure_bank():
    if not hindsight_configured():
        return False
    try:
        client = get_client()
        bank_id = get_bank_id()
        try:
            client.get_bank_config(bank_id=bank_id)
            return True
        except Exception:
            try:
                client.create_bank(
                    bank_id=bank_id,
                    name="ProposalIQ",
                    mission=(
                        "Remember historical proposals, successful "
                        "and unsuccessful outcomes, client preferences, "
                        "proposal strategies, and lessons learned so "
                        "future proposals improve over time."
                    ),
                )
                return True
            except Exception as e:
                print(f"Could not create Hindsight bank: {e}")
                return False
    except Exception as e:
        print(f"Error ensuring Hindsight bank: {e}")
        return False


def seed_hindsight():
    if not hindsight_configured():
        return (False, "Hindsight API is not configured. Running in local memory mode.")

    records = load_local_memories()
    if not records:
        return (False, "No historical proposal data found to seed.")

    try:
        client = get_client()
        bank_id = get_bank_id()
        ensure_bank()

        seeded = 0
        for record in records:
            proposal_id = str(record.get("id", "")).strip()
            if not proposal_id:
                continue

            content = json.dumps(record, ensure_ascii=False, indent=2)
            metadata = {
                "proposal_id": proposal_id,
                "client": str(record.get("client", "")),
                "industry": str(record.get("industry", "")),
                "project": str(record.get("project", "")),
                "outcome": str(record.get("outcome", "")),
            }

            try:
                client.retain(bank_id=bank_id, content=content, metadata=metadata)
                seeded += 1
            except Exception as e:
                print(f"Could not seed proposal {proposal_id}: {e}")

        return (True, f"Successfully synced and seeded {seeded} historical proposals into Hindsight bank '{bank_id}'.")
    except Exception as e:
        return (False, f"Hindsight seeding failed: {e}")


def retain_proposal_outcome(record: dict):
    """
    Retains a new proposal outcome and lesson into Hindsight Cloud
    and persists it to local historical memory.
    """
    if not record.get("id"):
        # Auto-assign next PROP-ID
        existing = load_local_memories()
        next_num = len(existing) + 1
        record["id"] = f"PROP-{next_num:03d}"

    # Ensure required fields
    record.setdefault("client", "Prospect")
    record.setdefault("project", "Custom Solution")
    record.setdefault("industry", "Technology")
    record.setdefault("outcome", "won")
    record.setdefault("lessons", "Focus on clear ROI and phased milestones.")
    record.setdefault("approach", "Phased implementation with clear risk ownership.")
    record.setdefault("requirements", [])

    # Always persist locally first
    local_ok = save_local_memory(record)

    # Persist to Hindsight Cloud if configured
    hindsight_status = "Local memory saved"
    if hindsight_configured():
        try:
            client = get_client()
            bank_id = get_bank_id()
            ensure_bank()

            content = json.dumps(record, ensure_ascii=False, indent=2)
            metadata = {
                "proposal_id": record["id"],
                "client": str(record.get("client", "")),
                "industry": str(record.get("industry", "")),
                "project": str(record.get("project", "")),
                "outcome": str(record.get("outcome", "")),
            }

            client.retain(bank_id=bank_id, content=content, metadata=metadata)
            hindsight_status = f"Retained in Hindsight bank '{bank_id}'"
        except Exception as e:
            hindsight_status = f"Retained locally; Hindsight sync pending ({e})"
            print(f"Hindsight retain error: {e}")

    return {
        "success": True,
        "message": f"Proposal {record['id']} successfully recorded as {record['outcome'].upper()}. {hindsight_status}.",
        "record": record,
        "hindsight_synced": hindsight_configured() and "bank" in hindsight_status,
    }


def _safe_text(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, (dict, list)):
        try:
            return json.dumps(value, ensure_ascii=False)
        except Exception:
            return str(value)
    return str(value)


def _normalize_memory(item):
    if item is None:
        return {}
    if not isinstance(item, (dict, list, str)):
        result = {}
        for field in ["id", "text", "type", "context", "metadata"]:
            if hasattr(item, field):
                try:
                    val = getattr(item, field)
                    if val is not None:
                        result[field] = val
                except Exception:
                    pass
        if result:
            return result

    if isinstance(item, dict):
        for key in ["memory", "result", "data"]:
            nested = item.get(key)
            if isinstance(nested, dict):
                merged = dict(item)
                merged.update(nested)
                return merged
        return item

    if isinstance(item, list):
        for part in item:
            normalized = _normalize_memory(part)
            if normalized:
                return normalized
        return {"content": _safe_text(item)}

    if isinstance(item, str):
        text = item.strip()
        if not text:
            return {}
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
        return {"content": text}

    return {}


def _extract_recall_results(response):
    if response is None:
        return []
    if hasattr(response, "results"):
        try:
            results = response.results
            if isinstance(results, list):
                return results
        except Exception:
            pass
    if isinstance(response, dict):
        for key in ["results", "memories", "data"]:
            value = response.get(key)
            if isinstance(value, list):
                return value
    if isinstance(response, list):
        return response
    return []


def _metadata_from_memory(memory):
    if not isinstance(memory, dict):
        return {}
    metadata = memory.get("metadata", {})
    if isinstance(metadata, dict):
        return metadata
    if hasattr(metadata, "model_dump"):
        try:
            return metadata.model_dump()
        except Exception:
            pass
    if hasattr(metadata, "dict"):
        try:
            return metadata.dict()
        except Exception:
            pass
    if hasattr(metadata, "__dict__"):
        try:
            return vars(metadata)
        except Exception:
            pass
    return {}


def _find_proposal_id(memory):
    metadata = _metadata_from_memory(memory)
    proposal_id = memory.get("proposal_id") or metadata.get("proposal_id")
    if proposal_id:
        return str(proposal_id).strip()

    content = memory.get("text") or memory.get("content") or memory.get("context") or ""
    content = _safe_text(content)

    match = re.search(r'"id"\s*:\s*"?(PROP-\d+)', content, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    match = re.search(r'\b(PROP-\d+)\b', content, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    return ""


def _convert_memory_to_record(memory):
    normalized = _normalize_memory(memory)
    if not normalized:
        return {}

    local_records = load_local_memories()
    proposal_id = _find_proposal_id(normalized)

    # Recover original local proposal if available
    if proposal_id:
        for record in local_records:
            if str(record.get("id", "")).strip().lower() == proposal_id.lower():
                return dict(record)

    content = normalized.get("text") or normalized.get("content") or normalized.get("context") or ""
    if isinstance(content, str):
        try:
            parsed = json.loads(content)
            if isinstance(parsed, dict) and parsed.get("id"):
                return parsed
        except Exception:
            pass

    metadata = _metadata_from_memory(normalized)
    return {
        "id": proposal_id or "PROP-REMOTE",
        "client": normalized.get("client") or metadata.get("client") or "Enterprise Client",
        "industry": normalized.get("industry") or metadata.get("industry") or "General",
        "project": normalized.get("project") or metadata.get("project") or "Platform Modernization",
        "requirements": normalized.get("requirements", []),
        "approach": normalized.get("approach", ""),
        "outcome": normalized.get("outcome") or metadata.get("outcome") or "won",
        "lessons": normalized.get("lessons") or normalized.get("lesson") or _safe_text(content)[:250],
        "memory_text": _safe_text(content),
    }


def _is_valid_record(record):
    if not isinstance(record, dict):
        return False
    fields = [
        record.get("id"),
        record.get("client"),
        record.get("project"),
        record.get("outcome"),
        record.get("lessons"),
        record.get("approach"),
    ]
    return any(str(val).strip() for val in fields if val is not None)


def _record_key(record):
    return str(record.get("id", "")).strip().lower()


def _add_unique_record(memories, record):
    if not _is_valid_record(record):
        return False
    record_id = _record_key(record)
    if record_id:
        for existing in memories:
            if _record_key(existing) == record_id:
                return False
    memories.append(record)
    return True


def _get_local_loss(memories):
    records = load_local_memories()
    existing_ids = {_record_key(r) for r in memories if _record_key(r)}
    losses = [r for r in records if str(r.get("outcome", "")).lower() == "lost"]
    for record in losses:
        if _record_key(record) not in existing_ids:
            return dict(record)
    return None


def recall(profile):
    """
    Recalls memories from Hindsight Cloud (or local fallback).
    Always guarantees a mix of winning approaches and at least one high-signal loss lesson.
    """
    if not hindsight_configured():
        return recall_local(profile), "Local institutional memory (deterministic)"

    try:
        client = get_client()
        bank_id = get_bank_id()

        client_name = getattr(profile, "client_name", "")
        project_name = getattr(profile, "project_name", "")
        requirements = getattr(profile, "requirements", [])
        if not isinstance(requirements, list):
            requirements = []

        requirement_text = " ".join(str(item) for item in requirements[:5])

        query = f"""
Find historical proposal outcomes relevant to this RFP.

Client: {client_name}
Project: {project_name}
Requirements: {requirement_text}

Prioritize:
- similar industries and project types
- successful proposals and what worked
- unsuccessful proposals and lessons learned
- approaches that won vs approaches that failed
"""
        response = client.recall(
            bank_id=bank_id,
            query=query,
            max_tokens=4096,
            budget="high",
        )

        raw_results = _extract_recall_results(response)
        memories = []
        for item in raw_results:
            record = _convert_memory_to_record(item)
            _add_unique_record(memories, record)

        # Ensure we have winning proposals
        has_win = any(str(r.get("outcome", "")).lower() == "won" for r in memories)
        if not has_win:
            win_query = f"Find successful winning proposal outcomes for {client_name} {project_name} {requirement_text}"
            try:
                win_resp = client.recall(bank_id=bank_id, query=win_query, max_tokens=2048, budget="mid")
                for item in _extract_recall_results(win_resp):
                    _add_unique_record(memories, _convert_memory_to_record(item))
            except Exception:
                pass

        # Guarantee at least 1 loss memory for high-signal learning
        has_loss = any(str(r.get("outcome", "")).lower() == "lost" for r in memories)
        if not has_loss:
            loss_query = f"Find proposals that were LOST or unsuccessful. What failed, mistakes to avoid for {project_name}"
            try:
                loss_resp = client.recall(bank_id=bank_id, query=loss_query, max_tokens=2048, budget="mid")
                for item in _extract_recall_results(loss_resp):
                    rec = _convert_memory_to_record(item)
                    if str(rec.get("outcome", "")).lower() == "lost":
                        _add_unique_record(memories, rec)
                        break
            except Exception:
                pass

        # Fallback loss from local dataset if remote recall had only wins
        if not any(str(r.get("outcome", "")).lower() == "lost" for r in memories):
            local_loss = _get_local_loss(memories)
            if local_loss:
                _add_unique_record(memories, local_loss)

        wins = [r for r in memories if str(r.get("outcome", "")).lower() == "won"]
        losses = [r for r in memories if str(r.get("outcome", "")).lower() == "lost"]

        final_memories = wins[:4]
        if losses:
            final_memories.append(losses[0])
        if len(final_memories) < 5:
            remaining = [r for r in memories if r not in final_memories]
            final_memories.extend(remaining[: 5 - len(final_memories)])

        return final_memories[:5], f"Hindsight Cloud bank '{bank_id}'"

    except Exception as e:
        print(f"Hindsight recall fallback to local: {e}")
        return recall_local(profile), "Local institutional memory fallback"


def recall_local(profile):
    records = load_local_memories()
    if not records:
        return []

    client_name = str(getattr(profile, "client_name", "")).lower()
    project_name = str(getattr(profile, "project_name", "")).lower()
    requirements = getattr(profile, "requirements", [])
    if not isinstance(requirements, list):
        requirements = []

    requirement_text = " ".join(str(item).lower() for item in requirements)

    scored = []
    for record in records:
        client = str(record.get("client", "")).lower()
        project = str(record.get("project", "")).lower()
        industry = str(record.get("industry", "")).lower()
        lessons = str(record.get("lessons", "")).lower()
        approach = str(record.get("approach", "")).lower()

        score = 0
        if client_name and client_name in client:
            score += 6
        for word in client_name.split():
            if len(word) > 3 and word in client:
                score += 3
        for word in project_name.split():
            if len(word) > 3 and word in project:
                score += 3
        for word in requirement_text.split():
            if len(word) <= 4:
                continue
            if word in project:
                score += 1
            if word in lessons:
                score += 2
            if word in approach:
                score += 1
            if word in industry:
                score += 2

        if str(record.get("outcome", "")).lower() == "won":
            score += 1

        scored.append((score, record))

    scored.sort(key=lambda x: x[0], reverse=True)

    wins = [r for s, r in scored if str(r.get("outcome", "")).lower() == "won"]
    losses = [r for s, r in scored if str(r.get("outcome", "")).lower() == "lost"]

    selected = wins[:4]
    if losses:
        selected.append(losses[0])
    return selected[:5]
