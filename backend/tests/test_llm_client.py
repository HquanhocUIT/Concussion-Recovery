"""Provider selection and JSON parsing for the shared LLM client."""

import httpx
import pytest

from app.orchestrator.llm_client import (
    LlmUnavailable,
    complete_json,
    resolve_provider,
)


def test_no_key_configured_reports_unavailable(monkeypatch):
    for name in ("ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"):
        monkeypatch.delenv(name, raising=False)

    assert resolve_provider() == ("", "", "")
    with pytest.raises(LlmUnavailable):
        complete_json("anything")


def test_gemini_key_alone_selects_gemini(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)

    provider, key, model = resolve_provider()

    assert provider == "gemini"
    assert key == "test-key"
    assert model.startswith("gemini")


def test_anthropic_wins_when_both_keys_are_set(monkeypatch):
    """Existing deployments that already set an Anthropic key keep working."""
    monkeypatch.setenv("ANTHROPIC_API_KEY", "a-key")
    monkeypatch.setenv("GEMINI_API_KEY", "g-key")

    assert resolve_provider()[0] == "anthropic"


def test_gemini_response_is_parsed_through_its_own_envelope(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    class _Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "candidates": [
                    {"content": {"parts": [{"text": '{"answer": "Rest first."}'}]}}
                ]
            }

    monkeypatch.setattr(httpx, "post", lambda *a, **k: _Response())

    assert complete_json("prompt") == {"answer": "Rest first."}


def test_a_fenced_json_block_is_still_parsed(monkeypatch):
    """Models sometimes wrap JSON in a markdown fence despite being asked not to."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    fenced = "```json" + chr(10) + '{"answer": "Rest first."}' + chr(10) + "```"

    class _Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": fenced}]}}]}

    monkeypatch.setattr(httpx, "post", lambda *a, **k: _Response())

    assert complete_json("prompt") == {"answer": "Rest first."}
