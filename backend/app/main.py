import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.routers import health, validate, export, auth
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LENWORD Validate Backend",
    description="Stateless AI Startup Idea Validation API with Grok-to-Gemini fallback",
    version="1.0.0"
)

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
# Allow any localhost origin in dev environment, restrict to configured origins in prod.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix="/api")
app.include_router(validate.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
@app.get("/")
async def root():
    return {"message": "Welcome to the LENWORD Validate API. Use /api/health for status check."}
