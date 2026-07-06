"""
LLM client wrapper — supports both OpenAI and Anthropic.
Configure via LLM_PROVIDER in .env
Set MOCK_MODE=true to use pre-built responses (no API credits needed).
"""
import os
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "openai").lower()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")
_mock_env = os.environ.get("MOCK_MODE", "").lower()
if _mock_env == "true":
    MOCK_MODE = True
elif _mock_env == "false":
    MOCK_MODE = False
else:
    # If MOCK_MODE environment variable is not set, default to True if no API keys are configured
    MOCK_MODE = not (os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY"))


def chat(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> str:
    """
    Send a chat message and return the text response.
    Uses whichever provider is configured in .env.
    """
    if LLM_PROVIDER == "anthropic":
        return _anthropic_chat(system_prompt, user_prompt, temperature)
    else:
        return _openai_chat(system_prompt, user_prompt, temperature)


def _openai_chat(system_prompt: str, user_prompt: str, temperature: float) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content.strip()


def _anthropic_chat(system_prompt: str, user_prompt: str, temperature: float) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=2048,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text.strip()


def parse_json_response(raw: str) -> dict:
    """Strip markdown code fences and parse JSON."""
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        # Remove first and last fence lines
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return json.loads(raw)
