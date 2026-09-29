"""
api.py — HTTP layer between the frontend and the agent/memory functions.

Owned by: Prapthi (Agent & Backend Engineer)

Endpoints: POST /ask, POST /outcome, GET /history (+ GET /health)

This file never imports the Hindsight SDK. It only calls memory.py's
functions (retain_decision, get_history) and agent.respond_to_proposal.

Error policy: clients get short generic messages. Details (exception text,
Hindsight/Groq internals) go to the server log only.
"""

import logging
import re
from datetime import date
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from backend import memory
from backend.agent import AgentResponse, MemoryUnavailableError, ProposalError, respond_to_proposal
from backend.llm_client import GroqError

logger = logging.getLogger("pricing_api")

app = FastAPI(title="Pricing Consequence Agent API")

# Wide open for hackathon dev. Tighten before anything public-facing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- request/response models ----------

class AskRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    proposal: str = Field(..., min_length=1, max_length=2000)


class OutcomeRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    proposal: str = Field(..., min_length=1, max_length=2000)
    outcome: str = Field(..., min_length=1, max_length=2000)
    # Only stored if the caller explicitly provides them. Never inferred.
    revenue_impact: Optional[str] = None
    retention_impact: Optional[str] = None


class OutcomeResponse(BaseModel):
    status: str
    target_segment: str
    expected_effect: str
    date: str


class HistoryItem(BaseModel):
    pricing_change: str
    target_segment: str
    actual_effect: str
    date: str


class HistoryResponse(BaseModel):
    decisions: list[HistoryItem]


# ---------- deterministic extraction for /outcome (no LLM) ----------

_SEGMENT_PATTERNS = {
    "Enterprise": re.compile(r"\benterprise\b", re.I),
    "Mid-market": re.compile(r"\bmid[-\s]?market\b", re.I),
    "SMB": re.compile(r"\bsmb\b|\bsmall business(?:es)?\b", re.I),
}

_EXPECTATION_PATTERN = re.compile(
    r"(?:\bexpect(?:ing|ed|s)?\b|\baim(?:ing|s)?\s+to\b|\bhop(?:ing|es)\s+to\b|\bin order to\b|\bso that\b)"
    r"\s+(.+?)\s*(?:[.;]|$)",
    re.I,
)


def _extract_segment(proposal: str) -> str:
    """Explicit segment only. Zero matches or more than one -> 'unknown'."""
    found = [name for name, pat in _SEGMENT_PATTERNS.items() if pat.search(proposal)]
    return found[0] if len(found) == 1 else "unknown"


def _extract_expected_effect(proposal: str) -> str:
    """An explicitly stated expectation, if the proposal has one. Else 'unknown'."""
    m = _EXPECTATION_PATTERN.search(proposal)
    return m.group(1).strip() if m else "unknown"


# ---------- routes ----------

@app.post("/ask", response_model=AgentResponse)
def ask(req: AskRequest):
    try:
        return respond_to_proposal(req.proposal)
    except ProposalError as e:
        # Our own validation message is safe to show to the user.
        raise HTTPException(status_code=400, detail=str(e))
    except MemoryUnavailableError:
        logger.exception("Memory service failure during /ask")
        raise HTTPException(status_code=502, detail="The memory service is temporarily unavailable. Please try again.")
    except GroqError:
        logger.exception("Groq failure during /ask")
        raise HTTPException(status_code=503, detail="The reasoning service is temporarily unavailable. Please try again.")
    except Exception:
        logger.exception("Unexpected error during /ask")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")


@app.post("/outcome", response_model=OutcomeResponse)
def log_outcome(req: OutcomeRequest):
    decision = {
        "pricing_change": req.proposal,
        "target_segment": _extract_segment(req.proposal),
        "expected_effect": _extract_expected_effect(req.proposal),
        "actual_effect": req.outcome,
        "revenue_impact": req.revenue_impact,
        "retention_impact": req.retention_impact,
        "date": date.today().isoformat(),
    }

    try:
        memory.retain_decision(decision)
    except memory.MemoryServiceError:
        logger.exception("Memory service failure during /outcome")
        raise HTTPException(status_code=502, detail="Could not save the outcome to memory. Please try again.")
    except Exception:
        logger.exception("Unexpected error during /outcome")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    return OutcomeResponse(
        status="retained",
        target_segment=decision["target_segment"],
        expected_effect=decision["expected_effect"],
        date=decision["date"],
    )


@app.get("/history", response_model=HistoryResponse)
def history():
    try:
        items = memory.get_history()
    except memory.MemoryServiceError:
        logger.exception("Memory service failure during /history")
        raise HTTPException(status_code=502, detail="Could not load history from memory. Please try again.")
    except Exception:
        logger.exception("Unexpected error during /history")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")

    return HistoryResponse(decisions=[HistoryItem(**item) for item in items])


@app.get("/health")
def health():
    return {"status": "ok"}