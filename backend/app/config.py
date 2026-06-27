from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    RATE_LIMIT_STRING: str = "10/minute"
    SUPABASE_JWT_SECRET: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def allowed_origins_list(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
