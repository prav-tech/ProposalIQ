from core import RequirementProfile


def generate_proposal(
    profile: RequirementProfile,
    memories=None
):
    memories = memories or []

    if not memories:
        return (
            generate_generic_proposal(profile),
            "Generated solely from RFP text without organizational memory."
        )

    wins = [
        m for m in memories
        if str(m.get("outcome", "")).lower() in {"won", "win", "successful"}
    ]

    losses = [
        m for m in memories
        if str(m.get("outcome", "")).lower() in {"lost", "loss", "unsuccessful"}
    ]

    # Format requirements
    requirements_bullets = "\n".join(
        f"- **Req {i+1}:** {item}" for i, item in enumerate(profile.requirements)
    ) or "- Requirements extracted from RFP scope and deliverables."

    technical_bullets = "\n".join(
        f"- {item}" for item in profile.technical_requirements
    ) or "- Scalable enterprise microservices and secure API integration layer."

    evaluation_bullets = "\n".join(
        f"- {item}" for item in profile.evaluation_criteria
    ) or "- Alignment with technical specifications, delivery timeline, and total cost of ownership."

    # Highlighted memory lessons
    winning_lessons = [
        f"• **[{w.get('id', 'WIN')} - {w.get('client', 'Client')}]:** {w.get('lessons', 'Proven approach applied.')}"
        for w in wins[:3]
    ]
    winning_lessons_str = "\n".join(winning_lessons) if winning_lessons else "• Standard high-velocity delivery structure."

    loss_lessons = [
        f"• **[AVOIDED - {l.get('id', 'LOSS')} {l.get('client', '')}]:** {l.get('lessons', 'Generic framing avoided.')}"
        for l in losses[:2]
    ]
    loss_lessons_str = "\n".join(loss_lessons) if loss_lessons else "• Avoid unverified SLAs or ambiguous timeline milestones."

    # Identify dominant industry/patterns
    industry = "Enterprise"
    if any("health" in str(m.get("industry", "")).lower() for m in memories) or "health" in profile.client_name.lower():
        industry = "Healthcare"
    elif any("bank" in str(m.get("industry", "")).lower() for m in memories) or "bank" in profile.client_name.lower():
        industry = "Banking & FinTech"
    elif any("gov" in str(m.get("industry", "")).lower() for m in memories):
        industry = "Public Sector"

    # Specific elements derived from winning memories
    pilot_text = (
        "Structured 6-week Phase 1 Production Pilot with defined success metrics before general rollout "
        "(modeled on successful delivery frameworks from " + (wins[0].get('client') if wins else 'NorthStar Health') + ")."
    )

    security_ownership = (
        "Explicit Dedicated Security & Compliance Lead assigned directly to project governance, "
        "providing signed bi-weekly audit attestations and SOC2/ISO-27001 mapping to satisfy evaluation criteria."
    )

    proposal = f"""# Proposal: {profile.project_name}
**Prepared for:** {profile.client_name}  
**Prepared by:** ProposalIQ Intelligent Bid Desk  
**Status:** Memory-Informed Proposal (Powered by Hindsight Cloud)  

---

## Executive Summary

ProposalIQ is pleased to submit this comprehensive proposal to **{profile.client_name}** for the **{profile.project_name}** initiative.

Unlike standard boilerplate AI proposals that merely regurgitate RFP prompt text, this proposal is directly calibrated by **{len(memories)} historical proposal outcomes** stored within our organizational Hindsight memory bank. By combining our direct understanding of your requirements with empirical lessons from {len(wins)} winning engagements and critical risk lessons from {len(losses)} previous evaluations, we provide an execution plan that maximizes technical feasibility, organizational adoption, and contractual certainty.

Our core delivery commitment is built on three pillars:
1. **Verifiable Risk Ownership:** Clear operational assignment for compliance, security, and SLAs.
2. **De-risked Pilot Rollout:** A controlled, metric-driven pilot phase prior to broad organizational cutover.
3. **Outcome-Tied Milestones:** Transparent milestone checkpoints mapped directly to client evaluation criteria.

---

## Understanding of RFP & Business Objectives

{profile.client_name} requires a robust, scalable, and secure implementation that achieves the following core business requirements:

{requirements_bullets}

### Scope Alignment
The target scope encompasses the delivery of an end-to-end platform tailored for {industry} standards, integrating legacy systems with modern cloud infrastructure while maintaining uninterrupted service continuity.

---

## Technical Approach & Architecture

Our proposed technical architecture is structured around modular, resilient microservices with strict separation of concerns:

{technical_bullets}

### Key Architectural Safeguards
- **Zero-Trust API Gateway:** Mutual TLS (mTLS), token-based authorization, and real-time anomaly detection.
- **Failover & Resilience:** Multi-zone high-availability deployment with automated health probing and recovery.
- **Data Governance:** Granular role-based access control (RBAC), end-to-end payload encryption at rest (AES-256) and in transit (TLS 1.3).
- **Audit Logging:** Immutable append-only audit trail designed for regulatory inspection and compliance reporting.

---

## Security, Risk & Compliance

*Informed by organizational memory: Financial and enterprise clients heavily reward explicit security ownership rather than passive compliance bullet points.*

- **Named Security Ownership:** {security_ownership}
- **Compliance Mapping:** Direct matrix cross-referencing all RFP security requirements with third-party verified SOC2 Type II, ISO/IEC 27001, and regional data protection regulations.
- **Vulnerability Testing:** Independent static (SAST) and dynamic (DAST) penetration testing conducted prior to every release gate.

---

## Implementation Plan & Phased Delivery

To ensure seamless operational continuity, we propose a proven 5-stage deployment framework:

```
[Phase 1: Discovery & Architecture] ➔ [Phase 2: Pilot Environment] ➔ [Phase 3: Integration & Testing] ➔ [Phase 4: Phased Cutover] ➔ [Phase 5: Managed Handover]
        Weeks 1-3                          Weeks 4-7                          Weeks 8-11                          Weeks 12-14                     Ongoing
```

- **Phase 1 — Discovery & Governance (Weeks 1–3):** Stakeholder alignment, detailed interface specifications, and risk mitigation baseline.
- **Phase 2 — Pilot Environment Deployment (Weeks 4–7):** {pilot_text}
- **Phase 3 — Core Integration & Security Audit (Weeks 8–11):** Backend service integration, stress testing under peak load, and full security signoff.
- **Phase 4 — Phased Production Rollout (Weeks 12–14):** Incremental traffic migration with real-time canary monitoring and rollback triggers.
- **Phase 5 — Post-Launch Knowledge Transfer (Ongoing):** Comprehensive documentation, operator training workshops, and SLA-backed support.

---

## Timeline & Delivery Schedule

- **Projected Duration:** {profile.timeline}
- **Key Milestones:**
  - Milestone 1: Architecture Signoff & Security Plan
  - Milestone 2: Functional Pilot Environment Demonstration
  - Milestone 3: End-to-End User Acceptance Testing (UAT)
  - Milestone 4: Production Go-Live & Service Validation

---

## Budget & Commercial Model

- **Budget Target:** {profile.budget}
- **Commercial Structure:** Fixed-price milestone delivery tied directly to verifiable acceptance criteria. No hidden change requests for baseline RFP requirements.

---

## Evaluation Criteria Alignment

We directly map our delivery plan to {profile.client_name}'s stated evaluation criteria:

{evaluation_bullets}

Every milestone includes pre-agreed evaluation checkpoints ensuring full transparency and compliance before sign-off.

---

## What ProposalIQ Learned (Hindsight Memory Applied)

ProposalIQ retrieved **{len(memories)} relevant organizational memories** from our persistent Hindsight memory bank:

### Winning Patterns Injected ({len(wins)} successful engagements)
{winning_lessons_str}

### Costly Mistakes Prevented ({len(losses)} avoided pitfalls)
{loss_lessons_str}

*Critical Takeaway:* Previous proposals revealed that enterprise evaluators penalize vague generalities (such as "we adhere to highest industry standards"). We have substituted all generic assertions with concrete governance ownership, measurable acceptance metrics, and an active pilot structure.

---

## Evidence to Include Before Submission

Before final package submission to {profile.client_name}, the bid team should attach the following verified artifacts:
1. **Executive SLA & Security Owner Attestation:** Signed by the designated Security Lead.
2. **Third-Party SOC2 Type II & Penetration Test Executive Summary.**
3. **Reference Case Study:** Similar {industry} implementation with documented ROI and timeline adherence.
4. **Architecture Blueprint:** Detailed data flow diagram showcasing integration boundaries and encryption points.

---

## Proposal Strategy & Win Differentiation

- **Sharp Product Insight:** Generic AI tools only parrot the prompt. ProposalIQ is differentiated by remembering **what actually wins** and **why previous bids were lost**.
- **Loss-Prevention Guardrail:** The CivicWorks and ShopSphere loss memories demonstrated that lack of explicit accessibility proof and generic compliance language were primary disqualifiers. This proposal directly neutralizes those evaluation risks.
- **Client Preference Alignment:** Tailored specifically for {profile.client_name}'s operational scale, timeline ({profile.timeline}), and budget expectations.
"""
    return (
        proposal,
        f"Generated using Hindsight-recalled proposal memories ({len(wins)} wins, {len(losses)} losses)."
    )


def generate_generic_proposal(profile: RequirementProfile):
    requirements_bullets = "\n".join(
        f"- {item}" for item in profile.requirements
    ) or "- Standard functional requirements as listed in RFP."

    technical_bullets = "\n".join(
        f"- {item}" for item in profile.technical_requirements
    ) or "- Standard cloud-based architecture."

    evaluation_bullets = "\n".join(
        f"- {item}" for item in profile.evaluation_criteria
    ) or "- Evaluation based on cost and compliance."

    proposal = f"""# Proposal: {profile.project_name}
**Prepared for:** {profile.client_name}  
**Prepared by:** Bid Desk (Baseline Proposal — No Memory)  

---

## Executive Summary

We are pleased to submit this proposal to **{profile.client_name}** for the **{profile.project_name}** project.

Our proposed approach is based directly on the requirements and specifications detailed in the RFP documentation provided. We intend to deliver a high-quality solution that meets the expectations of your organization within the required timeframe.

---

## Understanding of Requirements

Our understanding of the project is based on the following RFP requirements:

{requirements_bullets}

---

## Technical Approach

We will deliver a modern web and cloud platform incorporating:

{technical_bullets}

---

## Security & Compliance

The solution will incorporate standard security best practices, including user authentication, data encryption, and access controls as required by industry standards.

---

## Implementation Plan

1. **Discovery:** Review project documentation and confirm deliverables.
2. **Design:** Create user interface designs and technical schemas.
3. **Development:** Build the application features according to requirements.
4. **Testing:** Conduct quality assurance and bug fixing.
5. **Deployment:** Deploy the system to the production environment.

---

## Timeline

- **Estimated Timeline:** {profile.timeline}

---

## Budget

- **Project Budget:** {profile.budget}

---

## Evaluation Criteria

We aim to satisfy all criteria mentioned in the RFP:

{evaluation_bullets}

---

## Why Us

We provide professional engineering services aligned with the requirements specified in your request for proposal.
"""
    return proposal
