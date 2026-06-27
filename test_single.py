import os
import asyncio
from supabase import create_client

SUPABASE_URL = "https://zpwarhctbmawtdpaamwt.supabase.co"
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "YOUR_ANON_KEY")
client = create_client(SUPABASE_URL, SUPABASE_KEY)
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "YOUR_SERVICE_KEY")
admin_client = create_client(SUPABASE_URL, service_key)

async def main():
    try:
        # Create user
        import random
        email = f"testfront{random.randint(1000, 9999)}@test.com"
        res = client.auth.sign_up({
            "email": email,
            "password": "password123"
        })
        user_id = res.user.id
        
        # Insert report with admin client
        report_id = "22222222-2222-2222-2222-222222222222"
        admin_client.table("validation_reports").upsert({
            "id": report_id,
            "startup_name": "Test Fetch Frontend",
            "report_data": {},
            "user_id": user_id
        }).execute()
        
        # Now try to fetch it with the authenticated client using single()
        fetch_res = client.table("validation_reports").select("*").eq("id", report_id).single().execute()
        print(f"Single fetch result: {fetch_res.data}")
            
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
