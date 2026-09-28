from dataclasses import dataclass, asdict
import re


# ============================================================
# REQUIREMENT PROFILE
# ============================================================

@dataclass
class RequirementProfile:
    client_name: str = "Unknown Client"
    project_name: str = "Untitled Project"
    timeline: str = "Not specified"
    budget: str = "Not specified"
    requirements: list[str] = None
    technical_requirements: list[str] = None
    evaluation_criteria: list[str] = None
    scope: str = ""

    def __post_init__(self):
        self.requirements = self.requirements or []
        self.technical_requirements = self.technical_requirements or []
        self.evaluation_criteria = self.evaluation_criteria or []

    def to_dict(self):
        return asdict(self)


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_lines(text):
    text = text.replace("\x7f", "-")
    text = text.replace("–", "-")
    text = text.replace("—", "-")

    lines = []

    for line in text.splitlines():
        line = re.sub(r"\s+", " ", line).strip()

        if line:
            lines.append(line)

    return lines


# ============================================================
# SECTION EXTRACTION
# ============================================================

def extract_section(lines, start_patterns, end_patterns):
    start_index = None

    for i, line in enumerate(lines):

        for pattern in start_patterns:

            if re.search(
                pattern,
                line,
                re.IGNORECASE
            ):
                start_index = i + 1
                break

        if start_index is not None:
            break

    if start_index is None:
        return []

    end_index = len(lines)

    for i in range(start_index, len(lines)):

        for pattern in end_patterns:

            if re.search(
                pattern,
                lines[i],
                re.IGNORECASE
            ):
                end_index = i
                break

        if end_index != len(lines):
            break

    return lines[start_index:end_index]


# ============================================================
# BULLET EXTRACTION
# ============================================================

def extract_bullets(lines):
    results = []

    for line in lines:

        line = line.strip()

        line = re.sub(
            r"^[-•*]\s*",
            "",
            line
        )

        line = re.sub(
            r"^\d+[\.\)]\s*",
            "",
            line
        )

        if len(line) >= 4:
            results.append(line)

    return results


# ============================================================
# PROFILE EXTRACTION
# ============================================================

def extract_profile(text: str):

    lines = clean_lines(text)
    full_text = "\n".join(lines)

    # --------------------------------------------------------
    # CLIENT
    # --------------------------------------------------------

    client = "Unknown Client"

    for line in lines:

        match = re.search(
            r"(?:Issued\s+By|Issued\s+by)\s*:\s*(.+?)(?:\s+Industry\s*:|\s+Date\s*:|$)",
            line,
            re.IGNORECASE
        )

        if match:
            client = match.group(1).strip()
            break

    if client == "Unknown Client":

        for line in lines:

            match = re.search(
                r"(?:Client|Organization|Company)\s*:\s*(.+)",
                line,
                re.IGNORECASE
            )

            if match:
                client = match.group(1).strip()
                break

    # --------------------------------------------------------
    # PROJECT NAME
    # --------------------------------------------------------

    project = "Untitled Project"

    for i, line in enumerate(lines):

        match = re.search(
            r"REQUEST\s+FOR\s+PROPOSAL\s*:?\s*(.+)",
            line,
            re.IGNORECASE
        )

        if match:

            project = match.group(1).strip()

            if project:
                break

            if i + 1 < len(lines):
                project = lines[i + 1].strip()

            break

    # Handle PDFs where title is on the next line
    if project == "Untitled Project":

        for i, line in enumerate(lines):

            if re.search(
                r"REQUEST\s+FOR\s+PROPOSAL",
                line,
                re.IGNORECASE
            ):

                if i + 1 < len(lines):

                    candidate = lines[i + 1].strip()

                    if candidate:
                        project = candidate

                break

    # --------------------------------------------------------
    # TIMELINE
    # --------------------------------------------------------

    timeline = "Not specified"

    # First: explicit Timeline: value
    for line in lines:

        match = re.search(
            r"(?:Timeline|Implementation Timeline)\s*:\s*(.+)",
            line,
            re.IGNORECASE
        )

        if match:

            value = match.group(1).strip()

            if value and value != "-":
                timeline = value
                break

    # Second: heading followed by timeline text
    if timeline == "Not specified":

        for i, line in enumerate(lines):

            if re.search(
                r"^\s*\d*\.?\s*(?:Implementation Timeline|Timeline)\s*$",
                line,
                re.IGNORECASE
            ):

                for j in range(
                    i + 1,
                    min(i + 5, len(lines))
                ):

                    candidate = lines[j].strip()

                    if (
                        re.search(
                            r"\b(?:pilot|launch|rollout|deployment|MVP|production|implementation)\b",
                            candidate,
                            re.IGNORECASE
                        )
                        and
                        re.search(
                            r"\b(?:week|weeks|month|months|day|days)\b",
                            candidate,
                            re.IGNORECASE
                        )
                    ):

                        timeline = candidate
                        break

                if timeline != "Not specified":
                    break

    # Third: look anywhere in the RFP
    if timeline == "Not specified":

        timeline_parts = []

        for line in lines:

            has_timeline_word = re.search(
                r"\b(?:pilot|launch|rollout|deployment|MVP|production|implementation)\b",
                line,
                re.IGNORECASE
            )

            has_time_unit = re.search(
                r"\b(?:week|weeks|month|months|day|days)\b",
                line,
                re.IGNORECASE
            )

            if has_timeline_word and has_time_unit:
                timeline_parts.append(line)

        if timeline_parts:

            timeline = "; ".join(
                timeline_parts[:3]
            )

    # Fourth: generic duration fallback
    if timeline == "Not specified":

        for line in lines:

            if re.search(
                r"\b\d+\s*(?:-|to)?\s*\d*\s*(?:weeks?|months?|days?)\b",
                line,
                re.IGNORECASE
            ):

                if not re.search(
                    r"\b(?:budget|cost|price)\b",
                    line,
                    re.IGNORECASE
                ):

                    timeline = line
                    break

    # --------------------------------------------------------
    # BUDGET
    # --------------------------------------------------------

    budget = "Not specified"

    # Explicit budget labels
    for line in lines:

        match = re.search(
            r"(?:Budget|Project Budget|Budget Range|Expected Project Budget)"
            r"\s*:\s*(.+)",
            line,
            re.IGNORECASE
        )

        if match:

            value = match.group(1).strip()

            if value and value != "-":
                budget = value
                break

    # Handle "6. Budget" followed by amount
    if budget == "Not specified":

        for i, line in enumerate(lines):

            if re.fullmatch(
                r"(?:\d+\.\s*)?Budget",
                line,
                re.IGNORECASE
            ):

                if i + 1 < len(lines):

                    candidate = lines[i + 1].strip()

                    if re.search(
                        r"[$€£₹]|\d",
                        candidate
                    ):

                        budget = candidate

                if budget != "Not specified":
                    break

    # Look for currency ranges anywhere
    if budget == "Not specified":

        for line in lines:

            if re.search(
                r"[$€£₹]\s*[\d,]+",
                line
            ):

                if re.search(
                    r"(?:budget|cost|price|funding|investment)",
                    line,
                    re.IGNORECASE
                ):

                    budget = line.strip()
                    break

    # General budget range fallback
    if budget == "Not specified":

        for line in lines:

            if re.search(
                r"[$€£₹]\s*[\d,]+.*(?:-|to).*[$€£₹]?\s*[\d,]+",
                line,
                re.IGNORECASE
            ):

                budget = line.strip()
                break

    # --------------------------------------------------------
    # REQUIREMENTS
    # --------------------------------------------------------

    requirements = extract_section(
        lines,
        [
            r"^\d*\.?\s*Key Requirements$",
            r"^\d*\.?\s*Requirements$",
            r"^\d*\.?\s*Functional Requirements$",
            r"^\d*\.?\s*Project Requirements$",
        ],
        [
            r"^\d*\.?\s*Technical Requirements",
            r"^\d*\.?\s*Technical Specifications",
            r"^\d*\.?\s*Security",
            r"^\d*\.?\s*Accessibility",
            r"^\d*\.?\s*Implementation",
            r"^\d*\.?\s*Timeline",
            r"^\d*\.?\s*Budget",
            r"^\d*\.?\s*Evaluation",
            r"^\d*\.?\s*Proposal Response",
        ]
    )

    requirements = extract_bullets(
        requirements
    )

    # --------------------------------------------------------
    # TECHNICAL REQUIREMENTS
    # --------------------------------------------------------

    technical_requirements = extract_section(
        lines,
        [
            r"^\d*\.?\s*Technical Requirements$",
            r"^\d*\.?\s*Technical Requirements",
            r"^\d*\.?\s*Technical Specifications$",
            r"^\d*\.?\s*Technical Specifications",
        ],
        [
            r"^\d*\.?\s*Security",
            r"^\d*\.?\s*Accessibility",
            r"^\d*\.?\s*Implementation",
            r"^\d*\.?\s*Timeline",
            r"^\d*\.?\s*Budget",
            r"^\d*\.?\s*Evaluation",
            r"^\d*\.?\s*Proposal Response",
        ]
    )

    technical_requirements = extract_bullets(
        technical_requirements
    )

    # --------------------------------------------------------
    # SECURITY / ACCESSIBILITY
    # --------------------------------------------------------

    special_requirements = extract_section(
        lines,
        [
            r"^\d*\.?\s*Security",
            r"^\d*\.?\s*Security, Accessibility",
            r"^\d*\.?\s*Security and Compliance",
            r"^\d*\.?\s*Accessibility",
        ],
        [
            r"^\d*\.?\s*Implementation",
            r"^\d*\.?\s*Timeline",
            r"^\d*\.?\s*Budget",
            r"^\d*\.?\s*Evaluation",
            r"^\d*\.?\s*Proposal Response",
        ]
    )

    special_requirements = extract_bullets(
        special_requirements
    )

    for item in special_requirements:

        if item not in technical_requirements:

            technical_requirements.append(
                item
            )

    # --------------------------------------------------------
    # EVALUATION CRITERIA
    # --------------------------------------------------------

    evaluation_criteria = extract_section(
        lines,
        [
            r"^\d*\.?\s*Evaluation Criteria$",
            r"^\d*\.?\s*Evaluation Criteria",
            r"^\d*\.?\s*Selection Criteria$",
            r"^\d*\.?\s*Selection Criteria",
        ],
        [
            r"^\d*\.?\s*Proposal Response",
            r"^\d*\.?\s*Expected Outcome",
            r"^\d*\.?\s*Submission",
        ]
    )

    evaluation_criteria = extract_bullets(
        evaluation_criteria
    )

    # --------------------------------------------------------
    # FALLBACK REQUIREMENTS
    # --------------------------------------------------------

    if not requirements:

        candidates = []

        for line in lines:

            if re.match(
                r"^[-•*]",
                line
            ):

                cleaned = re.sub(
                    r"^[-•*]\s*",
                    "",
                    line
                )

                if len(cleaned) > 5:
                    candidates.append(
                        cleaned
                    )

        requirements = candidates[:15]

    # --------------------------------------------------------
    # RETURN PROFILE
    # --------------------------------------------------------

    return RequirementProfile(
        client_name=client,
        project_name=project,
        timeline=timeline,
        budget=budget,
        requirements=requirements,
        technical_requirements=technical_requirements,
        evaluation_criteria=evaluation_criteria,
        scope=full_text[:12000]
    )


# ============================================================
# PROPOSAL MARKDOWN
# ============================================================

def proposal_markdown(
    profile: RequirementProfile
):

    requirements = "\n".join(
        f"- {x}"
        for x in profile.requirements
    )

    technical = "\n".join(
        f"- {x}"
        for x in profile.technical_requirements
    )

    evaluation = "\n".join(
        f"- {x}"
        for x in profile.evaluation_criteria
    )

    if not requirements:
        requirements = "- Requirements to be confirmed from the RFP."

    if not technical:
        technical = "- Technical requirements to be confirmed from the RFP."

    if not evaluation:
        evaluation = "- Evaluation criteria to be confirmed from the RFP."

    return f"""
# Proposal

## Executive Summary

We propose a tailored solution for **{profile.client_name}**
for the **{profile.project_name}** project.

## Understanding of Requirements

{requirements}

## Technical Approach

{technical}

## Implementation Timeline

{profile.timeline}

## Budget

{profile.budget}

## Evaluation Criteria

{evaluation}

## Proposed Solution

Our approach will focus on delivering a secure, scalable,
accessible and measurable solution aligned with the client's
requirements.

## Security & Compliance

The solution will incorporate appropriate authentication,
authorization, encryption, audit logging and security testing.

## Why Us

Our proposal is informed by historical proposal outcomes
and lessons learned from previous engagements.
"""