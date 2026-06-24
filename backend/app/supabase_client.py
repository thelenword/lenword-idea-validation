import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(usecwd=True))
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise ValueError("Missing VITE_SUPABASE_URL in your .env file.")

if not SUPABASE_SERVICE_ROLE_KEY:
    logger.warning("SUPABASE_SERVICE_ROLE_KEY is missing from .env. Falling back to VITE_SUPABASE_ANON_KEY. Note that background DB inserts might fail if RLS is enabled.")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials. Add SUPABASE_SERVICE_ROLE_KEY to .env")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
