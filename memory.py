import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from hindsight_client import Hindsight


load_dotenv()


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "historical_proposals.json"


def load_local_memories():
    if not DATA_FILE.exists():
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        return data if isinstance(data, list) else []

    except Exception:
        return []


def hindsight_configured():
    api_key = os.getenv("HINDSIGHT_API_KEY")
    base_url = os.getenv(
        "HINDSIGHT_BASE_URL",
        "https://api.hindsight.vectorize.io"
    )

    return bool(api_key and base_url)


def get_client():
    api_key = os.getenv("HINDSIGHT_API_KEY")
    base_url = os.getenv(
        "HINDSIGHT_BASE_URL",
        "https://api.hindsight.vectorize.io"
    )

    if not api_key:
        raise ValueError(
            "HINDSIGHT_API_KEY is not configured."
        )

    return Hindsight(
        base_url=base_url,
        api_key=api_key
    )


def get_bank_id():
    return os.getenv(
        "HINDSIGHT_BANK_ID",
        "proposal-iq-demo"
    )


def ensure_bank():
    client = get_client()
    bank_id = get_bank_id()

    try:
        client.get_bank_config(
            bank_id=bank_id
        )
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
                )
            )
            return True

        except Exception as e:
            print(
                f"Could not create Hindsight bank: {e}"
            )
            return False


def seed_hindsight():
    if not hindsight_configured():
        return (
            False,
            "Hindsight API is not configured."
        )

    records = load_local_memories()

    if not records:
        return (
            False,
            "No historical proposal data found."
        )

    try:
        client = get_client()
        bank_id = get_bank_id()

        ensure_bank()

        seeded = 0

        for record in records:
            proposal_id = str(
                record.get("id", "")
            ).strip()

            if not proposal_id:
                continue

            content = json.dumps(
                record,
                ensure_ascii=False,
                indent=2
            )

            metadata = {
                "proposal_id": proposal_id,
                "client": str(
                    record.get("client", "")
                ),
                "industry": str(
                    record.get("industry", "")
                ),
                "project": str(
                    record.get("project", "")
                ),
                "outcome": str(
                    record.get("outcome", "")
                ),
            }

            try:
                client.retain(
                    bank_id=bank_id,
                    content=content,
                    metadata=metadata
                )

                seeded += 1

            except Exception as e:
                print(
                    f"Could not seed proposal "
                    f"{proposal_id}: {e}"
                )

        return (
            True,
            f"Seeded {seeded} historical proposals into Hindsight."
        )

    except Exception as e:
        return (
            False,
            f"Hindsight seeding failed: {e}"
        )


def _safe_text(value):
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, (dict, list)):
        try:
            return json.dumps(
                value,
                ensure_ascii=False
            )
        except Exception:
            return str(value)

    return str(value)


def _normalize_memory(item):

    if item is None:
        return {}

    # Hindsight RecallResult object
    if not isinstance(
        item,
        (dict, list, str)
    ):

        result = {}

        for field in [
            "id",
            "text",
            "type",
            "context",
            "metadata"
        ]:

            if hasattr(item, field):

                try:
                    value = getattr(
                        item,
                        field
                    )

                    if value is not None:
                        result[field] = value

                except Exception:
                    pass

        if result:
            return result

    # Dictionary
    if isinstance(item, dict):

        for key in [
            "memory",
            "result",
            "data"
        ]:

            nested = item.get(key)

            if isinstance(
                nested,
                dict
            ):

                merged = dict(item)
                merged.update(nested)

                return merged

        return item

    # List
    if isinstance(item, list):

        for part in item:

            normalized = _normalize_memory(
                part
            )

            if normalized:
                return normalized

        return {
            "content": _safe_text(item)
        }

    # String
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

        return {
            "content": text
        }

    return {}


def _extract_recall_results(response):

    if response is None:
        return []

    if hasattr(
        response,
        "results"
    ):

        try:
            results = response.results

            if isinstance(
                results,
                list
            ):
                return results

        except Exception:
            pass

    if isinstance(
        response,
        dict
    ):

        for key in [
            "results",
            "memories",
            "data"
        ]:

            value = response.get(key)

            if isinstance(
                value,
                list
            ):
                return value

    if isinstance(
        response,
        list
    ):
        return response

    return []


def _metadata_from_memory(memory):

    if not isinstance(
        memory,
        dict
    ):
        return {}

    metadata = memory.get(
        "metadata",
        {}
    )

    if isinstance(
        metadata,
        dict
    ):
        return metadata

    if hasattr(
        metadata,
        "model_dump"
    ):

        try:
            return metadata.model_dump()
        except Exception:
            pass

    if hasattr(
        metadata,
        "dict"
    ):

        try:
            return metadata.dict()
        except Exception:
            pass

    if hasattr(
        metadata,
        "__dict__"
    ):

        try:
            return vars(metadata)
        except Exception:
            pass

    return {}


def _find_proposal_id(memory):

    metadata = _metadata_from_memory(
        memory
    )

    proposal_id = (
        memory.get("proposal_id")
        or metadata.get("proposal_id")
    )

    if proposal_id:
        return str(
            proposal_id
        ).strip()

    content = (
        memory.get("text")
        or memory.get("content")
        or memory.get("context")
        or ""
    )

    content = _safe_text(
        content
    )

    match = re.search(
        r'"id"\s*:\s*"?(PROP-\d+)',
        content,
        re.IGNORECASE
    )

    if match:
        return match.group(
            1
        ).upper()

    match = re.search(
        r'\b(PROP-\d+)\b',
        content,
        re.IGNORECASE
    )

    if match:
        return match.group(
            1
        ).upper()

    return ""


def _convert_memory_to_record(memory):

    normalized = _normalize_memory(
        memory
    )

    if not normalized:
        return {}

    local_records = load_local_memories()

    proposal_id = _find_proposal_id(
        normalized
    )

    # Recover original local proposal
    if proposal_id:

        for record in local_records:

            record_id = str(
                record.get(
                    "id",
                    ""
                )
            ).strip()

            if (
                record_id.lower()
                == proposal_id.lower()
            ):

                return {
                    "id": record.get(
                        "id",
                        ""
                    ),
                    "client": record.get(
                        "client",
                        ""
                    ),
                    "industry": record.get(
                        "industry",
                        ""
                    ),
                    "project": record.get(
                        "project",
                        ""
                    ),
                    "requirements": record.get(
                        "requirements",
                        []
                    ),
                    "approach": record.get(
                        "approach",
                        ""
                    ),
                    "outcome": record.get(
                        "outcome",
                        ""
                    ),
                    "lessons": record.get(
                        "lessons",
                        ""
                    )
                }

    content = (
        normalized.get("text")
        or normalized.get("content")
        or normalized.get("context")
        or ""
    )

    if isinstance(
        content,
        str
    ):

        try:
            parsed = json.loads(
                content
            )

            if (
                isinstance(
                    parsed,
                    dict
                )
                and parsed.get("id")
            ):

                return {
                    "id": parsed.get(
                        "id",
                        ""
                    ),
                    "client": parsed.get(
                        "client",
                        ""
                    ),
                    "industry": parsed.get(
                        "industry",
                        ""
                    ),
                    "project": parsed.get(
                        "project",
                        ""
                    ),
                    "requirements": parsed.get(
                        "requirements",
                        []
                    ),
                    "approach": parsed.get(
                        "approach",
                        ""
                    ),
                    "outcome": parsed.get(
                        "outcome",
                        ""
                    ),
                    "lessons": parsed.get(
                        "lessons",
                        ""
                    )
                }

        except Exception:
            pass

    metadata = _metadata_from_memory(
        normalized
    )

    return {
        "id": proposal_id,
        "client": (
            normalized.get("client")
            or metadata.get("client")
            or ""
        ),
        "industry": (
            normalized.get("industry")
            or metadata.get("industry")
            or ""
        ),
        "project": (
            normalized.get("project")
            or metadata.get("project")
            or ""
        ),
        "requirements": [],
        "approach": normalized.get(
            "approach",
            ""
        ),
        "outcome": (
            normalized.get("outcome")
            or metadata.get("outcome")
            or ""
        ),
        "lessons": (
            normalized.get("lessons")
            or normalized.get("lesson")
            or ""
        ),
        "memory_text": _safe_text(
            content
        )
    }


def _is_valid_record(record):

    if not isinstance(
        record,
        dict
    ):
        return False

    fields = [
        record.get("id"),
        record.get("client"),
        record.get("project"),
        record.get("outcome"),
        record.get("lessons"),
        record.get("approach")
    ]

    return any(
        str(value).strip()
        for value in fields
        if value is not None
    )


def _record_key(record):

    return str(
        record.get(
            "id",
            ""
        )
    ).strip().lower()


def _add_unique_record(
    memories,
    record
):

    if not _is_valid_record(
        record
    ):
        return False

    record_id = _record_key(
        record
    )

    if record_id:

        for existing in memories:

            if (
                _record_key(existing)
                == record_id
            ):
                return False

    memories.append(
        record
    )

    return True


def _get_local_loss(memories):

    records = load_local_memories()

    existing_ids = {
        _record_key(record)
        for record in memories
        if _record_key(record)
    }

    losses = [
        record
        for record in records
        if str(
            record.get(
                "outcome",
                ""
            )
        ).lower() == "lost"
    ]

    for record in losses:

        record_id = _record_key(
            record
        )

        if record_id not in existing_ids:

            return {
                "id": record.get(
                    "id",
                    ""
                ),
                "client": record.get(
                    "client",
                    ""
                ),
                "industry": record.get(
                    "industry",
                    ""
                ),
                "project": record.get(
                    "project",
                    ""
                ),
                "requirements": record.get(
                    "requirements",
                    []
                ),
                "approach": record.get(
                    "approach",
                    ""
                ),
                "outcome": record.get(
                    "outcome",
                    ""
                ),
                "lessons": record.get(
                    "lessons",
                    ""
                )
            }

    return None


def recall(profile):

    if not hindsight_configured():
        return recall_local(
            profile
        )

    try:

        client = get_client()
        bank_id = get_bank_id()

        client_name = getattr(
            profile,
            "client_name",
            ""
        )

        project_name = getattr(
            profile,
            "project_name",
            ""
        )

        requirements = getattr(
            profile,
            "requirements",
            []
        )

        if not isinstance(
            requirements,
            list
        ):
            requirements = []

        requirement_text = " ".join(
            str(item)
            for item in requirements[:5]
        )

        # ==========================================
        # MAIN RECALL
        # ==========================================

        query = f"""
Find historical proposal outcomes relevant to this RFP.

Client:
{client_name}

Project:
{project_name}

Requirements:
{requirement_text}

Prioritize:
- similar industries
- similar project types
- similar requirements
- successful proposals
- unsuccessful proposals
- lessons learned
- approaches that worked
- approaches that failed
"""

        response = client.recall(
            bank_id=bank_id,
            query=query,
            max_tokens=4096,
            budget="high"
        )

        raw_results = _extract_recall_results(
            response
        )

        memories = []

        for item in raw_results:

            record = _convert_memory_to_record(
                item
            )

            _add_unique_record(
                memories,
                record
            )

        # ==========================================
        # WIN RECALL
        # ==========================================

        has_win = any(
            str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower() == "won"
            for record in memories
        )

        if not has_win:

            win_query = f"""
Find successful historical proposal examples relevant
to this RFP.

Client:
{client_name}

Project:
{project_name}

Requirements:
{requirement_text}

Focus on:
- proposals that were won
- similar industries
- similar project types
- successful approaches
- lessons from winning proposals
"""

            try:

                win_response = client.recall(
                    bank_id=bank_id,
                    query=win_query,
                    max_tokens=4096,
                    budget="high"
                )

                win_results = _extract_recall_results(
                    win_response
                )

                for item in win_results:

                    record = _convert_memory_to_record(
                        item
                    )

                    _add_unique_record(
                        memories,
                        record
                    )

            except Exception as e:
                print(
                    f"Successful-memory recall failed: {e}"
                )

        # ==========================================
        # LOSS RECALL
        # ==========================================

        has_loss = any(
            str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower() == "lost"
            for record in memories
        )

        if not has_loss:

            loss_query = f"""
Find historical proposal examples that were LOST.

Client:
{client_name}

Project:
{project_name}

Requirements:
{requirement_text}

IMPORTANT:
Return unsuccessful or lost proposals.
Focus on:
- proposals that were lost
- unsuccessful approaches
- reasons for losing
- lessons learned
- mistakes to avoid
"""

            try:

                loss_response = client.recall(
                    bank_id=bank_id,
                    query=loss_query,
                    max_tokens=4096,
                    budget="high"
                )

                loss_results = _extract_recall_results(
                    loss_response
                )

                for item in loss_results:

                    record = _convert_memory_to_record(
                        item
                    )

                    if (
                        str(
                            record.get(
                                "outcome",
                                ""
                            )
                        ).lower()
                        == "lost"
                    ):

                        _add_unique_record(
                            memories,
                            record
                        )

                        break

            except Exception as e:
                print(
                    f"Loss recall failed: {e}"
                )

        # ==========================================
        # GUARANTEE A REAL HISTORICAL LOSS
        # ==========================================

        has_loss = any(
            str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower() == "lost"
            for record in memories
        )

        if not has_loss:

            local_loss = _get_local_loss(
                memories
            )

            if local_loss:

                _add_unique_record(
                    memories,
                    local_loss
                )

        # ==========================================
        # FINAL SELECTION
        #
        # IMPORTANT:
        # Reserve one slot for a loss.
        # ==========================================

        wins = [
            record
            for record in memories
            if str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower() == "won"
        ]

        losses = [
            record
            for record in memories
            if str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower() == "lost"
        ]

        # Take at most 5 wins
        selected_wins = wins[:5]

        # Take exactly 1 loss if available
        selected_losses = losses[:1]

        final_memories = (
            selected_wins
            + selected_losses
        )

        # If there are no losses for some unexpected
        # reason, fill the remaining slots normally.
        if not selected_losses:

            remaining = [
                record
                for record in memories
                if record not in selected_wins
            ]

            final_memories.extend(
                remaining[
                    :6 - len(final_memories)
                ]
            )

        return final_memories[:6]

    except Exception as e:

        print(
            f"Hindsight recall failed: {e}"
        )

        return recall_local(
            profile
        )


def recall_local(profile):

    records = load_local_memories()

    if not records:
        return []

    client_name = str(
        getattr(
            profile,
            "client_name",
            ""
        )
    ).lower()

    project_name = str(
        getattr(
            profile,
            "project_name",
            ""
        )
    ).lower()

    requirements = getattr(
        profile,
        "requirements",
        []
    )

    if not isinstance(
        requirements,
        list
    ):
        requirements = []

    requirement_text = " ".join(
        str(item).lower()
        for item in requirements
    )

    scored = []

    for record in records:

        client = str(
            record.get(
                "client",
                ""
            )
        ).lower()

        project = str(
            record.get(
                "project",
                ""
            )
        ).lower()

        industry = str(
            record.get(
                "industry",
                ""
            )
        ).lower()

        lessons = str(
            record.get(
                "lessons",
                ""
            )
        ).lower()

        approach = str(
            record.get(
                "approach",
                ""
            )
        ).lower()

        score = 0

        if (
            client_name
            and client_name in client
        ):
            score += 5

        for word in client_name.split():

            if len(word) > 3 and word in client:
                score += 2

        for word in project_name.split():

            if len(word) > 3 and word in project:
                score += 2

        for word in requirement_text.split():

            if len(word) <= 4:
                continue

            if word in project:
                score += 1

            if word in lessons:
                score += 1

            if word in approach:
                score += 1

            if word in industry:
                score += 1

        if (
            str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower()
            == "won"
        ):
            score += 1

        scored.append(
            (
                score,
                record
            )
        )

    scored.sort(
        key=lambda x: x[0],
        reverse=True
    )

    wins = [
        record
        for score, record in scored
        if (
            score > 0
            and str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower()
            == "won"
        )
    ]

    losses = [
        record
        for score, record in scored
        if (
            str(
                record.get(
                    "outcome",
                    ""
                )
            ).lower()
            == "lost"
        )
    ]

    selected = wins[:5]

    if losses:
        selected.append(
            losses[0]
        )

    return selected[:6]

