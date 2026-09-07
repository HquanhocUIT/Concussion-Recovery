"""Provider selection and JSON parsing for the shared LLM client."""

import httpx
import pytest

from app.orchestrator import llm_client
from app.orchestrator.llm_client import (
    LlmUnavailable,
    complete_json,
    resolve_provider,
)


@pytest.fixture(autouse=True)
def _reset_model_cache():
    """The discovered Gemini model is cached per process; isolate each test."""
    llm_client._resolved_gemini_model = None
    yield
    llm_client._resolved_gemini_model = None


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
    # Discovery is a network call; stub it so the test stays offline.
    monkeypatch.setattr(llm_client, "list_gemini_models", lambda key: [])

    provider, key, model = resolve_provider()

    assert provider == "gemini"
    assert key == "test-key"
    assert model.startswith("gemini")


def test_an_explicit_model_the_key_can_call_is_honoured(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.5-pro")
    monkeypatch.setattr(
        llm_client, "list_gemini_models", lambda key: ["gemini-2.5-flash", "gemini-2.5-pro"]
    )

    assert resolve_provider()[2] == "gemini-2.5-pro"


def test_an_explicit_model_is_trusted_when_the_listing_is_unavailable(monkeypatch):
    """The caller may know something an unreadable listing does not."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-private-preview")
    monkeypatch.setattr(llm_client, "list_gemini_models", lambda key: [])

    assert resolve_provider()[2] == "gemini-private-preview"


def test_a_stale_pinned_model_is_replaced_not_obeyed(monkeypatch):
    """Regression: a stale GEMINI_MODEL kept the integration broken.

    render.yaml pinned gemini-2.0-flash, the deployment kept its own copy of
    that variable after the blueprint stopped setting it, and every request
    404'd while the assistant silently quoted guideline text instead. An
    explicit value must not outrank what the key can actually call.
    """
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.0-flash")
    monkeypatch.setattr(
        llm_client,
        "list_gemini_models",
        lambda key: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3-flash-preview"],
    )

    model = resolve_provider()[2]

    assert model == "gemini-2.5-flash"
    assert model != "gemini-2.0-flash"


def test_a_model_the_key_cannot_call_is_not_selected(monkeypatch):
    """Regression: a hardcoded default returned 404 in production.

    /health/composer reported gemini-2.0-flash as
    "404 Not Found ... :generateContent" while the key itself was valid, so
    the model must come from what the key can actually call.
    """
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    monkeypatch.setattr(
        llm_client, "list_gemini_models", lambda key: ["gemini-1.5-flash", "gemini-pro"]
    )

    model = resolve_provider()[2]

    assert model == "gemini-1.5-flash"
    assert model != "gemini-2.0-flash"


def test_picks_a_model_from_the_real_deployment_listing(monkeypatch):
    """The listing the production key actually returned.

    /health/composer reported 404 for gemini-2.0-flash while the key offered
    only 2.5-era models, so the selection must come from this list rather than
    from a name compiled into the client.
    """
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    monkeypatch.setattr(
        llm_client,
        "list_gemini_models",
        lambda key: [
            "antigravity-preview-05-2026",
            "deep-research-max-preview-04-2026",
            "gemini-2.5-computer-use-preview-10-2025",
            "gemini-2.5-flash",
            "gemini-2.5-flash-image",
            "gemini-2.5-flash-lite",
            "gemini-2.5-pro",
            "gemini-3-flash-preview",
        ],
    )

    model = resolve_provider()[2]

    assert model == "gemini-2.5-flash"
    assert model != "gemini-2.0-flash"


def test_an_unlisted_flash_model_is_preferred(monkeypatch):
    """None of the known names are offered, but a flash variant exists."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    monkeypatch.setattr(
        llm_client,
        "list_gemini_models",
        lambda key: ["gemini-9.9-pro-preview", "gemini-9.9-flash-preview"],
    )

    assert resolve_provider()[2] == "gemini-9.9-flash-preview"


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
