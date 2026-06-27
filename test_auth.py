import os
import asyncio
from supabase import create_client

SUPABASE_URL = "https://zpwarhctbmawtdpaamwt.supabase.co"
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "YOUR_ANON_KEY")
client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def main():
    # Login with a test user to get a token
    try:
        res = client.auth.sign_in_with_password({
            "email": "test@test.com",
            "password": "password123"
        })
        token = res.session.access_token
        print(f"Got token! length: {len(token)}")
        
        # Test backend /validate-idea endpoint
        import httpx
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.post(
                "http://localhost:8000/api/validate-idea",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "startupName": "Test API",
                    "answers": []
                }
            )
            print(f"Backend response: {resp.status_code}")
            print(resp.json())
            
            report_id = resp.json().get("report_id")
            
            # Now verify if the row has user_id set
            # We must use the service role key to see it without RLS blocking if it failed
            service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "YOUR_SERVICE_KEY")
            admin_client = create_client(SUPABASE_URL, service_key)
            db_res = admin_client.table("validation_reports").select("user_id").eq("id", report_id).execute()
            
            print(f"Database row user_id: {db_res.data[0]['user_id']}")
            print(f"Expected user_id: {res.user.id}")
            
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
