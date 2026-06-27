import logging
from typing import List, Dict
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class GroqError(Exception):
    """Custom exception for Groq API related errors."""
    pass

async def call_groq(messages: List[Dict[str, str]], timeout: float = 40.0) -> str:
    """
    Call Groq API with OpenAI-compatible SDK using the configured model and API key.
    """
    if not settings.GROQ_API_KEY:
        raise GroqError("GROQ_API_KEY is not configured.")

    try:
        client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        logger.info(f"Calling Groq (model: {settings.GROQ_MODEL}) with timeout {timeout}s")
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,  # type: ignore
            response_format={"type": "json_object"},
            timeout=timeout
        )
        content = response.choices[0].message.content
        if not content:
            raise GroqError("Groq returned an empty response.")
        return content
    except Exception as e:
        logger.error(f"Error during Groq API call: {e}")
        raise GroqError(f"Groq call failed: {str(e)}") from e
