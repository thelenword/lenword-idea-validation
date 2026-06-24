import logging
from typing import List, Dict
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class GrokError(Exception):
    """Custom exception for Grok API related errors."""
    pass

async def call_grok(messages: List[Dict[str, str]], timeout: float = 40.0) -> str:
    """
    Call xAI's Grok API with OpenAI-compatible SDK using the configured model and API key.
    """
    if not settings.XAI_API_KEY:
        raise GrokError("XAI_API_KEY is not configured.")

    try:
        client = AsyncOpenAI(
            api_key=settings.XAI_API_KEY,
            base_url="https://api.x.ai/v1"
        )
        logger.info(f"Calling Grok (model: {settings.GROK_MODEL}) with timeout {timeout}s")
        response = await client.chat.completions.create(
            model=settings.GROK_MODEL,
            messages=messages,  # type: ignore
            response_format={"type": "json_object"},
            timeout=timeout
        )
        content = response.choices[0].message.content
        if not content:
            raise GrokError("Grok returned an empty response.")
        return content
    except Exception as e:
        logger.error(f"Error during Grok API call: {e}")
        raise GrokError(f"Grok call failed: {str(e)}") from e
