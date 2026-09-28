from core import RequirementProfile


def generate_proposal(
    profile: RequirementProfile,
    memories=None
):

    memories = memories or []

    if not memories:

        return (
            generate_generic_proposal(profile),
            "Generated from the RFP without historical memory."
        )

    wins = [
        m for m in memories
        if str(
            m.get("outcome", "")
        ).lower() == "won"
    ]

    losses = [
        m for m in memories
        if str(
            m.get("outcome", "")
        ).lower() == "lost"
    ]

    lessons = [
        m.get("lessons", "")
        for m in memories
        if m.get("lessons")
    ]

    # --------------------------------------------------------
    # REQUIREMENTS
    # --------------------------------------------------------

    requirements = "\n".join(
        f"- {item}"
        for item in profile.requirements
    )

    technical = "\n".join(
        f"- {item}"
        for item in profile.technical_requirements
    )

    evaluation = "\n".join(
        f"- {item}"
        for item in profile.evaluation_criteria
    )

    # --------------------------------------------------------
    # MEMORY LESSONS
    # --------------------------------------------------------

    lesson_text = ""

    for lesson in lessons[:5]:

        lesson_text += (
            f"- {lesson}\n"
        )

    if not lesson_text:

        lesson_text = (
            "- No specific historical lessons were retrieved.\n"
        )

    # --------------------------------------------------------
    # DOMAIN-NEUTRAL MEMORY-INFORMED PROPOSAL
    # --------------------------------------------------------

    proposal = f"""
# Proposal

## Executive Summary

We propose a tailored solution for **{profile.client_name}**
for the **{profile.project_name}** project.

This proposal has been informed by relevant historical
proposal outcomes, including previous wins, losses,
approaches and lessons learned.

The approach prioritizes:

- Clear alignment with the client's requirements
- Explicit ownership of critical risks
- Relevant technical architecture
- Measurable implementation milestones
- Phased delivery where appropriate
- Validation before production deployment
- Clear business or operational outcomes

## Understanding of Requirements

The proposed solution addresses:

{requirements}

## Technical Approach

The solution will incorporate:

{technical}

## Security, Risk & Compliance

The proposal will explicitly identify responsibilities
for security, data protection, access control, monitoring,
testing and operational risk according to the needs of
the project.

Critical controls will be mapped to relevant requirements
rather than described only through generic statements.

## Accessibility & User Experience

Where applicable, accessibility and usability will be
treated as measurable implementation requirements.

The implementation will include appropriate validation,
testing and user acceptance activities.

## Implementation Plan

### Phase 1 — Discovery

Confirm business requirements, stakeholders,
dependencies, risks and success criteria.

### Phase 2 — Architecture & Design

Define the solution architecture, integrations,
security model, user workflows and delivery plan.

### Phase 3 — Development

Develop the required platform capabilities and
integrations identified in the RFP.

### Phase 4 — Integration & Testing

Perform integration testing, security validation,
user acceptance testing and requirement verification.

### Phase 5 — Pilot / Initial Deployment

Deploy a controlled release where appropriate,
collect feedback and validate operational readiness.

### Phase 6 — Production & Support

Complete production deployment, monitoring,
documentation and post-launch support.

## Timeline

{profile.timeline}

## Budget

{profile.budget}

## Evaluation Criteria

{evaluation}

## Historical Learning Applied

ProposalIQ retrieved:

- {len(wins)} successful historical proposal outcomes
- {len(losses)} unsuccessful historical proposal outcomes

The following lessons were identified from previous
proposal experiences:

{lesson_text}

The proposal deliberately incorporates these lessons
while avoiding approaches associated with previous
unsuccessful outcomes.

## Why This Approach

Rather than treating every RFP as a completely new
problem, ProposalIQ uses organizational proposal memory
to identify relevant patterns from previous engagements.

The resulting proposal is adapted to the current
client, project, requirements and evaluation criteria.

## Why Us

Our approach combines the requirements of the current
RFP with lessons learned from previous proposal outcomes,
creating a proposal that is informed by organizational
experience rather than generated from the RFP alone.
"""

    return (
        proposal,
        "Generated using Hindsight-recalled proposal memories."
    )


# ============================================================
# GENERIC PROPOSAL
# ============================================================

def generate_generic_proposal(
    profile: RequirementProfile
):

    requirements = "\n".join(
        f"- {item}"
        for item in profile.requirements
    )

    technical = "\n".join(
        f"- {item}"
        for item in profile.technical_requirements
    )

    evaluation = "\n".join(
        f"- {item}"
        for item in profile.evaluation_criteria
    )

    proposal = f"""
# Proposal

## Executive Summary

We propose a tailored solution for **{profile.client_name}**
for the **{profile.project_name}** project.

The proposed approach is based directly on the requirements
and evaluation criteria described in the RFP.

## Understanding of Requirements

{requirements}

## Technical Approach

The solution will incorporate:

{technical}

## Implementation Timeline

{profile.timeline}

## Budget

{profile.budget}

## Evaluation Criteria

{evaluation}

## Proposed Solution

Our approach will focus on delivering a secure, scalable,
usable and measurable solution aligned with the client's
requirements.

## Security & Compliance

The solution will incorporate appropriate authentication,
authorization, data protection, testing, monitoring and
audit controls based on the requirements of the project.

## Implementation

The implementation will include discovery, architecture,
development, integration, testing, deployment and
post-launch support.

## Why Us

Our proposal is aligned with the requirements,
technical expectations and evaluation criteria
specified in the RFP.
"""

    return proposal
