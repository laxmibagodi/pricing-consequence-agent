"""
test_classification.py — unit tests for proposal classification.

Tests the _classify_proposal() function and the full respond_to_proposal()
pipeline behaviour for:
  - valid proposals          → proceed to recall
  - vague proposals          → needs_clarification (no "new experiment" text)
  - out-of-scope proposals   → out_of_scope

Run with:
    pytest backend/test_classification.py -v

These tests mock Groq so they never hit the live API.
"""

import sys
import os
from unittest.mock import patch, MagicMock

# Make backend importable from the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))

import pytest

# ---------------------------------------------------------------------------
# Import after path fix
# ---------------------------------------------------------------------------
from backend import agent
from backend.agent import (
    _classify_proposal,
    _clarification_response,
    STATUS_VALID,
    STATUS_NEEDS_CLARIFICATION,
    STATUS_OUT_OF_SCOPE,
    AgentResponse,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_llm_classify(result: str):
    """Return a context manager that makes llm_client.complete return result."""
    return patch("backend.agent.llm_client.complete", return_value=result)


def _mock_memory_empty():
    """Return a context manager that makes both recall_similar calls return []."""
    return patch("backend.agent.memory.recall_similar", return_value=[])


def _mock_memory_error():
    from backend import memory as mem_module
    return patch(
        "backend.agent.memory.recall_similar",
        side_effect=mem_module.MemoryServiceError("test error"),
    )


# ---------------------------------------------------------------------------
# _classify_proposal unit tests
# ---------------------------------------------------------------------------

class TestClassifyProposal:

    def test_valid_explicit_discount(self):
        with _mock_llm_classify("valid"):
            result = _classify_proposal("Offer a 20% discount to new enterprise customers.")
        assert result == STATUS_VALID

    def test_valid_free_trial(self):
        with _mock_llm_classify("valid"):
            result = _classify_proposal("Introduce a 14-day free trial for the Pro plan.")
        assert result == STATUS_VALID

    def test_valid_price_increase(self):
        with _mock_llm_classify("valid"):
            result = _classify_proposal("Increase the annual subscription price by 10%.")
        assert result == STATUS_VALID

    def test_vague_better_deal(self):
        with _mock_llm_classify("needs_clarification"):
            result = _classify_proposal("Give customers a better deal.")
        assert result == STATUS_NEEDS_CLARIFICATION

    def test_vague_change_pricing(self):
        with _mock_llm_classify("needs_clarification"):
            result = _classify_proposal("Change our pricing.")
        assert result == STATUS_NEEDS_CLARIFICATION

    def test_vague_make_cheaper(self):
        with _mock_llm_classify("needs_clarification"):
            result = _classify_proposal("Make the plan cheaper.")
        assert result == STATUS_NEEDS_CLARIFICATION

    def test_out_of_scope_hire(self):
        with _mock_llm_classify("out_of_scope"):
            result = _classify_proposal("Hire 10 developers.")
        assert result == STATUS_OUT_OF_SCOPE

    def test_out_of_scope_marketing(self):
        with _mock_llm_classify("out_of_scope"):
            result = _classify_proposal("Launch a social media campaign.")
        assert result == STATUS_OUT_OF_SCOPE

    def test_groq_failure_defaults_to_valid(self):
        """If Groq is down, classification falls back to valid so analysis proceeds."""
        from backend.llm_client import GroqError
        with patch("backend.agent.llm_client.complete", side_effect=GroqError("timeout")):
            result = _classify_proposal("Some pricing proposal")
        assert result == STATUS_VALID

    def test_unexpected_groq_output_defaults_to_valid(self):
        """Unexpected text from Groq should default to valid (safe fallback)."""
        with _mock_llm_classify("maybe"):
            result = _classify_proposal("Offer a discount to SMB customers.")
        assert result == STATUS_VALID


# ---------------------------------------------------------------------------
# _clarification_response unit tests
# ---------------------------------------------------------------------------

class TestClarificationResponse:

    def test_needs_clarification_response(self):
        resp = _clarification_response("Give customers a better deal.", STATUS_NEEDS_CLARIFICATION)
        assert resp.proposal_status == STATUS_NEEDS_CLARIFICATION
        assert resp.has_evidence is False
        assert resp.verdict == "no_precedent"
        assert resp.confidence == 0.0
        assert len(resp.evidence) == 0
        # Must contain a call-to-action — not the "new experiment" message
        assert "new experiment" not in resp.response.lower()
        assert "clarify" in resp.response.lower() or "pricing" in resp.response.lower()

    def test_out_of_scope_response(self):
        resp = _clarification_response("Hire 10 developers.", STATUS_OUT_OF_SCOPE)
        assert resp.proposal_status == STATUS_OUT_OF_SCOPE
        assert resp.has_evidence is False
        assert "pricing" in resp.response.lower()
        assert "new experiment" not in resp.response.lower()


# ---------------------------------------------------------------------------
# respond_to_proposal integration tests (mocked)
# ---------------------------------------------------------------------------

class TestRespondToProposal:

    # ---- Test 1: valid proposal → proceeds to recall ---------

    def test_valid_proposal_reaches_recall(self):
        with (
            _mock_llm_classify("valid"),
            patch("backend.agent.memory.recall_similar", return_value=[]) as mock_recall,
        ):
            result = agent.respond_to_proposal(
                "Offer a 20% discount to new enterprise customers."
            )
        # Recall was called (went past classification)
        assert mock_recall.called
        assert result.proposal_status == STATUS_VALID

    # ---- Test 2: vague proposal → clarification, no recall ---

    def test_vague_proposal_skips_recall(self):
        with (
            _mock_llm_classify("needs_clarification"),
            patch("backend.agent.memory.recall_similar") as mock_recall,
        ):
            result = agent.respond_to_proposal("Give customers a better deal.")

        assert not mock_recall.called, "recall_similar must NOT be called for vague proposals"
        assert result.proposal_status == STATUS_NEEDS_CLARIFICATION
        assert result.has_evidence is False
        assert "new experiment" not in result.response.lower()

    # ---- Test 3: vague "change our pricing" ------------------

    def test_vague_change_pricing(self):
        with (
            _mock_llm_classify("needs_clarification"),
            patch("backend.agent.memory.recall_similar") as mock_recall,
        ):
            result = agent.respond_to_proposal("Change our pricing.")

        assert not mock_recall.called
        assert result.proposal_status == STATUS_NEEDS_CLARIFICATION
        assert "new experiment" not in result.response.lower()

    # ---- Test 4: out-of-scope "hire developers" --------------

    def test_out_of_scope_hire(self):
        with (
            _mock_llm_classify("out_of_scope"),
            patch("backend.agent.memory.recall_similar") as mock_recall,
        ):
            result = agent.respond_to_proposal("Hire 10 developers.")

        assert not mock_recall.called
        assert result.proposal_status == STATUS_OUT_OF_SCOPE
        assert "new experiment" not in result.response.lower()

    # ---- Test 5: out-of-scope "marketing campaign" -----------

    def test_out_of_scope_marketing(self):
        with (
            _mock_llm_classify("out_of_scope"),
            patch("backend.agent.memory.recall_similar") as mock_recall,
        ):
            result = agent.respond_to_proposal("Launch a social media campaign.")

        assert not mock_recall.called
        assert result.proposal_status == STATUS_OUT_OF_SCOPE

    # ---- Test 6: valid proposal, no evidence → new experiment OK -

    def test_valid_no_evidence_is_new_experiment(self):
        """
        A valid pricing proposal with zero matching evidence should return
        proposal_status=valid and mention "new experiment" (that's correct).
        """
        with (
            _mock_llm_classify("valid"),
            _mock_memory_empty(),
            patch("agent.memory.reflect_pattern", return_value={"summary": "", "evidence": []}),
        ):
            result = agent.respond_to_proposal(
                "Offer a 37% discount to customers in a newly defined segment."
            )

        assert result.proposal_status == STATUS_VALID
        assert result.has_evidence is False
        assert result.verdict == "no_precedent"
        # For a valid proposal with no evidence "new experiment" is correct
        assert "experiment" in result.response.lower() or "evidence" in result.response.lower()

    # ---- Edge: proposal too short → ProposalError (400) ------

    def test_too_short_raises_proposal_error(self):
        with pytest.raises(agent.ProposalError):
            agent.respond_to_proposal("hi")

    # ---- Edge: memory unavailable → MemoryUnavailableError ---

    def test_memory_unavailable_raises(self):
        with (
            _mock_llm_classify("valid"),
            _mock_memory_error(),
        ):
            with pytest.raises(agent.MemoryUnavailableError):
                agent.respond_to_proposal(
                    "Offer a 20% discount to new enterprise customers."
                )
