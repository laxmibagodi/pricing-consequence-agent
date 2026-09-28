"""
Groq wrapper using the official `groq` SDK (no openai package).

Retries are handled here, not inside the SDK (max_retries=0), so a failure
takes a predictable amount of time and always ends in a GroqError that
api.py can map to a clean 503. Plain completions only, no tool calling,
which sidesteps the function-calling errors the hackathon brief warns about.
"""

import os
import time

from groq import Groq

_client = None


class GroqError(Exception):
    """Raised when Groq fails after all retries. api.py maps this to a 503."""
    pass


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise GroqError("GROQ_API_KEY is not set")
        _client = Groq(api_key=api_key, max_retries=0)
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
        except GroqError as e:
            if "GROQ_API_KEY" in str(e):
                raise  # a missing key won't fix itself on retry
            last_err = e
        except Exception as e:
            last_err = e
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)
    raise GroqError(f"Groq completion failed after {max_retries} attempts: {last_err}")