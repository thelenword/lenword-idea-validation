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
        # Register a new user to get a valid token
        import random
        email = f"testauth{random.randint(1000, 9999)}@test.com"
        res = client.auth.sign_up({
            "email": email,
            "password": "password123"
        })
        token = res.session.access_token
        
        # Now try to verify the token using the admin client
        try:
            admin_res = admin_client.auth.get_user(token)
            print(f"Admin client get_user success! User ID: {admin_res.user.id}")
        except Exception as e:
            print(f"Admin client get_user FAILED: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
