"""
Groq wrapper (OpenAI-compatible endpoint). Wrapped with retries since the
free tier rate-limits aggressively, and the hackathon brief specifically
warns about function-calling errors on the recommended free models —
we sidestep that entirely by not using tool calling, just plain completions.
"""

import os
import time
from openai import OpenAI

_client = None


class GroqError(Exception):
    """Raised when Groq fails after all retries. api.py should catch this
    and return a clean error response instead of a raw 500."""
    pass


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise GroqError("GROQ_API_KEY is not set")
        _client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    return _client


def complete(system_prompt: str, user_prompt: str, max_retries: int = 3) -> str:
    model = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

    last_err = None
    for attempt in range(max_retries):
        try:
            client = get_client()
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                timeout=20,
            )
            content = resp.choices[0].message.content
            if not content or not content.strip():
                raise GroqError("Groq returned an empty response")
            return content
        except Exception as e:
            last_err = e
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    raise GroqError(f"Groq completion failed after {max_retries} attempts: {last_err}")