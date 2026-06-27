import os
import asyncio
from supabase import create_client

SUPABASE_URL = "https://zpwarhctbmawtdpaamwt.supabase.co"
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "YOUR_ANON_KEY")
client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Try inserting with null user_id to see if it fails
try:
    res = client.table("validation_reports").insert({
        "id": "00000000-0000-0000-0000-000000000000",
        "startup_name": "Test",
        "report_data": {},
        "user_id": None
    }).execute()
    print("Insert succeeded! user_id is nullable.")
except Exception as e:
    print(f"Insert failed: {e}")
