from __future__ import annotations

from io import BytesIO

import streamlit as st
from dotenv import load_dotenv
from pypdf import PdfReader

from core import RequirementProfile, extract_profile
from memory import recall, seed_hindsight, hindsight_configured
from generation import generate_proposal


load_dotenv()


st.set_page_config(
    page_title="ProposalIQ",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)


# -----------------------------
# Styling
# -----------------------------

st.markdown(
    """
    <style>
    .block-container {
        max-width: 1280px;
        padding-top: 2rem;
        padding-bottom: 4rem;
    }

    .hero {
        padding: 0.5rem 0 1.5rem 0;
    }

    .hero-title {
        font-size: 3rem;
        font-weight: 750;
        letter-spacing: -0.04em;
        margin-bottom: 0.25rem;
    }

    .hero-subtitle {
        font-size: 1.15rem;
        color: #667085;
        max-width: 760px;
        line-height: 1.6;
    }

    .section-label {
        color: #6c63ff;
        font-size: 0.78rem;
        font-weight: 750;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 0.25rem;
    }

    .section-title {
        font-size: 1.7rem;
        font-weight: 700;
        margin-bottom: 0.8rem;
    }

    .brief-card {
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 1rem 1.1rem;
        background: #ffffff;
        min-height: 105px;
    }

    .brief-label {
        font-size: 0.75rem;
        color: #667085;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
    }

    .brief-value {
        font-size: 1.02rem;
        font-weight: 650;
        margin-top: 0.35rem;
        line-height: 1.4;
    }

    .memory-summary {
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 1rem;
        background: #fafafa;
    }

    .memory-kicker {
        font-size: 0.75rem;
        color: #667085;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
    }

    .memory-number {
        font-size: 1.8rem;
        font-weight: 750;
        margin-top: 0.2rem;
    }

    .memory-win {
        border-left: 4px solid #16a34a;
        background: #f6fff8;
        border-radius: 10px;
        padding: 0.9rem 1rem;
        margin: 0.6rem 0;
    }

    .memory-loss {
        border-left: 4px solid #dc2626;
        background: #fff7f7;
        border-radius: 10px;
        padding: 0.9rem 1rem;
        margin: 0.6rem 0;
    }

    .learning-step {
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 1rem;
        min-height: 145px;
        background: #ffffff;
    }

    .learning-number {
        font-size: 0.75rem;
        color: #6c63ff;
        font-weight: 800;
        letter-spacing: 0.08em;
    }

    .learning-title {
        font-size: 1.05rem;
        font-weight: 700;
        margin: 0.35rem 0;
    }

    .learning-text {
        color: #667085;
        line-height: 1.5;
        font-size: 0.92rem;
    }

    .proposal-box {
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 1rem 1.2rem;
        background: #ffffff;
        margin-top: 0.5rem;
    }

    [data-testid="stMetric"] {
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 0.8rem;
    }

    div[data-testid="stFileUploader"] {
        border-radius: 12px;
    }

    .sidebar-title {
        font-weight: 750;
        font-size: 1.15rem;
        margin-bottom: 0.5rem;
    }

    .small-muted {
        color: #667085;
        font-size: 0.85rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# -----------------------------
# Session state
# -----------------------------

if "profile" not in st.session_state:
    st.session_state.profile = None

if "memories" not in st.session_state:
    st.session_state.memories = []

if "memory_source" not in st.session_state:
    st.session_state.memory_source = ""

if "generic" not in st.session_state:
    st.session_state.generic = None

if "informed" not in st.session_state:
    st.session_state.informed = None

if "source_name" not in st.session_state:
    st.session_state.source_name = ""


# -----------------------------
# Sidebar
# -----------------------------

with st.sidebar:

    st.markdown(
        '<div class="sidebar-title">ProposalIQ</div>',
        unsafe_allow_html=True,
    )

    st.caption("Proposal intelligence workspace")

    st.divider()

    st.markdown("### Workspace")

    st.markdown(
        """
        **New RFP**

        RFP Brief

        Proposal Workspace

        Institutional Memory
        """
    )

    st.divider()

    st.markdown("### Hindsight")

    if hindsight_configured():
        st.success("● Connected to Hindsight Cloud")
    else:
        st.info("● Local demo memory active")

    if st.button(
        "Seed / refresh live memory",
        use_container_width=True,
    ):
        ok, message = seed_hindsight()
        (st.success if ok else st.warning)(message)

    st.divider()

    st.markdown("### Demo flow")

    st.caption("1. Analyze an RFP")
    st.caption("2. Review the RFP brief")
    st.caption("3. Generate without memory")
    st.caption("4. Generate with Hindsight")
    st.caption("5. Show what was learned")


# -----------------------------
# Hero
# -----------------------------

st.markdown(
    """
    <div class="hero">
        <div class="hero-title">ProposalIQ 🧠</div>
        <div class="hero-subtitle">
            <strong>Turn every RFP into a smarter proposal.</strong><br>
            Proposal intelligence that remembers what worked, learns from outcomes,
            and improves every proposal.
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


if hindsight_configured():
    st.caption("● Hindsight memory connected")
else:
    st.caption("● Running with local demo memory")


# -----------------------------
# 01 Analyze RFP
# -----------------------------

st.markdown(
    '<div class="section-label">01 — INPUT</div>',
    unsafe_allow_html=True,
)

st.markdown(
    '<div class="section-title">Analyze a new RFP</div>',
    unsafe_allow_html=True,
)


uploaded = st.file_uploader(
    "Upload your RFP PDF",
    type=["pdf"],
    help="Text-based PDFs work best. Scanned PDFs need OCR before upload.",
)


# IMPORTANT:
# If a PDF is uploaded, do NOT show the default pasted RFP.
# The paste box only appears when there is no uploaded PDF.

if uploaded:

    st.success(f"✓ RFP loaded: {uploaded.name}")

    pasted = ""

else:

    pasted = st.text_area(
        "Or paste the RFP text",
        placeholder="Paste your RFP requirements here...",
        height=190,
    )


# -----------------------------
# Analyze button
# -----------------------------

if st.button(
    "Analyze RFP →",
    type="primary",
    use_container_width=True,
):

    try:

        if uploaded:

            reader = PdfReader(
                BytesIO(uploaded.getvalue())
            )

            text = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )

            st.session_state.source_name = uploaded.name

        else:

            text = pasted

            st.session_state.source_name = "Pasted RFP"

        if len(text.strip()) < 30:

            raise ValueError(
                "No usable text found. Try a text-based PDF "
                "or paste the RFP text."
            )

        st.session_state.profile = extract_profile(text)

        st.session_state.memories = []
        st.session_state.memory_source = ""
        st.session_state.generic = None
        st.session_state.informed = None

        st.success("RFP successfully analyzed.")

    except Exception as exc:

        st.error(
            f"Could not analyze the RFP: {exc}"
        )


profile: RequirementProfile | None = st.session_state.profile


# -----------------------------
# 02 RFP Brief
# -----------------------------

if profile:

    st.divider()

    st.markdown(
        '<div class="section-label">02 — UNDERSTAND</div>',
        unsafe_allow_html=True,
    )

    st.markdown(
        '<div class="section-title">RFP Brief</div>',
        unsafe_allow_html=True,
    )

    if st.session_state.source_name:

        st.caption(
            f"Source: {st.session_state.source_name}"
        )

    brief = st.columns(4)

    values = [
        (
            "Client",
            profile.client_name or "Not detected",
        ),
        (
            "Project",
            profile.project_name or "Not detected",
        ),
        (
            "Budget",
            profile.budget or "Not detected",
        ),
        (
            "Timeline",
            profile.timeline or "Not detected",
        ),
    ]

    for col, (label, value) in zip(brief, values):

        with col:

            st.markdown(
                f"""
                <div class="brief-card">
                    <div class="brief-label">{label}</div>
                    <div class="brief-value">{value}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.write("")

    req_col, tech_col = st.columns(2)

    with req_col:

        st.markdown("### Requirements")

        requirements = profile.requirements or []

        st.caption(
            f"{len(requirements)} requirements identified"
        )

        for i, item in enumerate(requirements, 1):

            st.markdown(
                f"**{i}.** {item}"
            )

    with tech_col:

        st.markdown("### Technical requirements")

        technical = (
            getattr(
                profile,
                "technical_requirements",
                [],
            )
            or []
        )

        st.caption(
            f"{len(technical)} technical requirements identified"
        )

        for i, item in enumerate(technical, 1):

            st.markdown(
                f"**{i}.** {item}"
            )

    evaluation = (
        getattr(
            profile,
            "evaluation_criteria",
            [],
        )
        or []
    )

    if evaluation:

        st.markdown("### Evaluation criteria")

        eval_cols = st.columns(
            min(
                3,
                max(
                    1,
                    len(evaluation),
                ),
            )
        )

        for i, item in enumerate(evaluation):

            with eval_cols[
                i % len(eval_cols)
            ]:

                st.markdown(
                    f"""
                    <div class="brief-card">
                        <div class="brief-label">
                            Criterion {i + 1}
                        </div>
                        <div class="brief-value">
                            {item}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

    with st.expander(
        "View extracted RFP data",
        expanded=False,
    ):

        st.json(
            profile.to_dict()
        )


    # -----------------------------
    # 03 Proposal generation
    # -----------------------------

    st.divider()

    st.markdown(
        '<div class="section-label">03 — BUILD</div>',
        unsafe_allow_html=True,
    )

    st.markdown(
        '<div class="section-title">Build the proposal</div>',
        unsafe_allow_html=True,
    )

    st.caption(
        "Compare a proposal generated only from the RFP "
        "with one shaped by previous proposal outcomes."
    )

    gen_left, gen_right = st.columns(2)

    with gen_left:

        st.markdown("### Without memory")

        st.caption(
            "Uses only the current RFP."
        )

        if st.button(
            "Generate generic proposal",
            use_container_width=True,
            key="generate_generic",
        ):

            (
                st.session_state.generic,
                _,
            ) = generate_proposal(profile)

            st.success(
                "Generic proposal generated."
            )

    with gen_right:

        st.markdown(
            "### ✦ With Hindsight memory"
        )

        st.caption(
            "Uses previous wins, losses, and lessons."
        )

        if st.button(
            "Generate with Hindsight",
            type="primary",
            use_container_width=True,
            key="generate_informed",
        ):

            recall_result = recall(profile)

            # Supports the current memory.py return shape
            # without changing the working Hindsight implementation.

            if isinstance(
                recall_result,
                tuple,
            ):

                memories = (
                    recall_result[0]
                    if len(recall_result) > 0
                    else []
                )

                source = (
                    recall_result[1]
                    if len(recall_result) > 1
                    else ""
                )

            else:

                memories = recall_result
                source = ""

            st.session_state.memories = memories
            st.session_state.memory_source = source

            (
                st.session_state.informed,
                _,
            ) = generate_proposal(
                profile,
                memories,
            )

            st.success(
                "Memory-informed proposal generated."
            )

    # -----------------------------
    # Proposal results
    # -----------------------------

    if (
        st.session_state.generic
        or st.session_state.informed
    ):

        st.write("")

        if st.session_state.generic:

            st.markdown(
                "### Generic proposal"
            )

            with st.container(
                border=True
            ):

                st.markdown(
                    st.session_state.generic
                )

            st.download_button(
                "Download generic proposal",
                st.session_state.generic,
                "proposal_without_memory.md",
                "text/markdown",
                key="download_generic",
            )

        if st.session_state.informed:

            st.markdown(
                "### ✦ Memory-informed proposal"
            )

            with st.container(
                border=True
            ):

                st.markdown(
                    st.session_state.informed
                )

            st.download_button(
                "Download memory-informed proposal",
                st.session_state.informed,
                "proposal_with_hindsight.md",
                "text/markdown",
                key="download_informed",
            )


    # -----------------------------
    # 04 Institutional memory
    # -----------------------------

    if st.session_state.memories:

        st.divider()

        st.markdown(
            '<div class="section-label">04 — MEMORY</div>',
            unsafe_allow_html=True,
        )

        st.markdown(
            '<div class="section-title">'
            'What ProposalIQ remembered'
            '</div>',
            unsafe_allow_html=True,
        )

        wins = [
            m
            for m in st.session_state.memories
            if str(
                m.get(
                    "outcome",
                    "",
                )
            ).lower()
            in {
                "won",
                "win",
                "successful",
            }
        ]

        losses = [
            m
            for m in st.session_state.memories
            if str(
                m.get(
                    "outcome",
                    "",
                )
            ).lower()
            in {
                "lost",
                "loss",
                "unsuccessful",
            }
        ]

        summary_cols = st.columns(3)

        with summary_cols[0]:

            st.markdown(
                f"""
                <div class="memory-summary">
                    <div class="memory-kicker">
                        Relevant memories
                    </div>
                    <div class="memory-number">
                        {len(st.session_state.memories)}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with summary_cols[1]:

            st.markdown(
                f"""
                <div class="memory-summary">
                    <div class="memory-kicker">
                        Successful
                    </div>
                    <div class="memory-number">
                        {len(wins)}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with summary_cols[2]:

            st.markdown(
                f"""
                <div class="memory-summary">
                    <div class="memory-kicker">
                        Unsuccessful
                    </div>
                    <div class="memory-number">
                        {len(losses)}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        if st.session_state.memory_source:

            st.caption(
                st.session_state.memory_source
            )

        for memory in st.session_state.memories:

            outcome = str(
                memory.get(
                    "outcome",
                    "",
                )
            ).lower()

            proposal_id = memory.get(
                "id",
                "Historical proposal",
            )

            client = memory.get(
                "client",
                "Unknown client",
            )

            project = memory.get(
                "project",
                "",
            )

            approach = memory.get(
                "approach",
                "",
            )

            lesson = (
                memory.get(
                    "lessons",
                    "",
                )
                or memory.get(
                    "lesson",
                    "",
                )
            )

            if outcome in {
                "lost",
                "loss",
                "unsuccessful",
            }:

                with st.container(
                    border=True
                ):

                    st.markdown(
                        f"### ✕ {proposal_id} · {client}"
                    )

                    st.caption(
                        f"{project} • Unsuccessful proposal"
                    )

                    if approach:

                        st.markdown(
                            "**What happened**"
                        )

                        st.write(
                            approach
                        )

                    if lesson:

                        st.markdown(
                            "**Lesson learned**"
                        )

                        st.write(
                            lesson
                        )

            else:

                with st.container(
                    border=True
                ):

                    st.markdown(
                        f"### ✓ {proposal_id} · {client}"
                    )

                    st.caption(
                        f"{project} • Successful proposal"
                    )

                    if approach:

                        st.markdown(
                            "**What worked**"
                        )

                        st.write(
                            approach
                        )

                    if lesson:

                        st.markdown(
                            "**Applied lesson**"
                        )

                        st.write(
                            lesson
                        )


        # -----------------------------
        # 05 Learning curve
        # -----------------------------

        st.divider()

        st.markdown(
            '<div class="section-label">05 — LEARNING</div>',
            unsafe_allow_html=True,
        )

        st.markdown(
            '<div class="section-title">'
            'ProposalIQ learns over time'
            '</div>',
            unsafe_allow_html=True,
        )

        st.caption(
            "The value of persistent memory grows as more "
            "proposal outcomes become part of the "
            "organization's knowledge."
        )

        learn_cols = st.columns(3)

        stages = [
            (
                "01",
                "First proposal",
                "Generic response",
                "No organizational proposal history "
                "is available yet.",
            ),
            (
                "02",
                "Several proposal cycles",
                "Personalized response",
                "Wins, losses, client patterns, and lessons "
                "begin shaping new drafts.",
            ),
            (
                "03",
                "Repeated use",
                "Institutional knowledge",
                "The agent can reuse accumulated proposal "
                "knowledge instead of starting over.",
            ),
        ]

        for col, (
            number,
            title,
            subtitle,
            text,
        ) in zip(
            learn_cols,
            stages,
        ):

            with col:

                st.markdown(
                    f"""<div class="learning-step">
<div class="learning-number">
        {number}
</div>
<div class="learning-title">
        {title}
</div>
<strong>
        {subtitle}
</strong>
<div class="learning-text">
      {text}
</div>
</div>""",
                    unsafe_allow_html=True,
                )

        st.write("")

        st.info(
            "Every proposal outcome can become memory "
            "for the next proposal — so ProposalIQ improves "
            "instead of resetting."
        )


# -----------------------------
# Footer
# -----------------------------

st.divider()

st.caption(
    "ProposalIQ • RFP intelligence powered by "
    "persistent Hindsight memory."
)