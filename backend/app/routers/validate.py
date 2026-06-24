import uuid
from fastapi import APIRouter, Request, Depends, BackgroundTasks
from app.models.schemas import IdeaValidationRequest
from app.limiter import limiter
from app.config import settings
from app.auth import get_current_user
from app.supabase_client import supabase_client
from app.tasks.validation import run_validation_pipeline

router = APIRouter()

@router.post("/validate-idea")
@limiter.limit(settings.RATE_LIMIT_STRING)
async def validate_idea(request: Request, payload: IdeaValidationRequest, background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    """
    Validate a startup idea based on name and 8 strategic answers.
    Dispatches to Celery and returns report_id.
    """
    report_id = str(uuid.uuid4())
    user_id = user.id
    
    # Insert pending report into Supabase
    supabase_client.table("validation_reports").insert({
        "id": report_id,
        "user_id": user_id,
        "startup_name": payload.startupName,
        "status": "pending",
        "score": 0,
        "report_data": {}
    }).execute()

    # Dispatch Background Task instead of Celery
    answers_dict = [a.model_dump() for a in payload.answers]
    background_tasks.add_task(run_validation_pipeline, report_id, user_id, payload.startupName, answers_dict)

    return {"status": "pending", "report_id": report_id}
