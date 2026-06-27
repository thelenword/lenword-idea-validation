import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from pydantic import BaseModel
from app.supabase_client import supabase_client

security = HTTPBearer()

class User(BaseModel):
    id: str
    email: str
    role: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    try:
        # Instead of manual PyJWT decoding, use the Supabase client to fetch the user
        res = supabase_client.auth.get_user(token)
        if not res.user:
            raise Exception("No user returned from Supabase")
            
        user_meta = res.user.user_metadata or {}
        
        return User(
            id=res.user.id,
            email=res.user.email,
            role=user_meta.get("role", "founder")
        )
    except Exception as e:
        print(f"Auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

from typing import Optional

optional_security = HTTPBearer(auto_error=False)

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)) -> Optional[User]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        res = supabase_client.auth.get_user(token)
        if not res.user:
            return None
        user_meta = res.user.user_metadata or {}
        return User(
            id=res.user.id,
            email=res.user.email,
            role=user_meta.get("role", "founder")
        )
    except Exception:
        return None
