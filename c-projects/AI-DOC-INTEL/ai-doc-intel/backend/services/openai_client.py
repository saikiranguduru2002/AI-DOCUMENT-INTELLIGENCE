import os

from openai import OpenAI


def _is_openrouter_key(api_key: str | None) -> bool:
    return bool(api_key) and api_key.startswith("sk-or-")


def get_openai_client() -> OpenAI:
    """
    Create an OpenAI-compatible client.

    Supports:
    - OpenAI (default): OPENAI_API_KEY=sk-... and optional OPENAI_BASE_URL
    - OpenRouter: OPENAI_API_KEY=sk-or-... (auto base_url + optional headers)
    """
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")

    default_headers: dict[str, str] | None = None
    if _is_openrouter_key(api_key) and not base_url:
        base_url = "https://openrouter.ai/api/v1"
        # Optional but recommended by OpenRouter for attribution.
        referer = os.getenv("OPENROUTER_HTTP_REFERER") or os.getenv("HTTP_REFERER")
        title = os.getenv("OPENROUTER_APP_TITLE")
        hdrs: dict[str, str] = {}
        if referer:
            hdrs["HTTP-Referer"] = referer
        if title:
            hdrs["X-Title"] = title
        default_headers = hdrs or None

    return OpenAI(api_key=api_key, base_url=base_url, default_headers=default_headers)


def default_chat_model() -> str:
    base_url = os.getenv("OPENAI_BASE_URL", "")
    api_key = os.getenv("OPENAI_API_KEY", "")
    if "openrouter.ai" in base_url or api_key.startswith("sk-or-"):
        return os.getenv("OPENAI_CHAT_MODEL", "openai/gpt-4o-mini")
    return os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")


def default_embedding_model() -> str:
    base_url = os.getenv("OPENAI_BASE_URL", "")
    api_key = os.getenv("OPENAI_API_KEY", "")
    if "openrouter.ai" in base_url or api_key.startswith("sk-or-"):
        return os.getenv("OPENAI_EMBEDDING_MODEL", "openai/text-embedding-3-small")
    return os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

