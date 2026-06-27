import os
import asyncio
from supabase import create_client

SUPABASE_URL = "https://zpwarhctbmawtdpaamwt.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "YOUR_SERVICE_KEY")
client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def check_policies():
    try:
        # We can run a raw SQL query using the rpc or just check what policies exist
        res = client.rpc('get_policies', {}).execute()
        print(res.data)
    except Exception as e:
        print(f"Error checking policies: {e}")

asyncio.run(check_policies())
