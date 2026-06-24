import logging
import asyncio
from typing import List, Dict, Tuple
from google import genai  # type: ignore
from google.genai import types  # type: ignore
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiError(Exception):
    """Custom exception for Gemini API related errors."""
    pass

def _map_messages_to_gemini(messages: List[Dict[str, str]]) -> Tuple[List[types.Content], str | None]:
    """
    Map OpenAI-style message dictionary list to Gemini Content object list and extract system instructions.
    """
    contents = []
    system_instruction = None

    for msg in messages:
        role = msg.get("role")
        content = msg.get("content", "")

        if role == "system":
            system_instruction = content
        else:
            gemini_role = "model" if role == "assistant" else "user"
            contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[types.Part.from_text(text=content)]
                )
            )

    return contents, system_instruction

async def call_gemini(messages: List[Dict[str, str]], timeout: float = 40.0) -> str:
    """
    Call Google's Gemini API with the official SDK using the configured model and API key.
    """
    if not settings.GEMINI_API_KEY:
        raise GeminiError("GEMINI_API_KEY is not configured.")

    # List of models to try in sequence
    models_to_try = [settings.GEMINI_MODEL, "gemini-1.5-flash", "gemini-2.0-flash"]
    # De-duplicate while preserving order
    seen = set()
    models_to_try = [x for x in models_to_try if not (x in seen or seen.add(x))]

    last_error = None
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    contents, system_instruction = _map_messages_to_gemini(messages)
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        system_instruction=system_instruction
    )

    for model in models_to_try:
        try:
            logger.info(f"Calling Gemini (model: {model}) with timeout {timeout}s")
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                ),
                timeout=timeout
            )
            
            content = response.text
            if not content:
                raise GeminiError(f"Gemini returned an empty response for model {model}.")
            return content
        except asyncio.TimeoutError as te:
            logger.warning(f"Gemini model {model} timed out after {timeout} seconds.")
            last_error = te
        except Exception as e:
            logger.warning(f"Error during Gemini call with model {model}: {e}")
            last_error = e

    logger.error(f"All Gemini fallback models failed. Last error: {last_error}")
    raise GeminiError(f"Gemini call failed for all attempted models. Last error: {str(last_error)}")
