"""Provider-agnostic JSON completion helper for the grounded composers.

Both composers only ever ask a model to reword evidence that has already
been retrieved and validated, so all either needs is "send this prompt,
get JSON back". Supporting Anthropic and Gemini behind one call keeps that
choice out of the composers themselves.

Provider is chosen from whichever key is configured, so a deployment sets
one environment variable and nothing else changes. With no key at all the
composers fall back to their deterministic templates.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

_DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5"
_DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"


class LlmUnavailable(RuntimeError):
    """No provider is configured, or the configured one could not be used."""


def resolve_provider() -> tuple[str, str, str]:
    """Return (provider, api_key, model) for whichever provider is configured.

    Anthropic wins if both keys are present, purely so behaviour does not
    change for a deployment that already set one.
    """

    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if anthropic_key:
        model = os.getenv("ANTHROPIC_MODEL", "").strip() or _DEFAULT_ANTHROPIC_MODEL
        return "anthropic", anthropic_key, model

    gemini_key = (os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")).strip()
    if gemini_key:
        model = os.getenv("GEMINI_MODEL", "").strip() or _DEFAULT_GEMINI_MODEL
        return "gemini", gemini_key, model

    return "", "", ""


def complete_json(prompt: str, *, max_tokens: int = 500, timeout: float = 30.0) -> dict[str, Any]:
    """Send `prompt` to the configured provider and parse the JSON it returns.

    Raises LlmUnavailable when nothing is configured. Transport and parsing
    errors propagate as httpx/ValueError for callers to fall back on.
    """

    provider, api_key, model = resolve_provider()
    if not provider:
        raise LlmUnavailable("no LLM provider configured")

    if provider == "anthropic":
        response = httpx.post(
            _ANTHROPIC_URL,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=timeout,
        )
        response.raise_for_status()
        text = response.json()["content"][0]["text"]
    else:
        response = httpx.post(
            _GEMINI_URL.format(model=model),
            headers={"content-type": "application/json", "x-goog-api-key": api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "maxOutputTokens": max_tokens,
                    "responseMimeType": "application/json",
                },
            },
            timeout=timeout,
        )
        response.raise_for_status()
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    return _parse_json_object(text)


def _parse_json_object(text: str) -> dict[str, Any]:
    """Parse a JSON object, tolerating a ```json fence around it."""

    cleaned = text.strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", cleaned, re.DOTALL)
    if fenced:
        cleaned = fenced.group(1)

    parsed = json.loads(cleaned)
    if not isinstance(parsed, dict):
        raise ValueError("expected a JSON object from the model")
    return parsed
