"""
Input Quality Analyzer

Detects gibberish, nonsensical, or extremely low-effort input and computes
a quality multiplier that penalizes the final validation scores accordingly.

The idea: if someone types "asdf", "yhj", "tjt" etc., the system should
recognize this is NOT a real startup idea and score it accordingly (near 0).
"""

import re
import math
import logging
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

# Common English words that signal real content (even short answers)
REAL_WORDS = {
    "the", "a", "an", "and", "or", "for", "to", "in", "on", "at", "by",
    "is", "it", "of", "we", "my", "our", "app", "web", "use", "help",
    "make", "build", "create", "sell", "buy", "pay", "free", "new", "get",
    "ai", "ml", "api", "saas", "b2b", "b2c", "mvp", "crm", "erp",
    "food", "tech", "health", "fin", "ed", "bio", "data", "cloud",
    "small", "big", "fast", "easy", "cheap", "better", "more", "less",
    "people", "users", "customers", "business", "market", "product",
    "service", "platform", "software", "mobile", "online", "digital",
    "money", "revenue", "profit", "cost", "price", "subscription",
    "team", "founder", "ceo", "cto", "developer", "designer", "engineer",
    "startup", "company", "idea", "problem", "solution", "customer",
    "none", "nothing", "not", "yet", "just", "started", "early", "pre",
}

# Vowel-consonant patterns for English-like detection
VOWELS = set("aeiouAEIOU")
CONSONANTS = set("bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ")


def _has_vowel_consonant_pattern(word: str) -> bool:
    """Check if a word has a natural vowel/consonant distribution."""
    if len(word) <= 1:
        return True
    vowel_count = sum(1 for c in word if c in VOWELS)
    consonant_count = sum(1 for c in word if c in CONSONANTS)
    total = vowel_count + consonant_count
    if total == 0:
        return False
    ratio = vowel_count / total
    # English words typically have 30-60% vowels
    return 0.15 <= ratio <= 0.75


def _consecutive_consonants(word: str) -> int:
    """Count max consecutive consonants in a word."""
    max_run = 0
    current = 0
    for c in word.lower():
        if c in CONSONANTS:
            current += 1
            max_run = max(max_run, current)
        else:
            current = 0
    return max_run


def _is_gibberish_word(word: str) -> bool:
    """Detect if a single word is gibberish."""
    w = word.lower().strip()
    if not w:
        return True
    # Single character words (except 'a', 'i')
    if len(w) == 1 and w not in ("a", "i"):
        return True
    # If it's a known real word, it's not gibberish
    if w in REAL_WORDS:
        return False
    # Very short with no vowels
    if len(w) <= 4 and not any(c in VOWELS for c in w):
        return True
    # Too many consecutive consonants (e.g. "dthdh", "gnxfn")
    if _consecutive_consonants(w) >= 4:
        return True
    # Very short and no vowel-consonant pattern
    if len(w) <= 5 and not _has_vowel_consonant_pattern(w):
        return True
    # Check for keyboard-mash patterns (all adjacent keys)
    keyboard_rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
    for row in keyboard_rows:
        if len(w) >= 3 and all(c in row for c in w):
            return True
    # Repeated characters
    if len(w) >= 3 and len(set(w)) <= 2:
        return True

    return False


def _word_count(text: str) -> int:
    """Count meaningful words in text."""
    words = re.findall(r'[a-zA-Z]+', text)
    return len([w for w in words if len(w) > 0])


def _real_word_ratio(text: str) -> float:
    """Ratio of recognized English words to total words."""
    words = re.findall(r'[a-zA-Z]+', text.lower())
    if not words:
        return 0.0
    real_count = sum(1 for w in words if w in REAL_WORDS or len(w) > 6)
    return real_count / len(words)


def _gibberish_word_ratio(text: str) -> float:
    """Ratio of gibberish words to total words."""
    words = re.findall(r'[a-zA-Z]+', text)
    if not words:
        return 1.0
    gibberish_count = sum(1 for w in words if _is_gibberish_word(w))
    return gibberish_count / len(words)


def analyze_field_quality(text: str) -> float:
    """
    Analyze a single field's input quality.
    Returns a score from 0.0 (pure gibberish) to 1.0 (quality input).
    """
    text = text.strip()

    # Empty or nearly empty
    if len(text) < 2:
        return 0.0

    # Very short input (less than 5 chars) — almost always gibberish for these fields
    if len(text) < 5:
        # Unless it's a real short word
        if text.lower() in REAL_WORDS:
            return 0.3  # Real word but WAY too short for a startup description
        return 0.05

    # Short input (5-15 chars)
    if len(text) < 15:
        gibberish_ratio = _gibberish_word_ratio(text)
        if gibberish_ratio > 0.6:
            return 0.1
        return 0.3

    # Medium input — check content quality
    word_count = _word_count(text)
    gibberish_ratio = _gibberish_word_ratio(text)
    real_ratio = _real_word_ratio(text)

    # Mostly gibberish words
    if gibberish_ratio > 0.7:
        return 0.1
    if gibberish_ratio > 0.5:
        return 0.25

    # Calculate quality score based on multiple factors
    length_score = min(1.0, len(text) / 100)  # Longer is better, up to 100 chars
    word_score = min(1.0, word_count / 10)  # More words is better, up to 10
    real_score = real_ratio  # Higher ratio of real words is better

    quality = (length_score * 0.3 + word_score * 0.3 + real_score * 0.2 + (1.0 - gibberish_ratio) * 0.2)

    return max(0.05, min(1.0, quality))


def analyze_input_quality(answers_map: Dict[str, str], startup_name: str) -> Tuple[float, str, Dict[str, float]]:
    """
    Analyze overall input quality across all fields.
    
    Returns:
        - overall_quality: float 0.0 to 1.0 (multiplier for scores)
        - quality_verdict: str describing input quality
        - field_scores: Dict mapping field_id to quality score
    """
    field_weights = {
        "problem": 0.20,
        "target_customer": 0.15,
        "solution": 0.20,
        "business_model": 0.15,
        "traction": 0.10,
        "team": 0.10,
        "competitors": 0.05,
        "one_liner": 0.05,
    }

    field_scores = {}
    weighted_sum = 0.0
    total_weight = 0.0

    # Also check the startup name
    name_quality = analyze_field_quality(startup_name)
    field_scores["startup_name"] = name_quality

    # Map Q01-Q08 to standard keys if present
    mapped_answers = {}
    if "Q01" in answers_map:
        mapped_answers = {
            "problem": answers_map.get("Q01", ""),
            "target_customer": answers_map.get("Q02", ""),
            "solution": answers_map.get("Q03", ""),
            "business_model": answers_map.get("Q06", ""),
            "traction": answers_map.get("Q08", ""),
            "team": answers_map.get("Q04", ""),
            "competitors": answers_map.get("Q05", ""),
            "one_liner": answers_map.get("Q07", ""),
        }
    else:
        mapped_answers = answers_map

    for field_id, weight in field_weights.items():
        text = mapped_answers.get(field_id, "")
        quality = analyze_field_quality(text)
        field_scores[field_id] = quality
        weighted_sum += quality * weight
        total_weight += weight

    overall_quality = weighted_sum / total_weight if total_weight > 0 else 0.0

    # Factor in startup name quality
    overall_quality = overall_quality * 0.85 + name_quality * 0.15

    # Determine verdict
    if overall_quality < 0.15:
        verdict = "GIBBERISH"
    elif overall_quality < 0.30:
        verdict = "EXTREMELY_LOW"
    elif overall_quality < 0.50:
        verdict = "VERY_LOW"
    elif overall_quality < 0.70:
        verdict = "LOW"
    elif overall_quality < 0.85:
        verdict = "MODERATE"
    else:
        verdict = "GOOD"

    logger.info(f"Input quality analysis: overall={overall_quality:.2f}, verdict={verdict}, fields={field_scores}")

    return overall_quality, verdict, field_scores
